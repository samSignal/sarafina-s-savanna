<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Http\Controllers\AdminGmailController;
use App\Http\Controllers\EmailUnsubscribeController;

Route::match(['get', 'post'], '/email/unsubscribe/{email}', [EmailUnsubscribeController::class, 'unsubscribe'])
    ->name('email.unsubscribe')
    ->middleware('signed');

 $faviconHandler = function () {
    $sourcePath = public_path('images/department logo/sarafina logo.jpeg');

    if (!is_file($sourcePath)) {
        abort(404);
    }

    if (
        function_exists('imagecreatefromjpeg')
        && function_exists('imagecreatetruecolor')
        && function_exists('imagesavealpha')
        && function_exists('imagecolorallocatealpha')
        && function_exists('imagefill')
        && function_exists('imagecopyresampled')
        && function_exists('imagepng')
    ) {
        $src = @imagecreatefromjpeg($sourcePath);

        if ($src !== false) {
            $srcW = imagesx($src);
            $srcH = imagesy($src);
            $sizes = [16, 32, 48, 64];
            $pngImages = [];

            foreach ($sizes as $size) {
                $dst = imagecreatetruecolor($size, $size);
                imagesavealpha($dst, true);
                $transparent = imagecolorallocatealpha($dst, 0, 0, 0, 127);
                imagefill($dst, 0, 0, $transparent);

                $scale = min($size / max(1, $srcW), $size / max(1, $srcH));
                $newW = (int) max(1, round($srcW * $scale));
                $newH = (int) max(1, round($srcH * $scale));
                $dstX = (int) floor(($size - $newW) / 2);
                $dstY = (int) floor(($size - $newH) / 2);

                imagecopyresampled($dst, $src, $dstX, $dstY, 0, 0, $newW, $newH, $srcW, $srcH);

                ob_start();
                imagepng($dst);
                $pngImages[$size] = (string) ob_get_clean();
                imagedestroy($dst);
            }

            imagedestroy($src);

            $count = count($pngImages);
            $header = pack('vvv', 0, 1, $count);
            $dir = '';
            $data = '';
            $offset = 6 + (16 * $count);

            foreach ($pngImages as $size => $png) {
                $w = $size >= 256 ? 0 : $size;
                $h = $size >= 256 ? 0 : $size;
                $bytes = strlen($png);
                $dir .= pack('CCCCvvVV', $w, $h, 0, 0, 1, 32, $bytes, $offset);
                $data .= $png;
                $offset += $bytes;
            }

            $ico = $header . $dir . $data;

            return response($ico, 200)
                ->header('Content-Type', 'image/x-icon')
                ->header('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
    }

    return response()->file($sourcePath, [
        'Content-Type' => 'image/jpeg',
        'Cache-Control' => 'no-cache, no-store, must-revalidate',
    ]);
};

Route::get('/favicon.ico', $faviconHandler);
Route::get('/sarafina.ico', $faviconHandler);

Route::get('/fix-sequences', function () {
    if (config('database.default') !== 'pgsql') {
        return 'Not PostgreSQL, skipping sequence fix.';
    }

    $tables = [
        'users',
        'products',
        'orders',
        'order_items',
        'loyalty_transactions',
        'gift_cards',
        'gift_card_transactions',
        'gift_card_audit_logs',
        'categories',
        'departments',
        'delivery_settings',
        'loyalty_settings',
        'general_settings'
    ];

    $results = [];

    foreach ($tables as $table) {
        if (Schema::hasTable($table)) {
            try {
                // Get the current max ID
                $maxId = DB::table($table)->max('id') ?? 0;
                $nextId = $maxId + 1;

                // Reset the sequence
                DB::statement("SELECT setval('{$table}_id_seq', {$nextId}, false)");

                $results[$table] = "Fixed: Max ID is {$maxId}, Sequence set to {$nextId}";
            } catch (\Exception $e) {
                $results[$table] = "Error: " . $e->getMessage();
            }
        } else {
            $results[$table] = "Table not found";
        }
    }

    return response()->json($results);
});

Route::get('/google/oauth/callback', [AdminGmailController::class, 'oauthCallback']);

Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
