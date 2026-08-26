<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="#ffffff">

        <!-- Primary Meta Tags -->
        <title>{{ $meta['title'] ?? 'Sarafina • Confident African Flavours' }}</title>
        <meta name="description" content="{{ $meta['description'] ?? 'Discover authentic African flavours with Sarafina. Shop our range of high-quality groceries, spices, and pantry essentials delivered within Zimbabwe.' }}">
        <meta name="robots" content="index, follow">
        <link rel="canonical" href="{{ url()->current() }}">

        <!-- Open Graph / Facebook -->
        <meta property="og:site_name" content="Sarafina">
        <meta property="og:locale" content="en_GB">
        <meta property="og:type" content="website">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:title" content="{{ $meta['title'] ?? 'Sarafina • Confident African Flavours' }}">
        <meta property="og:description" content="{{ $meta['description'] ?? 'Discover authentic African flavours with Sarafina. Shop our range of high-quality groceries, spices, and pantry essentials delivered within Zimbabwe.' }}">
        <meta property="og:image" content="{{ $meta['image'] ?? asset('images/og-image.jpg') }}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">

        <!-- Twitter -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:site" content="@SarafinaStore">
        <meta name="twitter:url" content="{{ url()->current() }}">
        <meta name="twitter:title" content="{{ $meta['title'] ?? 'Sarafina • Confident African Flavours' }}">
        <meta name="twitter:description" content="{{ $meta['description'] ?? 'Discover authentic African flavours with Sarafina. Shop our range of high-quality groceries, spices, and pantry essentials delivered within Zimbabwe.' }}">
        <meta name="twitter:image" content="{{ $meta['image'] ?? asset('images/og-image.jpg') }}">

        <!-- Organisation Structured Data -->
        @php
            $orgJsonLd = json_encode([
                '@context' => 'https://schema.org',
                '@type' => 'Organization',
                'name' => 'Sarafina',
                'url' => config('app.url'),
                'logo' => asset('images/department logo/sarafina logo.jpeg'),
                'description' => 'Authentic African groceries and flavours delivered within Zimbabwe.',
                'sameAs' => [],
            ]);
            $websiteJsonLd = json_encode([
                '@context' => 'https://schema.org',
                '@type' => 'WebSite',
                'name' => 'Sarafina',
                'url' => config('app.url'),
                'potentialAction' => [
                    '@type' => 'SearchAction',
                    'target' => [
                        '@type' => 'EntryPoint',
                        'urlTemplate' => config('app.url') . '/shop?search={search_term_string}',
                    ],
                    'query-input' => 'required name=search_term_string',
                ],
            ]);
        @endphp
        <script type="application/ld+json">{!! $orgJsonLd !!}</script>

        <!-- Website Structured Data -->
        <script type="application/ld+json">{!! $websiteJsonLd !!}</script>

        @if(config('app.gtm_id'))
        <!-- Google Tag Manager -->
        <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','{{ config("app.gtm_id") }}');</script>
        <!-- End Google Tag Manager -->
        @endif

        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png?v={{ is_file(public_path('favicon-48x48.png')) ? filemtime(public_path('favicon-48x48.png')) : 1 }}">
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png?v={{ is_file(public_path('favicon-192x192.png')) ? filemtime(public_path('favicon-192x192.png')) : 1 }}">
        <link rel="icon" type="image/x-icon" href="/sarafina.ico?v={{ is_file(public_path('favicon.ico')) ? filemtime(public_path('favicon.ico')) : 1 }}" sizes="any">
        <link rel="shortcut icon" href="/favicon.ico?v={{ is_file(public_path('favicon.ico')) ? filemtime(public_path('favicon.ico')) : 1 }}">
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v={{ is_file(public_path('apple-touch-icon.png')) ? filemtime(public_path('apple-touch-icon.png')) : 1 }}">
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/main.tsx'])
    </head>
    <body>
        @if(config('app.gtm_id'))
        <!-- Google Tag Manager (noscript) -->
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id={{ config('app.gtm_id') }}"
        height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
        <!-- End Google Tag Manager (noscript) -->
        @endif
        <div id="root"></div>
    </body>
</html>
