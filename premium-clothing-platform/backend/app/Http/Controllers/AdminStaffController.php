<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminStaffController extends Controller
{
    public function index(Request $request)
    {
        $tab = $request->input('tab', 'staff');
        $search = $request->input('search', '');
        $data = [];

        if ($tab === 'staff') {
            // Fetch users where role is 'staff' (Ensure 'staff' is in your users table enum/varchar)
            $data = DB::table('users')
                ->leftJoin('role_user', 'users.id', '=', 'role_user.user_id')
                ->leftJoin('roles', 'role_user.role_id', '=', 'roles.id')
                ->select('users.id', 'users.name', 'users.email', 'users.status', 'users.created_at', 'roles.name as assigned_role')
                ->where('users.role', 'staff')
                ->when($search, fn($q) => $q->where('users.name', 'like', "%{$search}%")->orWhere('users.email', 'like', "%{$search}%"))
                ->paginate(15)->withQueryString();
        } elseif ($tab === 'logs') {
            // Fetch Audit Trail
            $data = DB::table('activity_logs')
                ->join('users', 'activity_logs.user_id', '=', 'users.id')
                ->select('activity_logs.*', 'users.name as staff_name')
                ->when($search, fn($q) => $q->where('users.name', 'like', "%{$search}%")->orWhere('activity_logs.action', 'like', "%{$search}%"))
                ->orderBy('created_at', 'desc')
                ->paginate(20)->withQueryString();
        }

        $roles = DB::table('roles')->get();

        $stats = [
            'total_staff' => DB::table('users')->where('role', 'staff')->count(),
            'active_staff' => DB::table('users')->where('role', 'staff')->where('status', 'active')->count(),
            'total_roles' => $roles->count(),
        ];

        return Inertia::render('Admin/StaffManagement', [
            'tabData' => $data,
            'roles' => $roles,
            'stats' => $stats,
            'activeTab' => $tab,
            'filters' => ['search' => $search]
        ]);
    }

    // 🚀 Create New Staff & Assign Role
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',
        ]);

        DB::transaction(function () use ($validated) {
            // 1. Create User
            $userId = DB::table('users')->insertGetId([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => 'staff', // Identifier for backend
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 2. Assign Role in Pivot Table
            DB::table('role_user')->insert([
                'user_id' => $userId,
                'role_id' => $validated['role_id'],
            ]);

            // 3. Log Activity
            DB::table('activity_logs')->insert([
                'user_id' => auth()->id(), // Super Admin ID
                'action' => "Created new staff: {$validated['name']}",
                'module' => 'Staff Management',
                'created_at' => now(),
            ]);
        });

        return back()->with('success', 'Staff account created successfully!');
    }

    // 🚀 Block/Unblock Staff Access
    public function toggleStatus($id)
    {
        $user = DB::table('users')->where('id', $id)->first();
        if (!$user) return back()->withErrors('User not found.');

        $newStatus = $user->status === 'active' ? 'blocked' : 'active';
        
        DB::table('users')->where('id', $id)->update(['status' => $newStatus, 'updated_at' => now()]);

        DB::table('activity_logs')->insert([
            'user_id' => auth()->id(),
            'action' => "Changed staff status to {$newStatus} (ID: {$id})",
            'module' => 'Staff Management',
            'created_at' => now(),
        ]);

        return back()->with('success', "Staff account marked as {$newStatus}.");
    }
}