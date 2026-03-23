<x-mail::message>
# Refund Initiated

Dear {{ $refund->order->user ? $refund->order->user->name : 'Customer' }},

We have received a refund request for your order **#{{ $refund->order->order_number }}**.

**Refund Amount:** {{ $refund->order->currency }} {{ number_format($refund->amount, 2) }}

**Reason:** {{ $refund->reason }}

Our team will review your request shortly. You will be notified once the refund is processed.

<x-mail::button :url="config('app.frontend_url') . '/orders/' . $refund->order->id">
View Order Details
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
