<x-mail::message>
# Loyalty Points Update

Hello {{ $user->name }},

@if($type === 'earned')
You've earned **+{{ $points }} points**.
@elseif($type === 'redeemed')
You've redeemed **{{ abs($points) }} points**.
@elseif($type === 'bonus')
You've received a bonus of **+{{ $points }} points**.
@elseif($type === 'expired')
Your loyalty points have expired due to inactivity.
@elseif($type === 'adjustment')
Your loyalty points balance has been adjusted by **{{ $points > 0 ? '+' : '' }}{{ $points }} points**.
@else
Your loyalty points balance has been updated.
@endif

@if($description)
<x-mail::panel>
{{ $description }}
</x-mail::panel>
@endif

<x-mail::panel>
**Current Balance:** {{ $balance }} points
</x-mail::panel>

<x-mail::button :url="config('app.frontend_url') . '/account'">
Go to My Account
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
