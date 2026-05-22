import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Tag, Search, Plus, X, Percent, IndianRupee, Truck,
    CalendarClock, EyeOff, Eye, Trash2, TrendingDown, Users,
    LayoutTemplate, CheckCircle2, Copy, Save
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Coupons({ coupons, stats, filters, storeOffers }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // 🚀 Form for adding a new Coupon Code
    const { data, setData, post, processing, errors, reset } = useForm({
        code: '', type: 'percentage', value: '', min_order_value: 0,
        max_discount_amount: '', expiry_date: '', usage_limit: '', target_audience: 'all'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/franchise-superadmin/coupons', { onSuccess: () => { setIsAddModalOpen(false); reset(); } });
    };

    const toggleStatus = (id) => {
        router.post(`/franchise-superadmin/coupons/${id}/toggle-status`, {}, { preserveScroll: true });
    };

    const deleteCoupon = (id) => {
        if (confirm("Permanently delete this coupon? This cannot be undone.")) {
            router.delete(`/franchise-superadmin/coupons/${id}`, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout active="promotions"> {/* Update sidebar active state if needed */}
            <Head title="Promotions & Offers | Super Admin" />

            <div className="max-w-[1600px] mx-auto pb-20 pt-6 px-4 sm:px-6">

                {/* 🚀 HEADER & STATS */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter flex items-center gap-3">
                            <Tag className="text-[#E94E3C]" /> Promotions & Offers
                        </h1>
                        <p className="text-gray-500 font-bold text-sm mt-1">Manage discount codes, B2B sales, and free shipping promos.</p>
                    </div>
                    <button onClick={() => setIsAddModalOpen(true)} className="bg-[#1A1A2E] text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#E94E3C] transition-all flex items-center gap-2 shadow-lg shadow-black/10">
                        <Plus size={18} /> Create New Coupon
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <StatCard title="Active Campaigns" value={stats?.total_active} icon={Tag} color="text-blue-500" />
                    <StatCard title="Total Discounts Claimed" value={`₹${Number(stats?.total_discount_given).toLocaleString()}`} icon={TrendingDown} color="text-green-500" />
                    <StatCard title="Most Popular Code" value={stats?.most_used_code} icon={Percent} color="text-[#E94E3C]" />
                </div>

                {/* 🚀 SEARCH BAR FOR COUPONS */}
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-6 flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search Promo Codes (e.g. SPORTS10)..." value={search} onChange={e => setSearch(e.target.value)} onKeyPress={e => e.key === 'Enter' && router.get('/franchise-superadmin/coupons', { search })} className="w-full bg-gray-50 border-none rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none uppercase" />
                    </div>
                </div>

                {/* 🚀 DISCOUNT COUPONS DATA TABLE */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-visible mb-16">
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50 text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-5 whitespace-nowrap">Promo Code</th>
                                    <th className="px-6 py-5 whitespace-nowrap">Discount Rule</th>
                                    <th className="px-6 py-5 whitespace-nowrap">Target & Conditions</th>
                                    <th className="px-6 py-5 whitespace-nowrap text-center">Usage Stats</th>
                                    <th className="px-6 py-5 whitespace-nowrap text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {coupons?.data?.length > 0 ? coupons.data.map((coupon) => (
                                    <tr key={coupon.id} className={`hover:bg-gray-50/80 transition-colors group ${coupon.status === 'inactive' ? 'opacity-60' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="inline-flex items-center gap-2 border-2 border-dashed border-[#1A1A2E] bg-gray-50 px-3 py-1.5 rounded-lg">
                                                <Tag size={12} className="text-[#E94E3C]" />
                                                <span className="font-black text-[#1A1A2E] text-sm uppercase tracking-widest">{coupon.code}</span>
                                            </div>
                                            {coupon.expiry_date && (
                                                <p className={`text-[9px] font-bold mt-2 uppercase tracking-widest flex items-center gap-1 ${new Date(coupon.expiry_date) < new Date() ? 'text-red-500' : 'text-gray-400'}`}>
                                                    <CalendarClock size={10} /> Exp: {new Date(coupon.expiry_date).toLocaleDateString()}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-black text-[#1A1A2E] text-base flex items-center gap-1">
                                                {coupon.type === 'percentage' && <>{coupon.value}% OFF</>}
                                                {coupon.type === 'flat' && <>₹{coupon.value} FLAT OFF</>}
                                                {coupon.type === 'free_shipping' && <span className="flex items-center gap-1 text-green-600"><Truck size={14} /> FREE SHIPPING</span>}
                                            </p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                                Up to ₹{coupon.max_discount_amount || '∞'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] bg-blue-50 text-blue-600 font-black px-2 py-1 rounded uppercase tracking-widest flex items-center w-max gap-1 mb-1">
                                                <Users size={10} /> {coupon.target_audience.replace('_', ' ')}
                                            </span>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Min Order: ₹{coupon.min_order_value}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="bg-gray-100 text-[#1A1A2E] font-black text-xs px-3 py-1.5 rounded-lg border border-gray-200">
                                                {coupon.used_count} / {coupon.usage_limit || '∞'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => toggleStatus(coupon.id)} className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${coupon.status === 'active' ? 'text-orange-500 bg-orange-50 hover:bg-orange-100' : 'text-green-600 bg-green-50 hover:bg-green-100'}`}>
                                                    {coupon.status === 'active' ? 'Disable' : 'Enable'}
                                                </button>
                                                <button onClick={() => deleteCoupon(coupon.id)} className="p-2 text-red-400 bg-red-50 hover:bg-red-500 hover:text-white rounded-xl transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="5" className="px-6 py-16 text-center"><Tag size={48} className="mx-auto text-gray-300 mb-4" strokeWidth={1} /><p className="text-[#1A1A2E] font-black text-lg">No Coupons Found</p></td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ========================================================= */}
                {/* 🚀 NEW SECTION: STOREFRONT VISUAL BANNERS                 */}
                {/* ========================================================= */}
                <div className="mb-6 border-b border-gray-200 pb-4">
                    <h2 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-tighter flex items-center gap-2">
                        <LayoutTemplate size={24} className="text-[#E94E3C]" />
                        Storefront Visual Banners
                    </h2>
                    <p className="text-sm font-medium text-gray-500 mt-1">
                        Edit the promotional text and banners shown directly on the main website layout.
                    </p>
                </div>

                <div className="grid gap-6 pb-12">
                    {storeOffers && storeOffers.map((offer) => (
                        <StoreOfferEditCard key={offer.id} offer={offer} />
                    ))}
                </div>
                {/* ========================================================= */}

            </div>

            {/* 🚀 MODAL: CREATE COUPON */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A2E]/60 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
                            <div className="sticky top-0 bg-white/90 backdrop-blur-md p-6 border-b border-gray-100 flex justify-between items-center z-10">
                                <h3 className="font-black text-[#1A1A2E] uppercase tracking-wider flex items-center gap-2"><Tag size={18} className="text-[#E94E3C]" /> Create Discount Coupon</h3>
                                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField label="Coupon Code *" value={data.code} onChange={e => setData('code', e.target.value)} error={errors.code} placeholder="e.g. SPORTS10" style={{ textTransform: 'uppercase' }} />
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Discount Type *</label>
                                        <select value={data.type} onChange={e => setData('type', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none cursor-pointer">
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="flat">Flat Amount (₹)</option>
                                            <option value="free_shipping">Free Shipping</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <InputField label="Discount Value" type="number" value={data.value} onChange={e => setData('value', e.target.value)} error={errors.value} placeholder="10 or 500" disabled={data.type === 'free_shipping'} />
                                    <InputField label="Min Order Value (₹) *" type="number" value={data.min_order_value} onChange={e => setData('min_order_value', e.target.value)} error={errors.min_order_value} />
                                    <InputField label="Max Discount (₹)" type="number" value={data.max_discount_amount} onChange={e => setData('max_discount_amount', e.target.value)} error={errors.max_discount_amount} disabled={data.type === 'flat' || data.type === 'free_shipping'} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Audience</label>
                                        <select value={data.target_audience} onChange={e => setData('target_audience', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none cursor-pointer">
                                            <option value="all">Everyone</option>
                                            <option value="b2c_customers">D2C Customers Only</option>
                                            <option value="b2b_franchises">Franchises Only</option>
                                        </select>
                                    </div>
                                    <InputField label="Usage Limit (Total)" type="number" value={data.usage_limit} onChange={e => setData('usage_limit', e.target.value)} error={errors.usage_limit} placeholder="Leave blank for infinite" />
                                    <InputField label="Expiry Date" type="datetime-local" value={data.expiry_date} onChange={e => setData('expiry_date', e.target.value)} error={errors.expiry_date} />
                                </div>

                                <button disabled={processing} type="submit" className="w-full bg-[#1A1A2E] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#E94E3C] transition-colors disabled:opacity-50 shadow-xl shadow-black/10 mt-2">
                                    {processing ? 'Generating...' : 'Generate Coupon Code'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </AdminLayout>
    );
}

// =======================================================================
// 💎 Helper Components
// =======================================================================

function StatCard({ title, value, icon: Icon, color }) {
    return (
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{title}</p>
                <h4 className="text-2xl font-black text-[#1A1A2E]">{value}</h4>
            </div>
            <div className={`size-12 rounded-2xl flex items-center justify-center bg-gray-50 ${color}`}><Icon size={20} strokeWidth={2.5} /></div>
        </div>
    );
}

function InputField({ label, error, ...props }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
            <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none transition-all disabled:opacity-50 disabled:bg-gray-200" {...props} />
            {error && <p className="text-[10px] text-red-500 font-bold ml-1">{error}</p>}
        </div>
    );
}

// 💎 Storefront Banner Helper Component
function StoreOfferEditCard({ offer }) {
    const [isEditing, setIsEditing] = useState(false);

    // Using Inertia useForm to handle the banner updates
    const { data, setData, put, processing } = useForm({
        title: offer.title || '',
        subtitle: offer.subtitle || '',
        offer_code: offer.offer_code || '',
        is_active: offer.is_active === 1,
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/franchise-superadmin/offers/${offer.id}`, {
            preserveScroll: true,
            onSuccess: () => setIsEditing(false)
        });
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between transition-colors hover:border-[#1A1A2E]/20">
            {!isEditing ? (
                <>
                    <div className="flex-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#E94E3C] bg-[#E94E3C]/10 px-2 py-1 rounded-md mb-3 inline-block">
                            {offer.display_type.replace('_', ' ')}
                        </span>
                        <h3 className="text-xl font-black text-[#1A1A2E] uppercase">{offer.title}</h3>
                        <p className="text-sm text-gray-500 font-bold mt-1">{offer.subtitle || 'No Subtitle'}</p>
                        {offer.offer_code && (
                            <p className="mt-3 text-xs font-black text-gray-400 uppercase tracking-widest">
                                Linked Code: <span className="bg-gray-50 px-2 py-1 rounded text-[#1A1A2E]">{offer.offer_code}</span>
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
                        <div className="text-right">
                            {offer.is_active ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                                    <CheckCircle2 size={12} /> Active
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                                    Inactive
                                </span>
                            )}
                        </div>
                        <button onClick={() => setIsEditing(true)} className="w-full md:w-auto bg-gray-50 text-[#1A1A2E] px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#1A1A2E] hover:text-white transition-all border border-gray-200">
                            Edit Content
                        </button>
                    </div>
                </>
            ) : (
                <form onSubmit={submit} className="w-full flex flex-col gap-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <InputField label="Main Title" value={data.title} onChange={e => setData('title', e.target.value)} required />
                        <InputField label="Subtitle / Details" value={data.subtitle} onChange={e => setData('subtitle', e.target.value)} />
                        <InputField label="Coupon Code Text" value={data.offer_code} onChange={e => setData('offer_code', e.target.value.toUpperCase())} placeholder="Leave empty if no code" />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between mt-2 pt-5 border-t border-gray-100 gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="text-[#E94E3C] rounded-md focus:ring-[#E94E3C] size-5 border-gray-300 transition-colors" />
                            <span className="text-xs font-black uppercase tracking-widest text-[#1A1A2E]">Show on Website</span>
                        </label>

                        <div className="flex w-full sm:w-auto gap-3">
                            <button type="button" onClick={() => setIsEditing(false)} className="flex-1 sm:flex-none text-xs font-black uppercase tracking-widest text-gray-500 hover:text-black py-3 px-4">Cancel</button>
                            <button type="submit" disabled={processing} className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest bg-[#1A1A2E] text-white px-8 py-3 rounded-xl hover:bg-[#E94E3C] transition-colors disabled:opacity-50">
                                <Save size={16} /> Save Changes
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}