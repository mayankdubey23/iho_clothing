<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role', // <-- Yeh add karna zaroori tha
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // ==========================================
    // 🏢 FRANCHISE & ADMIN RELATIONSHIPS
    // ==========================================

    // Franchise ke sabhi service pincodes
    public function servicePincodes()
    {
        return $this->hasMany(FranchisePincode::class, 'franchise_id');
    }

    // Franchise ka apna stock/inventory
    public function inventories()
    {
        return $this->hasMany(Inventory::class, 'franchise_id');
    }

    // Franchise ne kitne orders fulfill kiye
    public function fulfilledOrders()
    {
        return $this->hasMany(Order::class, 'franchise_id');
    }
}