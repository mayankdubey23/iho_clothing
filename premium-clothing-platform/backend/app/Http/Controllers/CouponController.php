<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Inertia\Inertia; // UI render karne ke liye import kiya hai

class CouponController extends Controller
{
    // ==========================================
    // 🖥️ ADMIN UI: Show Coupons Page
    // ==========================================
    public function index()
    {
        // Sirf Super Admin is page ko dekh sakta hai
        abort_unless(auth()->user()->role === 'super_admin', 403);
        
        return Inertia::render('Admin/Coupons', [
            'coupons' => Coupon::latest()->get()
        ]);
    }

    // ==========================================
    // 🖥️ ADMIN UI: Create New Coupon
    // ==========================================
    public function store(Request $request)
    {
        abort_unless(auth()->user()->role === 'super_admin', 403);
        
        $validated = $request->validate([
            'code' => 'required|string|unique:coupons,code|max:50',
            'type' => 'required|in:fixed,percent',
            'value' => 'required|numeric|min:1',
            'min_cart_amount' => 'required|numeric|min:0',
            'expires_at' => 'nullable|date',
            'is_active' => 'boolean'
        ]);

        // Code ko hamesha CAPITAL letters mein save karein (e.g. festival20 -> FESTIVAL20)
        $validated['code'] = strtoupper($validated['code']);
        Coupon::create($validated);

        return back()->with('success', 'Coupon created successfully!');
    }

    // ==========================================
    // 🖥️ ADMIN UI: Delete Coupon
    // ==========================================
    public function destroy(Coupon $coupon)
    {
        abort_unless(auth()->user()->role === 'super_admin', 403);
        
        $coupon->delete();
        
        return back()->with('success', 'Coupon deleted successfully!');
    }

    // ==========================================
    // 🛒 STOREFRONT API: Checkout Engine Ke Liye
    // ==========================================
    public function apply(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'cart_total' => 'required|numeric|min:1'
        ]);

        $coupon = Coupon::where('code', strtoupper($request->code))->first();

        // 1. Check agar coupon exist karta hai aur active hai
        if (!$coupon || !$coupon->is_active) {
            return response()->json(['success' => false, 'error' => 'Invalid or inactive coupon code.'], 400);
        }

        // 2. Check agar coupon expire ho gaya hai
        if ($coupon->expires_at && Carbon::now()->greaterThan($coupon->expires_at)) {
            return response()->json(['success' => false, 'error' => 'This coupon has expired.'], 400);
        }

        // 3. Check minimum cart amount
        if ($request->cart_total < $coupon->min_cart_amount) {
            return response()->json(['success' => false, 'error' => "Minimum order amount should be ₹{$coupon->min_cart_amount} to apply this coupon."], 400);
        }

        // 4. Calculate Discount
        $discountAmount = 0;
        if ($coupon->type === 'fixed') {
            $discountAmount = $coupon->value;
        } elseif ($coupon->type === 'percent') {
            $discountAmount = ($request->cart_total * $coupon->value) / 100;
        }

        // Discount cart total se zyada nahi ho sakta
        $discountAmount = min($discountAmount, $request->cart_total);
        $newTotal = $request->cart_total - $discountAmount;

        return response()->json([
            'success' => true,
            'message' => 'Coupon applied successfully!',
            'discount_amount' => $discountAmount,
            'new_total' => $newTotal,
            'code' => $coupon->code
        ]);
    }
}