<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    protected $fillable = ['sku_id', 'franchise_id', 'stock_quantity', 'damaged_quantity', 'low_stock_threshold'];

    public function sku()
    {
        return $this->belongsTo(Sku::class);
    }
}
