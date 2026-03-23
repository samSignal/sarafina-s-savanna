<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminBannerController extends Controller
{
    public function index()
    {
        return Banner::orderBy('position')->orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'nullable|string|max:255',
                'subtitle' => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'image' => 'required|image|max:5120', // 5MB max
                'link_url' => 'nullable|string|max:255',
                'cta_text' => 'nullable|string|max:255',
                'position' => 'integer',
                'is_active' => 'boolean',
            ]);

            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('banners', 'public');
                $validated['image_path'] = '/storage/' . $path;
            }

            // Remove the 'image' file object from validated data as it's not a DB column
            unset($validated['image']);

            $banner = Banner::create($validated);

            return response()->json($banner, 201);
        } catch (\Exception $e) {
            \Log::error('Banner creation failed: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to create banner: ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, Banner $banner)
    {
        try {
            $validated = $request->validate([
                'title' => 'nullable|string|max:255',
                'subtitle' => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'image' => 'nullable|image|max:5120',
                'link_url' => 'nullable|string|max:255',
                'cta_text' => 'nullable|string|max:255',
                'position' => 'integer',
                'is_active' => 'boolean',
            ]);

            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($banner->image_path) {
                    $oldPath = str_replace('/storage/', '', $banner->image_path);
                    Storage::disk('public')->delete($oldPath);
                }
                
                $path = $request->file('image')->store('banners', 'public');
                $validated['image_path'] = '/storage/' . $path;
            }

            unset($validated['image']);

            $banner->update($validated);

            return response()->json($banner);
        } catch (\Exception $e) {
            \Log::error('Banner update failed: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to update banner: ' . $e->getMessage()], 500);
        }
    }

    public function destroy(Banner $banner)
    {
        if ($banner->image_path) {
            $oldPath = str_replace('/storage/', '', $banner->image_path);
            Storage::disk('public')->delete($oldPath);
        }
        
        $banner->delete();

        return response()->json(['message' => 'Banner deleted']);
    }

    public function updateOrder(Request $request)
    {
        $request->validate([
            'banners' => 'required|array',
            'banners.*.id' => 'required|exists:banners,id',
            'banners.*.position' => 'required|integer',
        ]);

        foreach ($request->banners as $item) {
            Banner::where('id', $item['id'])->update(['position' => $item['position']]);
        }

        return response()->json(['message' => 'Order updated']);
    }
}
