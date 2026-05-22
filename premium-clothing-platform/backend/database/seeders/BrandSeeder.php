<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Brand;
use Illuminate\Support\Str;

class BrandSeeder extends Seeder
{
    public function run()
    {
        $brands = ['IHO Studio', 'Nike', 'Under Armour', 'Adidas', 'Puma', 'Gymshark'];
        
        foreach ($brands as $brand) {
            Brand::updateOrCreate(
                ['name' => $brand],
                ['slug' => Str::slug($brand), 'is_active' => true]
            );
        }
    }
}