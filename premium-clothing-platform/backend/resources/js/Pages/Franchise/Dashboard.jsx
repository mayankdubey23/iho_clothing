import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    IndianRupee, ShoppingCart, Package, Users, Wallet,
    AlertTriangle, Ticket, ArrowUpRight, ArrowDownRight,
    TrendingUp, Truck, Undo2, PlusCircle, Activity, Clock
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout'; // 🚀 Updated Import
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard({
    // 🚀 Added Default Fallback Values to prevent Undefined crashes
    metrics = {
        todaySales: 0, monthlySales: 0, totalOrders: 0, pendingOrders: 0,
        deliveredOrders: 0, cancelledOrders: 0, returnRequests: 0,
        totalStock: 0, lowStockItems: 0, pendingStockRequests: 0,
        totalCustomers: 0, walletBalance: 0, pendingPayments: 0, openTickets: 0
    },
    charts = { salesTrend: [], topProducts: [] }
}) {
    // Quick Actions Config
    const quickActions = [
        { title: "Buy Stock", icon: PlusCircle, link: "/franchise/stock-requests/new", color: "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white" },
        { title: "View Orders", icon: ShoppingCart, link: "/franchise/orders", color: "bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white" },
        { title: "Check Low Stock", icon: AlertTriangle, link: "/franchise/inventory?filter=low", color: "bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white" },
        { title: "Raise Ticket", icon: Ticket, link: "/franchise/support", color: "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white" },
    ];

    return (
        <AdminLayout active="dashboard">
            {/* 🚀 Changed to AdminLayout */}
            <Head title="Command Center | IHO Franchise" />
            <div className="max-w-[1600px] mx-auto pb-20 pt-6 px-4 sm:px-6">

                {/* 🚀 HEADER & QUICK ACTIONS */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter flex items-center gap-3">
                            <Activity className="text-[#E94E3C]" size={32} /> Command Center
                        </h1>
                        <p className="text-gray-500 font-bold text-sm mt-1">Welcome back! Here is your business overview.</p>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">                        {quickActions.map((action, idx) => (
                        <Link key={idx} href={action.link} className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-sm border border-transparent hover:shadow-md min-w-max ${action.color}`}>
                            <action.icon size={16} /> {action.title}
                        </Link>
                    ))}
                    </div>
                </div>

                {/* 🚀 PRIMARY METRICS (Financial & Orders) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <MetricCard title="Today's Sales" value={`₹${metrics.todaySales.toLocaleString()}`} icon={IndianRupee} color="text-green-500" />
                    <MetricCard title="Monthly Sales" value={`₹${metrics.monthlySales.toLocaleString()}`} icon={TrendingUp} color="text-indigo-500" />
                    <MetricCard title="Wallet Balance" value={`₹${metrics.walletBalance.toLocaleString()}`} icon={Wallet} color="text-blue-500" />
                    <MetricCard title="Pending Payments" value={`₹${metrics.pendingPayments.toLocaleString()}`} icon={AlertTriangle} color="text-orange-500" alert={metrics.pendingPayments > 0} />
                </div>

                {/* 🚀 SECONDARY METRICS GRID */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    <SmallMetric title="Total Orders" value={metrics.totalOrders} icon={ShoppingCart} />
                    <SmallMetric title="Pending Orders" value={metrics.pendingOrders} icon={Clock} alert={metrics.pendingOrders > 0} />
                    <SmallMetric title="Delivered" value={metrics.deliveredOrders} icon={Truck} color="text-green-600" />
                    <SmallMetric title="Return Requests" value={metrics.returnRequests} icon={Undo2} color="text-red-500" alert={metrics.returnRequests > 0} />
                    <SmallMetric title="Local Customers" value={metrics.totalCustomers} icon={Users} />
                    <SmallMetric title="Support Tickets" value={metrics.openTickets} icon={Ticket} color="text-orange-500" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

                    {/* 🚀 CHARTS: SALES TREND */}
                    <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-sm font-black text-[#1A1A2E] uppercase tracking-widest mb-6">Sales Performance (Last 7 Days)</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={charts.salesTrend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} tickFormatter={(value) => `₹${value}`} />
                                    <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="sales" fill="#1A1A2E" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 🚀 INVENTORY & TOP PRODUCTS */}
                    <div className="space-y-6">
                        {/* Stock Overview Widget */}
                        <div className="bg-[#1A1A2E] text-white rounded-3xl p-6 shadow-xl shadow-black/10">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-4">Stock Overview</h3>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-3xl font-black">{metrics.totalStock}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Available Units</p>
                                </div>
                                <Package size={32} className="text-[#E94E3C] opacity-80" />
                            </div>
                            <div className="space-y-3 pt-4 border-t border-white/10">
                                <div className="flex justify-between items-center text-xs font-bold">
                                    <span className="text-orange-400 flex items-center gap-1"><AlertTriangle size={12} /> Low Stock Items</span>
                                    <span className="bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded">{metrics.lowStockItems}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-bold">
                                    <span className="text-blue-400 flex items-center gap-1"><Clock size={12} /> Pending Requests</span>
                                    <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">{metrics.pendingStockRequests}</span>
                                </div>
                            </div>
                        </div>

                        {/* Top Selling Widget */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Top Performing Products</h3>
                            <div className="space-y-4">
                                {charts.topProducts.map((prod, idx) => (
                                    <div key={idx} className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <span className="font-black text-gray-300 text-xs">0{idx + 1}</span>
                                            <p className="font-bold text-[#1A1A2E] text-sm truncate max-w-[150px]">{prod.product_name}</p>
                                        </div>
                                        <span className="bg-gray-50 text-[#1A1A2E] px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">{prod.total_sold} Sold</span>
                                    </div>
                                ))}
                                {charts.topProducts.length === 0 && <p className="text-xs font-bold text-gray-400">No sales data yet.</p>}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </AdminLayout >
    );
}

// 💎 Reusable Metric Components
function MetricCard({ title, value, icon: Icon, color, alert }) {
    return (
        <div className={`bg-white p-6 rounded-3xl border ${alert ? 'border-orange-200 shadow-orange-500/10' : 'border-gray-100 shadow-black/5'} shadow-sm flex items-center justify-between transition-all hover:scale-[1.02]`}>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{title}</p>
                <h4 className="text-2xl font-black text-[#1A1A2E] truncate">{value}</h4>
            </div>
            <div className={`size-14 rounded-2xl flex items-center justify-center ${alert ? 'bg-orange-50' : 'bg-gray-50'} ${color}`}>
                <Icon size={24} strokeWidth={2.5} />
            </div>
        </div>
    );
}

function SmallMetric({ title, value, icon: Icon, color = "text-gray-400", alert }) {
    return (
        <div className={`bg-white p-4 rounded-2xl border ${alert ? 'border-red-200 bg-red-50/30' : 'border-gray-100'} shadow-sm text-center flex flex-col items-center justify-center`}>
            <Icon size={20} className={`${alert ? 'text-red-500' : color} mb-2`} />
            <h4 className="text-xl font-black text-[#1A1A2E] leading-none">{value}</h4>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1">{title}</p>
        </div>
    );
}