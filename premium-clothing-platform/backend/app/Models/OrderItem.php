<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $guarded = [];

    // Yeh item kisi specific order se juda hai
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}