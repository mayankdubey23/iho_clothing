<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
            'min_order_value' => 'decimal:2',
            'min_cart_amount' => 'decimal:2',
            'max_discount_amount' => 'decimal:2',
            'expiry_date' => 'datetime',
            'expires_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }
}
