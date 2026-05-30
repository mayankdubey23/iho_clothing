<?php

namespace App\Http\Controllers\Franchise;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class SupportController extends Controller
{
    public function index()
    {
        $franchiseId = Auth::id();
        $ownerColumn = Schema::hasColumn('support_tickets', 'franchise_id') ? 'franchise_id' : 'user_id';

        $tickets = DB::table('support_tickets')
            ->where($ownerColumn, $franchiseId)
            ->orderBy('updated_at', 'desc')
            ->get();

        // Fetch messages for active view
        foreach ($tickets as $ticket) {
            $ticketKey = Schema::hasColumn('support_ticket_messages', 'support_ticket_id') ? 'support_ticket_id' : 'ticket_id';
            $senderKey = Schema::hasColumn('support_ticket_messages', 'sender_id') ? 'sender_id' : 'user_id';

            $ticket->messages = DB::table('support_ticket_messages')
                ->leftJoin('users', "support_ticket_messages.{$senderKey}", '=', 'users.id')
                ->where($ticketKey, $ticket->id)
                ->select('support_ticket_messages.*', 'users.name as sender_name')
                ->orderBy('created_at', 'asc')
                ->get();
        }

        return Inertia::render('Franchise/Support', [
            'tickets' => $tickets
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category' => 'required|string',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'attachment' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048'
        ]);

        $ticketId = null;

        DB::transaction(function () use ($request, &$ticketId) {
            // 1. Create Ticket
            $ticketPayload = [
                'subject' => $request->subject,
                'status' => 'Open',
                'created_at' => now(),
                'updated_at' => now()
            ];

            if (Schema::hasColumn('support_tickets', 'ticket_number')) {
                $ticketPayload['ticket_number'] = $this->nextTicketNumber();
            }
            if (Schema::hasColumn('support_tickets', 'franchise_id')) {
                $ticketPayload['franchise_id'] = Auth::id();
            } elseif (Schema::hasColumn('support_tickets', 'user_id')) {
                $ticketPayload['user_id'] = Auth::id();
            }
            if (Schema::hasColumn('support_tickets', 'user_type')) {
                $ticketPayload['user_type'] = 'Franchise';
            }
            if (Schema::hasColumn('support_tickets', 'category')) {
                $ticketPayload['category'] = $request->category;
            }
            if (Schema::hasColumn('support_tickets', 'priority')) {
                $ticketPayload['priority'] = 'Medium';
            }

            $ticketId = DB::table('support_tickets')->insertGetId($ticketPayload);

            // 2. Upload Attachment if exists
            $path = null;
            if ($request->hasFile('attachment')) {
                $path = $request->file('attachment')->store('support_attachments', 'public');
            }

            // 3. Create First Message
            $ticketKey = Schema::hasColumn('support_ticket_messages', 'support_ticket_id') ? 'support_ticket_id' : 'ticket_id';
            $senderKey = Schema::hasColumn('support_ticket_messages', 'sender_id') ? 'sender_id' : 'user_id';

            $messagePayload = [
                'message' => $request->message,
                'is_admin_reply' => false,
                'created_at' => now(),
                'updated_at' => now()
            ];

            $messagePayload[$ticketKey] = $ticketId;
            $messagePayload[$senderKey] = Auth::id();

            if (Schema::hasColumn('support_ticket_messages', 'attachment_path')) {
                $messagePayload['attachment_path'] = $path;
            }

            $messageId = DB::table('support_ticket_messages')->insertGetId($messagePayload);

            if ($path && Schema::hasTable('ticket_attachments')) {
                DB::table('ticket_attachments')->insert([
                    'message_id' => $messageId,
                    'file_path' => $path,
                    'file_name' => $request->file('attachment')->getClientOriginalName(),
                    'file_type' => $request->file('attachment')->getMimeType(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        });

        return back()->with('success', 'Support ticket created successfully.');
    }

    public function reply(Request $request, $id)
    {
        $request->validate([
            'message' => 'required|string',
            'attachment' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048'
        ]);

        $path = null;
        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('support_attachments', 'public');
        }

        $ticketKey = Schema::hasColumn('support_ticket_messages', 'support_ticket_id') ? 'support_ticket_id' : 'ticket_id';
        $senderKey = Schema::hasColumn('support_ticket_messages', 'sender_id') ? 'sender_id' : 'user_id';
        $ownerColumn = Schema::hasColumn('support_tickets', 'franchise_id') ? 'franchise_id' : 'user_id';

        abort_unless(DB::table('support_tickets')->where('id', $id)->where($ownerColumn, Auth::id())->exists(), 404);

        $messagePayload = [
            'message' => $request->message,
            'is_admin_reply' => false,
            'created_at' => now(),
            'updated_at' => now()
        ];

        $messagePayload[$ticketKey] = $id;
        $messagePayload[$senderKey] = Auth::id();

        if (Schema::hasColumn('support_ticket_messages', 'attachment_path')) {
            $messagePayload['attachment_path'] = $path;
        }

        $messageId = DB::table('support_ticket_messages')->insertGetId($messagePayload);

        if ($path && Schema::hasTable('ticket_attachments')) {
            DB::table('ticket_attachments')->insert([
                'message_id' => $messageId,
                'file_path' => $path,
                'file_name' => $request->file('attachment')->getClientOriginalName(),
                'file_type' => $request->file('attachment')->getMimeType(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Update parent ticket status
        DB::table('support_tickets')->where('id', $id)->update([
            'status' => 'Open', // Changed back to Open so Admin sees new reply
            'updated_at' => now()
        ]);

        return back();
    }

    public function close($id)
    {
        $ownerColumn = Schema::hasColumn('support_tickets', 'franchise_id') ? 'franchise_id' : 'user_id';

        DB::table('support_tickets')
            ->where('id', $id)
            ->where($ownerColumn, Auth::id())
            ->update([
                'status' => 'Closed',
                'updated_at' => now()
            ]);

        return back()->with('success', 'Ticket closed successfully.');
    }

    private function nextTicketNumber(): string
    {
        do {
            $ticketNumber = 'TKT-' . now()->format('ymd') . '-' . strtoupper(Str::random(5));
        } while (DB::table('support_tickets')->where('ticket_number', $ticketNumber)->exists());

        return $ticketNumber;
    }
}
