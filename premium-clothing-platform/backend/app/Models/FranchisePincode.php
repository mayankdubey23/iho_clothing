<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FranchisePincode extends Model
{
    use HasFactory;
    
    protected $guarded = [];

    // Yeh pincode kis franchise ka hai
    public function franchise()
    {
        return $this->belongsTo(User::class, 'franchise_id');
    }
}