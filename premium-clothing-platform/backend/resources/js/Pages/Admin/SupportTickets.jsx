import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    LifeBuoy, Search, AlertCircle, CheckCircle2, Clock,
    MessageSquare, ShieldAlert, Store, Users
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function SupportTickets({ tickets, stats, activeTab, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const applyFilters = (tab = activeTab, nextStatus = statusFilter) => {
        router.get('/franchise-superadmin/tickets', { tab, search, status: nextStatus }, { preserveState: true, preserveScroll: true });
    };

    const statusColors = {
        'Open': 'bg-red-50 text-red-600 border-red-200',
        'In Progress': 'bg-blue-50 text-blue-600 border-blue-200',
        'Waiting for Customer': 'bg-orange-50 text-orange-600 border-orange-200',
        'Waiting for Reply': 'bg-orange-50 text-orange-600 border-orange-200',
        'Resolved': 'bg-green-50 text-green-700 border-green-200',
        'Closed': 'bg-gray-100 text-gray-600 border-gray-300',
    };

    const priorityColors = {
        'Urgent': 'text-red-600',
        'High': 'text-orange-500',
        'Medium': 'text-blue-500',
        'Low': 'text-gray-400',
    };

    return (
        <AdminLayout active="support">
            <Head title="Support Helpdesk | Super Admin" />

            <div className="max-w-[1600px] mx-auto pb-20 pt-6 px-4 sm:px-6">

                {/* 🚀 HEADER & STATS */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter flex items-center gap-3">
                        <LifeBuoy className="text-[#E94E3C]" size={32} /> Global Helpdesk
                    </h1>
                    <p className="text-gray-500 font-bold text-sm mt-1">Manage inquiries and complaints from Customers and Franchises.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <StatCard title="Action Required (Open/WIP)" value={stats.open_tickets} icon={AlertCircle} color="text-orange-500" alert={stats.open_tickets > 0} />
                    <StatCard title="Urgent Escalations" value={stats.urgent_tickets} icon={ShieldAlert} color="text-red-500" alert={stats.urgent_tickets > 0} />
                    <StatCard title="Resolved Today" value={stats.closed_today} icon={CheckCircle2} color="text-green-500" />
                </div>

                {/* 🚀 TAB NAVIGATION */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-6 flex gap-2">
                    <button onClick={() => applyFilters('Customer')} className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'Customer' ? 'bg-[#1A1A2E] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <Users size={16} /> Customer Tickets
                    </button>
                    <button onClick={() => applyFilters('Franchise')} className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'Franchise' ? 'bg-[#1A1A2E] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <Store size={16} /> Franchise Tickets
                    </button>
                </div>

                {/* 🚀 FILTERS */}
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-1 w-full relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search Ticket #, Subject or Name..." value={search} onChange={e => setSearch(e.target.value)} onKeyPress={e => e.key === 'Enter' && applyFilters()} className="w-full bg-gray-50 border-none rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none" />
                    </div>
                    <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); applyFilters(activeTab, e.target.value); }} className="bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-600 focus:ring-2 focus:ring-[#E94E3C] outline-none cursor-pointer">
                        <option value="">All Statuses</option>
                        {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                {/* 🚀 TICKET INBOX (TABLE) */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-visible min-h-[400px]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50 text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-5 whitespace-nowrap">Ticket Details</th>
                                    <th className="px-6 py-5 whitespace-nowrap">Requester</th>
                                    <th className="px-6 py-5 whitespace-nowrap">Priority</th>
                                    <th className="px-6 py-5 whitespace-nowrap">Status</th>
                                    <th className="px-6 py-5 whitespace-nowrap text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {tickets?.data?.map((ticket) => (
                                    <tr key={ticket.id} className={`hover:bg-gray-50/80 transition-colors group cursor-pointer ${ticket.status === 'Open' ? 'bg-orange-50/30' : ''}`} onClick={() => router.get(`/franchise-superadmin/tickets/${ticket.id}`)}>

                                        <td className="px-6 py-4">
                                            <p className="font-black text-[#1A1A2E] text-sm group-hover:text-[#E94E3C] transition-colors">{ticket.subject}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                                {ticket.ticket_number} • Last Updated {new Date(ticket.updated_at).toLocaleDateString()}
                                            </p>
                                        </td>

                                        <td className="px-6 py-4">
                                            <p className="font-bold text-[#1A1A2E] text-sm">{ticket.creator_name}</p>
                                            <p className="text-[10px] font-bold text-gray-400">{ticket.email}</p>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${priorityColors[ticket.priority]}`}>
                                                <AlertCircle size={12} /> {ticket.priority}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] border px-3 py-1.5 rounded-md font-black tracking-wider uppercase shadow-sm inline-flex ${statusColors[ticket.status]}`}>
                                                {ticket.status}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <button className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1A1A2E] hover:text-white transition-colors group-hover:shadow-md">
                                                View Thread
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {tickets?.data?.length === 0 && (
                                    <tr><td colSpan="5" className="px-6 py-16 text-center"><MessageSquare size={48} className="mx-auto text-gray-300 mb-4" strokeWidth={1} /><p className="text-[#1A1A2E] font-black text-lg">Inbox Zero! 🎉</p></td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}

// 💎 Helper Component
function StatCard({ title, value, icon: Icon, color, alert }) {
    return (
        <div className={`bg-white p-5 rounded-3xl border ${alert ? 'border-orange-200 shadow-orange-500/10' : 'border-gray-100 shadow-black/5'} shadow-sm flex items-center justify-between`}>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{title}</p>
                <h4 className="text-2xl font-black text-[#1A1A2E]">{value?.toLocaleString() || 0}</h4>
            </div>
            <div className={`size-12 rounded-2xl flex items-center justify-center ${alert ? 'bg-orange-50' : 'bg-gray-50'} ${color}`}><Icon size={20} strokeWidth={2.5} /></div>
        </div>
    );
}
