import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, ShoppingBag, PackageOpen, Truck, RotateCcw,
    MoreVertical, MapPin, Store, Box, CheckCircle2, ChevronRight, X
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

// Exact Order Statuses requested
const STATUSES = [
    'Pending', 'Confirmed', 'Packed', 'Shipped',
    'Out for Delivery', 'Delivered', 'Cancelled', 'Returned', 'Refunded'
];

const STATUS_COLORS = {
    'Pending': 'bg-orange-50 text-orange-600 border-orange-200',
    'Confirmed': 'bg-blue-50 text-blue-600 border-blue-200',
    'Packed': 'bg-indigo-50 text-indigo-600 border-indigo-200',
    'Shipped': 'bg-purple-50 text-purple-600 border-purple-200',
    'Out for Delivery': 'bg-teal-50 text-teal-600 border-teal-200',
    'Delivered': 'bg-[#1A1A2E] text-white border-[#1A1A2E]',
    'Cancelled': 'bg-red-50 text-red-600 border-red-200',
    'Returned': 'bg-rose-50 text-rose-600 border-rose-200',
    'Refunded': 'bg-gray-100 text-gray-600 border-gray-300',
};

export default function NetworkOrders({ orders, franchises, filters, stats }) {
    // Safety fallbacks in case props are empty
    const safeOrders = orders?.data || [];
    const safeFilters = filters || {};
    const safeFranchises = franchises || [];
    const safeStats = stats || { total: 0, pending: 0, shipped: 0, returned: 0 };

    const [search, setSearch] = useState(safeFilters.search || '');
    const [statusFilter, setStatusFilter] = useState(safeFilters.status || '');
    const [franchiseFilter, setFranchiseFilter] = useState(safeFilters.franchise_id || '');
    const [openActionMenu, setOpenActionMenu] = useState(null);

    // 🚀 FILTER TRIGGER (Updated with correct franchise-superadmin URL)
    const applyFilters = () => {
        router.get('/franchise-superadmin/orders',
            { search, status: statusFilter, franchise_id: franchiseFilter },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleKeyPress = (e) => { if (e.key === 'Enter') applyFilters(); };

    return (
        <AdminLayout active="orders">
            <Head title="Network Orders | Super Admin" />

            <div className="max-w-[1600px] mx-auto pb-20 pt-6 px-4 sm:px-6">
                {/* 🚀 HEADER & STATS */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter mb-6">Network Orders</h1>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard title="Total Orders" value={safeStats.total} icon={ShoppingBag} color="text-blue-500" />
                        <StatCard title="Action Required" value={safeStats.pending} icon={PackageOpen} color="text-orange-500" alert={safeStats.pending > 0} />
                        <StatCard title="In Transit" value={safeStats.shipped} icon={Truck} color="text-purple-500" />
                        <StatCard title="Returns" value={safeStats.returned} icon={RotateCcw} color="text-red-500" alert={safeStats.returned > 0} />
                    </div>
                </div>

                {/* 🚀 FILTERS BAR */}
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-1 w-full relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text" placeholder="Search by Order ID, Customer, or City..."
                            value={search} onChange={e => setSearch(e.target.value)} onKeyPress={handleKeyPress}
                            className="w-full bg-gray-50 border-none rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none"
                        />
                    </div>

                    <div className="flex w-full md:w-auto gap-4">
                        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setTimeout(applyFilters, 100); }} className="bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-600 focus:ring-2 focus:ring-[#E94E3C] outline-none cursor-pointer">
                            <option value="">All Statuses</option>
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>

                        <select value={franchiseFilter} onChange={e => { setFranchiseFilter(e.target.value); setTimeout(applyFilters, 100); }} className="bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-600 focus:ring-2 focus:ring-[#E94E3C] outline-none cursor-pointer max-w-[200px] truncate">
                            <option value="">All Fulfillment</option>
                            <option value="master">Master Warehouse</option>
                            {safeFranchises.map(f => <option key={f.id} value={f.id}>{f.name} ({f.city})</option>)}
                        </select>

                        {(search || statusFilter || franchiseFilter) && (
                            <button onClick={() => router.get('/franchise-superadmin/orders')} className="bg-red-50 text-red-500 p-3 rounded-xl hover:bg-red-100 transition-colors">
                                <X size={20} strokeWidth={2.5} />
                            </button>
                        )}
                    </div>
                </div>

                {/* 🚀 DATA TABLE */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-visible">
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50 text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-5 whitespace-nowrap">Order Details</th>
                                    <th className="px-6 py-5 whitespace-nowrap">Customer & Location</th>
                                    <th className="px-6 py-5 whitespace-nowrap">Fulfillment Route</th>
                                    <th className="px-6 py-5 whitespace-nowrap">Amount & Payment</th>
                                    <th className="px-6 py-5 whitespace-nowrap">Status</th>
                                    <th className="px-6 py-5 whitespace-nowrap text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {safeOrders.length > 0 ? safeOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/80 transition-colors group">

                                        {/* Order ID & Date */}
                                        <td className="px-6 py-4">
                                            <p className="font-black text-[#1A1A2E] text-sm">#{order.razorpay_order_id ? order.razorpay_order_id.slice(-8).toUpperCase() : order.id}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                                {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </td>

                                        {/* Customer Info */}
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-[#1A1A2E] text-sm">{order.user ? order.user.name : (order.customer_name || 'Guest User')}</p>
                                            <p className="text-[11px] font-bold text-gray-500 flex items-center gap-1 mt-1 truncate max-w-[200px]">
                                                <MapPin size={10} className="text-[#E94E3C]" /> {order.city || 'India'}, {order.pincode}
                                            </p>
                                        </td>

                                        {/* Fulfillment Assignment */}
                                        <td className="px-6 py-4">
                                            {order.fulfillment_type === 'master' || !order.franchise_id ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-gray-100 rounded-lg text-gray-600"><Box size={14} /></div>
                                                    <div>
                                                        <p className="text-xs font-black uppercase tracking-widest text-[#1A1A2E]">Master Stock</p>
                                                        <p className="text-[10px] font-bold text-gray-400">HQ Fulfillment</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-[#E94E3C]/10 rounded-lg text-[#E94E3C]"><Store size={14} /></div>
                                                    <div>
                                                        <p className="text-xs font-black uppercase tracking-widest text-[#1A1A2E] truncate max-w-[150px]">{order.franchise?.name || 'Assigned Franchise'}</p>
                                                        <p className="text-[10px] font-bold text-gray-400">Partner Fulfillment</p>
                                                    </div>
                                                </div>
                                            )}
                                        </td>

                                        {/* Financials */}
                                        <td className="px-6 py-4">
                                            <p className="font-black text-[#1A1A2E]">₹{(Number(order.total_amount) || 0).toLocaleString('en-IN')}</p>
                                            <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${order.payment?.status === 'captured' ? 'text-green-500' : 'text-orange-500'}`}>
                                                {order.payment?.method || 'COD'} • {order.payment?.status || 'Pending'}
                                            </p>
                                        </td>

                                        {/* Status Badge */}
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] border px-3 py-1.5 rounded-md font-black tracking-wider uppercase inline-flex items-center gap-1.5 shadow-sm ${STATUS_COLORS[order.status] || STATUS_COLORS['Pending']}`}>
                                                {order.status === 'Delivered' && <CheckCircle2 size={12} />}
                                                {order.status || 'Pending'}
                                            </span>
                                        </td>

                                        {/* Actions Menu */}
                                        <td className="px-6 py-4 text-right relative">
                                            <button onClick={() => setOpenActionMenu(openActionMenu === order.id ? null : order.id)} className="p-2 text-gray-400 hover:text-[#1A1A2E] hover:bg-gray-100 rounded-xl transition-colors focus:outline-none">
                                                <MoreVertical size={20} />
                                            </button>

                                            {/* Action Dropdown */}
                                            <AnimatePresence>
                                                {openActionMenu === order.id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                        className="absolute right-12 top-2 w-48 bg-white border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.1)] rounded-2xl z-50 overflow-hidden text-left"
                                                    >
                                                        <div className="p-2 space-y-1">
                                                            <Link href={`/franchise-superadmin/orders/${order.id}`} className="block w-full px-4 py-2.5 text-xs font-black uppercase tracking-widest text-[#1A1A2E] hover:bg-gray-50 rounded-xl transition-colors">
                                                                View Full Details
                                                            </Link>
                                                            <button onClick={() => router.put(`/franchise-superadmin/orders/${order.id}/status`, { status: 'Shipped' }, { preserveScroll: true, onSuccess: () => setOpenActionMenu(null) })} className="block w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-widest text-purple-600 hover:bg-purple-50 rounded-xl transition-colors">
                                                                Mark as Shipped
                                                            </button>
                                                            <button onClick={() => alert("Reassign modal opening...")} className="block w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-widest text-[#E94E3C] hover:bg-[#E94E3C]/10 rounded-xl transition-colors">
                                                                Reassign Route
                                                            </button>
                                                        </div>
                                                        <div className="p-2 border-t border-gray-50">
                                                            <button onClick={() => router.put(`/franchise-superadmin/orders/${order.id}/status`, { status: 'Cancelled' }, { preserveScroll: true, onSuccess: () => setOpenActionMenu(null) })} className="block w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                                                                Cancel Order
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-16 text-center">
                                            <PackageOpen size={48} className="mx-auto text-gray-300 mb-4" strokeWidth={1} />
                                            <p className="text-[#1A1A2E] font-black text-lg">No orders found</p>
                                            <p className="text-gray-400 font-bold text-sm mt-1">Try adjusting your search or filters.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination (If order.links exist) */}
                {orders?.links && orders.links.length > 3 && (
                    <div className="flex justify-center gap-2 mt-8">
                        {orders.links.map((link, k) => (
                            <Link key={k} href={link.url || '#'} dangerouslySetInnerHTML={{ __html: link.label }} className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${link.active ? 'bg-[#1A1A2E] text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-[#1A1A2E] border border-gray-200'}`} />
                        ))}
                    </div>
                )}

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
            <div className={`size-12 rounded-2xl flex items-center justify-center ${alert ? 'bg-orange-50' : 'bg-gray-50'} ${color}`}>
                <Icon size={20} strokeWidth={2.5} />
            </div>
        </div>
    );
}