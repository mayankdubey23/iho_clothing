import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { User, Mail, Phone, Package, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function CustomerProfile({ customer }) {
    return (
        <AdminLayout active="customers">
            <Head title={`${customer.name} | Customer Profile`} />

            <div className="max-w-[1000px] mx-auto px-6 py-8">
                {/* Back Button */}
                <Link href="/franchise-superadmin/customers" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#ff3f6c] transition-colors mb-8">
                    <ArrowLeft size={14} /> Back to Customers
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-black text-[#282c3f] uppercase tracking-tighter italic flex items-center gap-3">
                        <User className="text-[#ff3f6c]" size={32} /> Customer Profile
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Customer Info Card */}
                    <div className="md:col-span-1 bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-slate-100 h-fit">
                        <div className="grid size-20 place-items-center rounded-2xl bg-slate-100 text-[#282c3f] mx-auto mb-4">
                            <User size={40} />
                        </div>
                        <h2 className="text-xl font-black text-center text-[#282c3f] uppercase tracking-tight">{customer.name}</h2>
                        <span className={`block text-center text-[10px] font-black uppercase tracking-widest mt-2 ${customer.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>
                            {customer.status}
                        </span>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                                <Mail size={16} className="text-slate-400" /> {customer.email}
                            </div>
                            <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                                <Phone size={16} className="text-slate-400" /> {customer.mobile_number || 'N/A'}
                            </div>
                        </div>
                    </div>

                    {/* Orders & Tickets */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Recent Orders */}
                        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-slate-100">
                            <h3 className="text-sm font-black uppercase tracking-widest text-[#282c3f] flex items-center gap-2 mb-4">
                                <Package size={16} className="text-[#ff3f6c]" /> Recent Orders
                            </h3>
                            {customer.orders && customer.orders.length > 0 ? (
                                <ul className="divide-y divide-slate-100">
                                    {customer.orders.map(order => (
                                        <li key={order.id} className="py-3 flex justify-between items-center">
                                            <span className="text-xs font-bold text-slate-500 uppercase">Order #{order.id}</span>
                                            <span className="text-[10px] font-black tracking-widest bg-slate-100 px-2 py-1 rounded-md">{order.status || 'Pending'}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-xs font-bold text-slate-400">No recent orders found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}