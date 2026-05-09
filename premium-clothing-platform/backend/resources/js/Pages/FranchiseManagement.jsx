import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Store, MapPin, TrendingUp, MoreVertical,
    ShieldCheck, ShieldAlert, Plus, X, Search, Filter,
    BarChart3, Wallet, Package
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function FranchiseManagement({ franchises, summary, filters }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '', email: '', password: '', city: '', state: '', margin: 20, commission: 5
    });

    const applyFilters = () => {
        router.get('/franchise-superadmin/franchises', { search, status: statusFilter }, { preserveState: true });
    };

    const submit = (e) => {
        e.preventDefault();
        post('/franchise-superadmin/franchises', {
            onSuccess: () => { setIsAddModalOpen(false); reset(); }
        });
    };

    const toggleStatus = (id) => {
        if (confirm("Change access status for this franchise?")) {
            router.post(`/franchise-superadmin/franchises/${id}/toggle-status`);
        }
    };

    return (
        <AdminLayout active="franchises">
            <Head title="Franchise Network | Super Admin" />

            <div className="max-w-[1600px] mx-auto pb-20 pt-6 px-4 sm:px-6">

                {/* 🚀 HEADER & SUMMARY */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter flex items-center gap-3">
                            <Store className="text-[#E94E3C]" /> Franchise Network
                        </h1>
                        <p className="text-gray-500 font-bold text-sm mt-1">Manage and monitor global franchise partners.</p>
                    </div>
                    <button onClick={() => setIsAddModalOpen(true)} className="bg-[#1A1A2E] text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#E94E3C] transition-all flex items-center gap-2 shadow-lg shadow-black/10">
                        <Plus size={18} /> Add New Franchise
                    </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    <SummaryCard title="Total Network" value={summary.total} icon={Users} color="text-blue-500" />
                    <SummaryCard title="Active Partners" value={summary.active} icon={ShieldCheck} color="text-green-500" />
                    <SummaryCard title="Pending Requests" value={summary.pending} icon={TrendingUp} color="text-orange-500" alert={summary.pending > 0} />
                    <SummaryCard title="Network Revenue" value={`₹${(summary.total_revenue / 100000).toFixed(1)}L`} icon={Wallet} color="text-[#E94E3C]" />
                </div>

                {/* 🚀 FILTERS */}
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-1 w-full relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} onKeyPress={e => e.key === 'Enter' && applyFilters()} className="w-full bg-gray-50 border-none rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none" />
                    </div>
                    <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setTimeout(applyFilters, 100); }} className="bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-600 focus:ring-2 focus:ring-[#E94E3C] outline-none cursor-pointer min-w-[150px]">
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>

                {/* 🚀 FRANCHISE TABLE */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50 text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-5">Franchise Details</th>
                                    <th className="px-6 py-5">Location</th>
                                    <th className="px-6 py-5">Margin/Comm.</th>
                                    <th className="px-6 py-5">Performance</th>
                                    <th className="px-6 py-5">Status</th>
                                    <th className="px-6 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {franchises.data.map((f) => (
                                    <tr key={f.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 bg-[#1A1A2E] text-white rounded-xl flex items-center justify-center font-black text-xs">{f.name[0]}</div>
                                                <div>
                                                    <p className="font-black text-[#1A1A2E] text-sm">{f.name}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{f.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-xs font-black text-gray-600 flex items-center gap-1"><MapPin size={12} className="text-[#E94E3C]" /> {f.city}, {f.state}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex gap-2">
                                                <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded">M: {f.margin}%</span>
                                                <span className="text-[10px] font-black bg-purple-50 text-purple-600 px-2 py-1 rounded">C: {f.commission}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-black text-green-600">₹{(f.revenue / 1000).toFixed(1)}k</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">{f.total_orders} Orders</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${f.status === 'active' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                                {f.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/franchise-superadmin/franchises/${f.id}`} className="p-2 text-gray-400 hover:text-blue-500 bg-gray-50 rounded-xl transition-colors"><BarChart3 size={18} /></Link>
                                                <button onClick={() => toggleStatus(f.id)} className={`p-2 rounded-xl transition-colors ${f.status === 'active' ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-green-500 bg-green-50 hover:bg-green-100'}`}>
                                                    {f.status === 'active' ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* 🚀 MODAL: ADD NEW FRANCHISE */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A2E]/60 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#1A1A2E]">
                                <h3 className="font-black text-white uppercase tracking-wider">New Franchise Onboarding</h3>
                                <button onClick={() => setIsAddModalOpen(false)} className="text-white/50 hover:text-white transition-colors"><X size={20} /></button>
                            </div>
                            <form onSubmit={submit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Full Name" value={data.name} onChange={e => setData('name', e.target.value)} error={errors.name} required />
                                <InputField label="Email Address" type="email" value={data.email} onChange={e => setData('email', e.target.value)} error={errors.email} required />
                                <InputField label="Initial Password" type="password" value={data.password} onChange={e => setData('password', e.target.value)} error={errors.password} required />
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="City" value={data.city} onChange={e => setData('city', e.target.value)} error={errors.city} required />
                                    <InputField label="State" value={data.state} onChange={e => setData('state', e.target.value)} error={errors.state} required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Margin (%)" type="number" value={data.margin} onChange={e => setData('margin', e.target.value)} error={errors.margin} required />
                                    <InputField label="Commission (%)" type="number" value={data.commission} onChange={e => setData('commission', e.target.value)} error={errors.commission} required />
                                </div>
                                <div className="md:col-span-2 pt-4">
                                    <button disabled={processing} type="submit" className="w-full bg-[#E94E3C] text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#c0392b] transition-all disabled:opacity-50 shadow-xl shadow-[#E94E3C]/20">
                                        {processing ? 'Creating Network Node...' : 'Activate Franchise'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
}

// 💎 Helper Components
function SummaryCard({ title, value, icon: Icon, color, alert }) {
    return (
        <div className={`bg-white p-5 rounded-3xl border ${alert ? 'border-orange-200' : 'border-gray-100'} shadow-sm flex items-center justify-between`}>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{title}</p>
                <h4 className="text-2xl font-black text-[#1A1A2E]">{value}</h4>
            </div>
            <div className={`size-12 rounded-2xl flex items-center justify-center bg-gray-50 ${color}`}><Icon size={22} strokeWidth={2.5} /></div>
        </div>
    );
}

function InputField({ label, ...props }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
            <input {...props} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none transition-all" />
            {props.error && <p className="text-[10px] text-red-500 font-bold ml-1">{props.error}</p>}
        </div>
    );
}