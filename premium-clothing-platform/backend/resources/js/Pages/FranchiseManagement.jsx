import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Users, Store, MapPin, Search, ShieldCheck, ShieldAlert,
    FileText, TrendingUp, UserPlus, XCircle, Map, DollarSign
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function FranchiseManagement({ tabData, activeTab, stats, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    const tabs = [
        { id: 'active', label: 'Active Franchises', icon: ShieldCheck, color: 'text-green-500' },
        { id: 'pending_requests', label: 'Franchise Requests', icon: UserPlus, color: 'text-orange-500', count: stats.pending },
        { id: 'rejected_requests', label: 'Rejected', icon: XCircle, color: 'text-red-400' },
        { id: 'blocked', label: 'Blocked', icon: ShieldAlert, color: 'text-red-600', count: stats.blocked },
        { id: 'service_areas', label: 'Service Areas', icon: Map, color: 'text-blue-500' },
        { id: 'documents', label: 'Documents', icon: FileText, color: 'text-gray-500' },
        { id: 'performance', label: 'Performance', icon: TrendingUp, color: 'text-purple-500' },
    ];

    const switchTab = (tabId) => {
        setSearch(''); // Clear search on tab switch
        router.get('/franchise-superadmin/franchises', { tab: tabId }, { preserveState: true, preserveScroll: true });
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            router.get('/franchise-superadmin/franchises', { tab: activeTab, search }, { preserveState: true });
        }
    };

    return (
        <AdminLayout active="franchises">
            <Head title="Franchise Management | Super Admin" />

            <div className="max-w-[1600px] mx-auto pb-20 pt-6 px-4 sm:px-6">

                {/* 🚀 HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#282c3f] uppercase tracking-tighter flex items-center gap-3">
                            <Store className="text-[#ff3f6c]" /> Franchise Management
                        </h1>
                        <p className="text-gray-500 font-bold text-sm mt-1">Unified command center for global partners & requests.</p>
                    </div>
                </div>

                {/* 🚀 PREMIUM TAB NAVIGATION */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-8 overflow-x-auto custom-scrollbar">
                    <div className="flex items-center gap-2 min-w-max">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => switchTab(tab.id)}
                                    className={`relative flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isActive ? 'text-[#282c3f] bg-gray-50' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'}`}
                                >
                                    <Icon size={16} className={isActive ? tab.color : ''} />
                                    {tab.label}
                                    {tab.count > 0 && (
                                        <span className={`ml-2 px-2 py-0.5 rounded-md text-[10px] ${isActive ? 'bg-[#282c3f] text-white' : 'bg-gray-200 text-gray-600'}`}>
                                            {tab.count}
                                        </span>
                                    )}
                                    {isActive && (
                                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#ff3f6c] rounded-t-full" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* SEARCH BAR */}
                <div className="relative mb-6">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text" placeholder={`Search in ${tabs.find(t => t.id === activeTab)?.label}...`}
                        value={search} onChange={e => setSearch(e.target.value)} onKeyPress={handleSearch}
                        className="w-full bg-white shadow-sm border border-gray-100 rounded-2xl pl-12 pr-4 py-4 font-bold text-[#282c3f] focus:ring-2 focus:ring-[#ff3f6c] outline-none"
                    />
                </div>

                {/* 🚀 DYNAMIC CONTENT AREA BASED ON TAB */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">

                    {/* TAB 1: ACTIVE FRANCHISES & BLOCKED */}
                    {(activeTab === 'active' || activeTab === 'blocked') && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50 text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-5">Franchise Account</th>
                                        <th className="px-6 py-5">Assigned Location</th>
                                        <th className="px-6 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {tabData.data?.length > 0 ? tabData.data.map((f) => (
                                        <tr key={f.id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 bg-[#282c3f] text-white rounded-xl flex items-center justify-center font-black text-xs">{f.name[0]}</div>
                                                    <div>
                                                        <p className="font-black text-[#282c3f] text-sm">{f.name}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{f.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-xs font-black text-gray-600 flex items-center gap-1"><MapPin size={12} className="text-[#ff3f6c]" /> {f.franchise_detail?.city || 'Unassigned'}</p>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <button onClick={() => router.post(`/franchise-superadmin/franchises/${f.id}/toggle-status`)} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${f.status === 'active' ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-green-600 bg-green-50 hover:bg-green-100'}`}>
                                                    {f.status === 'active' ? 'Block Access' : 'Unblock Access'}
                                                </button>
                                            </td>
                                        </tr>
                                    )) : <EmptyState message="No franchises found in this list." />}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* TAB 2: PENDING / REJECTED REQUESTS */}
                    {(activeTab === 'pending_requests' || activeTab === 'rejected_requests') && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50 text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-5">Applicant Info</th>
                                        <th className="px-6 py-5">Interested Area</th>
                                        <th className="px-6 py-5">Investment Budget</th>
                                        <th className="px-6 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {tabData.data?.length > 0 ? tabData.data.map((req) => (
                                        <tr key={req.id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="px-6 py-5">
                                                <p className="font-black text-[#282c3f] text-sm">{req.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{req.email} • {req.phone}</p>
                                            </td>
                                            <td className="px-6 py-5"><p className="text-xs font-bold text-gray-600">{req.city}, {req.state}</p></td>
                                            <td className="px-6 py-5"><span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-100">₹{req.budget_range}</span></td>
                                            <td className="px-6 py-5 text-right">
                                                {activeTab === 'pending_requests' && (
                                                    <div className="flex justify-end gap-2">
                                                        <button className="px-4 py-2 bg-[#282c3f] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#ff3f6c] transition-colors">Review & Approve</button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )) : <EmptyState message="No requests currently in this queue." />}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* PLACEHOLDER FOR OTHER TABS */}
                    {['service_areas', 'documents', 'performance'].includes(activeTab) && (
                        <div className="flex flex-col items-center justify-center p-20 text-center">
                            <Store size={48} className="text-gray-200 mb-4" strokeWidth={1} />
                            <h3 className="font-black text-[#282c3f] text-xl uppercase tracking-widest mb-2">{tabs.find(t => t.id === activeTab)?.label} Module</h3>
                            <p className="text-sm font-bold text-gray-400 max-w-md">Backend table connection is ready. The UI components for this specific tab will be rendered here.</p>
                        </div>
                    )}

                </div>
            </div>
        </AdminLayout>
    );
}

// 💎 Helper Empty State Component
function EmptyState({ message }) {
    return (
        <tr>
            <td colSpan="100%" className="px-6 py-16 text-center">
                <Search size={32} className="mx-auto text-gray-300 mb-3" strokeWidth={1.5} />
                <p className="text-[#282c3f] font-black text-sm uppercase tracking-widest">{message}</p>
            </td>
        </tr>
    );
}
