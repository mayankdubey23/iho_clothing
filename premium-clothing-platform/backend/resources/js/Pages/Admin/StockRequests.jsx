import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, PackageSearch, PackageCheck, Truck, CheckCircle,
    MoreVertical, XCircle, Banknote, Store
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function StockRequests({ requests, stats, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [openActionMenu, setOpenActionMenu] = useState(null);
    const [detailsRequest, setDetailsRequest] = useState(null);

    const applyFilters = () => {
        router.get('/franchise-superadmin/stock-requests', { search, status: statusFilter }, { preserveState: true });
    };

    const handleKeyPress = (e) => { if (e.key === 'Enter') applyFilters(); };

    const updateStatus = (id, newStatus) => {
        if (confirm(`Are you sure you want to mark Request #${id} as ${newStatus}?`)) {
            router.post(`/franchise-superadmin/stock-requests/${id}/status`, { status: newStatus }, { preserveScroll: true, onSuccess: () => setOpenActionMenu(null) });
        }
    };

    const statusConfig = {
        pending: { label: 'Pending', color: 'bg-orange-50 text-orange-600 border-orange-200' },
        approved: { label: 'Approved', color: 'bg-blue-50 text-blue-600 border-blue-200' },
        paid: { label: 'Paid', color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
        dispatched: { label: 'Dispatched', color: 'bg-purple-50 text-purple-600 border-purple-200' },
        completed: { label: 'Completed', color: 'bg-[#1A1A2E] text-white border-[#1A1A2E]' },
        rejected: { label: 'Rejected', color: 'bg-red-50 text-red-600 border-red-200' },
        cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-600 border-gray-300' },
    };

    const normalizeStatus = (status) => String(status || 'pending').toLowerCase();

    return (
        <AdminLayout active="stock-requests">
            <Head title="Stock Requests | Super Admin" />

            <div className="max-w-[1600px] mx-auto pb-20 pt-6 px-4 sm:px-6">

                {/* 🚀 HEADER & STATS */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter flex items-center gap-3">
                            <PackageSearch className="text-[#E94E3C]" size={28} /> Stock Requests
                        </h1>
                        <p className="text-gray-500 font-bold text-sm mt-1">Review, approve and dispatch B2B stock to franchises.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <StatCard title="Action Required (Pending)" value={stats?.pending} icon={PackageSearch} color="text-orange-500" alert={stats?.pending > 0} />
                    <StatCard title="Approved / Awaiting Payment" value={stats?.approved} icon={Banknote} color="text-blue-500" />
                    <StatCard title="Dispatched (In Transit)" value={stats?.dispatched} icon={Truck} color="text-purple-500" />
                </div>

                {/* 🚀 FILTERS */}
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-1 w-full relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search Request ID or Franchise Name..." value={search} onChange={e => setSearch(e.target.value)} onKeyPress={handleKeyPress} className="w-full bg-gray-50 border-none rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none" />
                    </div>
                    <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setTimeout(applyFilters, 100); }} className="bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-600 focus:ring-2 focus:ring-[#E94E3C] outline-none cursor-pointer">
                        <option value="">All Statuses</option>
                        {Object.entries(statusConfig).map(([status, config]) => <option key={status} value={status}>{config.label}</option>)}
                    </select>
                </div>

                {/* 🚀 DATA TABLE */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-visible">
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50 text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-5 whitespace-nowrap">Req ID & Date</th>
                                    <th className="px-6 py-5 whitespace-nowrap">Franchise</th>
                                    <th className="px-6 py-5 whitespace-nowrap text-center">Items Qty</th>
                                    <th className="px-6 py-5 whitespace-nowrap">B2B Value</th>
                                    <th className="px-6 py-5 whitespace-nowrap">Status</th>
                                    <th className="px-6 py-5 whitespace-nowrap text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {requests?.data?.length > 0 ? requests.data.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="font-black text-[#1A1A2E] text-sm">REQ-{req.id.toString().padStart(4, '0')}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{new Date(req.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                                        </td>

                                        <td className="px-6 py-4">
                                            <p className="font-bold text-[#1A1A2E] text-sm flex items-center gap-1.5"><Store size={14} className="text-[#E94E3C]" /> {req.franchise_name}</p>
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <span className="bg-gray-100 text-[#1A1A2E] font-black text-xs px-3 py-1 rounded-lg border border-gray-200">{req.items_count || 0} Units</span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <p className="font-black text-[#1A1A2E]">₹{Number(req.total_amount).toLocaleString()}</p>
                                            <span className={`text-[9px] font-black uppercase tracking-widest mt-1 ${req.payment_status === 'Paid' ? 'text-green-500' : 'text-orange-500'}`}>
                                                {req.payment_status}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] border px-3 py-1.5 rounded-md font-black tracking-wider uppercase shadow-sm ${statusConfig[normalizeStatus(req.status)]?.color}`}>
                                                {statusConfig[normalizeStatus(req.status)]?.label || req.status}
                                            </span>
                                        </td>

                                        {/* Dynamic Action Menu */}
                                        <td className="px-6 py-4 text-right relative">
                                            <button onClick={() => setOpenActionMenu(openActionMenu === req.id ? null : req.id)} className="p-2 text-gray-400 hover:text-[#1A1A2E] hover:bg-gray-100 rounded-xl transition-colors">
                                                <MoreVertical size={20} />
                                            </button>

                                            <AnimatePresence>
                                                {openActionMenu === req.id && (
                                                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="absolute right-12 top-2 w-48 bg-white border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.1)] rounded-2xl z-50 overflow-hidden text-left">
                                                        <div className="p-2 space-y-1">
                                                            <button onClick={() => { setDetailsRequest(req); setOpenActionMenu(null); }} className="block w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-widest text-[#1A1A2E] hover:bg-gray-50 rounded-xl transition-colors">View Items</button>

                                                            {normalizeStatus(req.status) === 'pending' && (
                                                                <>
                                                                    <button onClick={() => updateStatus(req.id, 'approved')} className="block w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">Approve Request</button>
                                                                    <button onClick={() => updateStatus(req.id, 'rejected')} className="block w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl transition-colors">Reject</button>
                                                                </>
                                                            )}

                                                            {normalizeStatus(req.status) === 'approved' && (
                                                                <button onClick={() => updateStatus(req.id, 'paid')} className="block w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">Mark as Paid</button>
                                                            )}

                                                            {normalizeStatus(req.status) === 'paid' && (
                                                                <button onClick={() => updateStatus(req.id, 'dispatched')} className="block w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-widest text-purple-600 hover:bg-purple-50 rounded-xl transition-colors">Dispatch Stock (Transfer)</button>
                                                            )}

                                                            {normalizeStatus(req.status) === 'dispatched' && (
                                                                <button onClick={() => updateStatus(req.id, 'completed')} className="block w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-widest text-green-600 hover:bg-green-50 rounded-xl transition-colors">Mark Completed</button>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="6" className="px-6 py-16 text-center"><PackageSearch size={48} className="mx-auto text-gray-300 mb-4" strokeWidth={1} /><p className="text-[#1A1A2E] font-black text-lg">No Stock Requests</p></td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            <AnimatePresence>
                {detailsRequest && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A2E]/60 p-4 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
                            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 p-6">
                                <div>
                                    <h3 className="font-black uppercase tracking-wider text-[#1A1A2E]">{detailsRequest.request_number || `REQ-${detailsRequest.id}`}</h3>
                                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">{detailsRequest.franchise_name} | Rs {Number(detailsRequest.total_amount || 0).toLocaleString()}</p>
                                </div>
                                <button onClick={() => setDetailsRequest(null)} className="text-gray-400 hover:text-red-500"><XCircle size={20} /></button>
                            </div>

                            <div className="max-h-[60vh] overflow-y-auto p-6">
                                <div className="space-y-3">
                                    {detailsRequest.items?.map((item) => (
                                        <div key={item.id} className="grid grid-cols-[1fr_auto] gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                            <div>
                                                <p className="font-black text-[#1A1A2E]">{item.product_name}</p>
                                                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Qty {item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-[#1A1A2E]">Rs {Number(item.total_price || 0).toLocaleString()}</p>
                                                <p className="text-[10px] font-bold text-gray-400">Rs {Number(item.franchise_price || 0).toLocaleString()} / unit</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
}

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
