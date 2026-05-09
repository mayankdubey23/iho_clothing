import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Plus, Search, Filter, MoreVertical, Package,
    Tag, Layers, Star, TrendingUp, Edit3, Trash2, EyeOff, Eye
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function ProductIndex({ products, categories, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    const toggleStatus = (id) => {
        router.post(`/franchise-superadmin/products/${id}/toggle-status`, {}, { preserveScroll: true });
    };

    return (
        <AdminLayout active="products">
            <Head title="Master Catalog | IHO Admin" />

            <div className="max-w-[1600px] mx-auto pb-20 pt-6 px-4 sm:px-6">

                {/* 🚀 HEADER */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-[#1A1A2E] tracking-tighter uppercase">Master Catalog</h1>
                        <p className="text-gray-500 font-bold mt-1">Manage your sportswear range, pricing and variants.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/franchise-superadmin/products/create" className="bg-[#1A1A2E] text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#E94E3C] transition-all shadow-xl shadow-black/10 flex items-center gap-2">
                            <Plus size={18} /> Add New Product
                        </Link>
                    </div>
                </div>

                {/* 🚀 SEARCH & FILTERS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text" placeholder="Search by name, SKU or fabric..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && router.get('/franchise-superadmin/products', { search }, { preserveState: true })}
                            className="w-full bg-white border-2 border-gray-100 rounded-2xl pl-12 pr-4 py-4 font-bold text-[#1A1A2E] focus:border-[#E94E3C] outline-none transition-all shadow-sm"
                        />
                    </div>
                    <select className="bg-white border-2 border-gray-100 rounded-2xl px-6 py-4 font-bold text-gray-500 focus:border-[#E94E3C] outline-none shadow-sm cursor-pointer">
                        <option value="">All Categories</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                </div>

                {/* 🚀 PRODUCT GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.data.map((product) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            // Yahan flex, flex-col aur h-full zaroori hai
                            className="flex flex-col h-full bg-white rounded-[2rem] border border-gray-100 overflow-hidden group hover:shadow-2xl hover:shadow-black/5 transition-all relative"
                        >
                            {/* Badges */}
                            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                                {product.is_featured && <span className="bg-yellow-400 text-white p-2 rounded-xl shadow-lg"><Star size={14} fill="currentColor" /></span>}
                                {product.is_best_seller && <span className="bg-[#E94E3C] text-white p-2 rounded-xl shadow-lg"><TrendingUp size={14} /></span>}
                            </div>

                            {/* 🚀 FIXED Image Container */}
                            <div className="h-[280px] w-full bg-gray-50 relative overflow-hidden shrink-0">
                                <img
                                    src={product.main_image ? `/storage/${product.main_image}` : 'https://placehold.co/400x400/f8fafc/94a3b8?text=No+Image'}
                                    onError={(e) => { e.target.src = 'https://placehold.co/400x400/f8fafc/ef4444?text=Missing'; }}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    alt={product.name}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                    <div className="flex gap-2 w-full">
                                        <Link href={`/franchise-superadmin/products/${product.id}/edit`} className="flex-1 bg-white text-[#1A1A2E] py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-center hover:bg-[#E94E3C] hover:text-white transition-colors">Edit</Link>
                                        <button onClick={() => toggleStatus(product.id)} className="bg-white/20 backdrop-blur-md text-white p-2.5 rounded-xl hover:bg-white hover:text-[#1A1A2E] transition-all">
                                            {product.status === 'active' ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="p-5 flex flex-col flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-[10px] font-black text-[#E94E3C] uppercase tracking-[0.2em]">{product.category?.name}</p>
                                    <p className="text-[10px] font-bold text-gray-400">SKU: {product.sku}</p>
                                </div>
                                <h3 className="font-black text-[#1A1A2E] text-lg leading-tight mb-4 group-hover:text-[#E94E3C] transition-colors">{product.name}</h3>

                                {/* Pricing Row - Wrapped in mt-auto taaki hamesha neeche rahe */}
                                <div className="mt-auto">
                                    <div className="flex items-end justify-between bg-gray-50 p-4 rounded-2xl mb-4">
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase mb-1 tracking-widest">Selling Price</p>
                                            {/* Number() lagaya hai taaki string pe toLocaleString crash na kare */}
                                            <p className="text-xl font-black text-[#1A1A2E]">₹{(Number(product.selling_price) || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-gray-400 uppercase mb-1 tracking-widest">MRP</p>
                                            <p className="text-xs font-bold text-gray-400 line-through">₹{(Number(product.mrp) || 0).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {/* Stock & Info Footer */}
                                    <div className="flex items-center justify-between px-1">
                                        <div className="flex items-center gap-2">
                                            <div className={`size-2 rounded-full ${product.total_stock > 10 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <span className="text-[10px] font-black text-[#1A1A2E] uppercase">{product.total_stock || 0} In Stock</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{product.variants?.length || 0} Variants</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="mt-12 flex justify-center">
                    {products.links.map((link, i) => (
                        <Link
                            key={i} href={link.url || '#'} dangerouslySetInnerHTML={{ __html: link.label }}
                            className={`mx-1 px-4 py-2 rounded-xl font-black text-xs transition-all ${link.active ? 'bg-[#1A1A2E] text-white' : 'bg-white text-gray-400 hover:bg-gray-100'}`}
                        />
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
