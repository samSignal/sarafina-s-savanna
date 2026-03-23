<x-mail::message>
# Refund Failed

Dear {{ $refund->order->user ? $refund->order->user->name : 'Customer' }},

We attempted to process a refund for your order **#{{ $refund->order->order_number }}**, but it failed.

**Reason:** {{ $refund->notes }}

Please contact our support team for further assistance.

<x-mail::button :url="config('app.frontend_url') . '/contact'">
Contact Support
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
