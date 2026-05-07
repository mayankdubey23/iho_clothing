<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FranchisePlan extends Model
{
    // Agar $guarded ya $fillable pehle se likha hai toh usko waise hi rehne dein
    protected $guarded = [];

    // ✅ ADD THIS BLOCK: Yeh string ko automatically Array mein badal dega
    protected $casts = [
        'features_list' => 'array',
    ];
}