<?php
use App\Models\Order;

$orders = Order::latest()->take(5)->get();
foreach ($orders as $order) {
    echo "Order ID: {$order->id}, Payment Status: '{$order->payment_status}'\n";
}
