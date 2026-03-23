<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    public function index()
    {
        return Banner::where('is_active', true)
            ->orderBy('position')
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
