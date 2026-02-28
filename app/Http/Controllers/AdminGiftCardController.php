<?php

namespace App\Http\Controllers;

use App\Models\GiftCard;
use App\Models\Product;
use App\Models\GiftCardTransaction;
use App\Models\GiftCardAuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\GiftCardIssued;

class AdminGiftCardController extends Controller
{
    public function index(Request $request)
    {
        $query = GiftCard::with(['purchaser', 'order']);

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('recipient_email', 'like', "%{$search}%")
                  ->orWhereHas('purchaser', function ($q) use ($search) {
                      $q->where('email', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->has('status') && $request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $sortField = $request->input('sort_field', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $giftCards = $query->paginate(15);

        return response()->json($giftCards);
    }

    public function products()
    {
        $products = Product::where('type', 'gift_card')
            ->orderBy('price')
            ->get();
            
        return response()->json($products);
    }

    public function storeProduct(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image_file' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
        ]);

        $data = [
            'name' => $validated['name'],
            'description' => $validated['description'] ?? '',
            'price' => $validated['price'],
            'desired_net_price' => $validated['price'],
            'price_uk_eu' => $validated['price'],
            'price_international' => $validated['price'],
            'stock' => 999999,
            'status' => 'In Stock',
            'type' => 'gift_card',
            'department_id' => null,
            'category_id' => null,
            'image' => '/images/gift-card.jpg', // Default
        ];

        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('products', 'public');
            $data['image'] = '/storage/' . $path;
        }

        $product = Product::create($data);

        return response()->json($product, 201);
    }

    public function destroyProduct($id)
    {
        $product = Product::where('id', $id)->where('type', 'gift_card')->firstOrFail();
        $product->delete();
        return response()->json(['message' => 'Gift card product deleted successfully']);
    }

    public function store(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'recipient_email' => 'nullable|email',
            'expiry_date' => 'nullable|date|after:today',
            'notes' => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();

            $code = GiftCard::generateCode();
            
            $giftCard = GiftCard::create([
                'code' => $code,
                'initial_value' => $request->amount,
                'balance' => $request->amount,
                'status' => 'active',
                'expiry_date' => $request->expiry_date ?? now()->addYears(2),
                'recipient_email' => $request->recipient_email,
                'purchaser_id' => auth()->id(), // Admin created it
            ]);

            GiftCardTransaction::create([
                'gift_card_id' => $giftCard->id,
                'amount' => $request->amount,
                'type' => 'credit',
                'description' => 'Manual creation by admin: ' . ($request->notes ?? 'No notes'),
            ]);

            GiftCardAuditLog::create([
                'gift_card_id' => $giftCard->id,
                'user_id' => auth()->id(),
                'action' => 'created',
                'details' => [
                    'initial_value' => $giftCard->initial_value,
                    'recipient_email' => $giftCard->recipient_email,
                    'notes' => $request->notes
                ],
                'ip_address' => $request->ip(),
            ]);

            if ($giftCard->recipient_email) {
                Mail::to($giftCard->recipient_email)->send(new GiftCardIssued($giftCard));
            }

            DB::commit();

            return response()->json([
                'message' => 'Gift card created successfully',
                'gift_card' => $giftCard
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gift card creation failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create gift card'], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $giftCard = GiftCard::findOrFail($id);

        $request->validate([
            'status' => 'required|in:active,deactivated,expired',
            'reason' => 'required_if:status,deactivated|string|nullable'
        ]);

        $oldStatus = $giftCard->status;
        
        if ($oldStatus !== $request->status) {
            $giftCard->status = $request->status;
            $giftCard->save();

            GiftCardAuditLog::create([
                'gift_card_id' => $giftCard->id,
                'user_id' => auth()->id(),
                'action' => 'updated',
                'details' => [
                    'field' => 'status',
                    'old_value' => $oldStatus,
                    'new_value' => $request->status,
                    'reason' => $request->reason
                ],
                'ip_address' => $request->ip(),
            ]);
        }

        return response()->json([
            'message' => 'Gift card status updated',
            'gift_card' => $giftCard
        ]);
    }

    public function destroy($id)
    {
        $giftCard = GiftCard::findOrFail($id);
        
        GiftCardAuditLog::create([
            'gift_card_id' => $giftCard->id,
            'user_id' => auth()->id(),
            'action' => 'deleted',
            'details' => [
                'balance' => $giftCard->balance,
                'status' => $giftCard->status
            ],
            'ip_address' => request()->ip(),
        ]);

        $giftCard->delete();

        return response()->json(['message' => 'Gift card deleted successfully']);
    }

    public function transactions($id)
    {
        $transactions = GiftCardTransaction::where('gift_card_id', $id)
            ->with('order')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($transactions);
    }

    public function auditLogs($id)
    {
        $logs = GiftCardAuditLog::where('gift_card_id', $id)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($logs);
    }
    
    public function export(Request $request)
    {
         $filename = 'gift-cards-export-' . date('Y-m-d') . '.csv';
         
         $query = GiftCard::with(['purchaser']);
         
         if ($request->has('status') && $request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
         }
         
         $giftCards = $query->get();

         $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function() use($giftCards) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Code', 'Initial Value', 'Balance', 'Status', 'Expiry Date', 'Recipient', 'Purchaser', 'Created At']);

            foreach ($giftCards as $card) {
                fputcsv($file, [
                    $card->code,
                    $card->initial_value,
                    $card->balance,
                    $card->status,
                    $card->expiry_date,
                    $card->recipient_email,
                    $card->purchaser ? $card->purchaser->name : 'Guest/System',
                    $card->created_at
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
