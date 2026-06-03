import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    RotateCcw, Search, CheckCircle2, XCircle, Truck,
    Box, MoreVertical, PackageCheck, AlertTriangle, IndianRupee
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Returns({ returns, stats, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [openActionMenu, setOpenActionMenu] = useState(null);

    // Filter Logic
    const applyFilters = () => router.get('/franchise-superadmin/returns', { search, status: statusFilter }, { preserveState: true });
    const handleKeyPress = (e) => { if (e.key === 'Enter') applyFilters(); };

    // Quick Status Update
    const updateStatus = (id, newStatus) => {
        if (confirm(`Mark Return #${id} as ${newStatus}?`)) {
            router.post(`/franchise-superadmin/returns/${id}/status`, { status: newStatus }, { preserveScroll: true, onSuccess: () => setOpenActionMenu(null) });
        }
    };

    // Styling configurations
    const statusConfig = {
        'Requested': { color: 'bg-orange-50 text-orange-600 border-orange-200' },
        'Approved': { color: 'bg-blue-50 text-blue-600 border-blue-200' },
        'Pickup Scheduled': { color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
        'Picked Up': { color: 'bg-purple-50 text-purple-600 border-purple-200' },
        'Received': { color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
        'Refunded': { color: 'bg-green-50 text-green-700 border-green-200' },
        'Replaced': { color: 'bg-teal-50 text-teal-700 border-teal-200' },
        'Rejected': { color: 'bg-red-50 text-red-600 border-red-200' },
        'Closed': { color: 'bg-[#282c3f] text-white border-[#282c3f]' },
    };

    return (
        <AdminLayout active="returns">
            <Head title="Returns & Refunds | Super Admin" />

            <div className="max-w-[1600px] mx-auto pb-20 pt-6 px-4 sm:px-6">

                {/* 🚀 HEADER & STATS */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-[#282c3f] uppercase tracking-tighter flex items-center gap-3">
                        <RotateCcw className="text-[#ff3f6c]" /> Reverse Logistics
                    </h1>
                    <p className="text-gray-500 font-bold text-sm mt-1">Manage product returns, inspections, and customer refunds.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <StatCard title="New Return Requests" value={stats?.pending_requests} icon={AlertTriangle} color="text-orange-500" alert={stats?.pending_requests > 0} />
                    <StatCard title="Pending Pickups" value={stats?.pending_pickups} icon={Truck} color="text-blue-500" />
                    <StatCard title="Awaiting Refund Issue" value={stats?.awaiting_refund} icon={IndianRupee} color="text-green-500" alert={stats?.awaiting_refund > 0} />
                </div>

                {/* 🚀 FILTERS BAR */}
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-1 w-full relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search Return ID, Order ID or Customer..." value={search} onChange={e => setSearch(e.target.value)} onKeyPress={handleKeyPress} className="w-full bg-gray-50 border-none rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-[#282c3f] focus:ring-2 focus:ring-[#ff3f6c] outline-none" />
                    </div>
                    <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setTimeout(applyFilters, 100); }} className="bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-600 focus:ring-2 focus:ring-[#ff3f6c] outline-none cursor-pointer">
                        <option value="">All Statuses</option>
                        {Object.keys(statusConfig).map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                </div>

                {/* 🚀 DATA TABLE */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-visible">
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50 text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-5 whitespace-nowrap">Return ID</th>
                                    <th className="px-6 py-5 whitespace-nowrap">Customer & Order</th>
                                    <th className="px-6 py-5 whitespace-nowrap">Resolution Type</th>
                                    <th className="px-6 py-5 whitespace-nowrap">Reason</th>
                                    <th className="px-6 py-5 whitespace-nowrap">Status</th>
                                    <th className="px-6 py-5 whitespace-nowrap text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {returns?.data?.length > 0 ? returns.data.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50/80 transition-colors group">

                                        <td className="px-6 py-4">
                                            <p className="font-black text-[#282c3f] text-sm">RET-{req.id.toString().padStart(5, '0')}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{new Date(req.created_at).toLocaleDateString()}</p>
                                        </td>

                                        <td className="px-6 py-4">
                                            <p className="font-bold text-[#282c3f] text-sm">{req.customer_name}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">ORD: {req.razorpay_order_id || 'N/A'}</p>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${req.type === 'Refund' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                                                {req.type}
                                            </span>
                                            {req.type === 'Refund' && <p className="text-xs font-black text-[#282c3f] mt-1.5">₹{Number(req.total_refund_amount).toLocaleString()}</p>}
                                        </td>

                                        <td className="px-6 py-4">
                                            <p className="text-xs font-bold text-gray-600 max-w-[200px] truncate">{req.reason}</p>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] border px-3 py-1.5 rounded-md font-black tracking-wider uppercase inline-flex items-center gap-1 shadow-sm ${statusConfig[req.status]?.color || 'bg-gray-100'}`}>
                                                {req.status}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-right relative">
                                            <button onClick={() => setOpenActionMenu(openActionMenu === req.id ? null : req.id)} className="p-2 text-gray-400 hover:text-[#282c3f] hover:bg-gray-100 rounded-xl transition-colors">
                                                <MoreVertical size={20} />
                                            </button>

                                            <AnimatePresence>
                                                {openActionMenu === req.id && (
                                                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="absolute right-12 top-2 w-48 bg-white border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.1)] rounded-2xl z-50 overflow-hidden text-left">
                                                        <div className="p-2 space-y-1">

                                                            {req.status === 'Requested' && (
                                                                <>
                                                                    <button onClick={() => updateStatus(req.id, 'Approved')} className="block w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">Approve Request</button>
                                                                    <button onClick={() => updateStatus(req.id, 'Rejected')} className="block w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl transition-colors">Reject Request</button>
                                                                </>
                                                            )}

                                                            {req.status === 'Approved' && (
                                                                <button onClick={() => updateStatus(req.id, 'Pickup Scheduled')} className="block w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">Schedule Pickup</button>
                                                            )}

                                                            {req.status === 'Pickup Scheduled' && (
                                                                <button onClick={() => updateStatus(req.id, 'Picked Up')} className="block w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-widest text-purple-600 hover:bg-purple-50 rounded-xl transition-colors">Mark Picked Up</button>
                                                            )}

                                                            {req.status === 'Picked Up' && (
                                                                <button onClick={() => alert('Inspection Modal Pending (Call processInspection logic here)')} className="block w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-widest text-[#ff3f6c] hover:bg-[#ff3f6c]/10 rounded-xl transition-colors flex items-center justify-between">
                                                                    Inspect Item <PackageCheck size={14} />
                                                                </button>
                                                            )}

                                                            {req.status === 'Received' && req.type === 'Refund' && (
                                                                <button onClick={() => updateStatus(req.id, 'Refunded')} className="block w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-widest text-green-600 hover:bg-green-50 rounded-xl transition-colors">Process Refund</button>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="6" className="px-6 py-16 text-center"><RotateCcw size={48} className="mx-auto text-gray-300 mb-4" strokeWidth={1} /><p className="text-[#282c3f] font-black text-lg">No Return Requests</p></td></tr>
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
                <h4 className="text-2xl font-black text-[#282c3f]">{value?.toLocaleString() || 0}</h4>
            </div>
            <div className={`size-12 rounded-2xl flex items-center justify-center ${alert ? 'bg-orange-50' : 'bg-gray-50'} ${color}`}><Icon size={20} strokeWidth={2.5} /></div>
        </div>
    );
}