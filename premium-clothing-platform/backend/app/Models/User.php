<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

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

    // Franchise ke mapped pincodes
    public function servicePincodes()
    {
        return $this->hasMany(FranchisePincode::class, 'franchise_id');
    }

    // Franchise ki inventory
    public function inventories()
    {
        return $this->hasMany(Inventory::class, 'franchise_id');
    }

    // Franchise ne jo orders fulfill kiye hain
    public function fulfilledOrders()
    {
        return $this->hasMany(Order::class, 'franchise_id');
    }

    // 🚀 NEW: Customer ne jo orders place kiye hain (Fixes the 500 error)
    public function orders()
    {
        return $this->hasMany(Order::class, 'user_id');
    }

    // 🚀 NEW: Customer ke support tickets (Fixes the 500 error)
    public function supportTickets()
    {
        return $this->hasMany(SupportTicket::class, 'user_id');
    }
}