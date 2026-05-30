import React from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Send, Paperclip, User, Clock,
    CheckCircle2, XCircle, FileText, Download, ShieldCheck
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function TicketView({ ticket, messages }) {

    // Reply Form Setup
    const { data, setData, post, processing, reset, errors } = useForm({
        message: '',
        status: ticket.status,
        attachments: []
    });

    const handleFileChange = (e) => {
        setData('attachments', Array.from(e.target.files));
    };

    const submitReply = (e) => {
        e.preventDefault();
        post(`/franchise-superadmin/tickets/${ticket.id}/reply`, {
            onSuccess: () => reset('message', 'attachments'),
            preserveScroll: true,
            forceFormData: true // Crucial for file uploads
        });
    };

    const updateTicketStatus = (newStatus) => {
        if (confirm(`Change ticket status to ${newStatus}?`)) {
            router.post(`/franchise-superadmin/tickets/${ticket.id}/status`, { status: newStatus }, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout active="support">
            <Head title={`Ticket ${ticket.ticket_number} | IHO Support`} />

            <div className="max-w-6xl mx-auto pb-10 pt-6 px-4">

                {/* 🚀 HEADER / BACK NAVIGATION */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link href="/franchise-superadmin/tickets" className="size-10 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-all">
                            <ArrowLeft size={18} className="text-[#1A1A2E]" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-black text-[#1A1A2E] uppercase tracking-tighter">
                                {ticket.ticket_number} : {ticket.subject}
                            </h1>
                            <p className="text-xs font-bold text-gray-400">Created on {new Date(ticket.created_at).toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {ticket.status !== 'Resolved' && (
                            <button onClick={() => updateTicketStatus('Resolved')} className="bg-green-50 text-green-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-100 transition-all border border-green-200">
                                Mark Resolved
                            </button>
                        )}
                        {ticket.status !== 'Closed' && (
                            <button onClick={() => updateTicketStatus('Closed')} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all border border-gray-300">
                                Close Ticket
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* 🚀 LEFT COLUMN: CHAT THREAD */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* THE MESSAGE BUBBLES */}
                        <div className="bg-gray-50 rounded-[2rem] p-6 min-h-[500px] border border-gray-100 space-y-6 overflow-y-auto">
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, x: msg.is_admin_reply ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex ${msg.is_admin_reply ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] ${msg.is_admin_reply ? 'bg-[#1A1A2E] text-white' : 'bg-white text-gray-800'} rounded-3xl p-5 shadow-sm border ${!msg.is_admin_reply ? 'border-gray-200' : 'border-[#1A1A2E]'}`}>
                                        <div className="flex items-center justify-between mb-2 gap-4">
                                            <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                                {msg.is_admin_reply ? <ShieldCheck size={12} className="text-[#E94E3C]" /> : <User size={12} />}
                                                {msg.sender_name}
                                            </span>
                                            <span className={`text-[9px] font-bold ${msg.is_admin_reply ? 'text-gray-400' : 'text-gray-400'}`}>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>

                                        {/* Attachments Section */}
                                        {msg.attachments?.length > 0 && (
                                            <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap gap-2">
                                                {msg.attachments.map(file => (
                                                    <a key={file.id} href={`/storage/${file.file_path}`} target="_blank" className={`flex items-center gap-2 p-2 rounded-lg text-[10px] font-bold ${msg.is_admin_reply ? 'bg-white/10 text-white' : 'bg-gray-100 text-[#1A1A2E]'}`}>
                                                        <FileText size={14} /> {file.file_name} <Download size={12} />
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* 🚀 REPLY COMPOSER */}
                        {ticket.status !== 'Closed' ? (
                            <form onSubmit={submitReply} className="bg-white rounded-[2rem] border border-gray-100 p-4 shadow-xl shadow-black/5">
                                <textarea
                                    rows="4"
                                    value={data.message}
                                    onChange={e => setData('message', e.target.value)}
                                    placeholder="Type your response here..."
                                    className="w-full border-none focus:ring-0 text-sm font-bold text-[#1A1A2E] placeholder-gray-300 resize-none p-4"
                                    required
                                />
                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-3">
                                        <label className="cursor-pointer p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                                            <Paperclip size={18} /> Attach
                                            <input type="file" multiple className="hidden" onChange={handleFileChange} />
                                        </label>
                                        <select
                                            value={data.status}
                                            onChange={e => setData('status', e.target.value)}
                                            className="bg-gray-50 border-none text-[10px] font-black uppercase tracking-widest text-[#1A1A2E] rounded-xl focus:ring-2 focus:ring-[#E94E3C]"
                                        >
                                            <option value="In Progress">Keep In Progress</option>
                                            <option value="Waiting for Customer">Waiting for Customer</option>
                                            <option value="Resolved">Resolved</option>
                                        </select>
                                    </div>
                                    <button
                                        disabled={processing}
                                        type="submit"
                                        className="bg-[#1A1A2E] text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#E94E3C] transition-all flex items-center gap-2 shadow-lg shadow-black/10 disabled:opacity-50"
                                    >
                                        {processing ? 'Sending...' : 'Send Reply'} <Send size={16} />
                                    </button>
                                </div>
                                {data.attachments.length > 0 && (
                                    <div className="mt-3 flex gap-2">
                                        {data.attachments.map((f, i) => (
                                            <span key={i} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold">{f.name}</span>
                                        ))}
                                    </div>
                                )}
                            </form>
                        ) : (
                            <div className="bg-red-50 p-6 rounded-3xl border border-red-100 text-center">
                                <p className="text-red-600 font-black uppercase text-xs tracking-widest">This ticket is closed. No further replies allowed.</p>
                            </div>
                        )}
                    </div>

                    {/* 🚀 RIGHT COLUMN: METADATA & USER INFO */}
                    <div className="space-y-6">

                        {/* Requester Info */}
                        <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                                <User size={14} /> Requester Profile
                            </h3>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="size-14 bg-gradient-to-tr from-[#1A1A2E] to-gray-700 text-white rounded-2xl flex items-center justify-center font-black text-xl">
                                    {(ticket.creator_name || 'U')[0]}
                                </div>
                                <div>
                                    <p className="font-black text-[#1A1A2E]">{ticket.creator_name}</p>
                                    <p className={`text-[10px] font-black px-2 py-0.5 rounded-md inline-block uppercase mt-1 ${ticket.user_type === 'Customer' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                        {ticket.user_type}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-4 pt-4 border-t border-gray-50">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase">Email Address</p>
                                    <p className="text-xs font-bold text-[#1A1A2E]">{ticket.email}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase">Phone Number</p>
                                    <p className="text-xs font-bold text-[#1A1A2E]">{ticket.phone || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Ticket Stats */}
                        <div className="bg-[#1A1A2E] rounded-[2rem] p-6 text-white shadow-xl shadow-black/10">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-6">Internal Status</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase text-white/60">Status</span>
                                    <span className="text-[10px] font-black uppercase bg-white/10 text-white px-3 py-1 rounded-md">{ticket.status}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase text-white/60">Priority</span>
                                    <span className={`text-[10px] font-black uppercase ${ticket.priority === 'Urgent' ? 'text-red-400' : 'text-white'}`}>{ticket.priority}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase text-white/60">Total Messages</span>
                                    <span className="text-[10px] font-black uppercase text-white">{messages.length}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
