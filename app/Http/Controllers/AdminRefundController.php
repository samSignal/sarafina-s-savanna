<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Refund;
use App\Services\RefundService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AdminRefundController extends Controller
{
    protected $refundService;

    public function __construct(RefundService $refundService)
    {
        $this->refundService = $refundService;
    }

    /**
     * List all refunds with pagination and filtering.
     */
    public function index(Request $request)
    {
        $query = Refund::with(['order.user', 'admin', 'items.product']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('order_number')) {
            $query->whereHas('order', function ($q) use ($request) {
                $q->where('order_number', 'like', '%' . $request->order_number . '%');
            });
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reason', 'like', "%{$search}%")
                  ->orWhere('stripe_refund_id', 'like', "%{$search}%")
                  ->orWhereHas('order', function ($oq) use ($search) {
                      $oq->where('order_number', 'like', "%{$search}%");
                  });
            });
        }

        return response()->json($query->latest()->paginate(15));
    }

    /**
     * Get refund statistics.
     */
    public function stats()
    {
        $pending = Refund::whereIn('status', ['pending', 'pending_approval'])->count();
        $processedToday = Refund::where('status', 'processed')->whereDate('updated_at', now()->toDateString())->count();
        $totalRefunded = Refund::where('status', 'processed')->sum('amount');
        
        return response()->json([
            'pending' => $pending,
            'processed_today' => $processedToday,
            'total_refunded' => $totalRefunded
        ]);
    }

    /**
     * Show refund details.
     */
    public function show(Refund $refund)
    {
        $refund->load(['order.user', 'admin', 'items.product', 'auditLogs.admin']);
        return response()->json($refund);
    }

    /**
     * Check refund eligibility for an order.
     */
    public function checkEligibility(Order $order)
    {
        $result = $this->refundService->checkRefundEligibility($order);
        return response()->json($result);
    }

    /**
     * Create a new refund request.
     */
    public function store(Request $request)
    {
        Log::info('Refund request received', $request->all());
        
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'amount' => 'required|numeric|min:0.01',
            'reason' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.amount' => 'required|numeric|min:0',
            'restock' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        $order = Order::findOrFail($request->order_id);

        // Cumulative check: a single refund's amount against the order total isn't enough —
        // multiple refunds on the same order must not sum to more than what was paid.
        $totalRefunded = $order->refunds()->whereIn('status', ['processed', 'pending_approval'])->sum('amount');
        if ($totalRefunded + $request->amount > $order->total) {
            $remaining = max(0, $order->total - $totalRefunded);
            return response()->json(['message' => "Refund amount exceeds the remaining refundable balance ({$remaining})."], 422);
        }

        // Per-item check: don't allow refunding more units of a product than were purchased
        // and not already refunded.
        $order->load(['items', 'refunds.items']);
        $orderItems = $order->items->keyBy('product_id');
        $refundedQuantities = [];
        foreach ($order->refunds as $existingRefund) {
            if (in_array($existingRefund->status, ['rejected', 'failed'])) {
                continue;
            }
            foreach ($existingRefund->items as $rItem) {
                $refundedQuantities[$rItem->product_id] = ($refundedQuantities[$rItem->product_id] ?? 0) + $rItem->quantity;
            }
        }

        foreach ($request->items as $item) {
            if (! $orderItems->has($item['product_id'])) {
                return response()->json(['message' => 'Invalid product for this order.'], 422);
            }

            $orderItem = $orderItems[$item['product_id']];
            $previouslyRefunded = $refundedQuantities[$item['product_id']] ?? 0;
            $remainingQty = $orderItem->quantity - $previouslyRefunded;

            if ($item['quantity'] > $remainingQty) {
                return response()->json(['message' => 'Refund quantity for product exceeds remaining refundable quantity.'], 422);
            }
        }

        try {
            $refund = $this->refundService->createRefundRequest(
                $order,
                $request->amount,
                $request->reason,
                $request->items,
                Auth::id(),
                $request->boolean('restock'),
                $request->notes
            );

            return response()->json($refund, 201);
        } catch (\Exception $e) {
            Log::error('Refund creation failed for order ' . $order->order_number . ': ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Refund failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Approve a pending refund.
     */
    public function approve(Request $request, Refund $refund)
    {
        $request->validate([
            'amount' => 'nullable|numeric|min:0.01',
            'restock' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        if ($refund->status !== 'pending_approval') {
            return response()->json(['message' => 'Refund is not pending approval.'], 400);
        }

        // Prevent self-approval if desired (optional rule, but good practice)
        if ($refund->admin_id === Auth::id()) {
             // For strict 2-person rule:
             // return response()->json(['message' => 'You cannot approve your own refund request.'], 403);
             // For now, I'll allow it unless strict mode is requested, 
             // but the prompt said "Second admin approval", so I should enforce different user.
             if ($refund->admin_id === Auth::id()) {
                 return response()->json(['message' => 'Second admin approval required. You cannot approve your own request.'], 403);
             }
        }

        try {
            $processedRefund = $this->refundService->approveRefund(
                $refund, 
                Auth::id(),
                $request->amount,
                $request->boolean('restock'),
                $request->notes
            );
            return response()->json($processedRefund);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Approval failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Export refunds to CSV.
     */
    public function export()
    {
        $refunds = Refund::with(['order', 'admin'])->latest()->get();
        
        $csvHeader = ['ID', 'Order Number', 'Amount', 'Status', 'Reason', 'Admin', 'Date'];
        $csvData = [];
        
        $csvData[] = implode(',', $csvHeader);
        
        foreach ($refunds as $refund) {
            $csvData[] = implode(',', [
                $refund->id,
                $refund->order ? $refund->order->order_number : 'N/A',
                $refund->amount,
                $refund->status,
                '"' . str_replace('"', '""', $refund->reason) . '"',
                $refund->admin ? $refund->admin->name : 'System',
                $refund->created_at->format('Y-m-d H:i:s')
            ]);
        }
        
        $output = implode("\n", $csvData);
        
        return response($output, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="refunds_export.csv"',
        ]);
    }
}
