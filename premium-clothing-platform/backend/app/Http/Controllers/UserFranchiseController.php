<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserFranchise;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class UserFranchiseController extends Controller
{
    public function index(Request $request)
    {
        $tab = $request->input('tab', 'active');
        $search = $request->input('search', '');

        $data = match (true) {
            in_array($tab, ['active', 'blocked'], true) => $this->franchiseUsers($tab, $search),
            in_array($tab, ['pending_requests', 'rejected_requests'], true) => $this->franchiseRequests($tab, $search),
            $tab === 'service_areas' => $this->serviceAreas($search),
            default => $this->emptyPaginator(),
        };

        return Inertia::render('FranchiseManagement', [
            'tabData' => $data,
            'activeTab' => $tab,
            'stats' => [
                'active' => $this->franchiseCount('active'),
                'pending' => $this->pendingRequestsCount(),
                'blocked' => $this->franchiseCount('blocked'),
            ],
            'filters' => ['search' => $search],
        ]);
    }

    public function toggleStatus($id)
    {
        $user = User::findOrFail($id);

        if (! Schema::hasColumn('users', 'status')) {
            return back()->with('success', 'Franchise status column is not enabled for this install.');
        }

        $user->status = ($user->status === 'active') ? 'blocked' : 'active';
        $user->save();

        return back()->with('success', 'Franchise status updated.');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['nullable', 'string', 'min:8'],
            'mobile_number' => ['nullable', 'string', 'max:20'],
            'city' => ['nullable', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'max:100'],
            'pincode' => ['nullable', 'string', 'max:20'],
        ]);

        $userData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password'] ?? 'password123'),
            'role' => 'franchise',
        ];

        foreach (['mobile_number', 'city', 'state', 'pincode'] as $column) {
            if (Schema::hasColumn('users', $column)) {
                $userData[$column] = $validated[$column] ?? null;
            }
        }

        if (Schema::hasColumn('users', 'status')) {
            $userData['status'] = 'active';
        }

        User::create($userData);

        return back()->with('success', 'Franchise created successfully.');
    }

    public function show($id)
    {
        $franchise = User::where('role', 'franchise')->findOrFail($id);

        $franchise->franchise_detail = [
            'city' => $franchise->city,
            'state' => $franchise->state,
            'pincode' => $franchise->pincode,
        ];

        return Inertia::render('FranchiseManagement', [
            'tabData' => new LengthAwarePaginator([$franchise], 1, 10),
            'activeTab' => 'active',
            'stats' => [
                'active' => $this->franchiseCount('active'),
                'pending' => $this->pendingRequestsCount(),
                'blocked' => $this->franchiseCount('blocked'),
            ],
            'filters' => ['search' => ''],
        ]);
    }

    public function updateStatus(Request $request, $application)
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,reviewed,approved,rejected'],
        ]);

        if (Schema::hasTable('franchise_applications')) {
            DB::table('franchise_applications')
                ->where('id', $application)
                ->update(['status' => $validated['status']]);

            return back()->with('success', 'Franchise application updated.');
        }

        if (Schema::hasTable('user_franchises')) {
            $status = $validated['status'] === 'reviewed' ? 'pending' : $validated['status'];
            UserFranchise::findOrFail($application)->update(['status' => $status]);

            return back()->with('success', 'Franchise application updated.');
        }

        return back()->with('success', 'No franchise application table is enabled for this install.');
    }

    private function franchiseUsers(string $tab, string $search): LengthAwarePaginator
    {
        $hasStatus = Schema::hasColumn('users', 'status');

        if ($tab === 'blocked' && ! $hasStatus) {
            return $this->emptyPaginator();
        }

        $franchises = User::query()
            ->where('role', 'franchise')
            ->when($hasStatus, fn ($query) => $query->where('status', $tab))
            ->when($search, fn ($query) => $query->where('name', 'like', "%{$search}%"))
            ->paginate(10)
            ->withQueryString();

        $franchises->getCollection()->transform(function (User $user) use ($hasStatus) {
            if (! $hasStatus) {
                $user->status = 'active';
            }

            $user->franchise_detail = [
                'city' => $user->city,
                'state' => $user->state,
                'pincode' => $user->pincode,
            ];

            return $user;
        });

        return $franchises;
    }

    private function franchiseRequests(string $tab, string $search): LengthAwarePaginator
    {
        $status = $tab === 'pending_requests' ? 'pending' : 'rejected';

        if (Schema::hasTable('franchise_applications')) {
            return DB::table('franchise_applications')
                ->select([
                    'id',
                    'full_name as name',
                    'email',
                    'mobile_number as phone',
                    'preferred_city as city',
                    'preferred_state as state',
                    'investment_budget as budget_range',
                    'status',
                    'created_at',
                ])
                ->where('status', $status)
                ->when($search, fn ($query) => $query->where('full_name', 'like', "%{$search}%"))
                ->orderByDesc('created_at')
                ->paginate(10)
                ->withQueryString();
        }

        if (Schema::hasTable('franchise_enquiries')) {
            return DB::table('franchise_enquiries')
                ->where('status', $status)
                ->when($search, fn ($query) => $query->where('name', 'like', "%{$search}%"))
                ->orderByDesc('created_at')
                ->paginate(10)
                ->withQueryString();
        }

        return $this->emptyPaginator();
    }

    private function serviceAreas(string $search): LengthAwarePaginator
    {
        if (! Schema::hasTable('franchise_service_areas')) {
            return $this->emptyPaginator();
        }

        return DB::table('franchise_service_areas')
            ->join('users', 'franchise_service_areas.franchise_id', '=', 'users.id')
            ->select('franchise_service_areas.*', 'users.name as franchise_name')
            ->when($search, fn ($query) => $query->where('pincode', 'like', "%{$search}%"))
            ->paginate(10)
            ->withQueryString();
    }

    private function franchiseCount(string $status): int
    {
        if ($status === 'blocked' && ! Schema::hasColumn('users', 'status')) {
            return 0;
        }

        return User::query()
            ->where('role', 'franchise')
            ->when(Schema::hasColumn('users', 'status'), fn ($query) => $query->where('status', $status))
            ->count();
    }

    private function pendingRequestsCount(): int
    {
        if (Schema::hasTable('franchise_applications')) {
            return DB::table('franchise_applications')->where('status', 'pending')->count();
        }

        if (Schema::hasTable('franchise_enquiries')) {
            return DB::table('franchise_enquiries')->where('status', 'pending')->count();
        }

        return 0;
    }

    private function emptyPaginator(): LengthAwarePaginator
    {
        return new LengthAwarePaginator([], 0, 10);
    }
}
