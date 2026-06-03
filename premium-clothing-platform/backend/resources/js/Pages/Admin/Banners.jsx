import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Image as ImageIcon, Upload, Trash2, Eye, EyeOff, LayoutTemplate } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Banners({ banners }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        placement_type: 'main_hero_slider',
        desktop_image: null,
        mobile_image: null,
        target_url: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/franchise-superadmin/banners', {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const toggleStatus = (id) => {
        router.post(`/franchise-superadmin/banners/${id}/toggle`, {}, { preserveScroll: true });
    };

    const deleteBanner = (id) => {
        if (confirm('Are you sure you want to permanently delete this banner?')) {
            router.delete(`/franchise-superadmin/banners/${id}`, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout active="content">
            <Head title="Banner Management | Admin" />
            <div className="max-w-[1400px] mx-auto px-6 py-8">

                <div className="mb-10">
                    <h1 className="text-3xl font-black text-[#282c3f] uppercase tracking-tighter flex items-center gap-3">
                        <LayoutTemplate className="text-[#ff3f6c]" size={32} /> Dynamic Banners
                    </h1>
                    <p className="text-gray-500 font-bold text-sm mt-1">Control your storefront's visual campaigns in real-time.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* 📤 UPLOAD FORM */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-black text-[#282c3f] uppercase tracking-widest mb-6">Create Campaign</h3>
                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Campaign Title</label>
                                    <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#282c3f] outline-none focus:ring-2 focus:ring-[#ff3f6c]" placeholder="e.g. Summer Drop" />
                                    {errors.title && <span className="text-red-500 text-[9px] uppercase">{errors.title}</span>}
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Placement</label>
                                    <select value={data.placement_type} onChange={e => setData('placement_type', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#282c3f] outline-none cursor-pointer focus:ring-2 focus:ring-[#ff3f6c]">
                                        <option value="main_hero_slider">Main Hero Slider (Top)</option>
                                        <option value="mid_page_banner">Mid Page Banner</option>
                                        <option value="category_banner">Category Collection</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Desktop Image */}
                                    <div className="relative overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-100 transition-colors cursor-pointer">
                                        <input type="file" accept="image/*" onChange={e => setData('desktop_image', e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                        <ImageIcon size={20} className="mx-auto mb-2 text-gray-400" />
                                        <p className="text-[9px] font-black uppercase text-gray-500">{data.desktop_image ? data.desktop_image.name : 'Desktop Image'}</p>
                                        {errors.desktop_image && <span className="text-red-500 text-[9px] uppercase block mt-1">{errors.desktop_image}</span>}
                                    </div>
                                    {/* Mobile Image */}
                                    <div className="relative overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-100 transition-colors cursor-pointer">
                                        <input type="file" accept="image/*" onChange={e => setData('mobile_image', e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                        <ImageIcon size={20} className="mx-auto mb-2 text-gray-400" />
                                        <p className="text-[9px] font-black uppercase text-gray-500">{data.mobile_image ? data.mobile_image.name : 'Mobile Image'}</p>
                                        {errors.mobile_image && <span className="text-red-500 text-[9px] uppercase block mt-1">{errors.mobile_image}</span>}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target URL (Optional)</label>
                                    <input type="text" value={data.target_url} onChange={e => setData('target_url', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#282c3f] outline-none focus:ring-2 focus:ring-[#ff3f6c]" placeholder="/shop?category=gym" />
                                </div>

                                <button disabled={processing} className="w-full bg-[#282c3f] text-white py-3.5 rounded-xl font-black uppercase tracking-widest flex justify-center items-center gap-2 hover:bg-[#ff3f6c] transition-colors disabled:opacity-70 active:scale-95">
                                    <Upload size={16} /> {processing ? 'Uploading...' : 'Publish Banner'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* 🖥️ LIVE PREVIEW GRID */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 min-h-[500px]">
                            <h3 className="font-black text-[#282c3f] uppercase tracking-widest mb-6 border-b border-gray-100 pb-4">Live Banners</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {banners.length === 0 ? (
                                    <div className="col-span-2 text-center py-20">
                                        <ImageIcon size={48} className="mx-auto text-gray-200 mb-4" strokeWidth={1} />
                                        <p className="font-black text-[#282c3f] uppercase tracking-widest">No Active Campaigns</p>
                                        <p className="text-xs font-bold text-gray-400 mt-1">Upload your first banner from the left panel.</p>
                                    </div>
                                ) : (
                                    banners.map((banner) => (
                                        <div key={banner.id} className={`group relative rounded-2xl overflow-hidden border ${banner.is_active ? 'border-gray-200' : 'border-red-100 bg-red-50/30'}`}>
                                            {/* Preview Strip */}
                                            <div className="relative aspect-video bg-gray-100 overflow-hidden">
                                                <img src={`/storage/${banner.desktop_image_path}`} className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${!banner.is_active && 'grayscale opacity-50'}`} alt={banner.title} />
                                                <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded">
                                                    {banner.placement_type.replace(/_/g, ' ')}
                                                </div>
                                            </div>

                                            {/* Admin Controls */}
                                            <div className="p-4 flex items-center justify-between bg-white border-t border-gray-100">
                                                <div>
                                                    <p className="text-xs font-black uppercase tracking-widest text-[#282c3f] truncate w-32">{banner.title}</p>
                                                    <span className={`text-[8px] font-black uppercase tracking-widest ${banner.is_active ? 'text-green-500' : 'text-red-500'}`}>
                                                        {banner.is_active ? 'Live' : 'Hidden'}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => toggleStatus(banner.id)} className="p-2 bg-gray-50 hover:bg-gray-200 rounded-lg text-[#282c3f] transition-colors">
                                                        {banner.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                    <button onClick={() => deleteBanner(banner.id)} className="p-2 bg-red-50 hover:bg-red-500 hover:text-white rounded-lg text-red-500 transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}