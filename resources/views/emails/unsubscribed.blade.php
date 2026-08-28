<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Unsubscribed - {{ config('app.name') }}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; background: #f8fafc; color: #1f2937; margin: 0; padding: 40px 16px; }
        .card { max-width: 420px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 32px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
        h1 { font-size: 20px; margin: 0 0 12px; }
        p { font-size: 14px; line-height: 1.6; color: #4b5563; margin: 0; }
        a { color: #188655; }
    </style>
</head>
<body>
    <div class="card">
        <h1>You're unsubscribed</h1>
        <p>{{ $email }} will no longer receive marketing emails from {{ config('app.name') }}. You'll still get order confirmations, refund updates, and other account-related emails.</p>
    </div>
</body>
</html>
