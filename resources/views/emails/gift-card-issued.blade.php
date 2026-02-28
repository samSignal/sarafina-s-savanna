<x-mail::message>
# You've got a Gift Card!

@if($giftCard->sender_name)
**{{ $giftCard->sender_name }}** sent you a Sarafina's Savanna Gift Card!
@elseif($giftCard->purchaser)
**{{ $giftCard->purchaser->name }}** sent you a Sarafina's Savanna Gift Card!
@else
You have received a Sarafina's Savanna Gift Card!
@endif

@if($giftCard->message)
<x-mail::panel>
"{{ $giftCard->message }}"
</x-mail::panel>
@endif

<x-mail::panel>
<div style="text-align: center;">
<h2 style="color: #188655; margin: 0;">£{{ number_format($giftCard->initial_value, 2) }}</h2>
<p style="margin: 10px 0;">Redeem code:</p>
<div style="font-size: 24px; font-weight: bold; letter-spacing: 2px; background: #fff; padding: 10px; border: 1px dashed #ccc; display: inline-block;">{{ $giftCard->code }}</div>
@if($giftCard->expiry_date)
<p style="font-size: 14px; color: #666; margin-top: 10px;">Expires on: {{ $giftCard->expiry_date->format('F j, Y') }}</p>
@endif
</div>
</x-mail::panel>

You can use this code to purchase anything from our store.

<x-mail::button :url="config('app.frontend_url')">
Start Shopping
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
