<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserFranchise extends Model
{
    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function franchisePlan()
    {
        return $this->belongsTo(FranchisePlan::class);
    }
}
