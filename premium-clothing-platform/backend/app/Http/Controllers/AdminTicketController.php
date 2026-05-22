<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class AdminTicketController extends Controller
{
    public function index(Request $request)
    {
        abort_unless(Schema::hasTable('support_tickets'), 404, 'Support tickets table is not available.');

        $tab = $request->input('tab', 'Customer');
        $search = $request->input('search', '');
        $statusFilter = $request->input('status', '');
        $hasUserId = Schema::hasColumn('support_tickets', 'user_id');
        $hasFranchiseId = Schema::hasColumn('support_tickets', 'franchise_id');
        $hasTicketNumber = Schema::hasColumn('support_tickets', 'ticket_number');
        $hasPriority = Schema::hasColumn('support_tickets', 'priority');
        $hasUserRole = Schema::hasColumn('users', 'role');
        $selectColumns = ['support_tickets.*', 'users.name as creator_name', 'users.email'];

        if ($hasUserRole) {
            $selectColumns[] = 'users.role as creator_role';
        }

        $tickets = DB::table('support_tickets')
            ->when($hasUserId, fn ($query) => $query->leftJoin('users', 'support_tickets.user_id', '=', 'users.id'))
            ->when(! $hasUserId && $hasFranchiseId, fn ($query) => $query->leftJoin('users', 'support_tickets.franchise_id', '=', 'users.id'))
            ->select($selectColumns)
            ->when($hasUserRole && $tab === 'Customer', function ($query) {
                $query->where(function ($inner) {
                    $inner->whereNull('users.role')
                        ->orWhereNotIn('users.role', ['franchise', 'super_admin', 'admin']);
                });
            })
            ->when($hasUserRole && $tab === 'Franchise', fn ($query) => $query->where('users.role', 'franchise'))
            ->when(! $hasUserRole && $tab === 'Customer' && $hasFranchiseId && ! $hasUserId, fn ($query) => $query->whereRaw('1 = 0'))
            ->when($search, function ($query, $search) use ($hasTicketNumber) {
                $query->where(function ($inner) use ($search, $hasTicketNumber) {
                    if ($hasTicketNumber) {
                        $inner->where('support_tickets.ticket_number', 'like', "%{$search}%");
                    }

                    $inner->orWhere('support_tickets.subject', 'like', "%{$search}%")
                        ->orWhere('users.name', 'like', "%{$search}%");
                });
            })
            ->when($statusFilter, fn ($query) => $query->where('support_tickets.status', $statusFilter))
            ->orderByRaw("CASE WHEN support_tickets.status = 'Open' THEN 1 WHEN support_tickets.status = 'In Progress' THEN 2 ELSE 3 END")
            ->orderBy('support_tickets.updated_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $tickets->getCollection()->transform(function ($ticket) use ($hasTicketNumber, $hasPriority, $hasFranchiseId, $hasUserId) {
            $ticket->ticket_number = $hasTicketNumber ? $ticket->ticket_number : 'TKT-' . str_pad($ticket->id, 5, '0', STR_PAD_LEFT);
            $ticket->priority = $hasPriority ? $ticket->priority : 'Medium';
            $ticket->user_type = (($ticket->creator_role ?? null) === 'franchise' || ($hasFranchiseId && ! $hasUserId)) ? 'Franchise' : 'Customer';
            $ticket->creator_name = $ticket->creator_name ?: 'Unknown User';
            $ticket->email = $ticket->email ?: 'No email';

            return $ticket;
        });

        $stats = [
            'open_tickets' => DB::table('support_tickets')->whereIn('status', ['Open', 'In Progress', 'Waiting for Reply'])->count(),
            'urgent_tickets' => $hasPriority
                ? DB::table('support_tickets')->where('priority', 'Urgent')->where('status', '!=', 'Closed')->count()
                : 0,
            'closed_today' => DB::table('support_tickets')->whereIn('status', ['Closed', 'Resolved'])->whereDate('updated_at', today())->count(),
        ];

        return Inertia::render('Admin/SupportTickets', [
            'tickets' => $tickets,
            'stats' => $stats,
            'activeTab' => $tab,
            'filters' => ['search' => $search, 'status' => $statusFilter],
        ]);
    }

    public function show($id)
    {
        abort_unless(Schema::hasTable('support_tickets'), 404, 'Support tickets table is not available.');

        $hasUserId = Schema::hasColumn('support_tickets', 'user_id');
        $hasFranchiseId = Schema::hasColumn('support_tickets', 'franchise_id');

        $ticket = DB::table('support_tickets')
            ->when($hasUserId, fn ($query) => $query->leftJoin('users', 'support_tickets.user_id', '=', 'users.id'))
            ->when(! $hasUserId && $hasFranchiseId, fn ($query) => $query->leftJoin('users', 'support_tickets.franchise_id', '=', 'users.id'))
            ->select('support_tickets.*', 'users.name as creator_name', 'users.email', 'users.phone')
            ->where('support_tickets.id', $id)
            ->first();

        abort_unless($ticket, 404);

        $messages = collect();
        if (Schema::hasTable('support_ticket_messages')) {
            $ticketKey = Schema::hasColumn('support_ticket_messages', 'support_ticket_id') ? 'support_ticket_id' : 'ticket_id';
            $senderKey = Schema::hasColumn('support_ticket_messages', 'sender_id') ? 'sender_id' : 'user_id';

            $messages = DB::table('support_ticket_messages')
                ->leftJoin('users', "support_ticket_messages.{$senderKey}", '=', 'users.id')
                ->select('support_ticket_messages.*', 'users.name as sender_name')
                ->where($ticketKey, $id)
                ->orderBy('support_ticket_messages.created_at')
                ->get();

            if (Schema::hasTable('ticket_attachments') && Schema::hasColumn('ticket_attachments', 'message_id')) {
                foreach ($messages as $message) {
                    $message->attachments = DB::table('ticket_attachments')->where('message_id', $message->id)->get();
                }
            }
        }

        return Inertia::render('Admin/TicketView', [
            'ticket' => $ticket,
            'messages' => $messages,
        ]);
    }

    public function reply(Request $request, $id)
    {
        $request->validate([
            'message' => 'required|string',
            'status' => 'required|string',
            'attachments.*' => 'nullable|file|max:5120',
        ]);

        DB::transaction(function () use ($request, $id) {
            if (Schema::hasTable('support_ticket_messages')) {
                $ticketKey = Schema::hasColumn('support_ticket_messages', 'support_ticket_id') ? 'support_ticket_id' : 'ticket_id';
                $senderKey = Schema::hasColumn('support_ticket_messages', 'sender_id') ? 'sender_id' : 'user_id';

                $messageData = [
                    $ticketKey => $id,
                    $senderKey => auth()->id(),
                    'message' => $request->message,
                    'is_admin_reply' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                $messageId = DB::table('support_ticket_messages')->insertGetId($messageData);

                if ($request->hasFile('attachments') && Schema::hasTable('ticket_attachments')) {
                    foreach ($request->file('attachments') as $file) {
                        $path = $file->store('tickets/attachments', 'public');
                        DB::table('ticket_attachments')->insert([
                            'message_id' => $messageId,
                            'file_path' => $path,
                            'file_name' => $file->getClientOriginalName(),
                            'file_type' => $file->getMimeType(),
                            'created_at' => now(),
                        ]);
                    }
                }
            }

            DB::table('support_tickets')->where('id', $id)->update([
                'status' => $request->status,
                'updated_at' => now(),
            ]);
        });

        return back()->with('success', 'Reply sent successfully.');
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|string']);

        DB::table('support_tickets')->where('id', $id)->update([
            'status' => $request->status,
            'updated_at' => now(),
        ]);

        return back()->with('success', "Ticket marked as {$request->status}.");
    }
}
