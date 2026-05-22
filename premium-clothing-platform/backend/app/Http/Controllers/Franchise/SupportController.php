<?php

namespace App\Http\Controllers\Franchise;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class SupportController extends Controller
{
    public function index()
    {
        $franchiseId = Auth::id();

        $tickets = DB::table('support_tickets')
            ->where('franchise_id', $franchiseId)
            ->orderBy('updated_at', 'desc')
            ->get();

        // Fetch messages for active view
        foreach ($tickets as $ticket) {
            $ticket->messages = DB::table('support_ticket_messages')
                ->join('users', 'support_ticket_messages.user_id', '=', 'users.id')
                ->where('ticket_id', $ticket->id)
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
            $ticketId = DB::table('support_tickets')->insertGetId([
                'ticket_number' => 'TKT-' . strtoupper(Str::random(8)),
                'franchise_id' => Auth::id(),
                'category' => $request->category,
                'subject' => $request->subject,
                'status' => 'Open',
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // 2. Upload Attachment if exists
            $path = null;
            if ($request->hasFile('attachment')) {
                $path = $request->file('attachment')->store('support_attachments', 'public');
            }

            // 3. Create First Message
            DB::table('support_ticket_messages')->insert([
                'ticket_id' => $ticketId,
                'user_id' => Auth::id(),
                'message' => $request->message,
                'attachment_path' => $path,
                'is_admin_reply' => false,
                'created_at' => now(),
                'updated_at' => now()
            ]);
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

        DB::table('support_ticket_messages')->insert([
            'ticket_id' => $id,
            'user_id' => Auth::id(),
            'message' => $request->message,
            'attachment_path' => $path,
            'is_admin_reply' => false,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // Update parent ticket status
        DB::table('support_tickets')->where('id', $id)->update([
            'status' => 'Open', // Changed back to Open so Admin sees new reply
            'updated_at' => now()
        ]);

        return back();
    }

    public function close($id)
    {
        DB::table('support_tickets')
            ->where('id', $id)
            ->where('franchise_id', Auth::id())
            ->update([
                'status' => 'Closed',
                'updated_at' => now()
            ]);

        return back()->with('success', 'Ticket closed successfully.');
    }
}