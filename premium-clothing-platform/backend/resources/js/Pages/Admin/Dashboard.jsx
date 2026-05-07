import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import { TrendingUp, ShoppingBag, Box, Store, Users, IndianRupee } from 'lucide-react';
import AdminLayout from '../../Layouts/AdminLayout';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

const STATUS_BADGE = {
  pending: 'bg-amber-100 text-amber-800',
  completed: 'bg-emerald-100 text-emerald-800',
  processing: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
  delivered: 'bg-green-100 text-green-800',
};

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function Dashboard({ stats, recent_orders, chart_data }) {
    const { auth } = usePage().props;
    const isSuperAdmin = ['super_admin', 'admin'].includes(auth.user.role);

    // Dummy data for charts if none is provided or it's empty
    const processedChartData = chart_data && chart_data.length > 0
        ? chart_data.map(item => ({
            ...item,
            revenue: parseFloat(item.revenue),
            orders: parseInt(item.orders),
            name: new Date(item.name).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
          }))
        : [
            { name: 'Mon', revenue: 4000, orders: 24 },
            { name: 'Tue', revenue: 3000, orders: 13 },
            { name: 'Wed', revenue: 2000, orders: 98 },
            { name: 'Thu', revenue: 2780, orders: 39 },
            { name: 'Fri', revenue: 1890, orders: 48 },
            { name: 'Sat', revenue: 2390, orders: 38 },
            { name: 'Sun', revenue: 3490, orders: 43 },
        ];

    return (
        <AdminLayout active="dashboard">
            <Head title="Dashboard | Admin" />
            
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900">Dashboard Overview</h1>
                <p className="text-slate-500 mt-1">Real-time performance metrics, analytics, and recent activity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {isSuperAdmin ? (
                    <>
                        <StatCard title="Total Revenue" value={formatCurrency(stats.total_revenue)} icon={<TrendingUp size={24}/>} color="bg-emerald-500" />
                        <StatCard title="Total Orders" value={stats.total_orders || 0} icon={<ShoppingBag size={24}/>} color="bg-blue-500" />
                        <StatCard title="Total Customers" value={stats.total_customers || 0} icon={<Users size={24}/>} color="bg-sky-500" />
                        <StatCard title="Franchise Apps" value={stats.applications || 0} icon={<Store size={24}/>} color="bg-orange-500" />
                    </>
                ) : (
                    <>
                        <StatCard title="My Total Sales" value={formatCurrency(stats.total_revenue)} icon={<TrendingUp size={24}/>} color="bg-emerald-500" />
                        <StatCard title="My Total Profit" value={formatCurrency(stats.total_profit)} icon={<IndianRupee size={24}/>} color="bg-green-500" />
                        <StatCard title="My Total Orders" value={stats.total_orders || 0} icon={<ShoppingBag size={24}/>} color="bg-blue-500" />
                        <StatCard title="My Stock Units" value={stats.stock || 0} icon={<Box size={24}/>} color="bg-indigo-500" />
                    </>
                )}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-6">{isSuperAdmin ? 'Revenue Trend' : 'My Sales Trend'} (Last 7 Days)</h2>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={processedChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `₹${value}`} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [`₹${value}`, 'Revenue']}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-6">{isSuperAdmin ? 'Orders Volume' : 'My Orders Volume'} (Last 7 Days)</h2>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={processedChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{fill: '#f1f5f9'}}
                                />
                                <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-10">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">Recent Orders</h2>
                    <a href="/admin/orders" className="text-sm font-semibold text-blue-600 hover:text-blue-800">View All</a>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-bold">Order ID</th>
                                <th className="px-6 py-4 font-bold">Customer</th>
                                <th className="px-6 py-4 font-bold">Pincode / Address</th>
                                <th className="px-6 py-4 font-bold">Amount</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {recent_orders?.length > 0 ? (
                                recent_orders.map(order => (
                                    <tr key={order.id} className="hover:bg-slate-50 transition group">
                                        <td className="px-6 py-4 font-black text-blue-600">#{order.id}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{order.customer_name}</td>
                                        <td className="px-6 py-4 text-slate-500 text-sm max-w-xs truncate">{order.shipping_address}</td>
                                        <td className="px-6 py-4 font-black text-slate-900">{formatCurrency(order.total_amount)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${STATUS_BADGE[order.status] || 'bg-gray-100 text-gray-800'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500 bg-slate-50/30 font-medium">No orders received yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}

function StatCard({ title, value, icon, color }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-5 hover:shadow-md hover:-translate-y-1 transition duration-300">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-sm ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-bold text-slate-500 mb-1">{title}</p>
                <h3 className="text-2xl font-black text-slate-900">{value}</h3>
            </div>
        </div>
    );
}
