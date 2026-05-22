import React from 'react';
import { Head, router } from '@inertiajs/react';
import {
    BarChart3, IndianRupee, TrendingUp, ShoppingBag,
    PackageSearch, ArrowUpRight, RotateCcw, Calendar, CheckCircle2, ShieldAlert
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Analytics({ kpis, topProducts, orderStatuses, inventoryHealth, returnsData, filters }) {

    const updateDateFilter = (e) => {
        router.get('/franchise/analytics', { dateFilter: e.target.value }, { preserveState: true });
    };

    // Calculate total orders for percentage bars
    const totalStatusOrders = orderStatuses.reduce((acc, curr) => acc + curr.count, 0) || 1;

    return (
        <AdminLayout active="analytics">
            <Head title="Reports & Analytics | IHO Franchise" />

            <div className="max-w-[1600px] mx-auto pb-20 pt-6 px-4 sm:px-6">

                {/* 🚀 HEADER & GLOBAL FILTERS */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter flex items-center gap-3">
                            <BarChart3 className="text-[#E94E3C]" size={32} /> Reports & Analytics
                        </h1>
                        <p className="text-gray-500 font-bold text-sm mt-1">Deep dive into your sales, inventory performance, and profit margins.</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-2 flex items-center gap-2 shadow-sm w-full md:w-auto">
                        <Calendar size={18} className="text-gray-400 ml-2" />
                        <select
                            value={filters.dateFilter}
                            onChange={updateDateFilter}
                            className="bg-transparent border-none text-sm font-bold text-[#1A1A2E] focus:ring-0 outline-none cursor-pointer py-2 pr-8"
                        >
                            <option value="today">Today</option>
                            <option value="yesterday">Yesterday</option>
                            <option value="last_7_days">Last 7 Days</option>
                            <option value="this_month">This Month</option>
                            <option value="last_month">Last Month</option>
                        </select>
                    </div>
                </div>

                {/* 🚀 TOP KPI CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-[#1A1A2E] to-[#0F3460] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Total Revenue (B2C)</p>
                        <h4 className="text-3xl font-black text-white flex items-center gap-1">₹{Number(kpis.revenue).toLocaleString()}</h4>
                    </div>
                    <MetricCard title="Total Orders" value={kpis.orders} icon={ShoppingBag} color="text-indigo-500" />
                    <MetricCard title="Est. Gross Profit" value={`₹${Number(kpis.profit).toLocaleString()}`} icon={TrendingUp} color="text-green-500" alert={kpis.profit < 0} />
                    <MetricCard title="B2B Stock Investment" value={`₹${Number(kpis.b2b_spend).toLocaleString()}`} icon={PackageSearch} color="text-orange-500" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* 🚀 LEFT COLUMN: TOP PRODUCTS & INVENTORY HEALTH */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Top Products Table */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <h3 className="font-black text-[#1A1A2E] uppercase tracking-widest text-xs flex items-center gap-2">
                                    <TrendingUp size={16} className="text-[#E94E3C]" /> Top Selling Products
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-white text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4">Product Details</th>
                                            <th className="px-6 py-4 text-center">Units Sold</th>
                                            <th className="px-6 py-4 text-right">Revenue Generated</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {topProducts.length > 0 ? topProducts.map((product, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-[#1A1A2E] text-sm">{product.name}</p>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase mt-0.5">SKU: {product.sku}</p>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md text-xs">{product.sold_qty}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="font-black text-green-600">₹{Number(product.revenue).toLocaleString()}</span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="3" className="px-6 py-10 text-center text-sm font-bold text-gray-400">No product sales in this period.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Inventory Health Bar */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-black text-[#1A1A2E] uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                                <PackageSearch size={16} className="text-blue-500" /> Current Inventory Health
                            </h3>
                            <div className="flex gap-4">
                                <HealthBox title="Healthy Stock" value={inventoryHealth.healthy} color="bg-green-50 text-green-600 border-green-200" icon={CheckCircle2} />
                                <HealthBox title="Low Stock Alerts" value={inventoryHealth.low} color="bg-orange-50 text-orange-600 border-orange-200" icon={ShieldAlert} />
                                <HealthBox title="Out of Stock" value={inventoryHealth.out} color="bg-red-50 text-red-600 border-red-200" icon={ShieldAlert} />
                            </div>
                        </div>

                    </div>

                    {/* 🚀 RIGHT COLUMN: DISTRIBUTION CHARTS */}
                    <div className="space-y-8">

                        {/* Order Status Distribution */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-black text-[#1A1A2E] uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                                <ShoppingBag size={16} className="text-indigo-500" /> Order Status Breakdown
                            </h3>
                            <div className="space-y-4">
                                {orderStatuses.length > 0 ? orderStatuses.map((status, idx) => {
                                    const percentage = ((status.count / totalStatusOrders) * 100).toFixed(0);
                                    return (
                                        <div key={idx}>
                                            <div className="flex justify-between text-xs font-bold mb-1.5">
                                                <span className="text-[#1A1A2E]">{status.status}</span>
                                                <span className="text-gray-500">{status.count} ({percentage}%)</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <p className="text-center text-sm font-bold text-gray-400 py-4">No orders to display.</p>
                                )}
                            </div>
                        </div>

                        {/* Returns Activity */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-black text-[#1A1A2E] uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                                <RotateCcw size={16} className="text-pink-500" /> Return Requests Activity
                            </h3>
                            <div className="space-y-3">
                                {returnsData.length > 0 ? returnsData.map((ret, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <span className="text-xs font-bold text-[#1A1A2E]">{ret.status}</span>
                                        <span className="text-sm font-black text-pink-600 bg-pink-50 px-2 py-0.5 rounded">{ret.count}</span>
                                    </div>
                                )) : (
                                    <p className="text-center text-sm font-bold text-gray-400 py-4">No returns recorded.</p>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}

// 💎 Reusable Components
function MetricCard({ title, value, icon: Icon, color, alert }) {
    return (
        <div className={`bg-white p-6 rounded-3xl border ${alert ? 'border-red-200 shadow-red-500/10' : 'border-gray-100 shadow-black/5'} shadow-sm flex items-center justify-between`}>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{title}</p>
                <h4 className="text-2xl font-black text-[#1A1A2E] truncate">{value}</h4>
            </div>
            <div className={`size-14 rounded-2xl flex items-center justify-center ${alert ? 'bg-red-50 text-red-500' : 'bg-gray-50'} ${color}`}>
                <Icon size={24} strokeWidth={2.5} />
            </div>
        </div>
    );
}

function HealthBox({ title, value, color, icon: Icon }) {
    return (
        <div className={`flex-1 p-4 rounded-2xl border ${color} shadow-sm text-center`}>
            <Icon size={20} className="mx-auto mb-2 opacity-80" />
            <h4 className="text-2xl font-black mb-1">{value}</h4>
            <p className="text-[9px] font-black uppercase tracking-widest opacity-80">{title}</p>
        </div>
    );
}