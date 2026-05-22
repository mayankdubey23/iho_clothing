<?php

namespace App\Http\Controllers\Franchise;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ServiceAreaController extends Controller
{
    public function index()
    {
        $franchiseId = Auth::id();

        // 1. Fetch Currently Assigned Areas
        $areas = DB::table('franchise_service_areas')
            ->where('franchise_id', $franchiseId)
            ->orderBy('is_active', 'desc')
            ->get();

        // 2. Fetch Expansion Requests
        $requests = DB::table('service_area_requests')
            ->where('franchise_id', $franchiseId)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Franchise/ServiceArea', [
            'areas' => $areas,
            'requests' => $requests
        ]);
    }

    public function storeRequest(Request $request)
    {
        $validated = $request->validate([
            'request_type' => 'required|string|in:Add New Area,Change Area,Pincode Expansion',
            'requested_state' => 'required|string|max:100',
            'requested_city' => 'required|string|max:100',
            'requested_locality' => 'required|string|max:255',
            'requested_pincode' => 'required|string|max:10',
            'reason' => 'required|string|max:1000',
        ]);

        DB::table('service_area_requests')->insert([
            'franchise_id' => Auth::id(),
            'request_type' => $validated['request_type'],
            'requested_state' => $validated['requested_state'],
            'requested_city' => $validated['requested_city'],
            'requested_locality' => $validated['requested_locality'],
            'requested_pincode' => $validated['requested_pincode'],
            'reason' => $validated['reason'],
            'status' => 'Pending',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return back()->with('success', 'Service Area expansion request sent to Super Admin successfully!');
    }
}