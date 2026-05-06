import React from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { TrendingUp, ShoppingBag, Box, Store, RefreshCcw } from 'lucide-react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Dashboard({ stats }) {
    const { auth } = usePage().props;
    const isSuperAdmin = auth.user.role === 'super_admin';

    // Status Update Function
    const handleStatusChange = (orderId, newStatus) => {
        if (confirm(`Are you sure you want to change order #${orderId} status to ${newStatus}?`)) {
            router.patch(`/admin/orders/${orderId}/status`, { status: newStatus }, {
                preserveScroll: true,
                onSuccess: () => alert("Status Updated!")
            });
        }
    };

    return (
        <AdminLayout active="dashboard">
            <Head title="Dashboard | Admin" />
            
            <div className="mb-10 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">Overview</h1>
                    <p className="text-slate-500 mt-1">Real-time performance metrics and recent activity.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 flex items-center gap-2 shadow-sm">
                    <RefreshCcw size={16} className="text-blue-500" /> Auto-refreshing
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard title="Total Revenue" value={`₹${stats.total_revenue || 0}`} icon={<TrendingUp size={24}/>} color="bg-emerald-500" shadow="shadow-emerald-200" />
                <StatCard title="Total Orders" value={stats.total_orders || 0} icon={<ShoppingBag size={24}/>} color="bg-blue-500" shadow="shadow-blue-200" />
                <StatCard title="Stock Units" value={stats.stock || 0} icon={<Box size={24}/>} color="bg-indigo-500" shadow="shadow-indigo-200" />
                {isSuperAdmin && (
                    <StatCard title="Franchise Apps" value={stats.applications || 0} icon={<Store size={24}/>} color="bg-orange-500" shadow="shadow-orange-200" />
                )}
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">Recent Orders</h2>
                    <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded">LIVE UPDATES</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-bold">Order ID</th>
                                <th className="px-6 py-4 font-bold">Customer</th>
                                <th className="px-6 py-4 font-bold">Location</th>
                                <th className="px-6 py-4 font-bold">Amount</th>
                                <th className="px-6 py-4 font-bold">Status Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {stats.recent_orders?.length > 0 ? (
                                stats.recent_orders.map(order => (
                                    <tr key={order.id} className="hover:bg-slate-50 transition group">
                                        <td className="px-6 py-4 font-black text-blue-600">#{order.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800">{order.customer_name}</div>
                                            <div className="text-xs text-slate-400">{order.customer_phone || 'No phone'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-sm truncate max-w-[200px]">
                                            {order.shipping_address}
                                        </td>
                                        <td className="px-6 py-4 font-black text-slate-900">₹{order.total_amount}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2">
                                                {/* Status Badge */}
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase w-max shadow-sm border ${
                                                    order.status === 'delivered' ? 'bg-green-100 text-green-700 border-green-200' : 
                                                    order.status === 'cancelled' ? 'bg-red-100 text-red-700 border-red-200' : 
                                                    order.status === 'shipped' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                                                    'bg-amber-100 text-amber-700 border-amber-200'
                                                }`}>
                                                    {order.status}
                                                </span>

                                                {/* Update Dropdown (Hidden if finished) */}
                                                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                                    <select 
                                                        className="text-xs border border-slate-200 rounded bg-white px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer font-bold text-slate-600"
                                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                        defaultValue={order.status}
                                                    >
                                                        <option value="pending">Mark Pending</option>
                                                        <option value="confirmed">Confirm Order</option>
                                                        <option value="shipped">Set Shipped</option>
                                                        <option value="delivered">Set Delivered</option>
                                                        <option value="cancelled">Cancel Order</option>
                                                    </select>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium italic">No orders received yet. Launch your ads!</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}

function StatCard({ title, value, icon, color, shadow }) {
    return (
        <div className={`bg-white rounded-xl border border-slate-200 p-6 flex items-center gap-5 hover:scale-[1.02] transition-transform duration-300 shadow-sm ${shadow}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-bold text-slate-400 mb-0.5 uppercase tracking-tighter">{title}</p>
                <h3 className="text-2xl font-black text-slate-900">{value}</h3>
            </div>
        </div>
    );
}