<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { max-width: 150px; }
        .card { background-color: #f9f9f9; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #ddd; }
        .code { font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #2c3e50; background: #fff; padding: 10px; border: 1px dashed #ccc; display: inline-block; margin: 10px 0; }
        .amount { font-size: 32px; color: #27ae60; font-weight: bold; }
        .details { margin-top: 20px; font-size: 14px; color: #666; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #999; }
        .btn { display: inline-block; padding: 10px 20px; background-color: #333; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Gift Card Redeemed</h2>
        </div>
        
        <p>Hello,</p>
        
        <p>Your gift card has been successfully redeemed for an order at Sarafina's Savanna.</p>

        <div class="card">
            <p>Redeemed Amount:</p>
            <div class="amount">£{{ number_format($amount, 2) }}</div>
            <p>Order Number: <strong>{{ $order->order_number }}</strong></p>
            <p>Gift Card Code: ****{{ substr($giftCard->code, -4) }}</p>
            
            <p class="details">Remaining Balance: £{{ number_format($giftCard->balance, 2) }}</p>
        </div>

        <div style="text-align: center;">
            <a href="{{ config('app.url') }}/client/orders/{{ $order->id }}" class="btn">View Order</a>
        </div>

        <div class="footer">
            <p>&copy; {{ date('Y') }} Sarafina's Savanna. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
