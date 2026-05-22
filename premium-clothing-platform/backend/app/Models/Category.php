<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $guarded = [];

    protected $fillable = ['name', 'slug', 'description', 'image', 'is_active', 'parent_id'];

    // 🚀 Yeh relation Laravel ko nested tree banane mein help karega
    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    public function parent()
    {
        return $this->belongsTo(self::class, 'parent_id');
    }



    public function subCategories()
    {
        // If a `sub_categories` table exists with a `category_id` FK
        // this will return all related subcategories.
        return $this->hasMany(SubCategory::class, 'category_id');
    }


    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
