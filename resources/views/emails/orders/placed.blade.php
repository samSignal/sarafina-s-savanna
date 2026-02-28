<x-mail::message>
# Order Confirmation

Thank you for your order{{ $order->user ? ', ' . $order->user->name : '' }}!

We've received your order **#{{ $order->order_number }}** and it is now being processed.

<x-mail::panel>
**Total Paid:** {{ $order->currency }} {{ number_format($order->total, 2) }}
@if($order->points_earned > 0)
<br>
**Points Earned:** {{ $order->points_earned }} Sarafina Points
@endif
</x-mail::panel>

## Order Summary

<x-mail::table>
| Item | Qty | Price | Total |
| :--- | :--: | :---: | :---: |
@foreach ($order->items as $item)
| {{ $item->product_name }} | {{ $item->quantity }} | {{ $order->currency }} {{ number_format($item->unit_price, 2) }} | {{ $order->currency }} {{ number_format($item->line_total, 2) }} |
@endforeach
</x-mail::table>

**Subtotal:** {{ $order->currency }} {{ number_format($order->items->sum('line_total'), 2) }}<br>
@if($order->delivery_cost > 0)
**Delivery:** {{ $order->currency }} {{ number_format($order->delivery_cost, 2) }}<br>
@endif
@if($order->discount_amount > 0)
**Discount:** -{{ $order->currency }} {{ number_format($order->discount_amount, 2) }}<br>
@endif
**Total:** {{ $order->currency }} {{ number_format($order->total, 2) }}

<x-mail::button :url="config('app.frontend_url') . '/orders/' . $order->id">
View Order Status
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
