<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Orders Export</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #1f2937; }
        h1 { font-size: 16px; margin: 0 0 4px; }
        .meta { color: #6b7280; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #e5e7eb; padding: 5px 6px; text-align: left; vertical-align: top; }
        th { background: #f8fafc; font-weight: bold; }
        .num { text-align: right; }
        .items { max-width: 220px; }
    </style>
</head>
<body>
    <h1>Sarafina — Orders Export</h1>
    <p class="meta">Generated {{ now()->format('Y-m-d H:i') }} &middot; {{ $orders->count() }} order(s)</p>

    <table>
        <thead>
            <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Delivery</th>
                <th class="num">Total</th>
                <th class="num">Total (GBP)</th>
                <th>Items</th>
                <th>Placed At</th>
            </tr>
        </thead>
        <tbody>
            @foreach($orders as $order)
                <tr>
                    <td>{{ $order->order_number }}</td>
                    <td>
                        {{ $order->user?->name ?? 'Unknown customer' }}<br>
                        <span style="color:#6b7280;">{{ $order->user?->email }}</span>
                    </td>
                    <td>{{ $order->status }}</td>
                    <td>{{ $order->payment_status }}</td>
                    <td>{{ $order->delivery_status ?? '-' }}</td>
                    <td class="num">{{ $order->currency }} {{ number_format((float) $order->total, 2) }}</td>
                    <td class="num">£{{ number_format((float) $order->total_gbp, 2) }}</td>
                    <td class="items">
                        @foreach($order->items as $item)
                            {{ $item->quantity }}x {{ $item->product_name }}@if(!$loop->last), @endif
                        @endforeach
                    </td>
                    <td>{{ $order->created_at?->format('Y-m-d H:i') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
