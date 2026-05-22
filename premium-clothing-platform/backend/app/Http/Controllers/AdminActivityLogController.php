<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class AdminActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search', '');
        $moduleFilter = $request->input('module', '');

        // Fetch Logs with User Details
        $logs = DB::table('activity_logs')
            ->join('users', 'activity_logs.user_id', '=', 'users.id')
            ->select('activity_logs.*', 'users.name as user_name', 'users.email')
            ->when($search, function ($query, $search) {
                $query->where('activity_logs.action', 'like', "%{$search}%")
                      ->orWhere('users.name', 'like', "%{$search}%")
                      ->orWhere('activity_logs.ip_address', 'like', "%{$search}%");
            })
            ->when($moduleFilter, function ($query, $moduleFilter) {
                $query->where('activity_logs.module', $moduleFilter);
            })
            ->orderBy('activity_logs.created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        // Get unique modules for the filter dropdown
        $modules = DB::table('activity_logs')->select('module')->distinct()->pluck('module');

        $stats = [
            'total_logs' => DB::table('activity_logs')->count(),
            'logs_today' => DB::table('activity_logs')->whereDate('created_at', today())->count(),
        ];

        return Inertia::render('Admin/ActivityLogs', [
            'logs' => $logs,
            'modules' => $modules,
            'stats' => $stats,
            'filters' => $request->only(['search', 'module'])
        ]);
    }
}