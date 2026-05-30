<?php

namespace App\Http\Controllers;

use App\Models\StorefrontBanner;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class AdminBannerController extends Controller
{
    // 1. Load the Admin Banner Dashboard
    public function index()
    {
        $banners = StorefrontBanner::orderBy('sort_order')->latest()->get();
        return Inertia::render('Admin/Banners', ['banners' => $banners]);
    }

    // 2. Secure Upload & Save
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'placement_type' => 'required|in:main_hero_slider,mid_page_banner,category_banner',
            'desktop_image' => 'required|image|mimes:jpeg,png,jpg,webp|max:4096',
            'mobile_image' => 'required|image|mimes:jpeg,png,jpg,webp|max:4096',
            'target_url' => 'nullable|string',
        ]);

        // Save images securely in storage/app/public/banners
        $desktopPath = $request->file('desktop_image')->store('banners/desktop', 'public');
        $mobilePath = $request->file('mobile_image')->store('banners/mobile', 'public');

        StorefrontBanner::create([
            'title' => $request->title,
            'placement_type' => $request->placement_type,
            'desktop_image_path' => $desktopPath,
            'mobile_image_path' => $mobilePath,
            'target_url' => $request->target_url,
            'sort_order' => (StorefrontBanner::max('sort_order') ?? 0) + 1, // Add to end of queue
            'is_active' => true,
        ]);

        return back()->with('success', 'Banner uploaded successfully!');
    }

    // 3. The Kill Switch (Activate/Deactivate)
    public function toggleStatus(StorefrontBanner $banner)
    {
        $banner->update(['is_active' => !$banner->is_active]);
        return back()->with('success', 'Banner visibility updated.');
    }

    // 4. Delete Permanently
    public function destroy(StorefrontBanner $banner)
    {
        // Pehle server se images udaao taaki space waste na ho
        Storage::disk('public')->delete([$banner->desktop_image_path, $banner->mobile_image_path]);
        
        // Fir database entry hata do
        $banner->delete();
        return back()->with('success', 'Banner deleted permanently.');
    }
}
