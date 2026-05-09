<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'mobile_number',
        'password',
        'role',
        'serviceable_pincodes',
        'address_line',
        'city',
        'state',
        'pincode',
        'country',
        'store_name',
        'store_address',
        'store_contact',
        'business_hours',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'serviceable_pincodes' => 'array',
        ];
    }

    public function servicePincodes()
    {
        return $this->hasMany(FranchisePincode::class, 'franchise_id');
    }

    public function inventories()
    {
        return $this->hasMany(Inventory::class, 'franchise_id');
    }

    public function fulfilledOrders()
    {
        return $this->hasMany(Order::class, 'franchise_id');
    }
}
