<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FranchisePlan extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'features_list' => 'array',
        ];
    }

    public function userFranchises()
    {
        return $this->hasMany(UserFranchise::class);
    }
}
