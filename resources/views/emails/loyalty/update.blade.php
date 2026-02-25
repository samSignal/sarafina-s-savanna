<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
        .points-badge { background-color: #e9ecef; padding: 5px 10px; border-radius: 4px; font-weight: bold; }
        .positive { color: #16a34a; }
        .negative { color: #dc2626; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Loyalty Points Update</h2>
        </div>
        <div class="content">
            <p>Hello {{ $user->name }},</p>
            
            @if($type === 'earned')
                <p>Great news! You've earned <span class="points-badge positive">+{{ $points }} points</span> from your recent activity.</p>
                @if($description)
                    <p><em>{{ $description }}</em></p>
                @endif
            @elseif($type === 'redeemed')
                <p>You have successfully redeemed <span class="points-badge negative">{{ abs($points) }} points</span>.</p>
                @if($description)
                    <p><em>{{ $description }}</em></p>
                @endif
            @elseif($type === 'bonus')
                <p>Congratulations! You've received a bonus of <span class="points-badge positive">+{{ $points }} points</span>.</p>
                @if($description)
                    <p><em>{{ $description }}</em></p>
                @endif
            @elseif($type === 'expired')
                <p>We're sorry, but your loyalty points have expired due to inactivity.</p>
            @elseif($type === 'adjustment')
                <p>Your loyalty points balance has been adjusted by <span class="points-badge {{ $points > 0 ? 'positive' : 'negative' }}">{{ $points > 0 ? '+' : '' }}{{ $points }} points</span>.</p>
                @if($description)
                    <p>Reason: {{ $description }}</p>
                @endif
            @endif

            <p>Your current balance is: <strong>{{ $balance }} points</strong></p>

            <p>Visit your account to view your full transaction history and rewards.</p>
            
            <p>
                <a href="{{ config('app.url') }}/account" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to My Account</a>
            </p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
