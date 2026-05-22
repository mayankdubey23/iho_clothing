import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import {
    Users, Search, Phone, Mail, MapPin,
    ShoppingBag, CalendarDays, ExternalLink, ShieldCheck
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Customers({ customers, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            router.get('/franchise/customers', { search }, { preserveState: true });
        }
    };

    return (
        <AdminLayout active="customers">
            <Head title="Local Customers | IHO Franchise" />

            <div className="max-w-[1600px] mx-auto pb-20 pt-6 px-4 sm:px-6">

                {/* 🚀 HEADER & SEARCH */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter flex items-center gap-3">
                            <Users className="text-[#E94E3C]" size={32} /> Local Customers
                        </h1>
                        <p className="text-gray-500 font-bold text-sm mt-1">Manage and contact users who have ordered from your hub.</p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search Name, Phone or Email..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyPress={handleSearch}
                            className="w-full bg-white shadow-sm border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none"
                        />
                    </div>
                </div>

                {/* 🚀 PRIVACY BANNER */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3 mb-6">
                    <ShieldCheck size={24} className="text-indigo-600 shrink-0" />
                    <p className="text-xs font-bold text-indigo-800">
                        <strong className="font-black uppercase tracking-wider mr-1">Privacy Notice:</strong>
                        You can only view customers who have placed an order within your assigned pincode. Passwords and sensitive data remain encrypted by the Super Admin.
                    </p>
                </div>

                {/* 🚀 CUSTOMERS DATA TABLE */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50 text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-5">Customer details</th>
                                    <th className="px-6 py-5">Contact Info</th>
                                    <th className="px-6 py-5">Delivery Location</th>
                                    <th className="px-6 py-5 text-center">Order History</th>
                                    <th className="px-6 py-5 text-right">Quick Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {customers?.data?.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center font-black text-[#1A1A2E] shadow-inner">
                                                    {customer.name?.substring(0, 2).toUpperCase() || 'GU'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#1A1A2E] text-sm">{customer.name || 'Guest User'}</p>
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">ID: CUST-{customer.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 space-y-1">
                                            <a href={`tel:${customer.phone}`} className="flex items-center gap-2 text-xs font-bold text-[#1A1A2E] hover:text-[#E94E3C] transition-colors w-max">
                                                <Phone size={12} className="text-gray-400" /> {customer.phone || 'N/A'}
                                            </a>
                                            <a href={`mailto:${customer.email}`} className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#E94E3C] transition-colors w-max">
                                                <Mail size={12} className="text-gray-400" /> {customer.email || 'N/A'}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-2 max-w-[250px]">
                                                <MapPin size={14} className="text-[#E94E3C] mt-0.5 shrink-0" />
                                                <p className="text-xs font-bold text-gray-600 line-clamp-2">
                                                    {customer.address ? `${customer.address.address_line}, ${customer.address.city}, ${customer.address.pincode}` : customer.fallback_address}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center space-y-1">
                                            <p className="text-sm font-black text-[#1A1A2E] flex items-center justify-center gap-1.5">
                                                <ShoppingBag size={14} className="text-[#E94E3C]" /> {customer.total_orders} Orders
                                            </p>
                                            <p className="text-[10px] font-bold text-gray-500 flex items-center justify-center gap-1">
                                                <CalendarDays size={12} /> Last: {new Date(customer.last_order_date).toLocaleDateString()}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/franchise/orders?search=${customer.phone}`} className="inline-flex items-center gap-1.5 text-[10px] bg-gray-100 text-[#1A1A2E] hover:bg-[#1A1A2E] hover:text-white font-black uppercase tracking-widest px-3 py-2 rounded-lg transition-all">
                                                View Orders <ExternalLink size={12} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {customers?.data?.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-16 text-center">
                                            <Users size={48} className="mx-auto text-gray-300 mb-4" strokeWidth={1} />
                                            <p className="text-[#1A1A2E] font-black text-lg">No Customers Found</p>
                                            <p className="text-gray-500 text-sm font-bold mt-1">When users place orders in your area, they will appear here.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}