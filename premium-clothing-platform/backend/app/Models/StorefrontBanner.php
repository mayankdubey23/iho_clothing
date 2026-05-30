<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StorefrontBanner extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'placement_type',
        'desktop_image_path',
        'mobile_image_path',
        'target_url',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];
}
