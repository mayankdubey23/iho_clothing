<?php

namespace App\Http\Controllers;

use App\Models\FranchisePlan;
use Illuminate\Http\Request;

class FranchisePlanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $plans = FranchisePlan::query()
            ->orderBy('price')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $plans,
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
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(FranchisePlan $franchisePlan)
    {
        return response()->json([
            'success' => true,
            'data' => $franchisePlan,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(FranchisePlan $franchisePlan)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, FranchisePlan $franchisePlan)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(FranchisePlan $franchisePlan)
    {
        //
    }
}
