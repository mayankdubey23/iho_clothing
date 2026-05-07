<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\Sku;
use App\Models\FranchisePincode;
use App\Models\Inventory;
use App\Models\FranchisePlan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. 👑 Super Admin Banayein
        $superAdmin = User::updateOrCreate(
            ['email' => 'admin@ihoclothing.com'],
            [
                'name' => 'Main Admin',
                'password' => Hash::make('password'),
                'role' => 'super_admin'
            ]
        );

        // 2. 🏬 Ek Franchise Banayein
        $franchise = User::updateOrCreate(
            ['email' => 'noida@ihoclothing.com'],
            [
                'name' => 'Noida Franchise (Sector 62)',
                'password' => Hash::make('password'),
                'role' => 'franchise'
            ]
        );

        // ✅ NEW: Initialize Wallet for Franchise
        DB::table('wallets')->updateOrInsert(
            ['franchise_id' => $franchise->id],
            ['balance' => 0, 'total_earned' => 0, 'pending_dues' => 0]
        );

        // 3. 📍 Franchise ko Pincode assign karein
        FranchisePincode::updateOrCreate(
            ['pincode' => '201309'],
            ['franchise_id' => $franchise->id]
        );

        // 4. 📝 ✅ NEW: Franchise Plans Banayein
        $plans = [
            [
                'name' => 'Basic Franchise', 
                'type' => 'offline', // ✅ Added missing 'type' column
                'price' => 50000, 
                // ✅ Changed 'features' to 'features_list' & converted to JSON
                'features_list' => json_encode(['City Level Rights', '10% Margin']) 
            ],
            [
                'name' => 'Premium Franchise', 
                'type' => 'both', // ✅ Added missing 'type' column
                'price' => 150000, 
                // ✅ Changed 'features' to 'features_list' & converted to JSON
                'features_list' => json_encode(['State Level Rights', '20% Margin', 'Dedicated Support'])
            ],
        ];

        foreach ($plans as $plan) {
            FranchisePlan::updateOrCreate(['name' => $plan['name']], $plan);
        }

        // 5. 👕 Ek Category aur Product banayein
        $category = Category::updateOrCreate(
            ['slug' => 'premium-hoodies'],
            ['name' => 'Premium Hoodies', 'is_active' => true]
        );

        $product = Product::updateOrCreate(
            ['slug' => 'signature-black-hoodie'],
            [
                'category_id' => $category->id,
                'name' => 'Signature Black Hoodie',
                'description' => 'Premium cotton hoodie for daily wear.',
                'mrp' => 2499.00,             // ✅ NEW: Added MRP for Enterprise structure
                'base_price' => 1999.00,      // Customer Selling Price
                'franchise_price' => 1499.00, // Price for Franchise
                'is_active' => true
            ]
        );

        // 6. 📏 Product ka ek SKU (Size/Color) banayein
        $sku = Sku::updateOrCreate(
            ['code' => 'HOOD-BLK-M'],
            [
                'product_id' => $product->id,
                'sku_code' => 'HOOD-BLK-M',
                'size' => 'M',
                'color' => 'Black'
            ]
        );

        // 7. 📦 Inventory / Stock Baantein
        
        // Super Admin (Main Warehouse) ko 100 piece
        Inventory::updateOrCreate(
            ['franchise_id' => null, 'sku_id' => $sku->id],
            ['stock_quantity' => 100]
        );

        // Noida Franchise ko 10 piece
        Inventory::updateOrCreate(
            ['franchise_id' => $franchise->id, 'sku_id' => $sku->id],
            ['stock_quantity' => 10]
        );

        $this->command->info('✅ Database seeded successfully with Super Admin, Franchise Plans, Wallets, and Test Products! 🚀');
    }
}