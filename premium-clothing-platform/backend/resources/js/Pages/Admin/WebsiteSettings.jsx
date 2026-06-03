import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Settings, Globe, CreditCard, Search, Link as LinkIcon,
    Save, ShieldCheck, AlertTriangle, Image as ImageIcon, Power
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function WebsiteSettings({ tabData, activeTab }) {

    // Tab State Management
    const switchTab = (tabId) => {
        router.get('/franchise-superadmin/settings', { tab: tabId }, { preserveState: true, preserveScroll: true });
    };

    // FORM: General Settings
    const generalForm = useForm({
        site_name: tabData?.site_name || '',
        support_email: tabData?.support_email || '',
        support_phone: tabData?.support_phone || '',
        business_address: tabData?.business_address || '',
        currency: tabData?.currency || 'INR',
        maintenance_mode: tabData?.maintenance_mode || 'false',
        logo: null
    });

    const submitGeneral = (e) => {
        e.preventDefault();
        generalForm.post('/franchise-superadmin/settings/general', { preserveScroll: true });
    };

    return (
        <AdminLayout active="settings">
            <Head title="Global Settings | Super Admin" />

            <div className="max-w-[1600px] mx-auto pb-20 pt-6 px-4 sm:px-6">

                {/* 🚀 HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#282c3f] uppercase tracking-tighter flex items-center gap-3">
                            <Settings className="text-[#ff3f6c]" size={32} /> Control Room
                        </h1>
                        <p className="text-gray-500 font-bold text-sm mt-1">Manage global website configuration, payments, and SEO.</p>
                    </div>
                    {tabData?.maintenance_mode === 'true' && (
                        <span className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 animate-pulse">
                            <AlertTriangle size={16} /> Maintenance Mode Active
                        </span>
                    )}
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* 🚀 SIDEBAR TABS */}
                    <div className="w-full lg:w-64 shrink-0">
                        <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-2 sticky top-6">
                            <TabButton id="general" activeTab={activeTab} switchTab={switchTab} icon={Globe} label="General Settings" />
                            <TabButton id="gateways" activeTab={activeTab} switchTab={switchTab} icon={CreditCard} label="Payment Gateways" />
                            <TabButton id="seo" activeTab={activeTab} switchTab={switchTab} icon={Search} label="SEO & Social Links" />
                        </div>
                    </div>

                    {/* 🚀 SETTINGS CONTENT AREA */}
                    <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 min-h-[500px]">

                        {/* 1. GENERAL & SYSTEM SETTINGS */}
                        {activeTab === 'general' && (
                            <form onSubmit={submitGeneral} className="space-y-8 max-w-3xl">

                                {/* Maintenance Warning */}
                                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex gap-4 items-start">
                                    <Power size={24} className="text-orange-500 shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-black text-orange-800 uppercase tracking-widest text-xs">System Maintenance Mode</h4>
                                        <p className="text-sm font-bold text-orange-600/80 mt-1 mb-3">If enabled, customers and franchises will see a "Under Maintenance" screen. Admins can still log in.</p>
                                        <select value={generalForm.data.maintenance_mode} onChange={e => generalForm.setData('maintenance_mode', e.target.value)} className="bg-white border-orange-200 text-orange-700 font-black uppercase text-xs rounded-xl focus:ring-2 focus:ring-orange-500">
                                            <option value="false">Live (Online)</option>
                                            <option value="true">Maintenance Mode (Offline)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField label="Website Name" value={generalForm.data.site_name} onChange={e => generalForm.setData('site_name', e.target.value)} />
                                    <InputField label="System Currency" value={generalForm.data.currency} onChange={e => generalForm.setData('currency', e.target.value)} placeholder="INR" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField label="Support Email" type="email" value={generalForm.data.support_email} onChange={e => generalForm.setData('support_email', e.target.value)} />
                                    <InputField label="Support Phone" value={generalForm.data.support_phone} onChange={e => generalForm.setData('support_phone', e.target.value)} />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Registered Business Address</label>
                                    <textarea rows="3" value={generalForm.data.business_address} onChange={e => generalForm.setData('business_address', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#282c3f] focus:ring-2 focus:ring-[#ff3f6c] outline-none resize-none"></textarea>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Upload Website Logo</label>
                                    <div className="flex items-center gap-4">
                                        <div className="size-16 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200">
                                            {tabData?.site_logo ? <img src={`/storage/${tabData.site_logo}`} className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-400" />}
                                        </div>
                                        <input type="file" onChange={e => generalForm.setData('logo', e.target.files[0])} className="text-sm font-bold file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-gray-100 file:text-[#282c3f] hover:file:bg-gray-200 cursor-pointer" />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <button disabled={generalForm.processing} type="submit" className="bg-[#282c3f] text-white px-8 py-3.5 rounded-xl font-black uppercase tracking-[0.1em] hover:bg-[#ff3f6c] transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-black/10">
                                        <Save size={16} /> {generalForm.processing ? 'Saving...' : 'Save General Settings'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* 2. PAYMENT GATEWAYS */}
                        {activeTab === 'gateways' && (
                            <div className="space-y-6 max-w-4xl">
                                <p className="text-sm font-bold text-gray-500 mb-6">Configure secure payment routes for D2C customers and B2B franchise wallet recharges.</p>

                                {tabData?.length > 0 ? tabData.map(gateway => (
                                    <GatewayForm key={gateway.id} gateway={gateway} />
                                )) : (
                                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                                        <CreditCard size={32} className="mx-auto text-gray-400 mb-2" />
                                        <p className="font-black text-[#282c3f]">No Gateways Configured.</p>
                                        <p className="text-xs font-bold text-gray-500">Insert rows in `payment_gateways` table via database.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 3. SEO & SOCIAL Placeholder */}
                        {activeTab === 'seo' && (
                            <div className="text-center py-20 opacity-50">
                                <Search size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="font-black text-xl text-[#282c3f] uppercase">SEO Module Ready</h3>
                                <p className="font-bold text-gray-500 text-sm mt-2">Backend tables are connected. Add form UI here similar to general settings.</p>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

// 💎 Reusable Components
function TabButton({ id, activeTab, switchTab, icon: Icon, label }) {
    const isActive = activeTab === id;
    return (
        <button onClick={() => switchTab(id)} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-left ${isActive ? 'bg-[#282c3f] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-[#282c3f]'}`}>
            <Icon size={16} className={isActive ? 'text-[#ff3f6c]' : ''} /> {label}
        </button>
    );
}

function InputField({ label, ...props }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
            <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#282c3f] focus:ring-2 focus:ring-[#ff3f6c] outline-none transition-all" {...props} />
        </div>
    );
}

// Sub-component for individual gateway config
function GatewayForm({ gateway }) {
    const form = useForm({
        is_active: gateway.is_active,
        mode: gateway.mode,
        api_key: gateway.api_key || '',
        api_secret: gateway.api_secret || ''
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(`/franchise-superadmin/settings/gateway/${gateway.id}`, { preserveScroll: true });
    };

    return (
        <form onSubmit={submit} className="border border-gray-200 rounded-2xl p-6 bg-gray-50/50 hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="size-10 bg-[#282c3f] text-white rounded-lg flex items-center justify-center"><ShieldCheck size={20} /></div>
                    <h4 className="font-black text-lg text-[#282c3f] uppercase">{gateway.name} Integration</h4>
                </div>
                <div className="flex items-center gap-4">
                    <select value={form.data.mode} onChange={e => form.setData('mode', e.target.value)} className="bg-white border-gray-200 text-xs font-black uppercase rounded-lg">
                        <option value="sandbox">Sandbox (Test)</option>
                        <option value="live">Live (Production)</option>
                    </select>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-black uppercase tracking-widest text-[#282c3f]">
                        <input type="checkbox" checked={form.data.is_active} onChange={e => form.setData('is_active', e.target.checked)} className="rounded text-[#ff3f6c] focus:ring-[#ff3f6c]" />
                        Enable
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Public API Key" type="password" placeholder="pk_test_..." value={form.data.api_key} onChange={e => form.setData('api_key', e.target.value)} />
                <InputField label="Secret Key (Encrypted)" type="password" placeholder="sk_test_..." value={form.data.api_secret} onChange={e => form.setData('api_secret', e.target.value)} />
            </div>

            <button disabled={form.processing} type="submit" className="mt-4 bg-gray-200 text-[#282c3f] px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#282c3f] hover:text-white transition-colors">
                {form.processing ? 'Saving...' : `Save ${gateway.name} Credentials`}
            </button>
        </form>
    );
}