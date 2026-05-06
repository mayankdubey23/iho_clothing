<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    use HasFactory;

    protected $guarded = []; // Mass assignment allow karne ke liye

    // Yeh stock kis franchise ka hai (Agar Null hai toh Super Admin ka hai)
    public function franchise()
    {
        return $this->belongsTo(User::class, 'franchise_id');
    }
    
    // Yeh inventory kis specific SKU (color/size) ki hai
    public function sku()
    {
        return $this->belongsTo(Sku::class);
    }
}