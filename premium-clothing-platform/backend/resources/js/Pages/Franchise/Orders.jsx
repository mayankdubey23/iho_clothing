import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingBag, Search, Clock, CheckCircle2, Truck, XCircle, Undo2,
    Package, FileText, Navigation, User, MapPin, X, Send
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function FranchiseOrders({ orders, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [selectedOrder, setSelectedOrder] = useState(null); // Controls the Details Modal

    const { data: trackData, setData: setTrackData, post: postTrack, processing: trackLoading } = useForm({
        courier_partner: '', tracking_number: ''
    });

    const applyFilters = () => router.get('/franchise/orders', { search, status: statusFilter }, { preserveState: true });
    const handleSearch = (e) => { if (e.key === 'Enter') applyFilters(); };

    const updateStatus = (orderId, newStatus) => {
        if (confirm(`Change order status to ${newStatus}? Customer will be notified.`)) {
            router.post(`/franchise/orders/${orderId}/status`, { status: newStatus }, {
                preserveScroll: true,
                onSuccess: () => setSelectedOrder(null) // Close modal on success
            });
        }
    };

    const submitTracking = (e, orderId) => {
        e.preventDefault();
        postTrack(`/franchise/orders/${orderId}/tracking`, {
            preserveScroll: true,
            onSuccess: () => {
                alert("Tracking Updated & Order Shipped!");
                setSelectedOrder(null);
            }
        });
    };

    const printInvoice = (orderId) => router.get(`/franchise/orders/${orderId}/invoice`);

    const getStatusConfig = (status) => {
        switch (status) {
            case 'Pending': return { color: 'bg-orange-50 text-orange-600 border-orange-200', icon: Clock };
            case 'Confirmed': return { color: 'bg-blue-50 text-blue-600 border-blue-200', icon: CheckCircle2 };
            case 'Packed': return { color: 'bg-indigo-50 text-indigo-600 border-indigo-200', icon: Package };
            case 'Shipped': return { color: 'bg-purple-50 text-purple-600 border-purple-200', icon: Navigation };
            case 'Out for Delivery': return { color: 'bg-yellow-50 text-yellow-600 border-yellow-200', icon: Truck };
            case 'Delivered': return { color: 'bg-green-50 text-green-600 border-green-200', icon: CheckCircle2 };
            case 'Cancelled Request': return { color: 'bg-red-50 text-red-600 border-red-200', icon: XCircle };
            default: return { color: 'bg-gray-50 text-gray-600 border-gray-200', icon: Clock };
        }
    };

    return (
        <AdminLayout active="orders">
            <Head title="Order Fulfillment | IHO Franchise" />

            <div className="max-w-[1600px] mx-auto pb-20 pt-6 px-4 sm:px-6">

                {/* 🚀 HEADER & FILTERS */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter flex items-center gap-3">
                            <ShoppingBag className="text-[#E94E3C]" size={32} /> Order Fulfillment
                        </h1>
                        <p className="text-gray-500 font-bold text-sm mt-1">Manage, pack, and ship orders assigned to your hub.</p>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setTimeout(applyFilters, 100); }} className="bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-sm font-bold text-gray-600 focus:ring-2 focus:ring-[#E94E3C] outline-none cursor-pointer shadow-sm">
                            <option value="all">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Packed">Packed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                        </select>
                        <div className="relative flex-1 md:w-80">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" placeholder="Search Order ID or Name..." value={search} onChange={e => setSearch(e.target.value)} onKeyPress={handleSearch} className="w-full bg-white shadow-sm border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none" />
                        </div>
                    </div>
                </div>

                {/* 🚀 MAIN ORDER TABLE */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50 text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-5">Order ID & Date</th>
                                    <th className="px-6 py-5">Customer info</th>
                                    <th className="px-6 py-5">Amount & Payment</th>
                                    <th className="px-6 py-5">Fulfillment Status</th>
                                    <th className="px-6 py-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {orders?.data?.map((order) => {
                                    const StatusIcon = getStatusConfig(order.status).icon;
                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50/80 transition-colors cursor-pointer" onClick={() => setSelectedOrder(order)}>
                                            <td className="px-6 py-4">
                                                <p className="font-black text-[#1A1A2E] text-sm">ORD-{order.id}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-[#1A1A2E] text-sm flex items-center gap-1.5"><User size={14} className="text-gray-400" /> {order.customer_name || 'Guest'}</p>
                                                <p className="text-[10px] font-bold text-gray-500 mt-1 pl-5">{order.customer_phone}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-black text-[#1A1A2E] text-sm">₹{Number(order.total_amount).toLocaleString()}</p>
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md mt-1 inline-block ${order.payment_status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                    {order.payment_method} • {order.payment_status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] border px-3 py-1.5 rounded-md font-black tracking-wider uppercase inline-flex items-center gap-1.5 ${getStatusConfig(order.status).color}`}>
                                                    <StatusIcon size={12} /> {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-[10px] bg-gray-100 text-[#1A1A2E] hover:bg-[#1A1A2E] hover:text-white font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all">
                                                    Manage Order
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {orders?.data?.length === 0 && (
                                    <tr><td colSpan="5" className="px-6 py-16 text-center"><ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" strokeWidth={1} /><p className="text-[#1A1A2E] font-black text-lg">No Orders Found</p></td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* 🚀 MODAL: ORDER DETAILS & MANAGEMENT */}
            <AnimatePresence>
                {selectedOrder && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-end p-0 md:p-4 bg-[#1A1A2E]/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 300 }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                            className="bg-gray-50 h-full w-full md:w-[600px] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
                        >
                            {/* Modal Header */}
                            <div className="p-6 bg-[#1A1A2E] text-white flex justify-between items-center shrink-0">
                                <div>
                                    <h3 className="font-black uppercase tracking-wider text-xl">Order #ORD-{selectedOrder.id}</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Placed: {new Date(selectedOrder.created_at).toLocaleString()}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => printInvoice(selectedOrder.id)} className="text-white hover:text-blue-400 transition-colors" title="Print Invoice"><FileText size={20} /></button>
                                    <button onClick={() => setSelectedOrder(null)} className="text-white/50 hover:text-white transition-colors"><X size={24} /></button>
                                </div>
                            </div>

                            {/* Modal Scrollable Body */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

                                {/* Status Actions */}
                                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Fulfillment Action</h4>
                                    <select
                                        onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                                        value={selectedOrder.status}
                                        className="w-full bg-gray-50 border border-gray-200 text-[#1A1A2E] text-sm font-black uppercase tracking-widest rounded-xl px-4 py-3.5 focus:ring-[#E94E3C] outline-none cursor-pointer"
                                    >
                                        <option value="Pending">Pending (Awaiting Acceptance)</option>
                                        <option value="Confirmed">Confirmed (Accept Order)</option>
                                        <option value="Packed">Packed (Ready for Shipping)</option>
                                        <option value="Shipped">Shipped (On the way)</option>
                                        <option value="Out for Delivery">Out for Local Delivery</option>
                                        <option value="Delivered">Delivered to Customer</option>
                                        <option value="Cancelled Request">Reject/Cancel Order</option>
                                    </select>
                                </div>

                                {/* Items List */}
                                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2"><Package size={14} /> Ordered Items</h4>
                                    <div className="space-y-3">
                                        {selectedOrder.items?.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                                <div>
                                                    <p className="font-bold text-[#1A1A2E] text-sm">{item.name}</p>
                                                    <p className="text-[10px] font-black text-gray-500 uppercase">SKU: {item.sku} | Qty: {item.quantity}</p>
                                                </div>
                                                <p className="font-black text-[#1A1A2E]">₹{Number(item.total_price).toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex justify-between items-center">
                                        <span className="font-bold text-gray-500 uppercase text-xs">Total Amount:</span>
                                        <span className="font-black text-[#1A1A2E] text-xl">₹{Number(selectedOrder.total_amount).toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Customer Info */}
                                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex gap-4 items-start">
                                    <MapPin size={20} className="text-gray-400 mt-1 shrink-0" />
                                    <div>
                                        <h4 className="font-black text-[#1A1A2E] text-sm">{selectedOrder.customer_name}</h4>
                                        <p className="text-xs font-bold text-gray-500 mt-1">{selectedOrder.customer_phone} • {selectedOrder.customer_email}</p>
                                        <p className="text-xs font-bold text-gray-600 mt-2 bg-gray-50 p-2 rounded-md">{selectedOrder.shipping_address || 'Shipping address will be fetched from user_addresses table.'}</p>
                                    </div>
                                </div>

                                {/* Add Tracking Details Form */}
                                {(selectedOrder.status === 'Packed' || selectedOrder.status === 'Shipped') && (
                                    <form onSubmit={(e) => submitTracking(e, selectedOrder.id)} className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 shadow-sm">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-3 flex items-center gap-2"><Navigation size={14} /> Add Tracking Information</h4>
                                        <div className="space-y-3">
                                            <input required type="text" placeholder="Courier Partner (e.g. Delhivery)" value={trackData.courier_partner} onChange={e => setTrackData('courier_partner', e.target.value)} className="w-full bg-white border border-indigo-100 rounded-xl px-4 py-3 font-bold text-[#1A1A2E] text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                            <input required type="text" placeholder="Tracking / AWB Number" value={trackData.tracking_number} onChange={e => setTrackData('tracking_number', e.target.value)} className="w-full bg-white border border-indigo-100 rounded-xl px-4 py-3 font-bold text-[#1A1A2E] text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                            <button disabled={trackLoading} type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg flex justify-center items-center gap-2">
                                                Update Tracking <Send size={14} />
                                            </button>
                                        </div>
                                    </form>
                                )}

                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </AdminLayout>
    );
}