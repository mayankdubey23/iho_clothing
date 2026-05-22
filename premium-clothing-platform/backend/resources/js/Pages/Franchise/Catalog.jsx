import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutGrid, Search, Package, Eye, EyeOff, Tag, IndianRupee, Store, X, Save
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Catalog({ products, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [editingProduct, setEditingProduct] = useState(null);

    const { data, setData, post, processing, reset } = useForm({
        local_selling_price: ''
    });

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            router.get('/franchise/catalog', { search }, { preserveState: true });
        }
    };

    const toggleVisibility = (mappingId) => {
        router.post(`/franchise/catalog/${mappingId}/toggle`, {}, { preserveScroll: true });
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setData('local_selling_price', product.local_selling_price || product.mrp);
    };

    const submitPriceUpdate = (e) => {
        e.preventDefault();
        post(`/franchise/catalog/${editingProduct.mapping_id}/price`, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingProduct(null);
                reset();
            }
        });
    };

    return (
        <AdminLayout active="catalog">
            <Head title="Store Catalog | IHO Franchise" />

            <div className="max-w-[1600px] mx-auto pb-20 pt-6 px-4 sm:px-6">

                {/* 🚀 HEADER & SEARCH */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter flex items-center gap-3">
                            <Store className="text-[#E94E3C]" size={32} /> Store Catalog
                        </h1>
                        <p className="text-gray-500 font-bold text-sm mt-1">Manage products assigned to you. Set local pricing and visibility.</p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by Product Name or SKU..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyPress={handleSearch}
                            className="w-full bg-white shadow-sm border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none"
                        />
                    </div>
                </div>

                {/* 🚀 PRODUCT GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {products?.data?.map((product) => (
                        <div key={product.mapping_id} className={`bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-lg ${!product.is_active_locally ? 'opacity-70 grayscale-[30%]' : ''}`}>

                            {/* Product Image & Tags */}
                            <div className="h-48 bg-gray-50 relative border-b border-gray-100 overflow-hidden group">
                                {product.master_image ? (
                                    <img src={`/storage/${product.master_image}`} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <Package size={48} strokeWidth={1} />
                                    </div>
                                )}

                                <div className="absolute top-3 left-3 flex flex-col gap-2">
                                    <span className="bg-white/90 backdrop-blur text-[#1A1A2E] text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-sm border border-gray-200/50">
                                        {product.category_name || 'General'}
                                    </span>
                                    {product.available_stock <= 5 && product.available_stock > 0 && (
                                        <span className="bg-orange-500/90 backdrop-blur text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-sm">Low Stock</span>
                                    )}
                                    {product.available_stock === 0 && (
                                        <span className="bg-red-500/90 backdrop-blur text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-sm">Out of Stock</span>
                                    )}
                                </div>

                                <button
                                    onClick={() => toggleVisibility(product.mapping_id)}
                                    className={`absolute top-3 right-3 size-8 rounded-full flex items-center justify-center shadow-sm backdrop-blur transition-all ${product.is_active_locally ? 'bg-green-100/90 text-green-600 hover:bg-red-100/90 hover:text-red-600' : 'bg-gray-100/90 text-gray-500 hover:bg-green-100/90 hover:text-green-600'}`}
                                    title={product.is_active_locally ? 'Hide from Local Store' : 'Show in Local Store'}
                                >
                                    {product.is_active_locally ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                            </div>

                            {/* Product Info */}
                            <div className="p-5">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">SKU: {product.sku}</p>
                                <h3 className="font-black text-[#1A1A2E] text-lg leading-tight mb-4 truncate">{product.name}</h3>

                                <div className="grid grid-cols-2 gap-3 mb-5">
                                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><Tag size={10} /> Master MRP</p>
                                        <p className="font-black text-gray-600 mt-0.5">₹{Number(product.mrp).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><Package size={10} /> Your Stock</p>
                                        <p className="font-black text-[#1A1A2E] mt-0.5">{product.available_stock} Units</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-dashed border-gray-200">
                                    <div>
                                        <p className="text-[9px] font-black text-[#E94E3C] uppercase tracking-widest">Local Selling Price</p>
                                        <p className="font-black text-[#1A1A2E] text-xl flex items-center gap-1 mt-0.5">
                                            <IndianRupee size={16} strokeWidth={3} />
                                            {Number(product.local_selling_price || product.mrp).toLocaleString()}
                                        </p>
                                    </div>
                                    <button onClick={() => openEditModal(product)} className="text-[10px] bg-[#1A1A2E] text-white hover:bg-[#E94E3C] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all shadow-md">
                                        Edit Price
                                    </button>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>

                {products?.data?.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm mt-6">
                        <Store size={48} className="mx-auto text-gray-300 mb-4" strokeWidth={1} />
                        <h3 className="text-[#1A1A2E] font-black text-xl uppercase tracking-wider mb-2">No Products Assigned</h3>
                        <p className="text-gray-500 font-bold text-sm max-w-md mx-auto">Super Admin has not assigned any products to your franchise yet. Please raise a support ticket to request product mapping.</p>
                    </div>
                )}
            </div>

            {/* 🚀 MODAL: EDIT LOCAL PRICE */}
            <AnimatePresence>
                {editingProduct && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1A1A2E]/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#1A1A2E]">
                                <h3 className="font-black text-white uppercase tracking-wider flex items-center gap-2"><Tag size={18} /> Update Local Price</h3>
                                <button onClick={() => setEditingProduct(null)} className="text-white/50 hover:text-white transition-colors"><X size={20} /></button>
                            </div>

                            <form onSubmit={submitPriceUpdate} className="p-6 space-y-5">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center mb-2">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{editingProduct.sku}</p>
                                    <p className="font-black text-[#1A1A2E] text-sm leading-tight">{editingProduct.name}</p>
                                    <div className="mt-3 inline-block bg-white border border-gray-200 px-3 py-1 rounded-md text-[10px] font-bold text-gray-500">
                                        Master MRP: <span className="font-black text-[#1A1A2E]">₹{editingProduct.mrp}</span>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-[#E94E3C] uppercase tracking-widest ml-1">Your Local Selling Price *</label>
                                    <div className="relative">
                                        <IndianRupee size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input required type="number" step="0.01" value={data.local_selling_price} onChange={e => setData('local_selling_price', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3 font-black text-xl text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none" />
                                    </div>
                                    <p className="text-[9px] font-bold text-gray-400 ml-1 mt-1">This price will be shown to customers in your service area.</p>
                                </div>

                                <button disabled={processing} type="submit" className="w-full bg-[#E94E3C] text-white py-3.5 rounded-xl font-black uppercase tracking-widest hover:bg-[#c0392b] transition-colors mt-2 shadow-xl shadow-[#E94E3C]/20 flex items-center justify-center gap-2">
                                    {processing ? 'Saving...' : 'Save Changes'} <Save size={16} />
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </AdminLayout>
    );
}