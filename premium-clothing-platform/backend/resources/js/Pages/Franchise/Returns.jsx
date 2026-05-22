import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    RotateCcw, Search, Truck, CheckCircle2, ShieldAlert,
    XCircle, Send, Package, IndianRupee, ClipboardList, X
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Returns({ returns, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedReturn, setSelectedReturn] = useState(null);

    const { data, setData, post, processing } = useForm({
        status: '',
        franchise_notes: '',
        condition: 'Sellable' // Default condition
    });

    const handleSearch = (e) => {
        if (e.key === 'Enter') router.get('/franchise/returns', { search }, { preserveState: true });
    };

    const openModal = (ret) => {
        setSelectedReturn(ret);
        setData({
            status: ret.status,
            franchise_notes: ret.franchise_notes || '',
            condition: 'Sellable'
        });
    };

    const submitUpdate = (e) => {
        e.preventDefault();
        post(`/franchise/returns/${selectedReturn.id}/status`, {
            preserveScroll: true,
            onSuccess: () => setSelectedReturn(null)
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Requested': return 'bg-orange-50 text-orange-600 border-orange-200';
            case 'Pickup Scheduled': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'Item Received': return 'bg-indigo-50 text-indigo-600 border-indigo-200';
            case 'Forwarded to Admin': return 'bg-purple-50 text-purple-600 border-purple-200';
            case 'Completed': return 'bg-green-50 text-green-600 border-green-200';
            case 'Rejected': return 'bg-red-50 text-red-600 border-red-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    return (
        <AdminLayout active="returns">
            <Head title="Returns & Refunds | IHO Franchise" />

            <div className="max-w-[1600px] mx-auto pb-20 pt-6 px-4 sm:px-6">

                {/* 🚀 HEADER & SEARCH */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter flex items-center gap-3">
                            <RotateCcw className="text-[#E94E3C]" size={32} /> Returns & Refunds
                        </h1>
                        <p className="text-gray-500 font-bold text-sm mt-1">Manage return requests, inspect products, and process inventory.</p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search Return ID or Order ID..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyPress={handleSearch}
                            className="w-full bg-white shadow-sm border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none"
                        />
                    </div>
                </div>

                {/* 🚀 DATA TABLE */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50 text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-5">Return ID & Type</th>
                                    <th className="px-6 py-5">Customer Info</th>
                                    <th className="px-6 py-5">Reason</th>
                                    <th className="px-6 py-5">Status</th>
                                    <th className="px-6 py-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {returns?.data?.map((ret) => (
                                    <tr key={ret.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-black text-[#1A1A2E] text-sm">{ret.return_number}</p>
                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md mt-1 inline-block ${ret.return_type === 'Refund' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {ret.return_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-[#1A1A2E] text-sm">{ret.customer_name}</p>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">ORD-{ret.order_id}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-bold text-[#1A1A2E] line-clamp-1">{ret.reason}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] border px-3 py-1.5 rounded-md font-black tracking-wider uppercase inline-block ${getStatusColor(ret.status)}`}>
                                                {ret.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => openModal(ret)} className="text-[10px] bg-gray-100 text-[#1A1A2E] hover:bg-[#1A1A2E] hover:text-white font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all">
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {returns?.data?.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-16 text-center">
                                            <RotateCcw size={48} className="mx-auto text-gray-300 mb-4" strokeWidth={1} />
                                            <p className="text-[#1A1A2E] font-black text-lg">No Return Requests</p>
                                            <p className="text-gray-500 text-sm font-bold mt-1">Awesome! No customers have requested returns in your area.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* 🚀 MODAL: MANAGE RETURN */}
            <AnimatePresence>
                {selectedReturn && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-end p-0 md:p-4 bg-[#1A1A2E]/80 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 300 }} className="bg-gray-50 h-full w-full md:w-[500px] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden">

                            <div className="p-6 bg-[#1A1A2E] text-white flex justify-between items-center shrink-0">
                                <div>
                                    <h3 className="font-black uppercase tracking-wider text-xl">Manage Return</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{selectedReturn.return_number}</p>
                                </div>
                                <button onClick={() => setSelectedReturn(null)} className="text-white/50 hover:text-white transition-colors"><X size={24} /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                {/* Customer Reason */}
                                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Customer Reason</h4>
                                    <p className="font-black text-[#1A1A2E] text-sm">{selectedReturn.reason}</p>
                                    {selectedReturn.customer_notes && <p className="text-xs font-bold text-gray-500 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">"{selectedReturn.customer_notes}"</p>}
                                </div>

                                {/* Items to Return */}
                                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2"><Package size={14} /> Items to pickup</h4>
                                    <div className="space-y-3">
                                        {selectedReturn.items?.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <div>
                                                    <p className="font-bold text-[#1A1A2E] text-sm">{item.name}</p>
                                                    <p className="text-[10px] font-black text-gray-500 uppercase">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Form */}
                                <form onSubmit={submitUpdate} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-2 flex items-center gap-2"><ClipboardList size={14} /> Update Progress</h4>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Status</label>
                                        <select value={data.status} onChange={e => setData('status', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#1A1A2E] text-sm focus:ring-2 focus:ring-[#E94E3C] outline-none">
                                            <option value="Requested">Requested (Pending Action)</option>
                                            <option value="Pickup Scheduled">Pickup Scheduled</option>
                                            <option value="Item Received">Item Received at Franchise</option>
                                            <option value="Forwarded to Admin">Forwarded to Super Admin</option>
                                            <option value="Rejected">Reject Request</option>
                                        </select>
                                    </div>

                                    {/* CONDITION DROPDOWN (Only visible if receiving items) */}
                                    {data.status === 'Item Received' && (
                                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 space-y-1.5">
                                            <label className="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-1"><ShieldAlert size={12} /> Received Item Condition</label>
                                            <select value={data.condition} onChange={e => setData('condition', e.target.value)} className="w-full bg-white border border-orange-200 rounded-lg px-4 py-2 font-bold text-[#1A1A2E] text-sm outline-none">
                                                <option value="Sellable">Good / Sellable (Adds to Stock)</option>
                                                <option value="Damaged">Damaged / Torn (Marks as Damaged)</option>
                                            </select>
                                            <p className="text-[9px] font-bold text-orange-600 mt-1 leading-tight">Careful! Selecting "Sellable" will increase your available inventory.</p>
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Your Notes / Proof</label>
                                        <textarea rows="2" placeholder="Item received in good condition..." value={data.franchise_notes} onChange={e => setData('franchise_notes', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-[#E94E3C] outline-none resize-none"></textarea>
                                    </div>

                                    <button disabled={processing} type="submit" className="w-full bg-[#E94E3C] text-white py-3.5 rounded-xl font-black uppercase tracking-widest hover:bg-[#c0392b] transition-colors shadow-lg flex items-center justify-center gap-2">
                                        {processing ? 'Saving...' : 'Update Status'} <Send size={16} />
                                    </button>
                                </form>

                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </AdminLayout>
    );
}