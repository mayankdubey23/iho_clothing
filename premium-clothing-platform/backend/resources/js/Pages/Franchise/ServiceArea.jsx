import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import {
    MapPin, Navigation, Send, Clock, CheckCircle2,
    XCircle, ShieldCheck, Map, PlusCircle, AlertTriangle
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function ServiceArea({ areas, requests }) {

    const { data, setData, post, processing, reset } = useForm({
        request_type: 'Pincode Expansion',
        requested_state: '',
        requested_city: '',
        requested_locality: '',
        requested_pincode: '',
        reason: ''
    });

    const submitRequest = (e) => {
        e.preventDefault();
        post('/franchise/service-area/request', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                alert("Expansion Request Submitted to Super Admin!");
            }
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-orange-50 text-orange-600 border-orange-200';
            case 'Approved': return 'bg-green-50 text-green-600 border-green-200';
            case 'Rejected': return 'bg-red-50 text-red-600 border-red-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    return (
        <AdminLayout active="service_area">
            <Head title="Service Area | IHO Franchise" />

            <div className="max-w-[1600px] mx-auto pb-20 pt-6 px-4 sm:px-6">

                {/* 🚀 HEADER */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter flex items-center gap-3">
                            <Map className="text-[#E94E3C]" size={32} /> Service Zones
                        </h1>
                        <p className="text-gray-500 font-bold text-sm mt-1">View your assigned delivery pincodes or request an expansion.</p>
                    </div>
                    <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm max-w-sm">
                        <ShieldCheck size={20} className="text-indigo-600 shrink-0" />
                        <p className="text-[10px] font-bold text-indigo-800">
                            You can only fulfill orders within these assigned zones. Final approval rights are reserved with the Super Admin.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                    {/* 🚀 LEFT: ASSIGNED AREAS */}
                    <div className="xl:col-span-2 space-y-6">
                        <h3 className="font-black text-[#1A1A2E] uppercase tracking-widest text-sm flex items-center gap-2">
                            <MapPin size={18} className="text-[#E94E3C]" /> Currently Active Zones
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {areas.length > 0 ? areas.map((area) => (
                                <div key={area.id} className={`bg-white rounded-3xl p-6 shadow-sm border transition-all ${area.is_active ? 'border-green-200 shadow-green-500/5' : 'border-gray-200 opacity-70'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${area.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {area.is_active ? 'Active Zone' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pincode</p>
                                            <h4 className="text-2xl font-black text-[#1A1A2E]">{area.pincode}</h4>
                                        </div>
                                    </div>

                                    <div className="space-y-1 mb-4">
                                        <p className="font-bold text-[#1A1A2E] text-lg">{area.locality}</p>
                                        <p className="text-sm font-bold text-gray-500">{area.city}, {area.state}</p>
                                    </div>

                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-2">
                                        <Navigation size={14} className="text-blue-500" />
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Coverage: <span className="text-blue-600">{area.delivery_coverage}</span></p>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-2 bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm">
                                    <AlertTriangle size={48} className="mx-auto text-orange-400 mb-4" strokeWidth={1.5} />
                                    <h3 className="text-[#1A1A2E] font-black text-lg uppercase">No Active Zones Assigned</h3>
                                    <p className="text-gray-500 text-sm font-bold mt-1">Please raise an expansion request to start receiving orders.</p>
                                </div>
                            )}
                        </div>

                        {/* REQUEST HISTORY TABLE */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-8">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <h3 className="font-black text-[#1A1A2E] uppercase tracking-widest text-xs flex items-center gap-2">
                                    <Clock size={16} className="text-gray-500" /> Expansion Request History
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-white text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4">Request Type & Date</th>
                                            <th className="px-6 py-4">Target Location</th>
                                            <th className="px-6 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {requests.map((req) => (
                                            <tr key={req.id} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-[#1A1A2E] text-sm">{req.request_type}</p>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{new Date(req.created_at).toLocaleDateString()}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-[#1A1A2E] text-sm">{req.requested_locality} - {req.requested_pincode}</p>
                                                    <p className="text-[10px] font-bold text-gray-500">{req.requested_city}, {req.requested_state}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-[10px] border px-3 py-1 rounded-md font-black tracking-wider uppercase inline-flex items-center gap-1 ${getStatusColor(req.status)}`}>
                                                        {req.status}
                                                    </span>
                                                    {req.admin_notes && <p className="text-[9px] text-gray-500 mt-1 max-w-[200px] truncate">Note: {req.admin_notes}</p>}
                                                </td>
                                            </tr>
                                        ))}
                                        {requests.length === 0 && (
                                            <tr><td colSpan="3" className="px-6 py-10 text-center text-sm font-bold text-gray-400">No requests made yet.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* 🚀 RIGHT: REQUEST NEW AREA FORM */}
                    <div className="xl:col-span-1">
                        <div className="bg-[#1A1A2E] rounded-3xl shadow-xl overflow-hidden sticky top-28">
                            <div className="p-6 border-b border-white/10 bg-white/5">
                                <h3 className="font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    <PlusCircle size={18} className="text-[#E94E3C]" /> Request Area Expansion
                                </h3>
                                <p className="text-[10px] text-gray-400 mt-1 font-bold">Subject to Super Admin approval & feasibility check.</p>
                            </div>

                            <form onSubmit={submitRequest} className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Request Type *</label>
                                    <select required value={data.request_type} onChange={e => setData('request_type', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-bold text-white focus:ring-2 focus:ring-[#E94E3C] outline-none">
                                        <option className="text-black" value="Pincode Expansion">Expand to nearby Pincode</option>
                                        <option className="text-black" value="Add New Area">Add completely New Area</option>
                                        <option className="text-black" value="Change Area">Relocate / Change Area</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">State *</label>
                                        <input required type="text" value={data.requested_state} onChange={e => setData('requested_state', e.target.value)} placeholder="e.g. UP" className="w-full bg-white border-none rounded-xl px-4 py-3 font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">City *</label>
                                        <input required type="text" value={data.requested_city} onChange={e => setData('requested_city', e.target.value)} placeholder="e.g. Noida" className="w-full bg-white border-none rounded-xl px-4 py-3 font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Locality / Area Name *</label>
                                    <input required type="text" value={data.requested_locality} onChange={e => setData('requested_locality', e.target.value)} placeholder="e.g. Sector 62" className="w-full bg-white border-none rounded-xl px-4 py-3 font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none" />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pincode *</label>
                                    <input required type="text" maxLength="6" value={data.requested_pincode} onChange={e => setData('requested_pincode', e.target.value)} placeholder="e.g. 201309" className="w-full bg-white border-none rounded-xl px-4 py-3 font-black text-xl text-[#1A1A2E] tracking-widest focus:ring-2 focus:ring-[#E94E3C] outline-none" />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Business Reason *</label>
                                    <textarea required rows="3" value={data.reason} onChange={e => setData('reason', e.target.value)} placeholder="Why do you want to expand here?" className="w-full bg-white border-none rounded-xl px-4 py-3 font-bold text-[#1A1A2E] text-sm focus:ring-2 focus:ring-[#E94E3C] outline-none resize-none"></textarea>
                                </div>

                                <button disabled={processing} type="submit" className="w-full bg-[#E94E3C] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#c0392b] transition-colors mt-2 shadow-xl shadow-[#E94E3C]/20 flex items-center justify-center gap-2">
                                    {processing ? 'Submitting...' : 'Submit Request'} <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </AdminLayout>
    );
}