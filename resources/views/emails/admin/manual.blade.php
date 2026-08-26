<!doctype html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f8fafc;">
    @php
        $logoPath = public_path('images/department logo/sarafina logo.jpeg');
        $logoUrl = rtrim((string) config('app.url'), '/').'/images/department%20logo/sarafina%20logo.jpeg';
        $logoSrc = isset($message) && is_object($message) && file_exists($logoPath) ? $message->embed($logoPath) : $logoUrl;
    @endphp
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:24px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
                    <tr>
                        <td style="padding:20px 24px;text-align:center;background:#ffffff;">
                            <img src="{{ $logoSrc }}" alt="Sarafina" style="max-width:160px;height:auto;display:inline-block;" />
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0 24px 8px 24px;color:#52525b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';font-size:16px;line-height:1.5;">
                            {!! $bodyHtml !!}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:16px 24px 20px 24px;border-top:1px solid #e5e7eb;color:#6b7280;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';font-size:12px;line-height:1.6;">
                            <strong style="color:#111827;">Sarafina</strong><br />
                            <a href="{{ config('app.url') }}" style="color:#188655;text-decoration:none;">{{ config('app.url') }}</a><br />
                            Support: <a href="mailto:support@sarafina.co.uk" style="color:#188655;text-decoration:none;">support@sarafina.co.uk</a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
