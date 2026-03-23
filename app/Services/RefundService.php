<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Refund;
use App\Models\RefundItem;
use App\Models\RefundAuditLog;
use App\Models\User;
use App\Models\Product;
use App\Models\LoyaltyTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Stripe\StripeClient;
use App\Mail\RefundInitiatedNotification;
use App\Mail\RefundProcessedNotification;
use App\Mail\RefundFailedNotification;

class RefundService
{
    protected $stripe;
    protected $loyaltyService;

    public function __construct(LoyaltyService $loyaltyService)
    {
        $this->stripe = new StripeClient(config('services.stripe.secret') ?? env('STRIPE_SECRET'));
        $this->loyaltyService = $loyaltyService;
    }

    /**
     * Check if an order is eligible for a refund.
     */
    public function checkRefundEligibility(Order $order): array
    {
        if (strtolower($order->payment_status) !== 'paid') {
            return ['eligible' => false, 'reason' => 'Order is not paid.'];
        }

        $totalRefunded = $order->refunds()->whereIn('status', ['processed', 'pending_approval'])->sum('amount');
        if ($totalRefunded >= $order->total) {
            return ['eligible' => false, 'reason' => 'Order is already fully refunded.'];
        }

        // Check time window based on department rules
        // If at least one item is within its department's refund window, the order is eligible.
        $daysSinceOrder = $order->created_at->diffInDays(now());
        
        $order->load('items.product.department');
        $maxWindow = 0;
        $hasRefundableItem = false;

        foreach ($order->items as $item) {
            $product = $item->product;
            $dept = $product ? $product->department : null;
            
            $window = $dept ? $dept->refund_window_days : 14; // Default 14
            $allowed = $dept ? $dept->allow_refunds : true;   // Default true

            if ($allowed) {
                $hasRefundableItem = true;
                if ($window > $maxWindow) {
                    $maxWindow = $window;
                }
            }
        }

        if (!$hasRefundableItem) {
             return ['eligible' => false, 'reason' => 'Items in this order are not eligible for refunds.'];
        }

        if ($daysSinceOrder > $maxWindow) {
            return ['eligible' => false, 'reason' => "Refund period ({$maxWindow} days) has expired."];
        }

        return ['eligible' => true, 'reason' => 'Order is eligible for refund.'];
    }

    /**
     * Create a refund request.
     * If amount > 100, it requires approval.
     * Otherwise, it processes immediately unless $autoProcess is false.
     */
    public function createRefundRequest(Order $order, float $amount, string $reason, array $items, ?int $adminId, bool $restock = false, ?string $notes = null, bool $autoProcess = true)
    {
        return DB::transaction(function () use ($order, $amount, $reason, $items, $adminId, $restock, $notes, $autoProcess) {
            // 1. Create Refund Record
            // If autoProcess is false, force approval (pending_approval)
            // If amount > 100, force approval (pending_approval)
            // Otherwise, pending (ready for execution)
            $status = ($amount > 100 || !$autoProcess) ? 'pending_approval' : 'pending';
            
            $refund = Refund::create([
                'order_id' => $order->id,
                'amount' => $amount,
                'reason' => $reason,
                'status' => $status,
                'admin_id' => $adminId,
                'notes' => $notes,
            ]);

            // 2. Create Refund Items
            foreach ($items as $item) {
                $product = Product::withTrashed()->find($item['product_id']);
                
                // Check if product allows refunds (Prevent client requests for non-refundable items)
                if (!$adminId && $product && $product->department && !$product->department->allow_refunds) {
                    throw new \Exception("Item {$product->name} is not eligible for refund.");
                }

                // Determine restock quantity based on department rules
                $shouldRestock = $restock;
                
                if ($product && $product->department) {
                    // Use department settings if available
                    $dept = $product->department;
                    if (!$dept->restock_on_refund) {
                        $shouldRestock = false;
                    }
                } else {
                    // Fallback for items without department (or if hardcoded logic was preferred)
                    // We can keep the old logic as a fallback if needed, but moving to DB-driven is better.
                    // Assuming default true for restock unless specified otherwise.
                }

                RefundItem::create([
                    'refund_id' => $refund->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'amount' => $item['amount'],
                    'restock_quantity' => $shouldRestock ? $item['quantity'] : 0,
                ]);
            }

            // 3. Log Creation
            RefundAuditLog::create([
                'refund_id' => $refund->id,
                'admin_id' => $adminId, // Can be null (system/user)
                'action' => 'refund_created',
                'details' => "Refund request created for {$amount}. Status: {$status}",
            ]);

            // 4. Send Notification (Initiated)
            if ($order->user) {
                try {
                    Mail::to($order->user)->send(new RefundInitiatedNotification($refund));
                } catch (\Exception $e) {
                    Log::error("Failed to send refund initiated email: " . $e->getMessage());
                }
            }

            // 5. Execute if no approval needed
            if ($status === 'pending' && $autoProcess) {
                // Only execute if we have an adminId (system or admin)
                // If adminId is null (client request), we probably shouldn't auto-execute anyway, 
                // but the logic above sets status to pending_approval if !$autoProcess.
                // So if we are here, status is pending AND autoProcess is true.
                // We need an adminId for audit logs in executeRefund, so let's use 0 or check for null.
                return $this->executeRefund($refund, $adminId ?? 0); 
            }

            return $refund;
        });
    }

    /**
     * Approve and execute a pending refund.
     */
    public function approveRefund(Refund $refund, int $adminId, ?float $amount = null, ?bool $restock = null, ?string $notes = null)
    {
        if ($refund->status !== 'pending_approval') {
            throw new \Exception("Refund is not pending approval.");
        }

        if ($amount !== null) {
            $refund->amount = $amount;
        }

        if ($notes !== null) {
            $refund->notes = $notes;
        }

        if ($restock !== null) {
             foreach ($refund->items as $item) {
                 $item->restock_quantity = $restock ? $item->quantity : 0;
                 $item->save();
             }
        }
        
        // Update status to pending before execution to prevent double approval race conditions
        $refund->status = 'pending'; 
        $refund->save();

        return $this->executeRefund($refund, $adminId);
    }

    /**
     * Execute the refund logic (Stripe, Inventory, Loyalty).
     */
    public function executeRefund(Refund $refund, int $adminId)
    {
        return DB::transaction(function () use ($refund, $adminId) {
            $order = $refund->order;

            // 1. Process Stripe Refund
            try {
                // If we have a stripe payment intent, try to refund via Stripe
                if ($order->stripe_payment_intent_id) {
                    $stripeRefund = $this->stripe->refunds->create([
                        'payment_intent' => $order->stripe_payment_intent_id,
                        'amount' => (int) ($refund->amount * 100), // Stripe uses cents
                        'reason' => 'requested_by_customer', 
                        'metadata' => ['order_id' => $order->id, 'refund_id' => $refund->id],
                    ]);
                    $refund->stripe_refund_id = $stripeRefund->id;
                }
                
                $refund->status = 'processed';
                $refund->save();

            } catch (\Exception $e) {
                $refund->status = 'failed';
                $refund->notes .= "\nStripe Error: " . $e->getMessage();
                $refund->save();

                RefundAuditLog::create([
                    'refund_id' => $refund->id,
                    'admin_id' => $adminId,
                    'action' => 'refund_failed',
                    'details' => $e->getMessage(),
                ]);
                
                if ($order->user) {
                    try {
                        Mail::to($order->user)->send(new RefundFailedNotification($refund));
                    } catch (\Exception $mailError) {
                        Log::error("Failed to send refund failed email: " . $mailError->getMessage());
                    }
                }
                
                // Re-throw to ensure transaction rollback if needed, 
                // BUT if we want to save the 'failed' status, we should NOT rollback the outer transaction 
                // entirely if we want to keep the record of failure.
                // However, since we are inside a transaction, if we throw, everything including the 'failed' status save is rolled back.
                // So we should probably NOT throw here if we want to persist the failure state, 
                // OR we should handle this differently.
                // For now, let's allow it to fail hard so the admin knows something went wrong.
                // throw $e; 
                
                // FIXED: Return the failed refund so the transaction commits the failure status.
                // This ensures we have a record of the attempt.
                return $refund;
            }

            // 2. Update Inventory (Restock)
            foreach ($refund->items as $item) {
                if ($item->restock_quantity > 0) {
                    $product = $item->product; // Uses relationship
                    if ($product) {
                        $product->increment('stock', $item->restock_quantity);
                    }
                }
            }

            // 3. Deduct Loyalty Points
            $this->deductLoyaltyPoints($order, $refund->amount);

            // 4. Log Audit
            RefundAuditLog::create([
                'refund_id' => $refund->id,
                'admin_id' => $adminId,
                'action' => 'refund_processed',
                'details' => "Refund of {$refund->amount} processed successfully.",
            ]);

            // 5. Send Notification (Processed)
            if ($order->user) {
                try {
                    Mail::to($order->user)->send(new RefundProcessedNotification($refund));
                } catch (\Exception $e) {
                    Log::error("Failed to send refund processed email: " . $e->getMessage());
                }
            }

            // 6. Update Order Payment Status
            $totalRefunded = $order->refunds()->where('status', 'processed')->sum('amount');
            if ($totalRefunded >= $order->total) {
                $order->payment_status = 'refunded';
            } elseif ($totalRefunded > 0) {
                $order->payment_status = 'partially_refunded';
            }
            $order->save();

            return $refund;
        });
    }

    /**
     * Deduct loyalty points proportionally.
     */
    public function deductLoyaltyPoints(Order $order, float $refundAmount)
    {
        if (!$order->user) return;
        
        // Calculate proportion
        if ($order->total <= 0) return;
        
        $proportion = $refundAmount / $order->total;
        $pointsToDeduct = (int) round($order->points_earned * $proportion);

        if ($pointsToDeduct > 0) {
            $user = $order->user;
            
            // Ensure we don't go negative
            $currentBalance = $user->points_balance;
            $actualDeduction = min($currentBalance, $pointsToDeduct);
            
            if ($actualDeduction > 0) {
                $user->decrement('points_balance', $actualDeduction);
                
                LoyaltyTransaction::create([
                    'user_id' => $user->id,
                    'order_id' => $order->id,
                    'points' => -$actualDeduction,
                    'type' => 'refund_deduction',
                    'description' => "Points deducted for refund on Order #{$order->order_number}",
                    'expiry_date' => null,
                ]);
            }
        }
    }
}
