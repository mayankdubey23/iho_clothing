<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupportTicket extends Model
{
    use HasFactory;

    // Isse mass assignment errors nahi aayenge
    protected $guarded = [];

    // Inverse relationship (Har ticket ek user ka hota hai)
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
