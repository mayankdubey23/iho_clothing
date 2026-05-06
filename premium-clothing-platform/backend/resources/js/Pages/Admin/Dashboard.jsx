import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import { TrendingUp, ShoppingBag, Box, Store } from 'lucide-react';
import AdminLayout from '../../Layouts/AdminLayout';

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
};

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function Dashboard({ stats }) {
    const { auth } = usePage().props;
    const isSuperAdmin = auth.user.role === 'super_admin';

    return (
        <AdminLayout active="dashboard">
            <Head title="Dashboard | Admin" />
            
            <div className="mb-10">
                <h1 className="text-3xl font-black text-slate-900">Overview</h1>
                <p className="text-slate-500 mt-1">Real-time performance metrics and recent activity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard title="Total Revenue" value={`₹${stats.total_revenue || 0}`} icon={<TrendingUp size={24}/>} color="bg-emerald-500" />
                <StatCard title="Total Orders" value={stats.total_orders || 0} icon={<ShoppingBag size={24}/>} color="bg-blue-500" />
                <StatCard title="Stock Units" value={stats.stock || 0} icon={<Box size={24}/>} color="bg-indigo-500" />
                {isSuperAdmin && (
                    <StatCard title="Franchise Apps" value={stats.applications || 0} icon={<Store size={24}/>} color="bg-orange-500" />
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-lg font-bold text-slate-800">Recent Orders</h2>
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
                            {stats.recent_orders?.length > 0 ? (
                                stats.recent_orders.map(order => (
                                    <tr key={order.id} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4 font-black text-blue-600">#{order.id}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-800">{order.customer_name}</td>
                                        <td className="px-6 py-4 text-slate-500 text-sm">{order.shipping_address}</td>
                                        <td className="px-6 py-4 font-black text-slate-900">₹{order.total_amount}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full font-bold uppercase">
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No orders received yet.</td></tr>
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-5 hover:shadow-md transition">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-sm ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-bold text-slate-500 mb-1">{title}</p>
                <h3 className="text-2xl font-black text-slate-900">{value}</h3>
            </div>
        </div>
    );
}