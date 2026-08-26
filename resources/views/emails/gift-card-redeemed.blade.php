<x-mail::message>
# Gift Card Redeemed

Hello,

Your gift card was used for order **#{{ $order->order_number }}**.

<x-mail::panel>
**Redeemed Amount:** £{{ number_format($amount, 2) }}<br>
**Gift Card:** ****{{ substr($giftCard->code, -4) }}<br>
**Remaining Balance:** £{{ number_format($giftCard->balance, 2) }}
</x-mail::panel>

<x-mail::button :url="config('app.frontend_url') . '/orders/' . $order->id">
View Order
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
