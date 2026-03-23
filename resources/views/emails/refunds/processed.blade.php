<x-mail::message>
# Refund Processed

Dear {{ $refund->order->user ? $refund->order->user->name : 'Customer' }},

Your refund for order **#{{ $refund->order->order_number }}** has been approved and processed.

<x-mail::panel>
**Refund Amount:** {{ $refund->order->currency }} {{ number_format($refund->amount, 2) }}
</x-mail::panel>

The amount should appear in your account within 5-10 business days, depending on your bank.

<x-mail::button :url="config('app.frontend_url') . '/orders/' . $refund->order->id">
View Order Details
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
