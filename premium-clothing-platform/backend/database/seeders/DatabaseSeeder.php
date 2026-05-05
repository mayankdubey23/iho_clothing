<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;
use App\Models\Sku;
use App\Models\ProductImage;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Categories Banayein
        $tshirtsCategory = Category::create([
            'name' => 'Premium T-Shirts',
            'slug' => 'premium-tshirts',
        ]);

        $bottomsCategory = Category::create([
            'name' => 'Performance Bottoms',
            'slug' => 'performance-bottoms',
        ]);

        // 2. Product 1 Banayein (T-Shirt)
        $product1 = Product::create([
            'category_id' => $tshirtsCategory->id,
            'name' => 'Premium Dry-Fit Sports T-Shirt',
            'slug' => 'premium-dry-fit-sports-tshirt',
            'description' => 'High quality sweat-absorbent t-shirt for elite athletes. Perfect for rigorous training and fashion reviews.',
            'base_price' => 1299.00,
            'franchise_price' => 899.00,
            'is_active' => true,
        ]);

        // Product 1 ki SKUs
        $product1->skus()->createMany([
            ['sku_code' => 'DRYFIT-BLK-M', 'size' => 'M', 'color' => 'Deep Blue'],
            ['sku_code' => 'DRYFIT-BLK-L', 'size' => 'L', 'color' => 'Deep Blue'],
        ]);

        // Product 1 ki Multiple Images (Front, Back, 3D Render)
        $product1->images()->createMany([
            ['image_path' => 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80', 'is_primary' => true],
            ['image_path' => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', 'is_primary' => false], // Back angle
        ]);

        // 3. Product 2 Banayein (Track Pants)
        $product2 = Product::create([
            'category_id' => $bottomsCategory->id,
            'name' => 'Pro Compression Track Pants',
            'slug' => 'pro-compression-track-pants',
            'description' => 'Maximum stretch and comfort. Designed for heavy workouts and sleek urban aesthetics.',
            'base_price' => 1999.00,
            'franchise_price' => 1499.00,
            'is_active' => true,
        ]);

        // Product 2 ki SKUs
        $product2->skus()->createMany([
            ['sku_code' => 'TRACK-NAVY-M', 'size' => 'M', 'color' => 'White'],
        ]);

        // Product 2 ki Images
        $product2->images()->createMany([
            ['image_path' => 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80', 'is_primary' => true],
        ]);
    }
}