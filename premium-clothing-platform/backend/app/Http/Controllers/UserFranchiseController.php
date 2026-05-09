<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class UserFranchiseController extends Controller
{
    public function index(Request $request)
    {
        $hasStatus = Schema::hasColumn('users', 'status');

        $franchises = User::where('role', 'franchise')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($sub) use ($search) {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($hasStatus && $request->status, fn ($query, $status) => $query->where('status', $status))
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(function (User $user) use ($hasStatus) {
                $stats = DB::table('orders')
                    ->where('franchise_id', $user->id)
                    ->selectRaw('COUNT(id) as total_orders, COALESCE(SUM(total_amount), 0) as total_revenue')
                    ->first();

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'status' => $hasStatus ? ($user->status ?? 'active') : 'active',
                    'city' => $user->city ?? 'N/A',
                    'state' => $user->state ?? 'N/A',
                    'margin' => 0,
                    'commission' => 0,
                    'total_orders' => (int) ($stats->total_orders ?? 0),
                    'revenue' => (float) ($stats->total_revenue ?? 0),
                    'joined_at' => optional($user->created_at)->format('d M Y'),
                ];
            });

        $totalFranchises = User::where('role', 'franchise')->count();
        $pendingApplications = Schema::hasTable('franchise_applications')
            ? DB::table('franchise_applications')->where('status', 'pending')->count()
            : DB::table('user_franchises')->where('status', 'pending')->count();

        $summary = [
            'total' => $totalFranchises,
            'active' => $hasStatus
                ? User::where('role', 'franchise')->where('status', 'active')->count()
                : $totalFranchises,
            'pending' => $pendingApplications,
            'total_revenue' => DB::table('orders')->whereNotNull('franchise_id')->sum('total_amount'),
        ];

        return Inertia::render('FranchiseManagement', [
            'franchises' => $franchises,
            'summary' => $summary,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'margin' => 'nullable|numeric|min:0|max:100',
            'commission' => 'nullable|numeric|min:0|max:100',
        ]);

        DB::transaction(function () use ($validated) {
            $userData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => 'franchise',
            ];

            foreach (['city', 'state'] as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $userData[$column] = $validated[$column];
                }
            }

            if (Schema::hasColumn('users', 'status')) {
                $userData['status'] = 'active';
            }

            $user = User::create($userData);

            if (Schema::hasTable('wallets')) {
                DB::table('wallets')->updateOrInsert(
                    ['franchise_id' => $user->id],
                    [
                        'balance' => 0,
                        'total_earned' => 0,
                        'pending_dues' => 0,
                        'updated_at' => now(),
                        'created_at' => now(),
                    ]
                );
            }
        });

        return back()->with('success', 'New franchise created and activated!');
    }

    public function toggleStatus($id)
    {
        if (!Schema::hasColumn('users', 'status')) {
            return back()->withErrors([
                'status' => 'Franchise status column is not available in the users table.',
            ]);
        }

        $user = User::where('role', 'franchise')->findOrFail($id);
        $user->status = ($user->status === 'active') ? 'blocked' : 'active';
        $user->save();

        return back()->with('success', 'Franchise status updated successfully.');
    }

    public function updateStatus(Request $request, $application)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected',
        ]);

        if (!Schema::hasTable('user_franchises')) {
            return back()->withErrors(['status' => 'Franchise applications table is not available.']);
        }

        DB::table('user_franchises')
            ->where('id', $application)
            ->update([
                'status' => $validated['status'],
                'updated_at' => now(),
            ]);

        return back()->with('success', 'Application status updated successfully.');
    }

    public function show($id)
    {
        $franchise = User::where('role', 'franchise')->findOrFail($id);

        return Inertia::render('FranchiseManagement', [
            'franchises' => User::where('role', 'franchise')
                ->where('id', $franchise->id)
                ->paginate(10)
                ->through(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'status' => Schema::hasColumn('users', 'status') ? ($user->status ?? 'active') : 'active',
                    'city' => $user->city ?? 'N/A',
                    'state' => $user->state ?? 'N/A',
                    'margin' => 0,
                    'commission' => 0,
                    'total_orders' => DB::table('orders')->where('franchise_id', $user->id)->count(),
                    'revenue' => (float) DB::table('orders')->where('franchise_id', $user->id)->sum('total_amount'),
                    'joined_at' => optional($user->created_at)->format('d M Y'),
                ]),
            'summary' => [
                'total' => 1,
                'active' => 1,
                'pending' => 0,
                'total_revenue' => DB::table('orders')->where('franchise_id', $franchise->id)->sum('total_amount'),
            ],
            'filters' => [],
        ]);
    }
}
