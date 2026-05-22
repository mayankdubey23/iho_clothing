<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreOffer extends Model
{
    protected $fillable = ['title', 'code', 'is_active'];
}