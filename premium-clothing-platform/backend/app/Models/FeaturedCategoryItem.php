<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FeaturedCategoryItem extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'image_path',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active'  => 'boolean',
        'sort_order' => 'integer',
    ];

    /** Returns only active items ordered by sort_order */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
