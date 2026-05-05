<?php

namespace App\Http\Controllers;

use App\Models\UserFranchise;
use Illuminate\Http\Request;

class UserFranchiseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $franchises = UserFranchise::query()
            ->with(['franchisePlan'])
            ->where('user_id', auth()->id())
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $franchises,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'franchise_plan_id' => ['required', 'exists:franchise_plans,id'],
            'business_name' => ['nullable', 'string', 'max:255'],
        ]);

        $franchise = UserFranchise::create([
            ...$validated,
            'user_id' => $request->user()->id,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Franchise application submitted successfully.',
            'data' => $franchise->load('franchisePlan'),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(UserFranchise $userFranchise)
    {
        abort_unless($userFranchise->user_id === auth()->id(), 403);

        return response()->json([
            'success' => true,
            'data' => $userFranchise->load('franchisePlan'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(UserFranchise $userFranchise)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, UserFranchise $userFranchise)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(UserFranchise $userFranchise)
    {
        //
    }
}
