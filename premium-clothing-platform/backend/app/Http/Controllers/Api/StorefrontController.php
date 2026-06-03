<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HeroSlide;
use Illuminate\Http\Request;

class StorefrontController extends Controller
{
    public function getHeroSlides()
    {
        // Sirf active slides fetch karo
        $slides = HeroSlide::where('is_active', true)->get();

        // React Native ko jis exact format mein data chahiye, usme map karo
        $formattedSlides = $slides->map(function ($slide) {
            return [
                'id' => (string) $slide->id,
                'tag' => $slide->tag,
                'title' => $slide->title,
                'btnText' => $slide->btn_text,
                // Image ka full URL banana zaroori hai mobile ke liye
                'image' => asset('storage/' . $slide->image_path)
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formattedSlides
        ], 200);
    }
}