<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $guarded = []; // Security allow karne ke liye

    // Ek order mein kai items (kapde) hote hain
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    // Kis franchise ne is order ko fulfill kiya (Profit kiska hua)
    public function fulfilledBy()
    {
        return $this->belongsTo(User::class, 'franchise_id');
    }
}