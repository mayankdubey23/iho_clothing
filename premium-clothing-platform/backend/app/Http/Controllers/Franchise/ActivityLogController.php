<?php

namespace App\Http\Controllers\Franchise;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $franchiseId = Auth::id(); // 🛡️ STRICT ISOLATION RULE
        $filter = $request->input('module', 'All');

        // Fetch logs ONLY for this specific Franchise Admin
        $logs = DB::table('activity_logs')
            ->where('user_id', $franchiseId)
            ->when($filter !== 'All', function ($query) use ($filter) {
                $query->where('module', $filter);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Franchise/ActivityLogs', [
            'logs' => $logs,
            'filters' => ['module' => $filter]
        ]);
    }
}