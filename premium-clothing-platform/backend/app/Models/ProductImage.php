<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductImage extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
            'sort_order' => 'integer',
            'media_type' => 'string',
        ];
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
