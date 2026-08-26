<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

$typoPrefix = '/infoproject';
$correctPrefix = '/inforproject';
$uri = $_SERVER['REQUEST_URI'] ?? '/';
if (is_string($uri) && ($uri === $typoPrefix || str_starts_with($uri, $typoPrefix . '/'))) {
    $target = $correctPrefix . (substr($uri, strlen($typoPrefix)) ?: '/');
    header('Location: ' . $target, true, 301);
    exit;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());
