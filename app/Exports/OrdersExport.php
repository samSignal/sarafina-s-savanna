<?php

namespace App\Exports;

use App\Models\Order;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class OrdersExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    public function __construct(private Collection $orders)
    {
    }

    public function collection(): Collection
    {
        return $this->orders;
    }

    public function headings(): array
    {
        return [
            'Order #',
            'Customer',
            'Email',
            'Status',
            'Payment Status',
            'Delivery Status',
            'Currency',
            'Total',
            'Total (GBP)',
            'Exchange Rate',
            'Delivery Cost',
            'Discount',
            'Gift Card Discount',
            'Points Redeemed',
            'Items',
            'Placed At',
        ];
    }

    public function map($order): array
    {
        /** @var Order $order */
        $rate = (float) $order->exchange_rate ?: 1.0;

        $itemsSummary = $order->items
            ->map(fn ($item) => "{$item->quantity}x {$item->product_name}")
            ->implode('; ');

        return [
            $order->order_number,
            $order->user?->name ?? 'Unknown customer',
            $order->user?->email ?? '',
            $order->status,
            $order->payment_status,
            $order->delivery_status ?? '',
            $order->currency,
            (float) $order->total,
            (float) $order->total_gbp,
            $rate,
            (float) $order->delivery_cost,
            (float) ($order->discount_amount ?? 0),
            (float) ($order->gift_card_discount ?? 0),
            (int) ($order->points_redeemed ?? 0),
            $itemsSummary,
            $order->created_at?->format('Y-m-d H:i'),
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
