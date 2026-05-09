<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $guarded = []; // Security allow karne ke liye

    protected $appends = ['payment'];

    protected $fillable = [
        'order_number',
        'full_name',
        'mobile_number',
        'alternate_mobile_number',
        'email',
        'customer_name',    // ✅ Added
        'customer_phone',   // ✅ Added
        'customer_email',   // ✅ Added
        'house_flat_building',
        'street_area_locality',
        'landmark',
        'city',
        'state',
        'pincode',
        'country',
        'shipping_address',
        'total_amount',
        'payment_method',
        'sales_channel',
        'status',
        'payment_status',
        'franchise_id',
        'fulfillment_type', // ✅ Added
        'razorpay_order_id',
        'razorpay_payment_id',
    ];

    // Ek order mein kai items (kapde) hote hain
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    // Kis franchise ne is order ko fulfill kiya (Profit kiska hua)
    public function fulfilledBy()
    {
        return $this->belongsTo(User::class, 'franchise_id');
    }

    public function franchise()
    {
        return $this->belongsTo(User::class, 'franchise_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getPaymentAttribute()
    {
        $status = $this->payment_status ?: 'pending';

        return [
            'method' => strtoupper($this->payment_method ?: 'cod'),
            'status' => $status === 'success' ? 'captured' : $status,
            'razorpay_order_id' => $this->razorpay_order_id,
            'razorpay_payment_id' => $this->razorpay_payment_id,
        ];
    }
}
