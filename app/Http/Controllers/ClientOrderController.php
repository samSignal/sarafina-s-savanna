<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ClientOrderController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $orders = $user->orders()
            ->with(['items.product'])
            ->latest()
            ->get();

        return response()->json($orders);
    }

    public function show(Request $request, int $id)
    {
        $user = $request->user();

        $order = $user->orders()
            ->with(['items.product'])
            ->findOrFail($id);

        return response()->json($order);
    }
}
