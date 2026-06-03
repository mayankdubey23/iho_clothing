import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Map, MapPin, Search, ShieldCheck, ShieldAlert,
    ArrowRightLeft, Plus, X, Store, Navigation
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function ServiceAreas({ areas, franchises, stats, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [transferModal, setTransferModal] = useState({ open: false, area: null });

    const { data, setData, post, processing, errors, reset } = useForm({
        franchise_id: '', state: '', city: '', pincode: ''
    });

    const { data: transferData, setData: setTransferData, post: postTransfer, processing: processingTransfer, reset: resetTransfer, errors: transferErrors } = useForm({
        new_franchise_id: ''
    });

    const handleAssign = (e) => {
        e.preventDefault();
        post('/franchise-superadmin/service-areas', { onSuccess: () => { setIsAssignModalOpen(false); reset(); } });
    };

    const handleTransfer = (e) => {
        e.preventDefault();
        postTransfer(`/franchise-superadmin/service-areas/${transferModal.area.id}/transfer`, { onSuccess: () => { setTransferModal({ open: false, area: null }); resetTransfer(); } });
    };

    return (
        <AdminLayout active="service-areas">
            <Head title="Service Areas | Super Admin" />

            <div className="max-w-[1600px] mx-auto pb-20 pt-6 px-4 sm:px-6">

                {/* 🚀 HEADER & STATS */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#282c3f] uppercase tracking-tighter flex items-center gap-3">
                            <Map className="text-[#ff3f6c]" /> Routing & Coverage
                        </h1>
                        <p className="text-gray-500 font-bold text-sm mt-1">Map pincodes to franchises for automatic order routing.</p>
                    </div>
                    <button onClick={() => setIsAssignModalOpen(true)} className="bg-[#282c3f] text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#ff3f6c] transition-all flex items-center gap-2 shadow-lg shadow-black/10">
                        <Plus size={18} /> Assign New Zone
                    </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard title="Covered Pincodes" value={stats?.total_covered} icon={Navigation} color="text-blue-500" />
                    <StatCard title="Active Routing Zones" value={stats?.active_zones} icon={ShieldCheck} color="text-green-500" />
                    <StatCard title="Blocked Zones" value={stats?.blocked_zones} icon={ShieldAlert} color="text-red-500" alert={stats?.blocked_zones > 0} />
                    <StatCard title="Deployed Partners" value={stats?.total_franchises} icon={Store} color="text-purple-500" />
                </div>

                {/* 🚀 SEARCH BAR */}
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-6 flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search by Pincode, City or Franchise Name..." value={search} onChange={e => setSearch(e.target.value)} onKeyPress={e => e.key === 'Enter' && router.get('/franchise-superadmin/service-areas', { search })} className="w-full bg-gray-50 border-none rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-[#282c3f] focus:ring-2 focus:ring-[#ff3f6c] outline-none" />
                    </div>
                </div>

                {/* 🚀 SERVICE AREA TABLE */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-visible">
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50 text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-5 whitespace-nowrap">Assigned Pincode</th>
                                    <th className="px-6 py-5 whitespace-nowrap">City & State</th>
                                    <th className="px-6 py-5 whitespace-nowrap">Franchise Node</th>
                                    <th className="px-6 py-5 whitespace-nowrap">Routing Status</th>
                                    <th className="px-6 py-5 whitespace-nowrap text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {areas?.data?.length > 0 ? areas.data.map((area) => (
                                    <tr key={area.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="bg-[#282c3f] text-white px-3 py-1.5 rounded-lg text-sm font-black tracking-widest shadow-md">
                                                {area.pincode}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-black text-[#282c3f] text-sm flex items-center gap-1.5"><MapPin size={14} className="text-[#ff3f6c]" /> {area.city}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 ml-5">{area.state}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-[#282c3f] text-sm flex items-center gap-1.5"><Store size={14} className="text-blue-500" /> {area.franchise_name}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] border px-3 py-1.5 rounded-md font-black tracking-wider uppercase inline-flex items-center gap-1 shadow-sm ${area.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                {area.status === 'active' ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                                                {area.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => setTransferModal({ open: true, area: area })} className="px-3 py-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-1">
                                                    <ArrowRightLeft size={12} /> Transfer
                                                </button>
                                                <button onClick={() => router.post(`/franchise-superadmin/service-areas/${area.id}/toggle-status`, {}, { preserveScroll: true })} className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${area.status === 'active' ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-green-600 bg-green-50 hover:bg-green-100'}`}>
                                                    {area.status === 'active' ? 'Block Zone' : 'Unblock'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="5" className="px-6 py-16 text-center"><Map size={48} className="mx-auto text-gray-300 mb-4" strokeWidth={1} /><p className="text-[#282c3f] font-black text-lg">No Service Areas Mapped</p></td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* 🚀 MODAL: ASSIGN NEW ZONE */}
            <AnimatePresence>
                {isAssignModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#282c3f]/60 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#282c3f]">
                                <h3 className="font-black text-white uppercase tracking-wider flex items-center gap-2"><MapPin size={18} /> Assign Pincode Routing</h3>
                                <button onClick={() => setIsAssignModalOpen(false)} className="text-white/50 hover:text-white transition-colors"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleAssign} className="p-6 space-y-4">
                                <InputField label="Select Franchise Partner *" isSelect options={franchises} value={data.franchise_id} onChange={e => setData('franchise_id', e.target.value)} error={errors.franchise_id} />
                                <InputField label="State *" value={data.state} onChange={e => setData('state', e.target.value)} error={errors.state} placeholder="e.g. Maharashtra" />
                                <InputField label="City *" value={data.city} onChange={e => setData('city', e.target.value)} error={errors.city} placeholder="e.g. Mumbai" />
                                <InputField label="Pincode (Zone ID) *" value={data.pincode} onChange={e => setData('pincode', e.target.value)} error={errors.pincode} placeholder="e.g. 400001" type="number" />

                                <button disabled={processing} type="submit" className="w-full bg-[#ff3f6c] text-white py-3.5 rounded-xl font-black uppercase tracking-widest hover:bg-[#c0392b] transition-colors mt-4 shadow-xl shadow-[#ff3f6c]/20 disabled:opacity-50">
                                    {processing ? 'Mapping Route...' : 'Lock Service Area'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 🚀 MODAL: TRANSFER ZONE */}
            <AnimatePresence>
                {transferModal.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#282c3f]/60 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-600">
                                <h3 className="font-black text-white uppercase tracking-wider flex items-center gap-2"><ArrowRightLeft size={18} /> Transfer Zone</h3>
                                <button onClick={() => setTransferModal({ open: false, area: null })} className="text-white/50 hover:text-white transition-colors"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleTransfer} className="p-6 space-y-4">
                                <div className="bg-indigo-50 p-4 rounded-2xl mb-4 border border-indigo-100">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Zone Being Transferred</p>
                                    <p className="text-xl font-black text-indigo-900 mt-1">{transferModal.area?.pincode} - {transferModal.area?.city}</p>
                                    <p className="text-xs font-bold text-indigo-600 mt-2 flex items-center gap-1"><Store size={12} /> Current: {transferModal.area?.franchise_name}</p>
                                </div>

                                <InputField label="Transfer Ownership To *" isSelect options={franchises.filter(f => f.id !== transferModal.area?.franchise_id)} value={transferData.new_franchise_id} onChange={e => setTransferData('new_franchise_id', e.target.value)} error={transferErrors.new_franchise_id} />

                                <button disabled={processingTransfer} type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors mt-4 shadow-xl shadow-indigo-600/20 disabled:opacity-50">
                                    {processingTransfer ? 'Transferring Route...' : 'Confirm Transfer'}
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
function StatCard({ title, value, icon: Icon, color, alert }) {
    return (
        <div className={`bg-white p-5 rounded-3xl border ${alert ? 'border-orange-200 shadow-orange-500/10' : 'border-gray-100 shadow-black/5'} shadow-sm flex items-center justify-between`}>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{title}</p>
                <h4 className="text-2xl font-black text-[#282c3f]">{value?.toLocaleString() || 0}</h4>
            </div>
            <div className={`size-12 rounded-2xl flex items-center justify-center ${alert ? 'bg-orange-50' : 'bg-gray-50'} ${color}`}><Icon size={20} strokeWidth={2.5} /></div>
        </div>
    );
}

function InputField({ label, isSelect, options, error, ...props }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
            {isSelect ? (
                <select required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#282c3f] focus:ring-2 focus:ring-[#ff3f6c] outline-none cursor-pointer" {...props}>
                    <option value="">-- Choose Option --</option>
                    {options?.map(opt => <option key={opt.id} value={opt.id}>{opt.name} ({opt.city})</option>)}
                </select>
            ) : (
                <input required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#282c3f] focus:ring-2 focus:ring-[#ff3f6c] outline-none" {...props} />
            )}
            {error && <p className="text-[10px] text-red-500 font-bold ml-1">{error}</p>}
        </div>
    );
}