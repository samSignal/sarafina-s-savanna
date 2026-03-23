<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\RefundService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ClientRefundController extends Controller
{
    protected $refundService;

    public function __construct(RefundService $refundService)
    {
        $this->refundService = $refundService;
    }

    /**
     * Check refund eligibility for a client's order.
     */
    public function checkEligibility(Order $order)
    {
        if ($order->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $result = $this->refundService->checkRefundEligibility($order);
        return response()->json($result);
    }

    /**
     * Create a new refund request for the client.
     */
    public function store(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'reason' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.amount' => 'required|numeric|min:0', // This should probably be validated against order item price on server side
            'notes' => 'nullable|string',
        ]);

        $order = Order::findOrFail($request->order_id);

        if ($order->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Validate items belong to order and prices are correct
        $orderItems = $order->items->keyBy('product_id');
        $totalRefundAmount = 0;

        // Calculate already refunded quantities per product
        $order->load(['refunds.items']);
        $refundedQuantities = [];
        foreach ($order->refunds as $existingRefund) {
            if (in_array($existingRefund->status, ['rejected', 'failed'])) continue;
            
            foreach ($existingRefund->items as $rItem) {
                if (!isset($refundedQuantities[$rItem->product_id])) {
                    $refundedQuantities[$rItem->product_id] = 0;
                }
                $refundedQuantities[$rItem->product_id] += $rItem->quantity;
            }
        }

        foreach ($request->items as $item) {
            if (!$orderItems->has($item['product_id'])) {
                return response()->json(['message' => 'Invalid product for this order.'], 422);
            }
            
            $orderItem = $orderItems[$item['product_id']];
            $previouslyRefunded = $refundedQuantities[$item['product_id']] ?? 0;
            $remainingQty = $orderItem->quantity - $previouslyRefunded;

            if ($item['quantity'] > $remainingQty) {
                return response()->json(['message' => "Refund quantity for product exceeds remaining refundable quantity."], 422);
            }

            // Simple validation: ensure claimed amount per unit doesn't exceed paid unit price
            // We can trust the client to send the correct amount for now, but ideally we recalculate it.
            // Let's recalculate it to be safe.
            $unitPrice = $orderItem->line_total / $orderItem->quantity;
            $calculatedAmount = $unitPrice * $item['quantity'];
            
            // Allow small float difference
            if (abs($item['amount'] - $calculatedAmount) > 0.05) {
                 return response()->json(['message' => 'Invalid refund amount calculation.'], 422);
            }
            
            $totalRefundAmount += $calculatedAmount;
        }

        // Eligibility Check
        $eligibility = $this->refundService->checkRefundEligibility($order);
        if (!$eligibility['eligible']) {
            return response()->json(['message' => $eligibility['reason']], 422);
        }

        try {
            // Client refunds always need approval, so we set a high amount or ensure logic handles it.
            // But RefundService logic is: > 100 needs approval, <= 100 auto-processes (if admin).
            // For clients, ALL refunds should probably be 'pending_approval' or at least 'pending' (manual review).
            // The service sets status based on amount.
            // Let's enforce manual review for ALL client-initiated refunds by passing a flag or just checking status later.
            // Actually, for safety, client requests should ALWAYS be 'pending_approval' or 'pending' (but not executed immediately).
            // The service executes immediately if status is 'pending'.
            // We need to modify the service or handling here to PREVENT auto-execution for client requests.
            
            // Wait, RefundService::createRefundRequest executes if status is 'pending'.
            // We might want to pass a param to force "draft" or "request" mode.
            // Or we just rely on the fact that we can create it with a status that isn't 'processed'.
            
            // Let's modify the RefundService to accept a 'force_approval' flag?
            // Or simpler: We just calculate amount. If it's small, service executes it.
            // Do we want auto-refunds for clients? Probably NOT. 
            // So we should update RefundService to allow skipping auto-execution.
            
            // Let's use a trick: Pass a huge amount? No.
            // Let's update RefundService to take an optional $autoProcess boolean.
            
            // For now, let's assume we update RefundService to support $autoExecute = true/false.
            // I'll update RefundService next.
            
            $refund = $this->refundService->createRefundRequest(
                $order,
                $totalRefundAmount,
                $request->reason,
                $request->items,
                null, // admin_id is null for client requests
                false, // restock - defaults to false
                $request->notes,
                false // autoProcess - force manual approval
            );

            return response()->json($refund, 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Refund request failed: ' . $e->getMessage()], 500);
        }
    }
}
