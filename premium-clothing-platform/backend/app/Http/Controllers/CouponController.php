<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class CouponController extends Controller
{
    public function index()
    {
        abort_unless(auth()->user()->role === 'super_admin', 403);

        $activeCouponsQuery = Coupon::query();
        if (Schema::hasColumn('coupons', 'status')) {
            $activeCouponsQuery->where('status', 'active');
        } elseif (Schema::hasColumn('coupons', 'is_active')) {
            $activeCouponsQuery->where('is_active', true);
        }

        $mostUsedCode = Schema::hasColumn('coupons', 'used_count')
            ? Coupon::orderByDesc('used_count')->value('code')
            : Coupon::latest()->value('code');

        return Inertia::render('Admin/Coupons', [
            'coupons' => Coupon::latest()->paginate(15),
            'stats' => [
                'total_active' => $activeCouponsQuery->count(),
                'total_discount_given' => 0,
                'most_used_code' => $mostUsedCode ?? 'N/A',
            ],
            'filters' => [],
            'storeOffers' => Schema::hasTable('store_offers') ? DB::table('store_offers')->get() : [],
        ]);
    }

    public function store(Request $request)
    {
        abort_unless(auth()->user()->role === 'super_admin', 403);

        $validated = $request->validate([
            'code' => 'required|string|unique:coupons,code|max:50',
            'type' => 'required|in:flat,percentage,free_shipping,fixed,percent',
            'value' => 'nullable|numeric|min:0',
            'min_order_value' => 'nullable|numeric|min:0',
            'min_cart_amount' => 'nullable|numeric|min:0',
            'max_discount_amount' => 'nullable|numeric|min:0',
            'expiry_date' => 'nullable|date',
            'expires_at' => 'nullable|date',
            'usage_limit' => 'nullable|integer|min:1',
            'target_audience' => 'nullable|in:all,b2c_customers,b2b_franchises',
        ]);

        $validated['code'] = strtoupper(trim($validated['code']));
        $validated['type'] = match ($validated['type']) {
            'fixed' => 'flat',
            'percent' => 'percentage',
            default => $validated['type'],
        };
        $validated['min_order_value'] = $validated['min_order_value'] ?? $validated['min_cart_amount'] ?? 0;
        $validated['expiry_date'] = $validated['expiry_date'] ?? $validated['expires_at'] ?? null;
        $validated['target_audience'] = $validated['target_audience'] ?? 'all';
        $validated['status'] = 'active';

        Coupon::create($validated);

        return back()->with('success', 'Coupon created successfully!');
    }

    public function destroy(Coupon $coupon)
    {
        abort_unless(auth()->user()->role === 'super_admin', 403);

        $coupon->delete();

        return back()->with('success', 'Coupon deleted successfully!');
    }

    public function updateOffer(Request $request, $id)
    {
        abort_unless(auth()->user()->role === 'super_admin', 403);
        abort_unless(Schema::hasTable('store_offers'), 404, 'Store offer banners table is not available.');

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'offer_code' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        DB::table('store_offers')->where('id', $id)->update(array_merge($validated, [
            'updated_at' => now(),
        ]));

        return back()->with('success', 'Storefront offer banner updated successfully!');
    }

    public function apply(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'cart_total' => 'required|numeric|min:1',
        ]);

        $coupon = Coupon::where('code', strtoupper(trim($request->code)))->first();
        $isActive = $coupon && (
            isset($coupon->status)
                ? $coupon->status === 'active'
                : (bool) $coupon->is_active
        );

        if (! $coupon || ! $isActive) {
            return response()->json(['success' => false, 'error' => 'Invalid or inactive coupon code.'], 400);
        }

        $expiresAt = $coupon->expiry_date ?? $coupon->expires_at;

        if ($expiresAt && Carbon::now()->greaterThan($expiresAt)) {
            return response()->json(['success' => false, 'error' => 'This coupon has expired.'], 400);
        }

        $minimumCartAmount = $coupon->min_order_value ?? $coupon->min_cart_amount ?? 0;

        if ($request->cart_total < $minimumCartAmount) {
            return response()->json(['success' => false, 'error' => "Minimum order amount should be Rs {$minimumCartAmount} to apply this coupon."], 400);
        }

        $discountAmount = 0;

        if (in_array($coupon->type, ['fixed', 'flat'], true)) {
            $discountAmount = $coupon->value;
        } elseif (in_array($coupon->type, ['percent', 'percentage'], true)) {
            $discountAmount = ($request->cart_total * $coupon->value) / 100;

            if ($coupon->max_discount_amount) {
                $discountAmount = min($discountAmount, $coupon->max_discount_amount);
            }
        }

        $discountAmount = min($discountAmount, $request->cart_total);

        return response()->json([
            'success' => true,
            'message' => 'Coupon applied successfully!',
            'discount_amount' => $discountAmount,
            'new_total' => $request->cart_total - $discountAmount,
            'code' => $coupon->code,
        ]);
    }
}
