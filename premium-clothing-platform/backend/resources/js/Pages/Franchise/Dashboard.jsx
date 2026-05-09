import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag, Box, Clock, MapPin, ArrowUpRight, PackageOpen } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Dashboard({ stats, recent_orders }) {
    const { auth } = usePage().props;

    // ✅ SAFETY LOCK 1: Agar backend se user data na aaye toh fallback use karein
    const user = auth?.user || { name: 'Franchise Partner' };

    // ✅ SAFETY LOCK 2: Null data ko empty handle karein
    const safeStats = stats || {};
    const safeOrders = Array.isArray(recent_orders) ? recent_orders : [];

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(Number(value) || 0);
    };

    const STATUS_BADGE = {
        pending: 'bg-[#fef3c7] text-[#92400e] border border-[#fcd34d]',
        confirmed: 'bg-blue-50 text-blue-700 border border-blue-200',
        packed: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
        shipped: 'bg-purple-50 text-purple-700 border border-purple-200',
        delivered: 'bg-[#1A1A2E] text-white border border-[#1A1A2E]',
        cancelled: 'bg-red-50 text-[#E94E3C] border border-red-200',
    };

    return (
        <AdminLayout active="dashboard">
            <Head title="Franchise Hub | IHO Clothing" />

            <div className="max-w-7xl mx-auto pb-12">

                {/* 🎯 HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                    className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4"
                >
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="bg-[#1A1A2E] text-white text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md shadow-[#1A1A2E]/20">
                                <MapPin size={12} strokeWidth={2.5} /> Local Territory
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-[#1A1A2E] tracking-tighter uppercase">
                            Franchise Hub
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium">
                            Welcome back, <span className="text-[#E94E3C] font-bold">{user.name}</span>. Track your local sales and manage stock.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/franchise/inventory" className="bg-white border border-gray-200 text-[#1A1A2E] px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:border-[#1A1A2E] transition-colors shadow-sm">
                            Request Stock
                        </Link>
                    </div>
                </motion.div>

                {/* 🎯 STATS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard delay={0.1} title="Territory Revenue" value={formatCurrency(safeStats.revenue)} icon={<TrendingUp size={22} />} isAccent />
                    <StatCard delay={0.2} title="Orders Fulfilled" value={safeStats.orders_count || 0} icon={<ShoppingBag size={22} />} />
                    <StatCard delay={0.3} title="Local Stock Units" value={safeStats.stock_level || 0} icon={<Box size={22} />} warning={(safeStats.stock_level || 0) < 50} />
                    <StatCard delay={0.4} title="Pending Fulfillment" value={safeStats.pending || 0} icon={<Clock size={22} />} isAlert={(safeStats.pending || 0) > 0} />
                </div>

                {/* 🎯 RECENT ORDERS */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                    className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                >
                    <div className="px-6 py-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-sm font-black tracking-widest text-[#1A1A2E] uppercase">Action Required: Recent Orders</h2>
                            <p className="text-xs text-gray-400 font-medium mt-1">Orders routed to your pincode for fulfillment.</p>
                        </div>
                        <Link href="/franchise/orders" className="text-[10px] font-black tracking-widest text-white bg-[#1A1A2E] hover:bg-[#E94E3C] uppercase px-5 py-2.5 rounded-full transition-all flex items-center gap-2 group">
                            Process Orders <ArrowUpRight size={14} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50 text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 whitespace-nowrap">Order ID</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Customer</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Amount</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Status</th>
                                    <th className="px-6 py-4 whitespace-nowrap text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {safeOrders.length > 0 ? (
                                    safeOrders.map((order, i) => (
                                        <tr key={order.id || i} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="px-6 py-5 font-black text-[#1A1A2E]">#{order.razorpay_order_id ? order.razorpay_order_id.slice(-6).toUpperCase() : order.id}</td>
                                            <td className="px-6 py-5">
                                                <p className="font-bold text-gray-700 group-hover:text-[#E94E3C] transition-colors">{order.customer_name || 'N/A'}</p>
                                                <p className="text-xs text-gray-400 font-medium truncate max-w-[200px]">{order.shipping_address || 'No address'}</p>
                                            </td>
                                            <td className="px-6 py-5 font-black text-[#1A1A2E]">{formatCurrency(order.total_amount)}</td>
                                            <td className="px-6 py-5">
                                                <span className={`text-[10px] px-3 py-1.5 rounded-md font-black tracking-wider uppercase ${STATUS_BADGE[order.status] || 'bg-gray-100 text-gray-800'}`}>
                                                    {order.status || 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <Link href={`/franchise/orders/${order.id}`} className="text-xs font-bold text-[#E94E3C] hover:text-[#1A1A2E] transition-colors">
                                                    Manage
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <PackageOpen size={40} strokeWidth={1.5} className="mb-4 text-gray-300" />
                                                <p className="text-sm font-bold uppercase tracking-widest text-[#1A1A2E]">All Caught Up!</p>
                                                <p className="text-xs font-medium mt-1">No pending orders in your territory right now.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </AdminLayout>
    );
}

function StatCard({ title, value, icon, isAccent = false, isAlert = false, warning = false, delay = 0 }) {
    let gradientBg = 'from-[#1A1A2E] to-[#2d2d4d]';
    let shadowColor = 'shadow-[#1A1A2E]/30';
    let hoverLine = 'bg-[#1A1A2E]';

    if (isAccent) {
        gradientBg = 'from-[#E94E3C] to-[#c0392b]';
        shadowColor = 'shadow-[#E94E3C]/30';
        hoverLine = 'bg-[#E94E3C]';
    } else if (isAlert || warning) {
        gradientBg = 'from-[#f59e0b] to-[#d97706]';
        shadowColor = 'shadow-[#f59e0b]/30';
        hoverLine = 'bg-[#f59e0b]';
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}
            className="relative bg-white rounded-3xl shadow-sm border border-gray-100 p-6 overflow-hidden group cursor-pointer"
        >
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${isAccent || isAlert ? 'from-[#E94E3C]/5' : 'from-[#1A1A2E]/5'} to-transparent`}></div>

            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-2 flex items-center gap-2">
                        {title}
                        {(isAlert || warning) && <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E94E3C] opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-[#E94E3C]"></span></span>}
                    </p>
                    <h3 className={`text-3xl font-black tracking-tighter ${isAlert || warning ? 'text-[#E94E3C]' : 'text-[#1A1A2E]'}`}>
                        {value}
                    </h3>
                </div>
                <div className={`size-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 bg-gradient-to-br ${gradientBg} text-white ${shadowColor}`}>
                    {icon}
                </div>
            </div>

            <div className={`absolute bottom-0 left-0 h-1.5 w-0 group-hover:w-full transition-all duration-500 ease-out ${hoverLine}`}></div>
        </motion.div>
    );
}