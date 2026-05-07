<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockTransaction extends Model
{
    // Security check: Kaun se columns fillable hain
    protected $fillable = [
        'sku_id', 
        'franchise_id', 
        'transaction_type', 
        'quantity', 
        'reason', 
        'performed_by'
    ];

    /**
     * 🔗 Relationships
     */
    public function sku() {
        return $this->belongsTo(Sku::class);
    }

    public function franchise() {
        return $this->belongsTo(User::class, 'franchise_id');
    }

    public function performer() {
        return $this->belongsTo(User::class, 'performed_by');
    }
}