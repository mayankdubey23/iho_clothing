<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('colors')) {
            $colors = [
                ['White', '#FFFFFF'], ['Blue', '#2563EB'], ['Black', '#000000'], ['Multi', '#8B5CF6'],
                ['Green', '#16A34A'], ['Grey', '#94A3B8'], ['Navy Blue', '#1E3A8A'], ['Brown', '#7C2D12'],
                ['Maroon', '#7F1D1D'], ['Pink', '#EC4899'], ['Red', '#DC2626'], ['Beige', '#D6C2A8'],
                ['Yellow', '#FACC15'], ['Purple', '#7C3AED'], ['Cream', '#FFF7D6'], ['Peach', '#FDBA74'],
                ['Olive', '#6B7D2A'], ['Teal', '#0F766E'], ['Off White', '#F8F4E3'], ['Orange', '#F97316'],
                ['Sea Green', '#2E8B57'], ['Turquoise Blue', '#06B6D4'], ['Lime Green', '#84CC16'], ['Mustard', '#D4A017'],
                ['Khaki', '#BDB76B'], ['Lavender', '#C4B5FD'], ['Coffee Brown', '#4B2E2A'], ['Rust', '#B45309'],
                ['Burgundy', '#800020'], ['Charcoal', '#36454F'], ['Mauve', '#B784A7'], ['Silver', '#C0C0C0'],
                ['Gold', '#D4AF37'], ['Tan', '#D2B48C'], ['Rose', '#F43F5E'], ['Metallic', '#8C8C8C'],
                ['Taupe', '#8B8589'], ['Grey Melange', '#A8A29E'], ['Camel Brown', '#C19A6B'], ['Nude', '#E3BC9A'],
                ['Violet', '#8B5CF6'], ['Fluorescent Green', '#39FF14'], ['Magenta', '#D946EF'], ['Coral', '#FF7F50'],
                ['Steel', '#71797E'], ['Rose Gold', '#B76E79'], ['Bronze', '#CD7F32'],
            ];

            foreach ($colors as [$name, $hexCode]) {
                DB::table('colors')->updateOrInsert(
                    ['name' => $name],
                    ['hex_code' => $hexCode, 'is_active' => true, 'updated_at' => now(), 'created_at' => now()]
                );
            }
        }

        if (Schema::hasTable('sizes')) {
            $sizes = [
                ['Extra Small', 'XS'], ['Small', 'S'], ['Medium', 'M'], ['Large', 'L'],
                ['Extra Large', 'XL'], ['Double Extra Large', 'XXL'], ['Free Size', 'Free Size'],
            ];

            foreach ($sizes as [$name, $code]) {
                DB::table('sizes')->updateOrInsert(
                    ['code' => $code],
                    ['name' => $name, 'is_active' => true, 'updated_at' => now(), 'created_at' => now()]
                );
            }
        }
    }

    public function down(): void
    {
        // Keep admin-created product attributes intact.
    }
};
