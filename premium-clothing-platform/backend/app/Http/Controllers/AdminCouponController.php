<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AdminCouponController extends Controller
{
    public function index(Request $request)
    {
        // 🚀 Fetch all coupons with usage stats
        $coupons = DB::table('coupons')
            ->when($request->search, function ($query, $search) {
                $query->where('code', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $activeCouponsQuery = DB::table('coupons');
        if (Schema::hasColumn('coupons', 'status')) {
            $activeCouponsQuery->where('status', 'active');
        } elseif (Schema::hasColumn('coupons', 'is_active')) {
            $activeCouponsQuery->where('is_active', true);
        }

        $mostUsedCode = Schema::hasColumn('coupons', 'used_count')
            ? DB::table('coupons')->orderBy('used_count', 'desc')->value('code')
            : DB::table('coupons')->latest()->value('code');

        $stats = [
            'total_active' => $activeCouponsQuery->count(),
            'total_discount_given' => Schema::hasTable('coupon_usages')
                ? DB::table('coupon_usages')->sum('discount_applied')
                : 0,
            'most_used_code' => $mostUsedCode ?? 'N/A',
        ];

        // 🚀 NEW: Fetch Storefront Visual Offers (Banners)
        $storeOffers = Schema::hasTable('store_offers')
            ? DB::table('store_offers')
                ->when(Schema::hasColumn('store_offers', 'sort_order'), fn ($query) => $query->orderBy('sort_order'))
                ->latest()
                ->get()
                ->map(function ($offer) {
                $offer->offer_code = $offer->offer_code ?? $offer->code ?? null;
                $offer->code = $offer->code ?? $offer->offer_code ?? null;
                $offer->subtitle = $offer->subtitle ?? '';
                $offer->display_type = $offer->display_type ?? 'store_offer';
                $offer->bg_image = $offer->bg_image ?? null;
                $offer->target_url = $offer->target_url ?? '/shop';
                $offer->sort_order = $offer->sort_order ?? 0;
                return $offer;
            })
            : collect();

        return Inertia::render('Admin/Coupons', [
            'coupons' => $coupons,
            'stats' => $stats,
            'filters' => $request->only('search'),
            'storeOffers' => $storeOffers // 👈 Pass to React
        ]);
    }

    // 🚀 Store New Coupon
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:coupons,code|max:20',
            'type' => 'required|in:flat,percentage,free_shipping',
            'value' => 'nullable|numeric|min:0',
            'min_order_value' => 'required|numeric|min:0',
            'max_discount_amount' => 'nullable|numeric|min:0',
            'expiry_date' => 'nullable|date',
            'usage_limit' => 'nullable|integer|min:1',
            'target_audience' => 'required|in:all,b2c_customers,b2b_franchises',
        ]);

        $validated['code'] = strtoupper(trim($validated['code'])); // Standardize CODE
        $validated['created_at'] = now();
        $validated['updated_at'] = now();

        DB::table('coupons')->insert($validated);

        return back()->with('success', "Coupon {$validated['code']} created successfully!");
    }

    // 🚀 Toggle Status (Enable/Disable)
    public function toggleStatus($id)
    {
        $coupon = DB::table('coupons')->where('id', $id)->first();
        if(!$coupon) return back()->withErrors('Coupon not found.');

        $newStatus = $coupon->status === 'active' ? 'inactive' : 'active';
        
        DB::table('coupons')->where('id', $id)->update([
            'status' => $newStatus,
            'updated_at' => now()
        ]);

        return back()->with('success', "Coupon marked as {$newStatus}.");
    }

    // 🚀 Delete Coupon
    public function destroy($id)
    {
        DB::table('coupons')->where('id', $id)->delete();
        return back()->with('success', 'Coupon permanently deleted.');
    }

    // ====================================================================
    // 🚀 NEW: Method to Update the Visual Storefront Offers (Banners)
    // ====================================================================
    public function storeOffer(Request $request)
    {
        abort_unless(Schema::hasTable('store_offers'), 404, 'Store offer banners table is not available.');

        DB::table('store_offers')->insert($this->offerPayload($this->validateOffer($request), true));

        return back()->with('success', 'Storefront offer banner created successfully!');
    }

    public function updateOffer(Request $request, $id)
    {
        abort_unless(Schema::hasTable('store_offers'), 404, 'Store offer banners table is not available.');

        DB::table('store_offers')->where('id', $id)->update($this->offerPayload($this->validateOffer($request)));

        return back()->with('success', 'Storefront offer banner updated successfully!');
    }

    public function destroyOffer($id)
    {
        abort_unless(Schema::hasTable('store_offers'), 404, 'Store offer banners table is not available.');

        DB::table('store_offers')->where('id', $id)->delete();

        return back()->with('success', 'Storefront offer banner deleted.');
    }

    private function validateOffer(Request $request): array
    {
        return $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'offer_code' => 'nullable|string|max:50',
            'display_type' => 'nullable|string|max:50',
            'bg_image' => 'nullable|string|max:1000',
            'target_url' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);
    }

    private function offerPayload(array $validated, bool $creating = false): array
    {
        $payload = [
            'title' => $validated['title'],
            'is_active' => $validated['is_active'] ?? false,
            'updated_at' => now(),
        ];

        if ($creating) {
            $payload['created_at'] = now();
        }

        foreach ([
            'subtitle' => $validated['subtitle'] ?? null,
            'display_type' => $validated['display_type'] ?? 'store_offer',
            'bg_image' => $validated['bg_image'] ?? null,
            'target_url' => $validated['target_url'] ?? '/shop',
            'sort_order' => $validated['sort_order'] ?? 0,
        ] as $column => $value) {
            if (Schema::hasColumn('store_offers', $column)) {
                $payload[$column] = $value;
            }
        }

        if (Schema::hasColumn('store_offers', 'offer_code')) {
            $payload['offer_code'] = $validated['offer_code'] ?? null;
        } elseif (Schema::hasColumn('store_offers', 'code')) {
            $payload['code'] = $validated['offer_code'] ?? null;
        }

        return $payload;
    }
}
