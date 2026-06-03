import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Box, AlertTriangle, RefreshCcw, ArrowRightLeft,
    Plus, Minus, X, CheckCircle2, MoreVertical
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function MasterStock({ inventory, franchises, filters, stats }) {
    const safeInventory = inventory?.data || [];
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');

    // Modal States
    const [adjustModal, setAdjustModal] = useState({ open: false, product: null, type: 'add' });
    const [transferModal, setTransferModal] = useState({ open: false, product: null });

    const { data: adjustData, setData: setAdjustData, put: submitAdjust, processing: adjustProcessing, reset: resetAdjust, errors: adjustErrors } = useForm({ quantity: '', reason: '', type: 'add' });
    const { data: transferData, setData: setTransferData, post: submitTransfer, processing: transferProcessing, reset: resetTransfer, errors: transferErrors } = useForm({ franchise_id: '', quantity: '' });

    // Filter Trigger
    const applyFilters = () => {
        router.get('/franchise-superadmin/master-stock', { search, status: statusFilter }, { preserveState: true });
    };

    const handleAdjustSubmit = (e) => {
        e.preventDefault();
        submitAdjust(`/franchise-superadmin/master-stock/${adjustModal.product.id}/adjust`, {
            onSuccess: () => { setAdjustModal({ open: false, product: null }); resetAdjust(); }
        });
    };

    const handleTransferSubmit = (e) => {
        e.preventDefault();
        submitTransfer(`/franchise-superadmin/master-stock/${transferModal.product.id}/transfer`, {
            onSuccess: () => { setTransferModal({ open: false, product: null }); resetTransfer(); }
        });
    };

    return (
        <AdminLayout active="inventory">
            <Head title="Master Stock | Super Admin" />

            <div className="max-w-[1600px] mx-auto pb-20 pt-6 px-4 sm:px-6">

                {/* 🚀 HEADER & STATS */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-[#282c3f] uppercase tracking-tighter mb-6 flex items-center gap-3">
                        <Box className="text-[#ff3f6c]" /> Master Stock
                    </h1>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard title="Total Unique Items" value={stats?.total_items} icon={Box} color="text-blue-500" />
                        <StatCard title="Total Master Stock" value={stats?.total_stock} icon={CheckCircle2} color="text-green-500" />
                        <StatCard title="Low Stock Alerts" value={stats?.low_stock} icon={AlertTriangle} color="text-orange-500" alert={stats?.low_stock > 0} />
                        <StatCard title="Damaged / Returns" value={stats?.damaged_stock} icon={RefreshCcw} color="text-red-500" alert={stats?.damaged_stock > 0} />
                    </div>
                </div>

                {/* 🚀 FILTERS BAR */}
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-1 w-full relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text" placeholder="Search by Product Name or SKU..."
                            value={search} onChange={e => setSearch(e.target.value)} onKeyPress={e => e.key === 'Enter' && applyFilters()}
                            className="w-full bg-gray-50 border-none rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-[#282c3f] focus:ring-2 focus:ring-[#ff3f6c] outline-none"
                        />
                    </div>
                    <div className="flex w-full md:w-auto gap-4">
                        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setTimeout(applyFilters, 100); }} className="bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-600 focus:ring-2 focus:ring-[#ff3f6c] outline-none cursor-pointer">
                            <option value="">All Stock Levels</option>
                            <option value="low">Low Stock (≤ 10)</option>
                            <option value="out">Out of Stock</option>
                        </select>
                        {(search || statusFilter) && (
                            <button onClick={() => router.get('/franchise-superadmin/master-stock')} className="bg-red-50 text-red-500 p-3 rounded-xl hover:bg-red-100 transition-colors"><X size={20} /></button>
                        )}
                    </div>
                </div>

                {/* 🚀 INVENTORY TABLE */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-visible">
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50 text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-5 whitespace-nowrap">Product Info</th>
                                    <th className="px-6 py-5 whitespace-nowrap">SKU</th>
                                    <th className="px-6 py-5 whitespace-nowrap text-center">Master Qty</th>
                                    <th className="px-6 py-5 whitespace-nowrap text-center">Damaged Qty</th>
                                    <th className="px-6 py-5 whitespace-nowrap">Status</th>
                                    <th className="px-6 py-5 whitespace-nowrap text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {safeInventory.length > 0 ? safeInventory.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">

                                        <td className="px-6 py-4 flex items-center gap-4">
                                            <div className="size-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                                {/* Fallback image if item.image is null */}
                                                <img src={item.image || "https://placehold.co/100"} alt="Product" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="font-black text-[#282c3f] text-sm max-w-[250px] truncate">{item.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.category?.name || 'Uncategorized'}</p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 font-bold text-gray-500 text-xs tracking-wider">{item.sku || 'N/A'}</td>

                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-lg font-black ${item.stock_quantity <= 10 ? 'text-red-500' : 'text-[#282c3f]'}`}>{item.stock_quantity || 0}</span>
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <span className="text-sm font-bold text-gray-400">{item.damaged_quantity || 0}</span>
                                        </td>

                                        <td className="px-6 py-4">
                                            {item.stock_quantity > 10 ? <Badge color="bg-green-100 text-green-700">In Stock</Badge> :
                                                item.stock_quantity > 0 ? <Badge color="bg-orange-100 text-orange-700">Low Stock</Badge> :
                                                    <Badge color="bg-red-100 text-red-700">Out of Stock</Badge>}
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => { setAdjustData('type', 'add'); setAdjustModal({ open: true, product: item }); }} className="p-2 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors tooltip" title="Adjust Stock"><RefreshCcw size={16} /></button>
                                                <button onClick={() => { setTransferModal({ open: true, product: item }); }} className="p-2 text-[#ff3f6c] bg-[#ff3f6c]/10 hover:bg-[#ff3f6c]/20 rounded-xl transition-colors tooltip" title="Transfer to Franchise"><ArrowRightLeft size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-16 text-center">
                                            <Box size={48} className="mx-auto text-gray-300 mb-4" strokeWidth={1} />
                                            <p className="text-[#282c3f] font-black text-lg">Inventory Empty</p>
                                            <p className="text-gray-400 font-bold text-sm mt-1">No products found matching your criteria.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination (If order.links exist) */}
                {inventory?.links && inventory.links.length > 3 && (
                    <div className="flex justify-center gap-2 mt-8">
                        {inventory.links.map((link, k) => (
                            <Link key={k} href={link.url || '#'} dangerouslySetInnerHTML={{ __html: link.label }} className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${link.active ? 'bg-[#282c3f] text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-[#282c3f] border border-gray-200'}`} />
                        ))}
                    </div>
                )}
            </div>

            {/* 🚀 MODAL: ADJUST STOCK */}
            <AnimatePresence>
                {adjustModal.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#282c3f]/60 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="font-black text-[#282c3f] uppercase tracking-wider">Adjust Stock</h3>
                                <button onClick={() => setAdjustModal({ open: false })} className="text-gray-400 hover:text-red-500 transition-colors"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleAdjustSubmit} className="p-6 space-y-5">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center mb-4 truncate">{adjustModal.product?.name}</p>

                                <div className="flex justify-center gap-2 mb-6">
                                    <TypeBtn active={adjustData.type === 'add'} onClick={() => setAdjustData('type', 'add')} color="bg-green-100 text-green-700 hover:bg-green-200" icon={<Plus size={16} />}>Add</TypeBtn>
                                    <TypeBtn active={adjustData.type === 'reduce'} onClick={() => setAdjustData('type', 'reduce')} color="bg-orange-100 text-orange-700 hover:bg-orange-200" icon={<Minus size={16} />}>Reduce</TypeBtn>
                                    <TypeBtn active={adjustData.type === 'damaged'} onClick={() => setAdjustData('type', 'damaged')} color="bg-red-100 text-red-700 hover:bg-red-200" icon={<AlertTriangle size={16} />}>Damaged</TypeBtn>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Quantity</label>
                                    <input type="number" min="1" required value={adjustData.quantity} onChange={e => setAdjustData('quantity', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#282c3f] focus:ring-2 focus:ring-[#ff3f6c] outline-none" placeholder="Enter quantity..." />
                                    {adjustErrors.quantity && <p className="text-[10px] text-red-500 mt-1 font-bold">{adjustErrors.quantity}</p>}
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Reason (Optional)</label>
                                    <input type="text" value={adjustData.reason} onChange={e => setAdjustData('reason', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#282c3f] focus:ring-2 focus:ring-[#ff3f6c] outline-none" placeholder="e.g. Supplier delivery, Audit adjustment..." />
                                </div>

                                <button disabled={adjustProcessing} type="submit" className="w-full bg-[#282c3f] text-white py-3.5 rounded-xl font-black uppercase tracking-widest hover:bg-[#ff3f6c] transition-colors disabled:opacity-50 mt-4">
                                    {adjustProcessing ? 'Updating...' : 'Update Stock'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 🚀 MODAL: TRANSFER TO FRANCHISE */}
            <AnimatePresence>
                {transferModal.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#282c3f]/60 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#282c3f]">
                                <h3 className="font-black text-white uppercase tracking-wider flex items-center gap-2"><ArrowRightLeft size={18} /> Transfer Route</h3>
                                <button onClick={() => setTransferModal({ open: false })} className="text-white/50 hover:text-white transition-colors"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleTransferSubmit} className="p-6 space-y-5">
                                <div className="bg-gray-50 p-4 rounded-2xl flex justify-between items-center mb-4">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Available Master</p>
                                        <p className="text-xl font-black text-[#282c3f]">{transferModal.product?.stock_quantity || 0} Units</p>
                                    </div>
                                    <Box size={24} className="text-gray-300" />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Select Destination Franchise *</label>
                                    <select required value={transferData.franchise_id} onChange={e => setTransferData('franchise_id', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#282c3f] focus:ring-2 focus:ring-[#ff3f6c] outline-none">
                                        <option value="">-- Choose Franchise --</option>
                                        {franchises?.map(f => <option key={f.id} value={f.id}>{f.name} ({f.city})</option>)}
                                    </select>
                                    {transferErrors.franchise_id && <p className="text-[10px] text-red-500 mt-1 font-bold">{transferErrors.franchise_id}</p>}
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Transfer Quantity *</label>
                                    <input type="number" min="1" max={transferModal.product?.stock_quantity} required value={transferData.quantity} onChange={e => setTransferData('quantity', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#282c3f] focus:ring-2 focus:ring-[#ff3f6c] outline-none" placeholder="Units to transfer..." />
                                    {transferErrors.quantity && <p className="text-[10px] text-red-500 mt-1 font-bold">{transferErrors.quantity}</p>}
                                </div>

                                <button disabled={transferProcessing} type="submit" className="w-full bg-[#ff3f6c] text-white py-3.5 rounded-xl font-black uppercase tracking-widest hover:bg-[#c0392b] transition-colors disabled:opacity-50 mt-4 flex items-center justify-center gap-2">
                                    {transferProcessing ? 'Processing Route...' : 'Confirm Transfer'} <ArrowRightLeft size={16} />
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </AdminLayout>
    );
}

// 💎 Helper Components
function StatCard({ title, value, icon: Icon, color, alert }) {
    return (
        <div className={`bg-white p-5 rounded-3xl border ${alert ? 'border-orange-200 shadow-orange-500/10' : 'border-gray-100 shadow-black/5'} shadow-sm flex items-center justify-between`}>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{title}</p>
                <h4 className="text-2xl font-black text-[#282c3f]">{value?.toLocaleString() || 0}</h4>
            </div>
            <div className={`size-12 rounded-2xl flex items-center justify-center ${alert ? 'bg-orange-50' : 'bg-gray-50'} ${color}`}>
                <Icon size={20} strokeWidth={2.5} />
            </div>
        </div>
    );
}

function Badge({ color, children }) {
    return <span className={`text-[10px] border px-2.5 py-1 rounded-md font-black tracking-wider uppercase inline-block shadow-sm ${color}`}>{children}</span>;
}

function TypeBtn({ active, onClick, color, icon, children }) {
    return (
        <button type="button" onClick={onClick} className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${active ? color + ' ring-2 ring-offset-1 ring-[#282c3f]' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
            {icon} {children}
        </button>
    );
}
