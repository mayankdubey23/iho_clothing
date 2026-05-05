<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\FranchisePlan;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@yourdomain.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ],
        );

        User::updateOrCreate(
            ['email' => 'customer@example.com'],
            [
                'name' => 'IHO Customer',
                'password' => Hash::make('password123'),
                'role' => 'customer',
            ],
        );

        $tshirtsCategory = Category::updateOrCreate(
            ['slug' => 'premium-tshirts'],
            ['name' => 'Premium T-Shirts', 'is_active' => true],
        );

        $bottomsCategory = Category::updateOrCreate(
            ['slug' => 'performance-bottoms'],
            ['name' => 'Performance Bottoms', 'is_active' => true],
        );

        $compressionCategory = Category::updateOrCreate(
            ['slug' => 'compression-sets'],
            ['name' => 'Compression Sets', 'is_active' => true],
        );

        $teamwearCategory = Category::updateOrCreate(
            ['slug' => 'teamwear-jerseys'],
            ['name' => 'Teamwear Jerseys', 'is_active' => true],
        );

        $accessoriesCategory = Category::updateOrCreate(
            ['slug' => 'training-accessories'],
            ['name' => 'Training Accessories', 'is_active' => true],
        );

        $product1 = Product::updateOrCreate(
            ['slug' => 'premium-dry-fit-sports-tshirt'],
            [
                'category_id' => $tshirtsCategory->id,
                'name' => 'Premium Dry-Fit Sports T-Shirt',
                'description' => 'High quality sweat-absorbent t-shirt for elite athletes. Perfect for rigorous training and fashion reviews.',
                'base_price' => 1299.00,
                'franchise_price' => 899.00,
                'is_active' => true,
            ],
        );

        collect([
            ['sku_code' => 'DRYFIT-BLK-M', 'size' => 'M', 'color' => 'Deep Blue', 'stock_quantity' => 45],
            ['sku_code' => 'DRYFIT-BLK-L', 'size' => 'L', 'color' => 'Deep Blue', 'stock_quantity' => 30],
        ])->each(function ($sku) use ($product1) {
            $createdSku = $product1->skus()->updateOrCreate(
                ['sku_code' => $sku['sku_code']],
                ['size' => $sku['size'], 'color' => $sku['color']],
            );

            $createdSku->inventory()->updateOrCreate(
                ['sku_id' => $createdSku->id],
                ['stock_quantity' => $sku['stock_quantity'], 'low_stock_threshold' => 10],
            );
        });

        $product1->images()->updateOrCreate(
            ['image_path' => 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80'],
            ['is_primary' => true, 'sort_order' => 1],
        );

        $product1->images()->updateOrCreate(
            ['image_path' => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'],
            ['is_primary' => false, 'sort_order' => 2],
        );

        $product2 = Product::updateOrCreate(
            ['slug' => 'pro-compression-track-pants'],
            [
                'category_id' => $bottomsCategory->id,
                'name' => 'Pro Compression Track Pants',
                'description' => 'Maximum stretch and comfort. Designed for heavy workouts and sleek urban aesthetics.',
                'base_price' => 1999.00,
                'franchise_price' => 1499.00,
                'is_active' => true,
            ],
        );

        $product2Sku = $product2->skus()->updateOrCreate(
            ['sku_code' => 'TRACK-NAVY-M'],
            ['size' => 'M', 'color' => 'White'],
        );

        $product2Sku->inventory()->updateOrCreate(
            ['sku_id' => $product2Sku->id],
            ['stock_quantity' => 22, 'low_stock_threshold' => 8],
        );

        $product2->images()->updateOrCreate(
            ['image_path' => 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80'],
            ['is_primary' => true, 'sort_order' => 1],
        );

        $product3 = Product::updateOrCreate(
            ['slug' => 'seamless-compression-training-set'],
            [
                'category_id' => $compressionCategory->id,
                'name' => 'Seamless Compression Training Set',
                'description' => 'Body-supportive top and tights set with flexible recovery comfort for gym, running, and high-intensity sessions.',
                'base_price' => 2499.00,
                'franchise_price' => 1799.00,
                'is_active' => true,
            ],
        );

        collect([
            ['sku_code' => 'COMP-ONYX-S', 'size' => 'S', 'color' => 'Onyx', 'stock_quantity' => 18],
            ['sku_code' => 'COMP-ONYX-M', 'size' => 'M', 'color' => 'Onyx', 'stock_quantity' => 26],
            ['sku_code' => 'COMP-SAGE-L', 'size' => 'L', 'color' => 'Sage', 'stock_quantity' => 14],
        ])->each(function ($sku) use ($product3) {
            $createdSku = $product3->skus()->updateOrCreate(
                ['sku_code' => $sku['sku_code']],
                ['size' => $sku['size'], 'color' => $sku['color']],
            );

            $createdSku->inventory()->updateOrCreate(
                ['sku_id' => $createdSku->id],
                ['stock_quantity' => $sku['stock_quantity'], 'low_stock_threshold' => 8],
            );
        });

        $product3->images()->updateOrCreate(
            ['image_path' => 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80'],
            ['is_primary' => true, 'sort_order' => 1],
        );

        $product4 = Product::updateOrCreate(
            ['slug' => 'academy-match-day-jersey'],
            [
                'category_id' => $teamwearCategory->id,
                'name' => 'Academy Match Day Jersey',
                'description' => 'Lightweight club jersey for teams, academies, and event merchandise with sharp retail presentation.',
                'base_price' => 1599.00,
                'franchise_price' => 1099.00,
                'is_active' => true,
            ],
        );

        collect([
            ['sku_code' => 'JERSEY-RED-M', 'size' => 'M', 'color' => 'Red', 'stock_quantity' => 34],
            ['sku_code' => 'JERSEY-RED-L', 'size' => 'L', 'color' => 'Red', 'stock_quantity' => 28],
            ['sku_code' => 'JERSEY-BLUE-XL', 'size' => 'XL', 'color' => 'Blue', 'stock_quantity' => 20],
        ])->each(function ($sku) use ($product4) {
            $createdSku = $product4->skus()->updateOrCreate(
                ['sku_code' => $sku['sku_code']],
                ['size' => $sku['size'], 'color' => $sku['color']],
            );

            $createdSku->inventory()->updateOrCreate(
                ['sku_id' => $createdSku->id],
                ['stock_quantity' => $sku['stock_quantity'], 'low_stock_threshold' => 10],
            );
        });

        $product4->images()->updateOrCreate(
            ['image_path' => 'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=800&q=80'],
            ['is_primary' => true, 'sort_order' => 1],
        );

        $product5 = Product::updateOrCreate(
            ['slug' => 'grip-training-duffel-kit'],
            [
                'category_id' => $accessoriesCategory->id,
                'name' => 'Grip Training Duffel Kit',
                'description' => 'Carry-ready sports accessory kit for franchise shelves, team orders, and bundled gymwear drops.',
                'base_price' => 1899.00,
                'franchise_price' => 1299.00,
                'is_active' => true,
            ],
        );

        $product5Sku = $product5->skus()->updateOrCreate(
            ['sku_code' => 'DUFFEL-BLK-STD'],
            ['size' => 'STD', 'color' => 'Black'],
        );

        $product5Sku->inventory()->updateOrCreate(
            ['sku_id' => $product5Sku->id],
            ['stock_quantity' => 40, 'low_stock_threshold' => 12],
        );

        $product5->images()->updateOrCreate(
            ['image_path' => 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80'],
            ['is_primary' => true, 'sort_order' => 1],
        );

        FranchisePlan::updateOrCreate(
            ['name' => 'Online Franchise'],
            [
                'type' => 'online',
                'price' => 49999.00,
                'features_list' => [
                    'Online storefront setup',
                    'Franchise product pricing',
                    'Digital catalog access',
                    'Basic onboarding support',
                ],
            ],
        );

        FranchisePlan::updateOrCreate(
            ['name' => 'Offline Franchise'],
            [
                'type' => 'offline',
                'price' => 149999.00,
                'features_list' => [
                    'Physical retail starter kit',
                    'Inventory guidance',
                    'Brand display support',
                    'Dedicated onboarding assistance',
                ],
            ],
        );

        FranchisePlan::updateOrCreate(
            ['name' => 'Hybrid Franchise'],
            [
                'type' => 'both',
                'price' => 199999.00,
                'features_list' => [
                    'Online and offline franchise rights',
                    'Priority inventory access',
                    'Advanced catalog support',
                    'Dedicated franchise success manager',
                ],
            ],
        );
    }
}
