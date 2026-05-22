<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class AdminServiceAreaController extends Controller
{
    public function index(Request $request)
    {
        // 🚀 Fetch all mapped service areas
        $areas = DB::table('franchise_service_areas')
            ->join('users', 'franchise_service_areas.franchise_id', '=', 'users.id')
            ->select('franchise_service_areas.*', 'users.name as franchise_name', 'users.email')
            ->when($request->search, function ($query, $search) {
                $query->where('pincode', 'like', "%{$search}%")
                      ->orWhere('city', 'like', "%{$search}%")
                      ->orWhere('users.name', 'like', "%{$search}%");
            })
            ->orderBy('state')
            ->orderBy('city')
            ->paginate(15)
            ->withQueryString();

        // Need franchise list for the dropdowns
        $franchises = User::where('role', 'franchise')->where('status', 'active')->select('id', 'name', 'city')->get();

        $stats = [
            'total_covered' => DB::table('franchise_service_areas')->count(),
            'active_zones' => DB::table('franchise_service_areas')->where('status', 'active')->count(),
            'blocked_zones' => DB::table('franchise_service_areas')->where('status', 'blocked')->count(),
            'total_franchises' => $franchises->count(),
        ];

        return Inertia::render('Admin/ServiceAreas', [
            'areas' => $areas,
            'franchises' => $franchises,
            'stats' => $stats,
            'filters' => $request->only('search')
        ]);
    }

    // 🚀 Assign New Service Area
    public function store(Request $request)
    {
        $validated = $request->validate([
            'franchise_id' => 'required|exists:users,id',
            'state' => 'required|string',
            'city' => 'required|string',
            'pincode' => 'required|string|unique:franchise_service_areas,pincode', // Strict Duplicate Prevention
        ]);

        DB::table('franchise_service_areas')->insert([
            'franchise_id' => $validated['franchise_id'],
            'state' => $validated['state'],
            'city' => $validated['city'],
            'pincode' => $validated['pincode'],
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', "Pincode {$validated['pincode']} successfully assigned to the franchise!");
    }

    // 🚀 Transfer Area to Another Franchise
    public function transfer(Request $request, $id)
    {
        $request->validate(['new_franchise_id' => 'required|exists:users,id']);

        DB::table('franchise_service_areas')->where('id', $id)->update([
            'franchise_id' => $request->new_franchise_id,
            'updated_at' => now()
        ]);

        return back()->with('success', 'Service area ownership transferred successfully!');
    }

    // 🚀 Block/Unblock Specific Pincode
    public function toggleStatus($id)
    {
        $area = DB::table('franchise_service_areas')->where('id', $id)->first();
        if(!$area) return back()->withErrors('Area not found.');

        $newStatus = $area->status === 'active' ? 'blocked' : 'active';
        
        DB::table('franchise_service_areas')->where('id', $id)->update([
            'status' => $newStatus,
            'updated_at' => now()
        ]);

        return back()->with('success', "Service area marked as {$newStatus}.");
    }
}