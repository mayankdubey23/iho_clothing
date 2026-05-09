import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    IndianRupee, ShoppingCart, Users, Store, Clock, AlertCircle,
    PackageSearch, CreditCard, PlusCircle, CheckCircle, Bell,
    Ticket, FileText, PackageCheck, XCircle, RefreshCcw, MousePointerClick, TrendingUp, Ban, LifeBuoy
} from 'lucide-react';

export default function CommandCenter({ stats, top_products, top_franchises }) {

    // Quick Actions exactly as you requested
    const QUICK_ACTIONS = [
        { label: "Add Product", icon: PlusCircle, href: "/admin/products/create" },
        { label: "Approve Franchise", icon: CheckCircle, href: "/admin/franchise-requests" },
        { label: "View Pending Orders", icon: Clock, href: "/admin/orders?status=pending" },
        { label: "Update Stock", icon: PackageSearch, href: "/admin/inventory" },
        { label: "Create Coupon", icon: Ticket, href: "/admin/coupons" },
        { label: "Send Notification", icon: Bell, href: "/admin/notifications" },
        { label: "View Reports", icon: FileText, href: "/admin/reports" },
    ];

    // Helper to safely format currency
    const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

    return (
        <div className="min-h-screen bg-[#f9f8f6] font-sans pb-20">
            <Head title="Command Center | Super Admin" />

            <div className="bg-[#1A1A2E] text-white pt-8 pb-24 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#E94E3C]/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

                <div className="max-w-[1600px] mx-auto flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative z-10">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E94E3C] mb-1">Super Admin Panel</p>
                        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Command Center</h1>
                    </div>

                    <div className="flex flex-wrap gap-2 xl:justify-end">
                        {QUICK_ACTIONS.map((action, i) => (
                            <Link key={i} href={action.href} className="flex items-center gap-2 bg-white/10 hover:bg-[#E94E3C] border border-white/10 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 backdrop-blur-sm shadow-sm">
                                <action.icon size={14} /> <span>{action.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-6 -mt-14 relative z-20 space-y-8">

                {/* 🔴 SECTION 1: FINANCIALS & STOCK VALUE */}
                <div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-[#1A1A2E] mb-4 flex items-center gap-2"><IndianRupee size={16} className="text-[#E94E3C]" /> Financial Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard title="Total Revenue" value={formatCurrency(stats.total_revenue)} icon={IndianRupee} color="text-green-500" bg="bg-green-50" />
                        <StatCard title="Today's Revenue" value={formatCurrency(stats.today_revenue)} icon={TrendingUp} color="text-emerald-500" bg="bg-emerald-50" />
                        <StatCard title="Monthly Revenue" value={formatCurrency(stats.monthly_revenue)} icon={FileText} color="text-blue-500" bg="bg-blue-50" />
                        <StatCard title="Master Stock Value" value={formatCurrency(stats.master_stock_value)} icon={PackageSearch} color="text-purple-500" bg="bg-purple-50" />
                    </div>
                </div>

                {/* 🔴 SECTION 2: E-COMMERCE & ORDERS */}
                <div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-[#1A1A2E] mb-4 flex items-center gap-2"><ShoppingCart size={16} className="text-[#E94E3C]" /> E-Commerce Performance</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
                        <MiniCard title="Total Orders" value={stats.total_orders} icon={ShoppingCart} />
                        <MiniCard title="Pending" value={stats.pending_orders} icon={Clock} alert={stats.pending_orders > 0} />
                        <MiniCard title="Delivered" value={stats.delivered_orders} icon={PackageCheck} />
                        <MiniCard title="Cancelled" value={stats.cancelled_orders} icon={XCircle} danger={stats.cancelled_orders > 0} />
                        <MiniCard title="Returns" value={stats.return_requests} icon={RefreshCcw} alert={stats.return_requests > 0} />
                        <MiniCard title="Customers" value={stats.total_customers} icon={Users} />
                        <MiniCard title="Visitors" value={stats.website_visitors} icon={MousePointerClick} />
                        <MiniCard title="Conversion" value={`${stats.conversion_rate}%`} icon={TrendingUp} />
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* 🔴 SECTION 3: FRANCHISE NETWORK */}
                    <div className="xl:col-span-2">
                        <h2 className="text-sm font-black uppercase tracking-widest text-[#1A1A2E] mb-4 flex items-center gap-2"><Store size={16} className="text-[#E94E3C]" /> Franchise Network</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                            <MiniCard title="Total" value={stats.total_franchises} icon={Store} />
                            <MiniCard title="Active" value={stats.active_franchises} icon={CheckCircle} />
                            <MiniCard title="Pending Reqs" value={stats.pending_franchise_reqs} icon={Clock} alert={stats.pending_franchise_reqs > 0} />
                            <MiniCard title="Blocked" value={stats.blocked_franchises} icon={Ban} danger={stats.blocked_franchises > 0} />
                        </div>

                        {/* Top Performing Franchises */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="font-black text-[#1A1A2E] uppercase tracking-wider mb-4">Top Performing Franchises</h3>
                            <div className="space-y-3">
                                {top_franchises.length > 0 ? top_franchises.map((f, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 bg-[#1A1A2E] text-white rounded-lg flex items-center justify-center font-black text-xs">{i + 1}</div>
                                            <div>
                                                <h4 className="font-bold text-[#1A1A2E] text-sm">{f.name}</h4>
                                                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{f.orders.toLocaleString()} Orders</p>
                                            </div>
                                        </div>
                                        <p className="font-black text-green-600 text-sm">{formatCurrency(f.revenue)}</p>
                                    </div>
                                )) : <p className="text-sm text-gray-400">No franchise data available yet.</p>}
                            </div>
                        </div>
                    </div>

                    {/* 🔴 SECTION 4: OPERATIONS, ALERTS & PRODUCTS */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-[#1A1A2E] mb-4 flex items-center gap-2"><AlertCircle size={16} className="text-[#E94E3C]" /> System Alerts</h2>
                            <div className="grid grid-cols-1 gap-3">
                                <AlertRow title="Low Stock Alerts" value={stats.low_stock_alerts} icon={AlertCircle} type={stats.low_stock_alerts > 0 ? "danger" : "default"} />
                                <AlertRow title="Pending Payments" value={stats.pending_payments} icon={CreditCard} type={stats.pending_payments > 0 ? "warning" : "default"} />
                                <AlertRow title="Support Tickets" value={stats.support_tickets} icon={LifeBuoy} type={stats.support_tickets > 0 ? "info" : "default"} />
                            </div>
                        </div>

                        {/* Top Selling Products */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="font-black text-[#1A1A2E] uppercase tracking-wider mb-4">Top Selling Products</h3>
                            <div className="space-y-3">
                                {top_products.length > 0 ? top_products.map((p, i) => (
                                    <div key={i} className="p-3 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col gap-1">
                                        <h4 className="font-bold text-[#1A1A2E] text-sm truncate">{p.name}</h4>
                                        <div className="flex justify-between items-center">
                                            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{p.sold.toLocaleString()} Units Sold</p>
                                            <p className="font-black text-green-600 text-xs">{formatCurrency(p.revenue)}</p>
                                        </div>
                                    </div>
                                )) : <p className="text-sm text-gray-400">No product sales yet.</p>}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

// 💎 HELPER COMPONENTS
function StatCard({ title, value, icon: Icon, color, bg }) {
    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className={`size-12 rounded-2xl ${bg} ${color} flex items-center justify-center mb-4`}>
                <Icon size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl lg:text-3xl font-black text-[#1A1A2E] tracking-tight">{value}</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{title}</p>
        </div>
    );
}

function MiniCard({ title, value, icon: Icon, alert, danger }) {
    let textColor = "text-[#1A1A2E]";
    if (alert) textColor = "text-orange-500";
    if (danger) textColor = "text-red-500";

    return (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col justify-center shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <Icon size={16} className="text-gray-400" />
            </div>
            <h4 className={`text-xl font-black ${textColor}`}>{value ? value.toLocaleString() : 0}</h4>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1 leading-tight">{title}</p>
        </div>
    );
}

function AlertRow({ title, value, icon: Icon, type }) {
    let colors = "bg-gray-50 text-gray-600 border-gray-200";
    if (type === 'danger') colors = "bg-red-50 text-red-600 border-red-100";
    if (type === 'warning') colors = "bg-orange-50 text-orange-600 border-orange-100";
    if (type === 'info') colors = "bg-blue-50 text-blue-600 border-blue-100";

    return (
        <div className={`flex items-center justify-between p-4 rounded-2xl border ${colors}`}>
            <div className="flex items-center gap-3">
                <Icon size={20} strokeWidth={2.5} />
                <span className="font-bold text-sm">{title}</span>
            </div>
            <span className="text-lg font-black bg-white px-3 py-1 rounded-lg shadow-sm">{value || 0}</span>
        </div>
    );
}