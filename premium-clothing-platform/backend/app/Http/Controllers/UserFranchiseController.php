<?php

namespace App\Http\Controllers;

use App\Models\UserFranchise;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserFranchiseController extends Controller
{
    // 🛒 CONSUMER: Submit Application
    public function store(Request $request)
    {
        $request->validate([
            'franchise_plan_id' => 'required|exists:franchise_plans,id',
            'city' => 'required|string',
            'state' => 'required|string',
            'investment_budget' => 'required|string',
            'message' => 'nullable|string'
        ]);

        UserFranchise::create([
            'user_id' => auth()->id(),
            'franchise_plan_id' => $request->franchise_plan_id,
            'status' => 'pending',
            'details' => json_encode([
                'city' => $request->city,
                'state' => $request->state,
                'investment_budget' => $request->investment_budget,
                'message' => $request->message
            ])
        ]);

        return back()->with('success', 'Franchise application submitted successfully! We will contact you soon.');
    }

    // 👑 SUPER ADMIN: View specific franchise details (God Mode)
    public function show($id)
    {
        $franchise = UserFranchise::with(['user', 'franchisePlan'])->findOrFail($id);
        return inertia('Admin/Franchises/Show', ['franchise' => $franchise]);
    }

    // 👑 SUPER ADMIN: Approve/Reject Franchise
    public function updateStatus(Request $request, $application_id)
    {
        $request->validate(['status' => 'required|in:approved,rejected']);

        $application = UserFranchise::findOrFail($application_id);
        
        try {
            DB::beginTransaction();
            
            $application->update(['status' => $request->status]);

            // Agar approve ho gaya, toh customer ko franchise bana do aur wallet create kar do
            if ($request->status === 'approved') {
                $user = User::findOrFail($application->user_id);
                $user->update(['role' => 'franchise']);

                // Initialize empty wallet
                DB::table('wallets')->updateOrInsert(
                    ['franchise_id' => $user->id],
                    ['balance' => 0, 'total_earned' => 0, 'pending_dues' => 0]
                );
            }

            DB::commit();
            return back()->with('success', 'Application status updated to ' . $request->status);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Something went wrong.']);
        }
    }
}