<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class AdminDeliveryController extends Controller
{
    public function index(Request $request)
    {
        $tab = $request->input('tab', 'pincodes');
        $search = $request->input('search', '');
        $data = [];

        if ($tab === 'pincodes') {
            $data = DB::table('pincode_serviceability')
                ->leftJoin('shipping_zones', 'pincode_serviceability.zone_id', '=', 'shipping_zones.id')
                ->select('pincode_serviceability.*', 'shipping_zones.name as zone_name')
                ->when($search, fn($q) => $q->where('pincode', 'like', "%{$search}%"))
                ->orderBy('pincode', 'asc')
                ->paginate(15)->withQueryString();
        } elseif ($tab === 'couriers') {
            $data = DB::table('courier_partners')->get();
        } elseif ($tab === 'shipments') {
            $data = DB::table('shipments')
                ->join('orders', 'shipments.order_id', '=', 'orders.id')
                ->leftJoin('courier_partners', 'shipments.courier_id', '=', 'courier_partners.id')
                ->select('shipments.*', 'orders.total_amount', 'courier_partners.name as courier_name')
                ->when($search, fn($q) => $q->where('shipments.tracking_number', 'like', "%{$search}%")->orWhere('orders.id', 'like', "%{$search}%"))
                ->orderBy('shipments.created_at', 'desc')
                ->paginate(15)->withQueryString();
        }

        $zones = DB::table('shipping_zones')->get();

        $stats = [
            'active_pincodes' => DB::table('pincode_serviceability')->where('status', 'active')->count(),
            'pending_shipments' => DB::table('shipments')->whereIn('delivery_status', ['Pending', 'Packed'])->count(),
            'couriers_count' => DB::table('courier_partners')->where('status', 'active')->count(),
        ];

        return Inertia::render('Admin/DeliverySettings', [
            'tabData' => $data,
            'zones' => $zones,
            'activeTab' => $tab,
            'stats' => $stats,
            'filters' => ['search' => $search]
        ]);
    }

    // 🚀 Store or Update Pincode Serviceability
    public function storePincode(Request $request)
    {
        $validated = $request->validate([
            'pincode' => 'required|string|max:10',
            'estimated_delivery_days' => 'required|integer|min:1',
            'is_cod_available' => 'required|boolean',
        ]);

        $exists = DB::table('pincode_serviceability')->where('pincode', $validated['pincode'])->first();

        if ($exists) {
            DB::table('pincode_serviceability')->where('id', $exists->id)->update([
                'estimated_delivery_days' => $validated['estimated_delivery_days'],
                'is_cod_available' => $validated['is_cod_available'],
                'updated_at' => now(),
            ]);
            return back()->with('success', 'Pincode settings updated.');
        } else {
            DB::table('pincode_serviceability')->insert([
                'pincode' => $validated['pincode'],
                'estimated_delivery_days' => $validated['estimated_delivery_days'],
                'is_cod_available' => $validated['is_cod_available'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            return back()->with('success', 'New Pincode mapped successfully.');
        }
    }

    // 🚀 Update Shipment Tracking (For an Order)
    public function updateTracking(Request $request, $id)
    {
        $validated = $request->validate([
            'courier_id' => 'nullable|exists:courier_partners,id',
            'tracking_number' => 'nullable|string',
            'delivery_status' => 'required|string',
        ]);

        DB::table('shipments')->where('id', $id)->update([
            'courier_id' => $validated['courier_id'],
            'tracking_number' => $validated['tracking_number'],
            'delivery_status' => $validated['delivery_status'],
            'shipped_at' => $validated['delivery_status'] === 'Shipped' ? now() : DB::raw('shipped_at'),
            'delivered_at' => $validated['delivery_status'] === 'Delivered' ? now() : DB::raw('delivered_at'),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Tracking details updated successfully.');
    }
}