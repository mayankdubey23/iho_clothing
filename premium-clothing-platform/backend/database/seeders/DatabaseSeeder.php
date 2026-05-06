<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\Sku;
use App\Models\FranchisePincode;
use App\Models\Inventory;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. 👑 Super Admin Banayein
        $superAdmin = User::create([
            'name' => 'Main Admin',
            'email' => 'admin@ihoclothing.com',
            'password' => Hash::make('password'),
            'role' => 'super_admin'
        ]);

        // 2. 🏬 Ek Franchise Banayein
        $franchise = User::create([
            'name' => 'Noida Franchise (Sector 62)',
            'email' => 'noida@ihoclothing.com',
            'password' => Hash::make('password'),
            'role' => 'franchise'
        ]);

        // 3. 📍 Franchise ko Pincode assign karein (Sector 62 ka Pincode)
        FranchisePincode::create([
            'franchise_id' => $franchise->id,
            'pincode' => '201309'
        ]);

// 4. 👕 Ek Category aur Product banayein
        $category = Category::create([
            'name' => 'Premium Hoodies',
            'slug' => 'premium-hoodies',
            'is_active' => true
        ]);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Signature Black Hoodie',
            'slug' => 'signature-black-hoodie',
            'description' => 'Premium cotton hoodie for daily wear.',
            'base_price' => 1999.00,
            'franchise_price' => 1499.00, // <-- Yeh line humne add kardi hai!
            'is_active' => true
        ]);

// 5. 📏 Product ka ek SKU (Size/Color) banayein
        $sku = Sku::create([
            'product_id' => $product->id,
            'sku_code' => 'HOOD-BLK-M',
            'size' => 'M',
            'color' => 'Black'
            // Yahan se humne 'price' hata diya hai
        ]);

 // 6. 📦 Inventory / Stock Baantein
        
        // Super Admin (Main Warehouse) ko 100 piece dete hain
        Inventory::create([
            'franchise_id' => null, // NULL matlab Super Admin
            'sku_id' => $sku->id,
            'stock_quantity' => 100
        ]);

        // Noida Franchise ko 10 piece dete hain
        Inventory::create([
            'franchise_id' => $franchise->id, // Noida Franchise
            'sku_id' => $sku->id,
            'stock_quantity' => 10
        ]);

        $this->command->info('Database seeded successfully with Super Admin, Franchise, and Smart Checkout Test Data! 🚀');
    }
}