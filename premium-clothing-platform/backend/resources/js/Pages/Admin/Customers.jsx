import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Users, ShieldAlert, ShieldCheck, Download,
    MoreVertical, ShoppingBag, LifeBuoy, MapPin, Mail, Phone, Calendar
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Customers({ customers, stats, filters }) {
    const safeCustomers = customers?.data || [];
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [openActionMenu, setOpenActionMenu] = useState(null);

    // Dynamic Filter Trigger
    const applyFilters = () => {
        router.get('/franchise-superadmin/customers', { search, status: statusFilter }, { preserveState: true });
    };

    // Toggle Block/Unblock Account
    const handleToggleStatus = (id, currentStatus) => {
        const action = currentStatus === 'active' ? 'BLOCK' : 'UNBLOCK';
        if (confirm(`Are you sure you want to ${action} this customer?`)) {
            router.post(`/franchise-superadmin/customers/${id}/toggle-status`, {}, { preserveScroll: true, onSuccess: () => setOpenActionMenu(null) });
        }
    };

    return (
        <AdminLayout active="customers">
            <Head title="Customer Management | Super Admin" />

            <div className="max-w-[1600px] mx-auto pb-20 pt-6 px-4 sm:px-6">

                {/* 🚀 HEADER & STATS */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter flex items-center gap-3">
                            <Users className="text-[#E94E3C]" /> Customer Database
                        </h1>
                        <p className="text-gray-500 font-bold text-sm mt-1">Securely manage your global customer relationships.</p>
                    </div>
                    {/* Secure Export Button */}
                    <a href="/franchise-superadmin/customers/export" target="_blank" className="bg-white border-2 border-gray-200 text-[#1A1A2E] px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-[#1A1A2E] transition-all flex items-center justify-center gap-2 shadow-sm">
                        <Download size={16} /> Export Safe Data
                    </a>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard title="Total Customers" value={stats?.total} icon={Users} color="text-blue-500" />
                    <StatCard title="Active Accounts" value={stats?.active} icon={ShieldCheck} color="text-green-500" />
                    <StatCard title="Blocked Accounts" value={stats?.blocked} icon={ShieldAlert} color="text-red-500" alert={stats?.blocked > 0} />
                    <StatCard title="Total Network Orders" value={stats?.total_orders} icon={ShoppingBag} color="text-[#E94E3C]" />
                </div>

                {/* 🚀 FILTERS BAR */}
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-1 w-full relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text" placeholder="Search by name, email or phone..."
                            value={search} onChange={e => setSearch(e.target.value)} onKeyPress={e => e.key === 'Enter' && applyFilters()}
                            className="w-full bg-gray-50 border-none rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none"
                        />
                    </div>
                    <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setTimeout(applyFilters, 100); }} className="bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-600 focus:ring-2 focus:ring-[#E94E3C] outline-none cursor-pointer">
                        <option value="">All Accounts</option>
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                    </select>
                </div>

                {/* 🚀 SECURE DATA TABLE */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-visible">
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50 text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-5 whitespace-nowrap">Customer Profile</th>
                                    <th className="px-6 py-5 whitespace-nowrap">Contact Info</th>
                                    <th className="px-6 py-5 whitespace-nowrap text-center">Orders</th>
                                    <th className="px-6 py-5 whitespace-nowrap text-center">Tickets</th>
                                    <th className="px-6 py-5 whitespace-nowrap">Status</th>
                                    <th className="px-6 py-5 whitespace-nowrap text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {safeCustomers.length > 0 ? safeCustomers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gray-50/80 transition-colors group">

                                        {/* Avatar & Name */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 bg-gradient-to-tr from-[#1A1A2E] to-gray-700 text-white rounded-full flex items-center justify-center font-black text-sm shadow-inner shrink-0">
                                                    {customer.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-black text-[#1A1A2E] text-sm">{customer.name}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1 mt-0.5">
                                                        <Calendar size={10} /> Joined {new Date(customer.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Secure Contact Info */}
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold text-gray-600 flex items-center gap-1.5 truncate max-w-[200px]"><Mail size={12} className="text-gray-400" /> {customer.email}</p>
                                                <p className="text-xs font-bold text-gray-600 flex items-center gap-1.5"><Phone size={12} className="text-gray-400" /> {customer.mobile_number || 'Not provided'}</p>
                                            </div>
                                        </td>

                                        {/* Order Count */}
                                        <td className="px-6 py-4 text-center">
                                            <span className="bg-blue-50 text-blue-600 font-black text-xs px-3 py-1 rounded-lg border border-blue-100">{customer.orders_count || 0}</span>
                                        </td>

                                        {/* Tickets Count */}
                                        <td className="px-6 py-4 text-center">
                                            {customer.support_tickets_count > 0 ? (
                                                <span className="bg-orange-50 text-orange-600 font-black text-xs px-3 py-1 rounded-lg border border-orange-100">{customer.support_tickets_count}</span>
                                            ) : (
                                                <span className="text-gray-300 font-bold text-xs">-</span>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] border px-3 py-1.5 rounded-full font-black tracking-wider uppercase inline-flex items-center gap-1 shadow-sm ${customer.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                {customer.status === 'active' ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                                                {customer.status || 'active'}
                                            </span>
                                        </td>

                                        {/* Action Menu */}
                                        <td className="px-6 py-4 text-right relative">
                                            <button onClick={() => setOpenActionMenu(openActionMenu === customer.id ? null : customer.id)} className="p-2 text-gray-400 hover:text-[#1A1A2E] hover:bg-gray-100 rounded-xl transition-colors focus:outline-none">
                                                <MoreVertical size={20} />
                                            </button>

                                            <AnimatePresence>
                                                {openActionMenu === customer.id && (
                                                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="absolute right-12 top-2 w-48 bg-white border border-gray-100 shadow-xl rounded-2xl z-50 overflow-hidden text-left">
                                                        <div className="p-2 space-y-1">
                                                            <Link href={`/franchise-superadmin/customers/${customer.id}`} className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-black uppercase tracking-widest text-[#1A1A2E] hover:bg-gray-50 rounded-xl transition-colors">
                                                                View Full Profile
                                                            </Link>
                                                        </div>
                                                        <div className="p-2 border-t border-gray-50">
                                                            <button onClick={() => handleToggleStatus(customer.id, customer.status)} className={`flex items-center gap-2 w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-colors ${customer.status === 'active' ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}>
                                                                {customer.status === 'active' ? 'Block Account' : 'Unblock Account'}
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-16 text-center">
                                            <Users size={48} className="mx-auto text-gray-300 mb-4" strokeWidth={1} />
                                            <p className="text-[#1A1A2E] font-black text-lg">No Customers Found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {customers?.links && customers.links.length > 3 && (
                    <div className="flex justify-center gap-2 mt-8">
                        {customers.links.map((link, k) => (
                            <Link key={k} href={link.url || '#'} dangerouslySetInnerHTML={{ __html: link.label }} className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${link.active ? 'bg-[#1A1A2E] text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-[#1A1A2E] border border-gray-200'}`} />
                        ))}
                    </div>
                )}
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
                <h4 className="text-2xl font-black text-[#1A1A2E]">{value?.toLocaleString() || 0}</h4>
            </div>
            <div className={`size-12 rounded-2xl flex items-center justify-center ${alert ? 'bg-red-50' : 'bg-gray-50'} ${color}`}>
                <Icon size={20} strokeWidth={2.5} />
            </div>
        </div>
    );
}