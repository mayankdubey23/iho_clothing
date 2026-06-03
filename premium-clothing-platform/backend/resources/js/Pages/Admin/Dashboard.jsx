import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    TrendingUp, ShoppingBag, Box, Store, Users, IndianRupee,
    ArrowUpRight, ShieldAlert, PackageOpen, Globe, Activity, AlertCircle
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';

// 🚀 Fluid Animation Variants
const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

// Premium Status Badges
const STATUS_BADGE = {
    pending: 'bg-[#fef3c7] text-[#92400e] border border-[#fcd34d]',
    confirmed: 'bg-blue-50 text-blue-700 border border-blue-200',
    packed: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    shipped: 'bg-purple-50 text-purple-700 border border-purple-200',
    delivered: 'bg-[#282c3f] text-white border border-[#282c3f]',
    cancelled: 'bg-red-50 text-[#ff3f6c] border border-red-200',
};

function formatCurrency(value) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);
}

export default function Dashboard({ stats, recent_orders, chart_data }) {
    const { auth } = usePage().props;

    // ✅ SAFETY LOCKS
    const user = auth?.user || { name: 'Super Admin', role: 'super_admin' };
    const safeStats = stats || {};
    const safeOrders = Array.isArray(recent_orders) ? recent_orders : [];

    // Map backend stats dynamically
    const revenue = safeStats.total_revenue || safeStats.revenue || 0;
    const totalOrders = safeStats.total_orders || safeStats.orders_count || 0;
    const customersCount = safeStats.total_customers || 0;
    const franchiseApps = safeStats.applications || 0; // New franchise applications
    const pendingOrders = safeStats.pending_orders || 0;
    const lowStockCount = safeStats.low_stock || 0;

    // Dynamic Chart Data Processing
    const processedChartData = chart_data && chart_data.length > 0
        ? chart_data.map(item => ({
            ...item,
            revenue: parseFloat(item.revenue),
            orders: parseInt(item.orders),
            name: new Date(item.name).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
        }))
        : [
            { name: 'Mon', revenue: 40000, orders: 124 },
            { name: 'Tue', revenue: 35000, orders: 113 },
            { name: 'Wed', revenue: 58000, orders: 198 },
            { name: 'Thu', revenue: 27800, orders: 89 },
            { name: 'Fri', revenue: 68900, orders: 248 },
            { name: 'Sat', revenue: 83900, orders: 338 },
            { name: 'Sun', revenue: 94900, orders: 443 },
        ];

    return (
        <AdminLayout active="dashboard">
            <Head title="Global Command Center | IHO Admin" />

            <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-7xl mx-auto pb-12">

                {/* 🎯 SUPER ADMIN HEADER */}
                <motion.div variants={fadeUp} className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="bg-[#ff3f6c] text-white text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md shadow-[#ff3f6c]/30">
                                <Globe size={12} strokeWidth={2.5} /> Global Network
                            </span>
                            <span className="bg-[#282c3f] text-white text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                <ShieldAlert size={12} strokeWidth={2.5} /> Super Admin
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-[#282c3f] tracking-tighter uppercase">
                            Command Center
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium">
                            Welcome back, <span className="text-[#ff3f6c] font-bold">{user.name}</span>. Manage global inventory, monitor franchise performance, and approve requests.
                        </p>
                    </div>
                </motion.div>

                {/* 🎯 QUICK ACTION POWERS (Super Admin Specific) */}
                <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <QuickActionCard href="/franchise-superadmin/franchises" icon={<Store size={20} />} label="Manage Franchises" alert={franchiseApps > 0} />
                    <QuickActionCard href="/franchise-superadmin/master-stock" icon={<Box size={20} />} label="Master Catalog" />
                    <QuickActionCard href="/franchise-superadmin/stock-requests" icon={<PackageOpen size={20} />} label="Stock Approvals" alert={lowStockCount > 0} />
                    <QuickActionCard href="/franchise-superadmin/analytics" icon={<Activity size={20} />} label="Global Analytics" />
                </motion.div>

                {/* 🎯 GLOBAL STAT CARDS */}
                <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard title="Total Network Revenue" value={formatCurrency(revenue)} icon={<TrendingUp size={22} />} isAccent />
                    <StatCard title="Total Network Orders" value={totalOrders} icon={<ShoppingBag size={22} />} alert={pendingOrders > 0} />
                    <StatCard title="Total Customers" value={customersCount} icon={<Users size={22} />} />
                    <StatCard title="Master Low Stock" value={lowStockCount} icon={<AlertCircle size={22} />} isAlert={lowStockCount > 0} />
                </motion.div>

                {/* 🎯 ONLINE VS OFFLINE CHANNELS */}
                <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <ChannelCard
                        title="D2C Online Sales"
                        value={formatCurrency(safeStats.online_sales || (revenue * 0.6))}
                        subtitle="Direct customer orders via website"
                        icon={<Globe size={22} />}
                        accent="bg-[#ff3f6c]"
                    />
                    <ChannelCard
                        title="Franchise B2B Sales"
                        value={formatCurrency(safeStats.offline_sales || (revenue * 0.4))}
                        subtitle="Offline retail & franchise fulfillment"
                        icon={<Store size={22} />}
                        accent="bg-[#282c3f]"
                    />
                </motion.div>

                {/* 🎯 GLOBAL CHARTS */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-10">
                    <motion.div variants={fadeUp} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 lift-card relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#ff3f6c]/5 to-transparent rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/3"></div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-[#282c3f] mb-6 flex items-center justify-between">
                            Network Revenue Flow
                            <span className="text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded-md">Last 7 Days</span>
                        </h2>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={processedChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ff3f6c" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#ff3f6c" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fff0f4" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#ff3f6c', fontSize: 11, fontWeight: 700 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#ff3f6c', fontSize: 11, fontWeight: 700 }} tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000) + 'k' : value}`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#282c3f', borderRadius: '12px', border: 'none', color: '#fff', fontWeight: 'bold', fontSize: '12px', boxShadow: '0 10px 25px -5px rgba(26, 26, 46, 0.5)' }}
                                        itemStyle={{ color: '#ff3f6c' }}
                                        formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#ff3f6c" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    <motion.div variants={fadeUp} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 lift-card relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#282c3f]/5 to-transparent rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/3"></div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-[#282c3f] mb-6 flex items-center justify-between">
                            Global Order Volume
                            <span className="text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded-md">Last 7 Days</span>
                        </h2>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={processedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fff0f4" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#ff3f6c', fontSize: 11, fontWeight: 700 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#ff3f6c', fontSize: 11, fontWeight: 700 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#282c3f', borderRadius: '12px', border: 'none', color: '#fff', fontWeight: 'bold', fontSize: '12px' }}
                                        cursor={{ fill: 'rgba(26,26,46,0.05)' }}
                                    />
                                    <Bar dataKey="orders" radius={[6, 6, 0, 0]} barSize={28}>
                                        {processedChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === processedChartData.length - 1 ? '#ff3f6c' : '#282c3f'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* 🎯 GLOBAL LEDGER TABLE */}
                <motion.div variants={fadeUp} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden lift-card">
                    <div className="px-6 py-5 border-b border-gray-100 bg-white flex justify-between items-center">
                        <h2 className="text-sm font-black tracking-widest text-[#282c3f] uppercase">Master Order Ledger</h2>
                        <Link href="/franchise-superadmin/orders" className="text-xs font-bold tracking-widest text-[#ff3f6c] uppercase hover:text-[#282c3f] transition-colors flex items-center gap-1 group">
                            View All Network <ArrowUpRight size={14} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50 text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 whitespace-nowrap">Order ID</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Customer</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Fulfillment By</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Value</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {safeOrders.length > 0 ? (
                                    safeOrders.map((order, i) => (
                                        <motion.tr
                                            key={order.id || i}
                                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                            className="hover:bg-gray-50/80 transition-colors group"
                                        >
                                            <td className="px-6 py-4 font-black text-[#282c3f]">#{order.razorpay_order_id ? order.razorpay_order_id.slice(-6).toUpperCase() : order.id}</td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-gray-700 group-hover:text-[#ff3f6c] transition-colors">{order.customer_name || 'N/A'}</p>
                                                <p className="text-xs text-gray-400 font-medium truncate max-w-[150px]">{order.city || 'India'}, {order.pincode}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                {order.fulfillment_type === 'master' ? (
                                                    <span className="text-[10px] font-black tracking-widest text-[#ff3f6c] uppercase flex items-center gap-1"><Box size={10} /> Master Whse</span>
                                                ) : (
                                                    <span className="text-[10px] font-black tracking-widest text-[#282c3f] uppercase flex items-center gap-1"><Store size={10} /> Franchise</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-black text-[#282c3f]">{formatCurrency(order.total_amount)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] px-3 py-1.5 rounded-md font-black tracking-wider uppercase ${STATUS_BADGE[order.status] || 'bg-gray-100 text-gray-800'}`}>
                                                    {order.status || 'Pending'}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <ShoppingBag size={32} className="mb-3 opacity-20" />
                                                <p className="text-sm font-bold uppercase tracking-widest">No network orders yet</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </motion.div>
        </AdminLayout>
    );
}

// 💎 Ultra Premium Quick Action Button
function QuickActionCard({ label, icon, href, alert = false }) {
    return (
        <Link href={href} className="group relative bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:border-[#282c3f]/20 hover:shadow-lg transition-all overflow-hidden lift-card">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-50/50 group-hover:to-[#282c3f]/5 transition-colors -z-10"></div>
            <div className={`size-10 rounded-xl flex items-center justify-center shadow-sm shrink-0 transition-transform group-hover:scale-110 ${alert ? 'bg-[#ff3f6c]/10 text-[#ff3f6c]' : 'bg-[#282c3f]/5 text-[#282c3f]'}`}>
                {icon}
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-[#282c3f] group-hover:text-[#ff3f6c] transition-colors leading-tight">
                {label}
            </span>
            {alert && (
                <span className="absolute top-3 right-3 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff3f6c] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff3f6c]"></span>
                </span>
            )}
        </Link>
    );
}

// 💎 Ultra Premium Stat Card Component
function StatCard({ title, value, icon, isAccent = false, isAlert = false }) {
    return (
        <motion.div variants={fadeUp} className="relative bg-white rounded-3xl shadow-sm border border-gray-100 p-6 overflow-hidden lift-card group">
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isAccent || isAlert ? 'bg-gradient-to-br from-[#ff3f6c]/5 to-transparent' : 'bg-gradient-to-br from-[#282c3f]/5 to-transparent'}`}></div>

            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-2 flex items-center gap-1.5">
                        {title}
                        {isAlert && <span className="text-[#ff3f6c] animate-pulse"><AlertCircle size={10} strokeWidth={3} /></span>}
                    </p>
                    <h3 className={`text-3xl font-black tracking-tighter ${isAlert ? 'text-[#ff3f6c]' : 'text-[#282c3f]'}`}>
                        {value}
                    </h3>
                </div>
                <div className={`size-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 ${isAccent ? 'bg-gradient-to-br from-[#ff3f6c] to-[#c0392b] text-white shadow-[#ff3f6c]/30' : isAlert ? 'bg-gradient-to-br from-red-500 to-red-700 text-white shadow-red-500/30' : 'bg-gradient-to-br from-[#282c3f] to-[#2d2d4d] text-white shadow-[#282c3f]/30'}`}>
                    {icon}
                </div>
            </div>

            <div className={`absolute bottom-0 left-0 h-1.5 w-0 group-hover:w-full transition-all duration-500 ease-out ${isAccent || isAlert ? 'bg-[#ff3f6c]' : 'bg-[#282c3f]'}`}></div>
        </motion.div>
    );
}

// 💎 Channel Split Cards (Online vs Offline)
function ChannelCard({ title, value, subtitle, icon, accent }) {
    return (
        <motion.div variants={fadeUp} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 lift-card group cursor-pointer relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 flex items-center justify-between gap-4">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400 mb-2">{title}</p>
                    <h3 className="text-3xl font-black text-[#282c3f] tracking-tighter">{value}</h3>
                    <p className="mt-2 text-[10px] font-bold tracking-widest uppercase text-gray-400">{subtitle}</p>
                </div>
                <div className={`size-14 rounded-2xl ${accent} text-white flex items-center justify-center shadow-lg shadow-black/10 shrink-0 group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
            </div>
        </motion.div>
    );
}
