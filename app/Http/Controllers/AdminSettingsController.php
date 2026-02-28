<?php

namespace App\Http\Controllers;

use App\Models\GeneralSetting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdminSettingsController extends Controller
{
    public function getSettings(): JsonResponse
    {
        $setting = GeneralSetting::firstOrCreate(['id' => 1], [
            'store_name' => 'Sarafina Market',
            'support_email' => 'hello@sarafina.africa',
            'support_phone_uk' => '+44 123 456 7890',
            'support_phone_zim' => '+263 77 123 4567',
            'address_uk' => "123 African Market Street\nLondon, UK",
            'address_zim' => "Unit 5, Msasa Industrial Park\nHarare, Zimbabwe",
            'facebook_url' => 'https://www.facebook.com/share/g/1aVTavof8R/?mibextid=wwXIfr',
            'instagram_url' => 'https://www.instagram.com/sarafinafoods?igsh=MWwxanpvZDU3MGZ6cA%3D%3D&utm_source=qr',
            'tiktok_url' => 'https://www.tiktok.com/@sarafinafoods?_r=1&_t=ZN-94CSVlThI1u',
        ]);
        
        return response()->json($setting);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'store_name' => 'nullable|string|max:255',
            'support_email' => 'nullable|email|max:255',
            'support_phone_uk' => 'nullable|string|max:255',
            'support_phone_zim' => 'nullable|string|max:255',
            'address_uk' => 'nullable|string',
            'address_zim' => 'nullable|string',
            'facebook_url' => 'nullable|url',
            'instagram_url' => 'nullable|url',
            'tiktok_url' => 'nullable|url',
        ]);

        $setting = GeneralSetting::firstOrCreate(['id' => 1]);
        $setting->update($validated);

        return response()->json($setting);
    }
}
