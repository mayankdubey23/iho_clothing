import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck, Users, Activity, Lock, Unlock,
    Plus, Search, Key, Trash2, X, Clock
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function StaffManagement({ tabData, roles, activeTab, stats, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '', email: '', password: '', role_id: ''
    });

    const switchTab = (tabId) => {
        setSearch('');
        router.get('/franchise-superadmin/staff', { tab: tabId }, { preserveState: true, preserveScroll: true });
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') router.get('/franchise-superadmin/staff', { tab: activeTab, search }, { preserveState: true });
    };

    const toggleStatus = (id) => {
        if (confirm('Are you sure you want to change access for this staff member?')) {
            router.post(`/franchise-superadmin/staff/${id}/toggle-status`, {}, { preserveScroll: true });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/franchise-superadmin/staff', { onSuccess: () => { setIsAddModalOpen(false); reset(); } });
    };

    return (
        <AdminLayout active="staff">
            <Head title="Staff & Permissions | Super Admin" />

            <div className="max-w-[1600px] mx-auto pb-20 pt-6 px-4 sm:px-6">

                {/* 🚀 HEADER & STATS */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter flex items-center gap-3">
                            <ShieldCheck className="text-[#E94E3C]" size={32} /> Security & Access
                        </h1>
                        <p className="text-gray-500 font-bold text-sm mt-1">Manage team roles, system permissions, and view audit logs.</p>
                    </div>
                    {activeTab === 'staff' && (
                        <button onClick={() => setIsAddModalOpen(true)} className="bg-[#1A1A2E] text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#E94E3C] transition-all flex items-center gap-2 shadow-lg shadow-black/10">
                            <Plus size={18} /> Add Team Member
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <StatCard title="Total Staff Members" value={stats.total_staff} icon={Users} color="text-blue-500" />
                    <StatCard title="Active Accounts" value={stats.active_staff} icon={Unlock} color="text-green-500" />
                    <StatCard title="Configured Roles" value={stats.total_roles} icon={Key} color="text-purple-500" />
                </div>

                {/* 🚀 TAB NAVIGATION */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-6 flex gap-2">
                    <button onClick={() => switchTab('staff')} className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'staff' ? 'bg-[#1A1A2E] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <Users size={16} /> Staff Directory
                    </button>
                    <button onClick={() => switchTab('logs')} className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'logs' ? 'bg-[#1A1A2E] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <Activity size={16} /> Security Audit Logs
                    </button>
                </div>

                {/* 🚀 FILTERS BAR */}
                <div className="relative mb-6">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder={`Search ${activeTab === 'staff' ? 'Staff Directory' : 'Activity Logs'}...`} value={search} onChange={e => setSearch(e.target.value)} onKeyPress={handleSearch} className="w-full bg-white shadow-sm border border-gray-100 rounded-2xl pl-12 pr-4 py-4 font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none" />
                </div>

                {/* 🚀 DYNAMIC CONTENT TABLE */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">

                    {/* STAFF DIRECTORY TABLE */}
                    {activeTab === 'staff' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50 text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-5">Staff Identity</th>
                                        <th className="px-6 py-5">Assigned Role</th>
                                        <th className="px-6 py-5">Access Status</th>
                                        <th className="px-6 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {tabData?.data?.map((member) => (
                                        <tr key={member.id} className={`hover:bg-gray-50/80 transition-colors ${member.status === 'blocked' ? 'opacity-60' : ''}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 bg-gray-100 rounded-xl flex items-center justify-center font-black text-[#1A1A2E] text-xs">
                                                        {member.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-[#1A1A2E] text-sm">{member.name}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 mt-1">{member.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1.5 rounded-md font-black tracking-wider uppercase inline-flex items-center gap-1 shadow-sm">
                                                    <Key size={12} /> {member.assigned_role || 'No Role Assigned'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] border px-3 py-1.5 rounded-md font-black tracking-wider uppercase inline-flex items-center gap-1 shadow-sm ${member.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                    {member.status === 'active' ? <Unlock size={12} /> : <Lock size={12} />} {member.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => toggleStatus(member.id)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${member.status === 'active' ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-green-600 bg-green-50 hover:bg-green-100'}`}>
                                                    {member.status === 'active' ? 'Revoke Access' : 'Restore Access'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {tabData?.data?.length === 0 && <EmptyState icon={Users} text="No Staff Members Found" />}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ACTIVITY LOGS TABLE */}
                    {activeTab === 'logs' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50 text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-5">Timestamp</th>
                                        <th className="px-6 py-5">System Module</th>
                                        <th className="px-6 py-5">Staff Member</th>
                                        <th className="px-6 py-5">Action Performed</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {tabData?.data?.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-black text-[#1A1A2E] text-sm flex items-center gap-1.5"><Clock size={14} className="text-gray-400" /> {new Date(log.created_at).toLocaleTimeString()}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{new Date(log.created_at).toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-6 py-4"><span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{log.module}</span></td>
                                            <td className="px-6 py-4 font-bold text-[#1A1A2E] text-sm">{log.staff_name}</td>
                                            <td className="px-6 py-4 text-xs font-bold text-gray-600">{log.action}</td>
                                        </tr>
                                    ))}
                                    {tabData?.data?.length === 0 && <EmptyState icon={Activity} text="No System Logs Found" />}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>

            {/* 🚀 MODAL: ADD STAFF */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A2E]/60 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#1A1A2E]">
                                <h3 className="font-black text-white uppercase tracking-wider flex items-center gap-2"><ShieldCheck size={18} /> Onboard Team Member</h3>
                                <button onClick={() => setIsAddModalOpen(false)} className="text-white/50 hover:text-white transition-colors"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <InputField label="Full Name *" value={data.name} onChange={e => setData('name', e.target.value)} error={errors.name} placeholder="e.g. Rahul Sharma" />
                                <InputField label="Work Email *" type="email" value={data.email} onChange={e => setData('email', e.target.value)} error={errors.email} placeholder="e.g. rahul@ihoclothing.com" />
                                <InputField label="Secure Password *" type="password" value={data.password} onChange={e => setData('password', e.target.value)} error={errors.password} placeholder="Minimum 8 characters" />

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assign System Role *</label>
                                    <select required value={data.role_id} onChange={e => setData('role_id', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none cursor-pointer">
                                        <option value="">-- Choose Role --</option>
                                        {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                                    </select>
                                    {errors.role_id && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.role_id}</p>}
                                </div>

                                <button disabled={processing} type="submit" className="w-full bg-[#E94E3C] text-white py-3.5 rounded-xl font-black uppercase tracking-widest hover:bg-[#c0392b] transition-colors mt-4 shadow-xl shadow-[#E94E3C]/20 disabled:opacity-50 flex items-center justify-center gap-2">
                                    {processing ? 'Creating User...' : 'Create Account'} <Key size={16} />
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </AdminLayout>
    );
}

// 💎 Reusable Components
function StatCard({ title, value, icon: Icon, color }) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{title}</p>
                <h4 className="text-3xl font-black text-[#1A1A2E]">{value}</h4>
            </div>
            <div className={`size-14 rounded-2xl flex items-center justify-center bg-gray-50 ${color}`}><Icon size={24} strokeWidth={2.5} /></div>
        </div>
    );
}

function InputField({ label, error, ...props }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
            <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none transition-all" required {...props} />
            {error && <p className="text-[10px] text-red-500 font-bold ml-1">{error}</p>}
        </div>
    );
}

function EmptyState({ icon: Icon, text }) {
    return (
        <tr><td colSpan="4" className="px-6 py-16 text-center"><Icon size={48} className="mx-auto text-gray-300 mb-4" strokeWidth={1} /><p className="text-[#1A1A2E] font-black text-lg">{text}</p></td></tr>
    );
}