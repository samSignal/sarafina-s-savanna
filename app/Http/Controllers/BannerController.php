<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    public function index()
    {
        $banners = Banner::where('is_active', true)
            ->orderBy('position')
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($banners);
    }
}
