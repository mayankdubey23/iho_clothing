import React, { useState } from 'react';
import { Head, router, useForm, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PackageSearch, AlertTriangle, Search, Package, CheckCircle2, PackageX,
    PlusCircle, FileDown, ShieldAlert, BarChart3, X, Save
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Inventory({ inventory, stats, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [damagedModal, setDamagedModal] = useState(null);

    const { data, setData, post, processing, reset } = useForm({
        quantity: 1, notes: ''
    });

    const applyFilter = (filterType) => router.get('/franchise/inventory', { filter: filterType, search }, { preserveState: true });
    const handleSearch = (e) => { if (e.key === 'Enter') applyFilter(filters.filter); };

    const submitDamaged = (e) => {
        e.preventDefault();
        post(`/franchise/inventory/${damagedModal.id}/damaged`, {
            preserveScroll: true,
            onSuccess: () => { setDamagedModal(null); reset(); alert("Stock marked as damaged."); }
        });
    };

    return (
        <AdminLayout active="inventory">
            <Head title="My Inventory | IHO Franchise" />

            <div className="max-w-[1600px] mx-auto pb-20 pt-6 px-4 sm:px-6">

                {/* 🚀 HEADER & ACTIONS */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#282c3f] uppercase tracking-tighter flex items-center gap-3">
                            <PackageSearch className="text-[#ff3f6c]" size={32} /> My Inventory
                        </h1>
                        <p className="text-gray-500 font-bold text-sm mt-1">Manage variants, track performance, and report damages.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="bg-white border border-gray-200 text-[#282c3f] px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
                            <FileDown size={18} /> Report
                        </button>
                        <Link href="/franchise/stock-requests/new" className="bg-[#282c3f] text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#ff3f6c] transition-all flex items-center gap-2 shadow-lg">
                            <PlusCircle size={18} /> Request Stock
                        </Link>
                    </div>
                </div>

                {/* 🚀 ANALYTICS CARDS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard title="Total Available" value={stats.total_available} icon={Package} color="text-indigo-500" />
                    <StatCard title="Total Sold" value={stats.total_sold} icon={CheckCircle2} color="text-green-500" />
                    <StatCard title="Damaged Units" value={stats.total_damaged} icon={ShieldAlert} color="text-red-500" alert={stats.total_damaged > 0} />
                    <StatCard title="Low Stock Alerts" value={stats.low_stock_items} icon={AlertTriangle} color="text-orange-500" alert={stats.low_stock_items > 0} />
                </div>

                {/* 🚀 FILTER & SEARCH */}
                <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center bg-white p-3 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex gap-2 w-full md:w-auto">
                        <button onClick={() => applyFilter('all')} className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filters.filter === 'all' ? 'bg-[#282c3f] text-white' : 'bg-gray-50 text-gray-500'}`}>All Items</button>
                        <button onClick={() => applyFilter('low')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filters.filter === 'low' ? 'bg-orange-500 text-white shadow-md' : 'bg-orange-50 text-orange-600'}`}><AlertTriangle size={16} /> Low Stock</button>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search Product or SKU..." value={search} onChange={e => setSearch(e.target.value)} onKeyPress={handleSearch} className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-12 pr-4 py-3 font-bold text-[#282c3f] focus:ring-2 focus:ring-[#ff3f6c] outline-none" />
                    </div>
                </div>

                {/* 🚀 DATA TABLE */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50 text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-5">Product Details</th>
                                    <th className="px-6 py-5">Variant (Size/Color)</th>
                                    <th className="px-6 py-5 text-center">Available</th>
                                    <th className="px-6 py-5 text-center">Sold</th>
                                    <th className="px-6 py-5 text-center">Damaged</th>
                                    <th className="px-6 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {inventory?.data?.map((item) => {
                                    const isLow = item.quantity <= item.low_stock_threshold && item.quantity > 0;
                                    const isOut = item.quantity === 0;

                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-[#282c3f] text-sm">{item.product_name}</p>
                                                <p className="text-[10px] font-black text-gray-400 uppercase mt-0.5">SKU: {item.variant_sku || item.master_sku}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    {item.size ? <span className="bg-gray-100 text-[#282c3f] px-2 py-1 rounded text-[10px] font-black uppercase">{item.size}</span> : <span className="text-gray-400 text-xs">-</span>}
                                                    {item.color && <span className="bg-gray-100 text-[#282c3f] px-2 py-1 rounded text-[10px] font-black uppercase">{item.color}</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`text-xl font-black ${isOut ? 'text-red-600' : (isLow ? 'text-orange-500' : 'text-[#282c3f]')}`}>{item.quantity}</span>
                                                {isLow && <p className="text-[9px] text-orange-500 font-black uppercase mt-1">Low Alert</p>}
                                            </td>
                                            <td className="px-6 py-4 text-center"><span className="font-black text-green-600">{item.sold_quantity}</span></td>
                                            <td className="px-6 py-4 text-center"><span className="font-black text-red-500">{item.damaged_quantity}</span></td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => setDamagedModal(item)} disabled={item.quantity === 0} className="text-[10px] bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-black uppercase px-3 py-1.5 rounded-lg transition-all disabled:opacity-50">
                                                    Mark Damaged
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* 🚀 MODAL: MARK DAMAGED */}
            <AnimatePresence>
                {damagedModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#282c3f]/80 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
                            <div className="p-6 border-b border-red-100 flex justify-between items-center bg-red-50">
                                <h3 className="font-black text-red-600 uppercase tracking-wider flex items-center gap-2"><ShieldAlert size={18} /> Report Damage</h3>
                                <button onClick={() => setDamagedModal(null)} className="text-red-400 hover:text-red-600"><X size={20} /></button>
                            </div>
                            <form onSubmit={submitDamaged} className="p-6 space-y-5">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center mb-2">
                                    <p className="font-black text-[#282c3f] text-sm">{damagedModal.product_name}</p>
                                    <p className="text-[10px] font-bold text-gray-500 mt-1">Variant: {damagedModal.size || 'N/A'} | Available: {damagedModal.quantity}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase">Quantity Damaged</label>
                                    <input required type="number" min="1" max={damagedModal.quantity} value={data.quantity} onChange={e => setData('quantity', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-black focus:ring-2 focus:ring-red-500 outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase">Reason / Notes</label>
                                    <input type="text" placeholder="E.g. Torn during packing" value={data.notes} onChange={e => setData('notes', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-red-500 outline-none" />
                                </div>
                                <button disabled={processing} type="submit" className="w-full bg-red-600 text-white py-3.5 rounded-xl font-black uppercase hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20">
                                    Confirm Damage
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </AdminLayout>
    );
}

// 💎 Stat Card Component
function StatCard({ title, value, icon: Icon, color, alert }) {
    return (
        <div className={`bg-white p-4 md:p-6 rounded-3xl border ${alert ? 'border-red-200 shadow-red-500/10' : 'border-gray-100'} shadow-sm flex items-center justify-between`}>
            <div>
                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{title}</p>
                <h4 className="text-2xl md:text-3xl font-black text-[#282c3f]">{value || 0}</h4>
            </div>
            <div className={`size-10 md:size-14 rounded-2xl flex items-center justify-center ${alert ? 'bg-red-50' : 'bg-gray-50'} ${color}`}>
                <Icon size={24} strokeWidth={2.5} />
            </div>
        </div>
    );
}