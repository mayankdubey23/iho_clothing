<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockRequest extends Model
{
    // 🛡️ Security: Laravel ko batana ki kaun se columns fill ho sakte hain
    protected $fillable = [
        'franchise_id',
        'sku_id',
        'quantity',
        'total_amount',
        'status'
    ];

    /**
     * 🔗 Relationships
     */
    
    // Yeh request kis Franchise ne ki hai?
    public function franchise()
    {
        return $this->belongsTo(User::class, 'franchise_id');
    }

    // Yeh request kis SKU (Product Variant) ke liye hai?
    public function sku()
    {
        return $this->belongsTo(Sku::class, 'sku_id');
    }
}