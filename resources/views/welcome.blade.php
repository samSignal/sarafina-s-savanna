<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Sarafina Market • Confident African Flavours</title>
        <link rel="icon" type="image/jpeg" href="/images/department%20logo/sarafina%20logo.jpeg">
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/main.tsx'])
    </head>
    <body>
        <div id="root"></div>
    </body>
</html>
