<x-mail::message>
# Welcome to Sarafina, {{ $user->name }}!

We're thrilled to have you join our community. Sarafina is your gateway to confident African flavours and premium grocery delivery in Zimbabwe.

As a thank you for joining, we've added **20 welcome points** to your account! You can use these points for discounts on your future orders.

<x-mail::panel>
**Your Current Balance:** {{ $user->points_balance }} Points
</x-mail::panel>

<x-mail::button :url="config('app.frontend_url') . '/shop'">
Start Shopping
</x-mail::button>

If you have any questions, feel free to reply to this email or visit our [FAQ page]({{ config('app.frontend_url') }}/faq).

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
