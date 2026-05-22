<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run()
    {
        // 🚀 Aapka bataya hua exact Category & Subcategory structure
        $categoryTree = [
            'Men Sportswear' => [
                'Men T-Shirts', 'Men Track Pants', 'Men Shorts', 'Men Jackets', 
                'Men Gym Wear', 'Men Running Wear', 'Men Shoes', 'Men Accessories'
            ],
            'Women Sportswear' => [
                'Women T-Shirts', 'Sports Bras', 'Leggings', 'Track Pants', 
                'Yoga Wear', 'Running Wear', 'Jackets', 'Shoes', 'Accessories'
            ],
            'Gym Wear' => [
                'Gym T-Shirts', 'Compression Wear', 'Track Pants', 'Shorts', 
                'Sports Bras', 'Training Shoes', 'Gym Accessories'
            ],
            'Running Wear' => [
                'Running T-Shirts', 'Running Shorts', 'Running Track Pants', 
                'Running Shoes', 'Lightweight Jackets', 'Socks', 'Accessories'
            ],
            // Standalone Categories (No subcategories)
            'Yoga Wear' => [],
            'Outerwear & Jackets' => [],
            'Premium Hoodies' => [],
            'T-Shirts' => [],
            'Track Pants' => [],
            'Footwear' => [],
            'Accessories' => [],
        ];

        // Clear old categories to avoid duplicates (Optional, but good for fresh start)
        // Category::truncate(); 

        foreach ($categoryTree as $parentName => $subcategories) {
            // 1. Parent Category Create karo
            $parent = Category::firstOrCreate([
                'slug' => Str::slug($parentName)
            ], [
                'name' => $parentName,
                'is_active' => true,
                'parent_id' => null
            ]);

            // 2. Uske andar ki Subcategories Create karo
            foreach ($subcategories as $subName) {
                Category::firstOrCreate([
                    'slug' => Str::slug($subName)
                ], [
                    'name' => $subName,
                    'is_active' => true,
                    'parent_id' => $parent->id // Linking to Parent
                ]);
            }
        }
    }
}