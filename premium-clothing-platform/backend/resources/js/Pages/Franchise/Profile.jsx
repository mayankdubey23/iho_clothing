import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import {
    Store, User, Mail, Phone, MapPin, Building, CreditCard, ShieldCheck,
    Upload, AlertCircle, Clock, CheckCircle2, Save, FileText
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Profile({ user, profile, bank, pendingRequest }) {

    // Form 1: General Info (Instant Update)
    const generalForm = useForm({
        name: user?.name || '',
        business_name: profile?.business_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        whatsapp_number: profile?.whatsapp_number || '',
        logo: null
    });

    // Form 2: Sensitive Info (Requires Approval)
    const sensitiveForm = useForm({
        gst_number: profile?.gst_number || '',
        pan_number: profile?.pan_number || '',
        address_line: profile?.address_line || '',
        city: profile?.city || '',
        state: profile?.state || '',
        pincode: profile?.pincode || '',
        bank_name: bank?.bank_name || '',
        account_name: bank?.account_name || '',
        account_number: bank?.account_number || '',
        ifsc_code: bank?.ifsc_code || ''
    });

    const submitGeneral = (e) => {
        e.preventDefault();
        generalForm.post('/franchise/profile/general', { preserveScroll: true });
    };

    const submitSensitive = (e) => {
        e.preventDefault();
        sensitiveForm.post('/franchise/profile/sensitive', { preserveScroll: true });
    };

    return (
        <AdminLayout active="profile">
            <Head title="Business Profile | IHO Franchise" />

            <div className="max-w-[1200px] mx-auto pb-20 pt-6 px-4 sm:px-6">

                {/* 🚀 HEADER */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter flex items-center gap-3">
                            <Store className="text-[#E94E3C]" size={32} /> Business Profile
                        </h1>
                        <p className="text-gray-500 font-bold text-sm mt-1">Manage your franchise identity, legal details, and bank information.</p>
                    </div>
                </div>

                {/* 🚀 PENDING APPROVAL BANNER */}
                {pendingRequest && (
                    <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl mb-8 flex items-start gap-4 shadow-sm">
                        <Clock size={24} className="text-orange-500 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-orange-800 font-black uppercase tracking-widest text-sm">Update Under Review</h4>
                            <p className="text-orange-700 text-xs font-bold mt-1">
                                Your recent request to update Legal/Bank details is currently pending approval from the Super Admin. Changes will reflect here once approved.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                    {/* 🚀 PART 1: GENERAL INFORMATION (INSTANT) */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-max">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="font-black text-[#1A1A2E] uppercase tracking-widest text-sm flex items-center gap-2">
                                <User size={18} className="text-[#E94E3C]" /> General Details
                            </h3>
                            <span className="bg-green-100 text-green-700 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded">Instant Update</span>
                        </div>

                        <form onSubmit={submitGeneral} className="p-6 space-y-5">
                            {/* Logo Upload */}
                            <div className="flex items-center gap-6 pb-4 border-b border-gray-50">
                                <div className="size-20 rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                                    {profile?.logo_path ? (
                                        <img src={`/storage/${profile.logo_path}`} className="w-full h-full object-cover" alt="Logo" />
                                    ) : (
                                        <Store size={32} className="text-gray-300" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Brand Logo</label>
                                    <input type="file" onChange={e => generalForm.setData('logo', e.target.files[0])} accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:bg-gray-100 file:text-[#1A1A2E] hover:file:bg-gray-200 cursor-pointer" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Owner Name (No Numbers)" icon={User} form={generalForm} field="name" placeholder="John Doe" />
                                <InputField label="Franchise / Store Name" icon={Store} form={generalForm} field="business_name" placeholder="IHO Delhi Hub" />
                            </div>

                            <InputField label="Email Address" icon={Mail} form={generalForm} field="email" type="email" />

                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Mobile Number (10 Digits)" icon={Phone} form={generalForm} field="phone" maxLength="10" />
                                <InputField label="WhatsApp Number" icon={Phone} form={generalForm} field="whatsapp_number" maxLength="10" />
                            </div>

                            <button disabled={generalForm.processing} type="submit" className="w-full bg-[#1A1A2E] text-white py-3.5 rounded-xl font-black uppercase tracking-widest hover:bg-[#E94E3C] transition-colors mt-4 flex items-center justify-center gap-2">
                                {generalForm.processing ? 'Saving...' : 'Save General Details'} <Save size={16} />
                            </button>
                        </form>
                    </div>

                    {/* 🚀 PART 2: SENSITIVE INFORMATION (REQUIRES APPROVAL) */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
                        {pendingRequest && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
                                <div className="bg-white p-6 rounded-2xl shadow-xl text-center border border-gray-100 max-w-sm">
                                    <ShieldCheck size={40} className="text-orange-500 mx-auto mb-3" />
                                    <h4 className="font-black text-[#1A1A2E] uppercase">Form Locked</h4>
                                    <p className="text-xs font-bold text-gray-500 mt-2">You cannot make new changes while a previous request is still pending approval.</p>
                                </div>
                            </div>
                        )}

                        <div className="p-6 border-b border-gray-100 bg-indigo-50/30 flex justify-between items-center">
                            <h3 className="font-black text-[#1A1A2E] uppercase tracking-widest text-sm flex items-center gap-2">
                                <ShieldCheck size={18} className="text-indigo-600" /> Legal & Financials
                            </h3>
                            <span className="bg-orange-100 text-orange-700 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded">Needs Admin Approval</span>
                        </div>

                        <form onSubmit={submitSensitive} className="p-6 space-y-6">

                            {/* Legal Section */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest border-b border-gray-100 pb-2 flex items-center gap-1.5"><FileText size={14} /> Tax & Compliance</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="GST Number" form={sensitiveForm} field="gst_number" placeholder="22AAAAA0000A1Z5" maxLength="15" className="uppercase" />
                                    <InputField label="PAN Number" form={sensitiveForm} field="pan_number" placeholder="ABCDE1234F" maxLength="10" className="uppercase" />
                                </div>
                            </div>

                            {/* Address Section */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest border-b border-gray-100 pb-2 flex items-center gap-1.5"><MapPin size={14} /> Registered Address</h4>
                                <InputField label="Complete Address" form={sensitiveForm} field="address_line" placeholder="Shop 12, Main Market" />
                                <div className="grid grid-cols-3 gap-4">
                                    <InputField label="City" form={sensitiveForm} field="city" />
                                    <InputField label="State" form={sensitiveForm} field="state" />
                                    <InputField label="Pincode (6 Digits)" form={sensitiveForm} field="pincode" maxLength="6" />
                                </div>
                            </div>

                            {/* Bank Details Section */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest border-b border-gray-100 pb-2 flex items-center gap-1.5"><CreditCard size={14} /> Bank Account (For Settlements)</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Bank Name" form={sensitiveForm} field="bank_name" placeholder="HDFC Bank" />
                                    <InputField label="Account Holder Name" form={sensitiveForm} field="account_name" />
                                    <InputField label="Account Number" form={sensitiveForm} field="account_number" type="password" />
                                    <InputField label="IFSC Code" form={sensitiveForm} field="ifsc_code" placeholder="HDFC0001234" maxLength="11" className="uppercase" />
                                </div>
                            </div>

                            <button disabled={sensitiveForm.processing} type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
                                {sensitiveForm.processing ? 'Submitting...' : 'Submit for Approval'} <AlertCircle size={16} />
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </AdminLayout>
    );
}

// 💎 Reusable Input Field Component with Error Handling
function InputField({ label, icon: Icon, form, field, type = "text", placeholder, maxLength, className = "" }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                {Icon && <Icon size={12} />} {label}
            </label>
            <input
                type={type}
                value={form.data[field]}
                onChange={e => form.setData(field, e.target.value)}
                placeholder={placeholder}
                maxLength={maxLength}
                className={`w-full bg-gray-50 border ${form.errors[field] ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-2.5 font-bold text-[#1A1A2E] text-sm focus:ring-2 focus:ring-[#E94E3C] outline-none transition-all ${className}`}
            />
            {form.errors[field] && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-1">{form.errors[field]}</p>}
        </div>
    );
}