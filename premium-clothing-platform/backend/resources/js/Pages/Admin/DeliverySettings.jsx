import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Truck, MapPin, Search, Plus, X, Package,
    CheckCircle2, XCircle, Clock, Navigation
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function DeliverySettings({ tabData, zones, activeTab, stats, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        pincode: '', estimated_delivery_days: 3, is_cod_available: true
    });

    const switchTab = (tabId) => {
        setSearch('');
        router.get('/franchise-superadmin/delivery', { tab: tabId }, { preserveState: true, preserveScroll: true });
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') router.get('/franchise-superadmin/delivery', { tab: activeTab, search }, { preserveState: true });
    };

    const submitPincode = (e) => {
        e.preventDefault();
        post('/franchise-superadmin/delivery/pincode', { onSuccess: () => { setIsAddModalOpen(false); reset(); } });
    };

    return (
        <AdminLayout active="delivery">
            <Head title="Logistics & Shipping | Super Admin" />

            <div className="max-w-[1600px] mx-auto pb-20 pt-6 px-4 sm:px-6">

                {/* 🚀 HEADER & STATS */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter flex items-center gap-3">
                            <Truck className="text-[#E94E3C]" size={32} /> Delivery & Logistics
                        </h1>
                        <p className="text-gray-500 font-bold text-sm mt-1">Manage pincodes, couriers, tracking, and COD availability.</p>
                    </div>
                    {activeTab === 'pincodes' && (
                        <button onClick={() => setIsAddModalOpen(true)} className="bg-[#1A1A2E] text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#E94E3C] transition-all flex items-center gap-2 shadow-lg shadow-black/10">
                            <Plus size={18} /> Map New Pincode
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <StatCard title="Serviceable Pincodes" value={stats.active_pincodes} icon={MapPin} color="text-green-500" />
                    <StatCard title="Pending Shipments" value={stats.pending_shipments} icon={Package} color="text-orange-500" alert={stats.pending_shipments > 0} />
                    <StatCard title="Active Courier Partners" value={stats.couriers_count} icon={Truck} color="text-blue-500" />
                </div>

                {/* 🚀 TAB NAVIGATION */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-6 flex gap-2 w-max">
                    <button onClick={() => switchTab('pincodes')} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'pincodes' ? 'bg-[#1A1A2E] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <MapPin size={16} /> Serviceability & COD
                    </button>
                    <button onClick={() => switchTab('shipments')} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'shipments' ? 'bg-[#1A1A2E] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <Navigation size={16} /> Shipments & Tracking
                    </button>
                    <button onClick={() => switchTab('couriers')} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'couriers' ? 'bg-[#1A1A2E] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <Truck size={16} /> Courier Partners
                    </button>
                </div>

                {/* 🚀 FILTERS */}
                {(activeTab === 'pincodes' || activeTab === 'shipments') && (
                    <div className="relative mb-6">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder={`Search ${activeTab === 'pincodes' ? 'Pincode' : 'Tracking ID or Order'}...`} value={search} onChange={e => setSearch(e.target.value)} onKeyPress={handleSearch} className="w-full bg-white shadow-sm border border-gray-100 rounded-2xl pl-12 pr-4 py-4 font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none" />
                    </div>
                )}

                {/* 🚀 DYNAMIC CONTENT TABLE */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">

                    {/* PINCODE SERVICEABILITY */}
                    {activeTab === 'pincodes' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50 text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-5">Pincode</th>
                                        <th className="px-6 py-5">ETA (Days)</th>
                                        <th className="px-6 py-5">COD Availability</th>
                                        <th className="px-6 py-5">Delivery Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {tabData?.data?.map((pin) => (
                                        <tr key={pin.id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="bg-[#1A1A2E] text-white px-3 py-1.5 rounded-lg text-sm font-black tracking-widest shadow-md">{pin.pincode}</span>
                                            </td>
                                            <td className="px-6 py-4 font-black text-[#1A1A2E] text-sm flex items-center gap-1.5">
                                                <Clock size={14} className="text-gray-400" /> {pin.estimated_delivery_days} Days
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md flex w-max items-center gap-1 ${pin.is_cod_available ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                    {pin.is_cod_available ? <CheckCircle2 size={12} /> : <XCircle size={12} />} {pin.is_cod_available ? 'COD Allowed' : 'Prepaid Only'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${pin.status === 'active' ? 'text-blue-500' : 'text-red-500'}`}>{pin.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                    {tabData?.data?.length === 0 && <EmptyState icon={MapPin} text="No Pincodes Mapped" />}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* SHIPMENTS & TRACKING */}
                    {activeTab === 'shipments' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50 text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-5">Order ID</th>
                                        <th className="px-6 py-5">Tracking Info</th>
                                        <th className="px-6 py-5">Status</th>
                                        <th className="px-6 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {tabData?.data?.map((ship) => (
                                        <tr key={ship.id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="px-6 py-4 font-black text-[#1A1A2E]">ORD-{ship.order_id}</td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-[#1A1A2E] text-sm">{ship.tracking_number || 'No Tracking ID'}</p>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 flex items-center gap-1">
                                                    <Truck size={10} /> {ship.courier_name || 'Awaiting Partner'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-md font-black tracking-wider uppercase inline-flex items-center gap-1">
                                                    {ship.delivery_status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => alert('Update Tracking Modal (Connects to backend updateTracking method)')} className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1A1A2E] hover:text-white transition-colors">
                                                    Update Status
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {tabData?.data?.length === 0 && <EmptyState icon={Package} text="No Shipments Found" />}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>

            {/* 🚀 MODAL: ADD PINCODE */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A2E]/60 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#1A1A2E]">
                                <h3 className="font-black text-white uppercase tracking-wider flex items-center gap-2"><MapPin size={18} /> Map Service Pincode</h3>
                                <button onClick={() => setIsAddModalOpen(false)} className="text-white/50 hover:text-white transition-colors"><X size={20} /></button>
                            </div>
                            <form onSubmit={submitPincode} className="p-6 space-y-4">
                                <InputField label="Pincode *" type="number" value={data.pincode} onChange={e => setData('pincode', e.target.value)} error={errors.pincode} placeholder="e.g. 110001" />
                                <InputField label="Estimated Delivery (Days) *" type="number" min="1" value={data.estimated_delivery_days} onChange={e => setData('estimated_delivery_days', e.target.value)} error={errors.estimated_delivery_days} />

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">COD Availability *</label>
                                    <select required value={data.is_cod_available} onChange={e => setData('is_cod_available', e.target.value === 'true')} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none cursor-pointer">
                                        <option value="true">Enable Cash on Delivery (COD)</option>
                                        <option value="false">Prepaid Orders Only</option>
                                    </select>
                                </div>

                                <button disabled={processing} type="submit" className="w-full bg-[#E94E3C] text-white py-3.5 rounded-xl font-black uppercase tracking-widest hover:bg-[#c0392b] transition-colors mt-4 shadow-xl shadow-[#E94E3C]/20 disabled:opacity-50">
                                    {processing ? 'Saving...' : 'Save Pincode Rules'}
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
        <div className={`bg-white p-6 rounded-3xl border ${alert ? 'border-orange-200 shadow-orange-500/10' : 'border-gray-100 shadow-black/5'} shadow-sm flex items-center justify-between`}>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{title}</p>
                <h4 className="text-3xl font-black text-[#1A1A2E]">{value}</h4>
            </div>
            <div className={`size-14 rounded-2xl flex items-center justify-center ${alert ? 'bg-orange-50' : 'bg-gray-50'} ${color}`}><Icon size={24} strokeWidth={2.5} /></div>
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
        <tr><td colSpan="5" className="px-6 py-16 text-center"><Icon size={48} className="mx-auto text-gray-300 mb-4" strokeWidth={1} /><p className="text-[#1A1A2E] font-black text-lg">{text}</p></td></tr>
    );
}