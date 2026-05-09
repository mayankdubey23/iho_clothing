import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft, Save, Image as ImageIcon, Box,
    Tag, Plus, Trash2, IndianRupee, Layers
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function CreateProduct({ categories, brands }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '', category_id: '', brand_id: '', sku: '',
        mrp: '', selling_price: '', franchise_price: '',
        fabric: '', description: '',
        is_featured: false, is_best_seller: false,
        variants: [{ size: 'M', color: 'Black', stock: 10 }], // Default 1 variant
        images: []
    });

    // Handle dynamic variants
    const addVariant = () => setData('variants', [...data.variants, { size: '', color: '', stock: 0 }]);
    const removeVariant = (index) => setData('variants', data.variants.filter((_, i) => i !== index));
    const updateVariant = (index, field, value) => {
        const newVariants = [...data.variants];
        newVariants[index][field] = value;
        setData('variants', newVariants);
    };

    const submit = (e) => {
        e.preventDefault();
        post('/franchise-superadmin/products');
    };

    return (
        <AdminLayout active="inventory">
            <Head title="Add New Product | IHO Admin" />

            <div className="max-w-5xl mx-auto pb-20 pt-6 px-4 sm:px-6">

                {/* 🚀 HEADER */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/franchise-superadmin/products" className="size-10 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                            <ArrowLeft size={18} className="text-[#1A1A2E]" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-tighter">Add New Product</h1>
                            <p className="text-gray-400 font-bold text-xs">Fill in the details to launch a new item.</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">

                    {/* 📦 BASIC INFO */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-sm font-black uppercase tracking-widest text-[#1A1A2E] mb-6 flex items-center gap-2"><Box size={18} className="text-[#E94E3C]" /> Basic Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <InputField label="Product Name *" value={data.name} onChange={e => setData('name', e.target.value)} error={errors.name} required />
                            <InputField label="Master SKU *" value={data.sku} onChange={e => setData('sku', e.target.value)} error={errors.sku} placeholder="e.g. IHO-TSH-001" required />

                            <SelectField label="Category *" value={data.category_id} onChange={e => setData('category_id', e.target.value)} error={errors.category_id} options={categories} required />
                            <SelectField label="Brand (Optional)" value={data.brand_id} onChange={e => setData('brand_id', e.target.value)} options={brands} />
                        </div>

                        <InputField label="Fabric Detail" value={data.fabric} onChange={e => setData('fabric', e.target.value)} placeholder="e.g. 100% Cotton, Dri-FIT..." />
                    </div>

                    {/* 💰 PRICING STRATEGY */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-sm font-black uppercase tracking-widest text-[#1A1A2E] mb-6 flex items-center gap-2"><IndianRupee size={18} className="text-[#E94E3C]" /> Pricing Strategy</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InputField label="MRP (₹) *" type="number" value={data.mrp} onChange={e => setData('mrp', e.target.value)} error={errors.mrp} required />
                            <InputField label="D2C Selling Price (₹) *" type="number" value={data.selling_price} onChange={e => setData('selling_price', e.target.value)} error={errors.selling_price} required />
                            <InputField label="B2B Franchise Price (₹) *" type="number" value={data.franchise_price} onChange={e => setData('franchise_price', e.target.value)} error={errors.franchise_price} required />
                        </div>
                    </div>

                    {/* 👕 VARIANTS & INITIAL STOCK */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-sm font-black uppercase tracking-widest text-[#1A1A2E] flex items-center gap-2"><Layers size={18} className="text-[#E94E3C]" /> Variants & Stock</h2>
                            <button type="button" onClick={addVariant} className="text-xs font-black uppercase tracking-widest text-blue-500 bg-blue-50 px-4 py-2 rounded-xl flex items-center gap-1 hover:bg-blue-100">
                                <Plus size={14} /> Add Variant
                            </button>
                        </div>

                        <div className="space-y-4">
                            {data.variants.map((variant, index) => (
                                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="flex-1 grid grid-cols-3 gap-4">
                                        <InputField label="Size" value={variant.size} onChange={e => updateVariant(index, 'size', e.target.value)} placeholder="S, M, L, XL" required />
                                        <InputField label="Color" value={variant.color} onChange={e => updateVariant(index, 'color', e.target.value)} placeholder="Black, Red" required />
                                        <InputField label="Initial Stock Qty" type="number" value={variant.stock} onChange={e => updateVariant(index, 'stock', e.target.value)} required />
                                    </div>
                                    {data.variants.length > 1 && (
                                        <button type="button" onClick={() => removeVariant(index)} className="mt-5 p-3 text-red-500 bg-red-50 rounded-xl hover:bg-red-100"><Trash2 size={18} /></button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 📸 SUBMIT ACTIONS */}
                    <div className="flex items-center justify-end gap-4">
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-gray-600 mr-4">
                            <input type="checkbox" checked={data.is_featured} onChange={e => setData('is_featured', e.target.checked)} className="rounded text-[#E94E3C] focus:ring-[#E94E3C] size-4" /> Feature this product
                        </label>
                        <Link href="/franchise-superadmin/products" className="px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-white transition-colors">Cancel</Link>
                        <button disabled={processing} type="submit" className="bg-[#1A1A2E] text-white px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#E94E3C] transition-all flex items-center gap-2 disabled:opacity-50">
                            <Save size={16} /> {processing ? 'Saving...' : 'Save Product'}
                        </button>
                    </div>

                </form>
            </div>
        </AdminLayout>
    );
}

// 💎 Reusable Input Components
function InputField({ label, type = "text", error, required, ...props }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
            <input type={type} required={required} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none transition-all" {...props} />
            {error && <p className="text-[10px] text-red-500 font-bold ml-1">{error}</p>}
        </div>
    );
}

function SelectField({ label, options, error, required, ...props }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
            <select required={required} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none cursor-pointer" {...props}>
                <option value="">Select an option</option>
                {options?.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
            </select>
            {error && <p className="text-[10px] text-red-500 font-bold ml-1">{error}</p>}
        </div>
    );
} 