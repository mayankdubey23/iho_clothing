<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sku extends Model
{
    protected $guarded = [];

    // 👕 Sku belongs to a Product
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // 📦 Sku has many inventory records (Master + Franchises)
    // ✅ YE WALI LINE ADD KAREIN:
    public function inventories()
    {
        return $this->hasMany(Inventory::class, 'sku_id');
    }

    // Ek helper function master stock ke liye
    public function inventory()
    {
        return $this->hasOne(Inventory::class)->whereNull('franchise_id');
    }
}