import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LifeBuoy, PlusCircle, MessageSquare, Paperclip,
    X, Send, CheckCircle2, AlertCircle, Clock, Archive
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Support({ tickets }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [activeTicket, setActiveTicket] = useState(null);

    const categories = [
        "Stock Issue", "Payment Issue", "Order Issue", "Product Issue",
        "Inventory Issue", "Technical Issue", "Franchise Account Issue", "Other"
    ];

    // Form for New Ticket
    const { data, setData, post, processing, reset, errors } = useForm({
        category: 'Stock Issue', subject: '', message: '', attachment: null
    });

    // Form for Reply
    const { data: replyData, setData: setReplyData, post: postReply, processing: replying, reset: resetReply } = useForm({
        message: '', attachment: null
    });

    const submitTicket = (e) => {
        e.preventDefault();
        post('/franchise/support', {
            preserveScroll: true,
            onSuccess: () => { setIsCreateModalOpen(false); reset(); }
        });
    };

    const submitReply = (e) => {
        e.preventDefault();
        postReply(`/franchise/support/${activeTicket.id}/reply`, {
            preserveScroll: true,
            onSuccess: () => {
                resetReply();
                // Refresh local active ticket state
                const updatedTicket = tickets.find(t => t.id === activeTicket.id);
                if (updatedTicket) setActiveTicket(updatedTicket);
            }
        });
    };

    const closeTicket = (id) => {
        if (confirm('Are you sure you want to close this ticket?')) {
            router.post(`/franchise/support/${id}/close`, {}, { preserveScroll: true });
            setActiveTicket(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Open': return 'bg-blue-100 text-blue-700';
            case 'In Progress': return 'bg-orange-100 text-orange-700';
            case 'Waiting for Reply': return 'bg-purple-100 text-purple-700';
            case 'Resolved': return 'bg-green-100 text-green-700';
            case 'Closed': return 'bg-gray-100 text-gray-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <AdminLayout active="support">
            <Head title="Support Tickets | IHO Franchise" />

            <div className="max-w-[1600px] mx-auto pb-20 pt-6 px-4 sm:px-6">

                {/* 🚀 HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#282c3f] uppercase tracking-tighter flex items-center gap-3">
                            <LifeBuoy className="text-[#ff3f6c]" size={32} /> Helpdesk
                        </h1>
                        <p className="text-gray-500 font-bold text-sm mt-1">Raise issues and communicate directly with the Super Admin.</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-[#282c3f] text-white px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#ff3f6c] transition-all flex items-center gap-2 shadow-xl shadow-[#282c3f]/20"
                    >
                        <PlusCircle size={18} /> New Ticket
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* 🚀 LEFT: TICKET LIST */}
                    <div className="lg:col-span-1 space-y-4 h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
                        {tickets.length > 0 ? tickets.map((ticket) => (
                            <div
                                key={ticket.id}
                                onClick={() => setActiveTicket(ticket)}
                                className={`bg-white p-5 rounded-2xl border-2 transition-all cursor-pointer ${activeTicket?.id === ticket.id ? 'border-[#ff3f6c] shadow-md' : 'border-transparent shadow-sm hover:border-gray-200'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{ticket.ticket_number}</span>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${getStatusColor(ticket.status)}`}>
                                        {ticket.status}
                                    </span>
                                </div>
                                <h4 className="font-bold text-[#282c3f] text-sm line-clamp-1 mb-1">{ticket.subject}</h4>
                                <div className="flex justify-between items-center mt-3">
                                    <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">{ticket.category}</span>
                                    <span className="text-[10px] font-bold text-gray-400">{new Date(ticket.updated_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100">
                                <CheckCircle2 size={48} className="mx-auto text-green-400 mb-4" strokeWidth={1.5} />
                                <p className="font-black text-[#282c3f] uppercase">All Good!</p>
                                <p className="text-xs text-gray-500 mt-1 font-bold">No active issues.</p>
                            </div>
                        )}
                    </div>

                    {/* 🚀 RIGHT: TICKET THREAD (CHAT VIEW) */}
                    <div className="lg:col-span-2">
                        {activeTicket ? (
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 h-[75vh] flex flex-col overflow-hidden relative">

                                {/* Chat Header */}
                                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
                                    <div>
                                        <h2 className="font-black text-[#282c3f] text-lg">{activeTicket.subject}</h2>
                                        <p className="text-xs font-bold text-gray-500 mt-0.5 flex items-center gap-2">
                                            {activeTicket.ticket_number} • <span className={getStatusColor(activeTicket.status).split(' ')[1]}>{activeTicket.status}</span>
                                        </p>
                                    </div>
                                    {activeTicket.status !== 'Closed' && (
                                        <button onClick={() => closeTicket(activeTicket.id)} className="bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-1.5">
                                            <Archive size={14} /> Close Ticket
                                        </button>
                                    )}
                                </div>

                                {/* Chat Messages */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f9f8f6] custom-scrollbar">
                                    {activeTicket.messages.map((msg) => (
                                        <div key={msg.id} className={`flex ${msg.is_admin_reply ? 'justify-start' : 'justify-end'}`}>
                                            <div className={`max-w-[80%] md:max-w-[70%] rounded-2xl p-4 shadow-sm ${msg.is_admin_reply ? 'bg-white border border-gray-100 rounded-tl-sm' : 'bg-[#282c3f] text-white rounded-tr-sm'}`}>
                                                <div className="flex justify-between items-center mb-2 gap-4">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${msg.is_admin_reply ? 'text-indigo-600' : 'text-[#ff3f6c]'}`}>
                                                        {msg.is_admin_reply ? 'Super Admin' : 'You'}
                                                    </span>
                                                    <span className={`text-[9px] font-bold ${msg.is_admin_reply ? 'text-gray-400' : 'text-gray-400'}`}>
                                                        {new Date(msg.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className={`text-sm whitespace-pre-wrap ${msg.is_admin_reply ? 'text-gray-700 font-medium' : 'text-slate-200'}`}>
                                                    {msg.message}
                                                </p>
                                                {msg.attachment_path && (
                                                    <a href={`/storage/${msg.attachment_path}`} target="_blank" className={`mt-3 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg ${msg.is_admin_reply ? 'bg-gray-50 text-[#282c3f]' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                                                        <Paperclip size={14} /> View Attachment
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Reply Box */}
                                {activeTicket.status !== 'Closed' ? (
                                    <form onSubmit={submitReply} className="p-4 bg-white border-t border-gray-100 shrink-0">
                                        <div className="flex items-end gap-3">
                                            <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 p-2 focus-within:border-[#ff3f6c] focus-within:ring-1 focus-within:ring-[#ff3f6c] transition-all">
                                                <textarea required rows="2" placeholder="Type your reply here..." value={replyData.message} onChange={e => setReplyData('message', e.target.value)} className="w-full bg-transparent border-none focus:ring-0 resize-none text-sm font-medium text-[#282c3f] p-2" />
                                                <div className="flex justify-between items-center px-2 pb-1">
                                                    <label className="cursor-pointer text-gray-400 hover:text-[#282c3f] transition-colors flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
                                                        <Paperclip size={14} /> {replyData.attachment ? 'File Added' : 'Attach File'}
                                                        <input type="file" className="hidden" onChange={e => setReplyData('attachment', e.target.files[0])} accept=".jpg,.png,.pdf" />
                                                    </label>
                                                </div>
                                            </div>
                                            <button disabled={replying} type="submit" className="bg-[#ff3f6c] text-white size-14 rounded-2xl flex items-center justify-center hover:bg-[#c0392b] transition-colors shadow-lg shadow-[#ff3f6c]/20 shrink-0">
                                                <Send size={20} className="ml-1" />
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="p-4 bg-gray-50 border-t border-gray-200 text-center shrink-0">
                                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center justify-center gap-2">
                                            <Archive size={14} /> This ticket is closed
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 h-[75vh] flex flex-col items-center justify-center text-center p-8">
                                <MessageSquare size={64} className="text-gray-200 mb-4" strokeWidth={1} />
                                <h3 className="font-black text-xl text-[#282c3f] uppercase">Select a Ticket</h3>
                                <p className="text-sm font-bold text-gray-500 mt-2 max-w-xs">Click on a ticket from the list to view the conversation or create a new one.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* 🚀 MODAL: CREATE TICKET */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#282c3f]/80 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="font-black text-[#282c3f] uppercase tracking-wider flex items-center gap-2"><LifeBuoy size={18} className="text-[#ff3f6c]" /> Create Support Ticket</h3>
                                <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-[#282c3f]"><X size={20} /></button>
                            </div>

                            <form onSubmit={submitTicket} className="p-6 space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Issue Category *</label>
                                    <select required value={data.category} onChange={e => setData('category', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#282c3f] text-sm focus:ring-2 focus:ring-[#ff3f6c] outline-none">
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject *</label>
                                    <input required type="text" value={data.subject} onChange={e => setData('subject', e.target.value)} placeholder="Short description of the issue" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#282c3f] focus:ring-2 focus:ring-[#ff3f6c] outline-none" />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Detailed Message *</label>
                                    <textarea required rows="4" value={data.message} onChange={e => setData('message', e.target.value)} placeholder="Please provide details..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-[#282c3f] text-sm focus:ring-2 focus:ring-[#ff3f6c] outline-none resize-none"></textarea>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Attachment (Optional)</label>
                                    <input type="file" onChange={e => setData('attachment', e.target.files[0])} accept=".jpg,.png,.pdf" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:bg-gray-100 file:text-[#282c3f] hover:file:bg-gray-200 cursor-pointer" />
                                </div>

                                <button disabled={processing} type="submit" className="w-full bg-[#ff3f6c] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#c0392b] transition-colors mt-2 shadow-xl shadow-[#ff3f6c]/20 flex items-center justify-center gap-2">
                                    {processing ? 'Submitting...' : 'Submit Ticket'} <Send size={18} />
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </AdminLayout>
    );
}