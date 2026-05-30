import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    BarChart3, Calendar, Filter, Download, TrendingUp,
    ShoppingBag, RefreshCcw, Tag, Store, Package
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Analytics({ stats, chartData, tableData, franchises, filters }) {
    // Filter States
    const [dateRange, setDateRange] = useState(filters.date_range);
    const [reportType, setReportType] = useState(filters.report_type);
    const [franchiseId, setFranchiseId] = useState(filters.franchise_id);
    const [exportFormat, setExportFormat] = useState('csv');
    const [customDates, setCustomDates] = useState({ start: filters.start_date || '', end: filters.end_date || '' });

    // Apply Filters Function
    const applyFilters = (key, value) => {
        let newFilters = { date_range: dateRange, report_type: reportType, franchise_id: franchiseId, start_date: customDates.start, end_date: customDates.end };
        newFilters[key] = value;
        router.get('/franchise-superadmin/analytics', newFilters, { preserveState: true, preserveScroll: true });
    };

    const exportReport = () => {
        const params = new URLSearchParams({
            report_type: reportType,
            date_range: dateRange,
            franchise_id: franchiseId,
            format: exportFormat,
        });

        if (dateRange === 'custom') {
            if (customDates.start) params.set('start_date', customDates.start);
            if (customDates.end) params.set('end_date', customDates.end);
        }

        window.location.href = `/franchise-superadmin/analytics/export?${params.toString()}`;
    };

    // Format Data for Charts
    const formattedChartData = chartData.map(d => ({
        ...d,
        displayDate: new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        revenue: Number(d.revenue),
        orders: Number(d.orders)
    }));

    return (
        <AdminLayout active="analytics">
            <Head title="Reports & Analytics | Super Admin" />

            <div className="max-w-[1600px] mx-auto pb-20 pt-6 px-4 sm:px-6">

                {/* 🚀 HEADER & EXPORT */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter flex items-center gap-3">
                            <BarChart3 className="text-[#E94E3C]" /> Business Intelligence
                        </h1>
                        <p className="text-gray-500 font-bold text-sm mt-1">Comprehensive reports for sales, products, and franchises.</p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)} className="bg-white border-2 border-gray-200 text-[#1A1A2E] px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-[#E94E3C] outline-none">
                            <option value="csv">CSV</option>
                            <option value="pdf">PDF</option>
                        </select>
                        <button onClick={exportReport} className="bg-white border-2 border-gray-200 text-[#1A1A2E] px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-[#1A1A2E] hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
                            <Download size={16} /> Export Report
                        </button>
                    </div>
                </div>

                {/* 🚀 MASTER FILTERS */}
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Report Type Selector */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Report Dimension</label>
                        <select value={reportType} onChange={(e) => { setReportType(e.target.value); applyFilters('report_type', e.target.value); }} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none cursor-pointer">
                            <option value="sales">Overall Sales Report</option>
                            <option value="products">Product Performance</option>
                            <option value="franchises">Franchise Performance</option>
                            {/* Add Customer, Returns, Coupons etc here */}
                        </select>
                    </div>

                    {/* Date Range Selector */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Time Period</label>
                        <select value={dateRange} onChange={(e) => { setDateRange(e.target.value); applyFilters('date_range', e.target.value); }} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none cursor-pointer">
                            <option value="today">Today</option>
                            <option value="yesterday">Yesterday</option>
                            <option value="last_7_days">Last 7 Days</option>
                            <option value="this_month">This Month</option>
                            <option value="last_month">Last Month</option>
                            <option value="custom">Custom Date Range</option>
                        </select>
                    </div>

                    {/* Franchise Filter */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Filter by Franchise</label>
                        <select value={franchiseId} onChange={(e) => { setFranchiseId(e.target.value); applyFilters('franchise_id', e.target.value); }} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none cursor-pointer">
                            <option value="all">Entire Network</option>
                            {franchises.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                    </div>

                    {/* Custom Date Inputs (Only visible if Custom is selected) */}
                    {dateRange === 'custom' && (
                        <div className="flex items-end gap-2">
                            <input type="date" value={customDates.start} onChange={e => setCustomDates({ ...customDates, start: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 py-3 text-xs font-bold" />
                            <input type="date" value={customDates.end} onChange={e => setCustomDates({ ...customDates, end: e.target.value })} onBlur={() => applyFilters('custom_dates', 'apply')} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 py-3 text-xs font-bold" />
                        </div>
                    )}
                </div>

                {/* 🚀 KPI METRICS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard title="Net Revenue" value={`₹${Number(stats.total_revenue).toLocaleString()}`} icon={TrendingUp} color="text-green-500" />
                    <StatCard title="Total Orders" value={stats.total_orders} icon={ShoppingBag} color="text-blue-500" />
                    <StatCard title="Discounts Claimed" value={`₹${Number(stats.discounts_given).toLocaleString()}`} icon={Tag} color="text-purple-500" />
                    <StatCard title="Returns Processed" value={stats.total_returns} icon={RefreshCcw} color="text-red-500" alert={stats.total_returns > 0} />
                </div>

                {/* 🚀 REVENUE TREND CHART */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-8">
                    <h2 className="text-sm font-black uppercase tracking-widest text-[#1A1A2E] mb-6 flex items-center gap-2">
                        <TrendingUp size={16} className="text-[#E94E3C]" /> Revenue Trend Analysis
                    </h2>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={formattedChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#E94E3C" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#E94E3C" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} tickFormatter={(value) => `₹${value / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1A1A2E', borderRadius: '12px', border: 'none', color: '#fff', fontWeight: 'bold' }}
                                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#E94E3C" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 🚀 DYNAMIC DATA TABLE (Changes based on Report Type) */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-black text-[#1A1A2E] uppercase tracking-wider">Detailed Data Breakdown</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 border-b border-gray-100">
                                <tr>
                                    {/* Dynamic Table Headers based on Report Type */}
                                    {reportType === 'products' ? (
                                        <>
                                            <th className="px-6 py-5">Product Name & SKU</th>
                                            <th className="px-6 py-5 text-center">Units Sold</th>
                                            <th className="px-6 py-5 text-right">Generated Revenue</th>
                                        </>
                                    ) : reportType === 'franchises' ? (
                                        <>
                                            <th className="px-6 py-5">Franchise Partner</th>
                                            <th className="px-6 py-5 text-center">Total Orders</th>
                                            <th className="px-6 py-5 text-right">Total Revenue</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-6 py-5">Order ID & Date</th>
                                            <th className="px-6 py-5">Fulfillment Route</th>
                                            <th className="px-6 py-5">Status</th>
                                            <th className="px-6 py-5 text-right">Order Value</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {tableData.map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50/80 transition-colors">

                                        {/* Dynamic Row Rendering */}
                                        {reportType === 'products' ? (
                                            <>
                                                <td className="px-6 py-4">
                                                    <p className="font-black text-[#1A1A2E] text-sm">{row.name}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{row.sku}</p>
                                                </td>
                                                <td className="px-6 py-4 text-center font-black text-blue-600">{row.sold_qty} Units</td>
                                                <td className="px-6 py-4 text-right font-black text-[#1A1A2E]">₹{Number(row.total_revenue).toLocaleString()}</td>
                                            </>
                                        ) : reportType === 'franchises' ? (
                                            <>
                                                <td className="px-6 py-4 font-black text-[#1A1A2E] text-sm flex items-center gap-2"><Store size={14} className="text-[#E94E3C]" /> {row.franchise_name}</td>
                                                <td className="px-6 py-4 text-center font-bold text-gray-600">{row.total_orders} Orders</td>
                                                <td className="px-6 py-4 text-right font-black text-[#1A1A2E]">₹{Number(row.revenue).toLocaleString()}</td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-6 py-4">
                                                    <p className="font-black text-[#1A1A2E] text-sm">ORD-{row.id}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(row.created_at).toLocaleDateString()}</p>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-bold text-gray-600 flex items-center gap-1.5">
                                                    {row.fulfillment ? <><Store size={12} className="text-blue-500" /> {row.fulfillment}</> : <><Package size={12} className="text-gray-400" /> Master Stock</>}
                                                </td>
                                                <td className="px-6 py-4"><span className="text-[10px] bg-gray-100 text-[#1A1A2E] font-black px-2 py-1 rounded uppercase tracking-widest">{row.status}</span></td>
                                                <td className="px-6 py-4 text-right font-black text-[#1A1A2E]">₹{Number(row.total_amount).toLocaleString()}</td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}

// 💎 Helper Component
function StatCard({ title, value, icon: Icon, color, alert }) {
    return (
        <div className={`bg-white p-5 rounded-3xl border ${alert ? 'border-red-200 shadow-red-500/10' : 'border-gray-100 shadow-black/5'} shadow-sm flex items-center justify-between`}>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{title}</p>
                <h4 className="text-2xl font-black text-[#1A1A2E]">{value}</h4>
            </div>
            <div className={`size-12 rounded-2xl flex items-center justify-center ${alert ? 'bg-red-50' : 'bg-gray-50'} ${color}`}><Icon size={22} strokeWidth={2.5} /></div>
        </div>
    );
}
