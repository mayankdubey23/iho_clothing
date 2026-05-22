<?php

// app/Models/Product.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'mrp' => 'decimal:2',
            'base_price' => 'decimal:2',
            'franchise_price' => 'decimal:2',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'is_best_seller' => 'boolean',
            'show_on_men_page' => 'boolean',
            'discount_price' => 'decimal:2',
            'rating' => 'decimal:1',
        ];
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function gallery()
    {
        return $this->hasMany(ProductImage::class); // Assuming you have a ProductImage model
    }

    public function available_colors()
    {
        return $this->belongsToMany(Color::class, 'product_colors'); 
    }

    public function skus()
    {
        return $this->hasMany(Sku::class);
    }

    public function available_sizes()
    {
        return $this->belongsToMany(Size::class, 'product_sizes');
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}
