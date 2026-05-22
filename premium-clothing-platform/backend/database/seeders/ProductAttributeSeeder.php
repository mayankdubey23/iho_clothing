<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductAttributeSeeder extends Seeder
{
    public function run()
    {
        // 🚀 Insert Premium Colors (Super Admin can change these names/hex later)
        $colors = [
            ['name' => 'Titanium Black', 'hex_code' => '#0F172A'],
            ['name' => 'Frost White', 'hex_code' => '#FFFFFF'],
            ['name' => 'Crimson Red', 'hex_code' => '#E94E3C'],
            ['name' => 'Midnight Navy', 'hex_code' => '#1E3A8A'],
            ['name' => 'Slate Grey', 'hex_code' => '#64748B'],
            ['name' => 'Olive Green', 'hex_code' => '#4B5320'],
        ];

        foreach ($colors as $color) {
            DB::table('colors')->updateOrInsert(
                ['name' => $color['name']],
                ['hex_code' => $color['hex_code'], 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]
            );
        }

        // 🚀 Insert Standard Sizes
        $sizes = [
            ['name' => 'Extra Small', 'code' => 'XS'],
            ['name' => 'Small', 'code' => 'S'],
            ['name' => 'Medium', 'code' => 'M'],
            ['name' => 'Large', 'code' => 'L'],
            ['name' => 'Extra Large', 'code' => 'XL'],
            ['name' => 'Double Extra Large', 'code' => 'XXL'],
        ];

        foreach ($sizes as $size) {
            DB::table('sizes')->updateOrInsert(
                ['code' => $size['code']],
                ['name' => $size['name'], 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}