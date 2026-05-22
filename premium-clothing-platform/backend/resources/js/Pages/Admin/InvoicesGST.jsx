import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Receipt, FileText, Settings, Download, Mail,
    Search, IndianRupee, PieChart, Landmark, CheckCircle2, AlertCircle
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function InvoicesGST({ invoices, taxSettings, stats, activeTab, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    const { data, setData, post, processing, errors } = useForm({
        company_name: taxSettings?.company_name || 'IHO Clothing',
        gst_number: taxSettings?.gst_number || '',
        invoice_prefix: taxSettings?.invoice_prefix || 'IHO-',
        default_tax_percentage: taxSettings?.default_tax_percentage || 18,
        billing_address: taxSettings?.billing_address || ''
    });

    const switchTab = (tabId) => {
        setSearch('');
        router.get('/franchise-superadmin/invoices', { tab: tabId }, { preserveState: true, preserveScroll: true });
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') router.get('/franchise-superadmin/invoices', { tab: activeTab, search }, { preserveState: true });
    };

    const saveSettings = (e) => {
        e.preventDefault();
        post('/franchise-superadmin/invoices/settings', { preserveScroll: true });
    };

    const downloadInvoice = (id) => router.get(`/franchise-superadmin/invoices/${id}/download`);
    const emailInvoice = (id) => router.post(`/franchise-superadmin/invoices/${id}/email`, {}, { preserveScroll: true });

    return (
        <AdminLayout active="billing">
            <Head title="Billing & GST | Super Admin" />

            <div className="max-w-[1600px] mx-auto pb-20 pt-6 px-4 sm:px-6">

                {/* 🚀 HEADER & STATS */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter flex items-center gap-3">
                            <Receipt className="text-[#E94E3C]" size={32} /> Billing & GST
                        </h1>
                        <p className="text-gray-500 font-bold text-sm mt-1">Manage tax compliance, B2B/B2C invoices, and company billing info.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <StatCard title="Total Revenue Invoiced" value={`₹${Number(stats.total_invoiced || 0).toLocaleString()}`} icon={IndianRupee} color="text-green-500" />
                    <StatCard title="GST / Tax Collected" value={`₹${Number(stats.gst_collected || 0).toLocaleString()}`} icon={Landmark} color="text-blue-500" />
                    <StatCard title="Pending Dues (Unpaid)" value={`₹${Number(stats.pending_dues || 0).toLocaleString()}`} icon={AlertCircle} color="text-orange-500" alert={stats.pending_dues > 0} />
                </div>

                {/* 🚀 TAB NAVIGATION */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-6 flex gap-2 w-max">
                    <button onClick={() => switchTab('invoices')} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'invoices' ? 'bg-[#1A1A2E] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <FileText size={16} /> Invoice Ledger
                    </button>
                    <button onClick={() => switchTab('settings')} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-[#1A1A2E] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <Settings size={16} /> Tax & GST Settings
                    </button>
                </div>

                {/* 🚀 DYNAMIC CONTENT */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-visible min-h-[400px]">

                    {/* INVOICE LEDGER TABLE */}
                    {activeTab === 'invoices' && (
                        <>
                            <div className="p-4 border-b border-gray-100 relative">
                                <Search size={18} className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="text" placeholder="Search Invoice Number or Billing Name..." value={search} onChange={e => setSearch(e.target.value)} onKeyPress={handleSearch} className="w-full bg-gray-50 border-none rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none" />
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50/50 text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-5">Invoice # & Date</th>
                                            <th className="px-6 py-5">Billed To (Client)</th>
                                            <th className="px-6 py-5">Amounts & Tax</th>
                                            <th className="px-6 py-5">Payment Status</th>
                                            <th className="px-6 py-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {invoices?.data?.map((inv) => (
                                            <tr key={inv.id} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-black text-[#1A1A2E] text-sm flex items-center gap-1.5"><Receipt size={14} className="text-gray-400" /> {inv.invoice_number}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{new Date(inv.created_at).toLocaleDateString()}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-black text-[#1A1A2E] text-sm">{inv.billing_name}</p>
                                                    <p className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md mt-1 inline-block ${inv.type === 'B2B_Franchise' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {inv.type.replace('_', ' ')}
                                                    </p>
                                                    {inv.billing_gst && <p className="text-[10px] font-bold text-gray-500 mt-1">GST: {inv.billing_gst}</p>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-black text-[#1A1A2E] text-sm">₹{Number(inv.final_amount).toLocaleString()}</p>
                                                    <p className="text-[10px] font-bold text-gray-500 mt-1">Incl. ₹{Number(inv.tax_amount).toLocaleString()} Tax</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-[10px] border px-3 py-1.5 rounded-md font-black tracking-wider uppercase inline-flex items-center gap-1 shadow-sm ${inv.payment_status === 'Paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                                                        {inv.payment_status === 'Paid' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />} {inv.payment_status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => emailInvoice(inv.id)} className="p-2 text-indigo-500 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all" title="Email Invoice">
                                                            <Mail size={16} />
                                                        </button>
                                                        <button onClick={() => downloadInvoice(inv.id)} className="p-2 text-[#1A1A2E] bg-gray-100 hover:bg-[#1A1A2E] hover:text-white rounded-xl transition-all" title="Download PDF">
                                                            <Download size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {invoices?.data?.length === 0 && (
                                            <tr><td colSpan="5" className="px-6 py-16 text-center"><Receipt size={48} className="mx-auto text-gray-300 mb-4" strokeWidth={1} /><p className="text-[#1A1A2E] font-black text-lg">No Invoices Found</p></td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {/* TAX & GST SETTINGS */}
                    {activeTab === 'settings' && (
                        <form onSubmit={saveSettings} className="p-8 max-w-3xl mx-auto space-y-6">

                            <div className="bg-[#1A1A2E] text-white p-6 rounded-2xl flex items-center gap-4 shadow-xl shadow-black/10 mb-8">
                                <Landmark size={32} className="text-[#E94E3C]" />
                                <div>
                                    <h3 className="font-black text-lg uppercase tracking-wider">Company Taxation Profile</h3>
                                    <p className="text-xs text-gray-400 font-bold mt-1">These details will be printed on all generated B2C and B2B invoices.</p>
                                </div>
                            </div>

                            <InputField label="Company Legal Name *" value={data.company_name} onChange={e => setData('company_name', e.target.value)} error={errors.company_name} />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Company GSTIN (Optional)" value={data.gst_number} onChange={e => setData('gst_number', e.target.value)} error={errors.gst_number} placeholder="e.g. 07XXXXX1234X1Z5" />
                                <InputField label="Invoice Number Prefix *" value={data.invoice_prefix} onChange={e => setData('invoice_prefix', e.target.value)} error={errors.invoice_prefix} placeholder="e.g. INV-, IHO-" />
                            </div>

                            <div className="space-y-1.5 border-t border-gray-100 pt-6">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Default GST Rate (%) *</label>
                                <div className="relative w-1/3">
                                    <PieChart size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="number" step="0.01" required value={data.default_tax_percentage} onChange={e => setData('default_tax_percentage', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none" />
                                </div>
                                <p className="text-[10px] text-gray-500 font-bold ml-1 mt-1">This rate is applied globally unless overridden at the product level.</p>
                            </div>

                            <div className="space-y-1.5 border-t border-gray-100 pt-6">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Registered Billing Address</label>
                                <textarea rows="3" value={data.billing_address} onChange={e => setData('billing_address', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none resize-none"></textarea>
                            </div>

                            <div className="pt-4 text-right">
                                <button disabled={processing} type="submit" className="bg-[#E94E3C] text-white px-8 py-3.5 rounded-xl font-black uppercase tracking-[0.1em] hover:bg-[#c0392b] transition-all disabled:opacity-50">
                                    {processing ? 'Saving...' : 'Save Tax Settings'}
                                </button>
                            </div>
                        </form>
                    )}

                </div>
            </div>
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