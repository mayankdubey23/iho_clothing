<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    
    protected $guarded = []; 

    // Ek category mein bahut saare products hote hain
    public function products()
    {
        return $this->hasMany(Product::class);
    }
}