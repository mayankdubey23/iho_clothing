import React, { useEffect, useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import {
    UploadCloud, X, Plus, Trash2, ChevronLeft, Image as ImageIcon, Save, AlertCircle
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function EditProduct({ product, categories = [], brands = [], colors = [], sizes = [] }) {
    const fallbackSizes = [
        { id: 'S', name: 'Small', code: 'S' },
        { id: 'M', name: 'Medium', code: 'M' },
        { id: 'L', name: 'Large', code: 'L' },
        { id: 'XL', name: 'Extra Large', code: 'XL' },
    ];
    const fallbackColors = [
        { id: 'black', name: 'Black' },
        { id: 'white', name: 'White' },
        { id: 'grey', name: 'Grey' },
        { id: 'navy', name: 'Navy' },
    ];

    const sizeOptions = sizes.length > 0 ? sizes : fallbackSizes;
    const colorOptions = colors.length > 0 ? colors : fallbackColors;

    // 🚀 Advanced Form State
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT', // 👈 IMPORTANT: Fixes the 405 MethodNotAllowed Error
        name: product.name || '',
        slug: product.slug || '',
        sku: product.sku || '',
        category_id: product.category_id || '',
        brand_id: product.brand_id || '',
        custom_brand: '', // Added for editing/adding new brands on the fly
        gender: product.gender || '',
        subcategory_slug: product.subcategory_slug || '',
        fabric_detail: product.fabric_detail || '',
        mrp: product.mrp || '',
        d2c_price: product.d2c_price || product.base_price || '',
        b2b_price: product.b2b_price || product.franchise_price || '',
        variants: product.skus?.length > 0
            ? product.skus.map(s => ({
                id: s.id,
                size: s.size,
                color: s.color,
                qty: s.qty ?? s.inventories?.find(inv => inv.franchise_id == null)?.stock_quantity ?? 0,
            }))
            : [{ size: '', color: '', qty: '' }],
        is_featured: !!product.is_featured,
        is_best_seller: !!product.is_best_seller,
        show_on_men_page: !!product.show_on_men_page,
        status: product.status || (product.is_active ? 'active' : 'inactive'),
        new_images: [],
        existing_images: product.images || [],
    });

    // Handle Subcategory Logic based on Category
    const [availableSubcategories, setAvailableSubcategories] = useState([]);

    useEffect(() => {
        if (data.category_id) {
            const selectedCat = categories.find(c => c.id == data.category_id);
            setAvailableSubcategories(selectedCat?.children || []);
        }
    }, [data.category_id, categories]);

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (data.new_images.length + data.existing_images.length + files.length > 5) {
            alert('Studio Policy: Total gallery cannot exceed 5 images.');
            return;
        }
        setData('new_images', [...data.new_images, ...files]);
    };

    const submit = (e) => {
        e.preventDefault();
        post(`/franchise-superadmin/products/${product.id}`, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout active="products">
            <Head title={`Edit ${product.name} | Super Admin`} />

            <div className="max-w-[1400px] mx-auto pb-24 px-6">

                {/* Header */}
                <div className="mb-10 mt-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <Link href="/franchise-superadmin/products" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#94A3B8] hover:text-[#1E293B] mb-4">
                            <ChevronLeft size={14} /> Back to Catalog
                        </Link>
                        <h1 className="text-3xl font-black text-[#1E293B] uppercase tracking-tighter italic border-l-4 border-[#1E293B] pl-4">
                            Edit Product: {product.name}
                        </h1>
                    </div>
                    <button onClick={submit} disabled={processing} className="flex items-center gap-3 bg-[#1A1A2E] text-white px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#E94E3C] transition-all disabled:opacity-50">
                        <Save size={16} /> {processing ? 'Updating...' : 'Apply Changes'}
                    </button>
                </div>

                <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    <div className="lg:col-span-8 space-y-10">
                        {/* Basic Info & Taxonomy */}
                        <div className="bg-white border border-slate-200 p-8 shadow-sm">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#1E293B] mb-8 border-b border-slate-100 pb-4">Taxonomy & Identity</h3>
                            <div className="grid gap-6">
                                <FormField label="Product Name *" error={errors.name}>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="form-input" />
                                </FormField>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SelectField label="Category (Parent) *" value={data.category_id} onChange={e => setData('category_id', e.target.value)} options={categories} error={errors.category_id} />
                                    <FormField label="Sub-category" error={errors.subcategory_slug}>
                                        <div className="relative">
                                            <select value={data.subcategory_slug} onChange={e => setData('subcategory_slug', e.target.value)} className="form-input appearance-none cursor-pointer w-full">
                                                <option value="">Select sub-collection...</option>
                                                <option value="t-shirts">T-Shirts & Tops</option>
                                                <option value="women-t-shirts">Women T-Shirts</option>
                                                <option value="sports-bras">Sports Bras</option>
                                                <option value="leggings">Leggings</option>
                                                <option value="premium-hoodies">Premium Hoodies</option>
                                                <option value="track-pants">Track Pants & Joggers</option>
                                                <option value="shorts">Shorts</option>
                                                <option value="gym-wear">Gym Wear</option>
                                                <option value="gym-t-shirts">Gym T-Shirts</option>
                                                <option value="compression-wear">Compression Wear</option>
                                                <option value="training-shoes">Training Shoes</option>
                                                <option value="gym-accessories">Gym Accessories</option>
                                                <option value="yoga-wear">Yoga Wear</option>
                                                <option value="running-wear">Running Wear</option>
                                                <option value="running-shoes">Running Shoes</option>
                                                <option value="shoes">Shoes</option>
                                                <option value="outerwear-jackets">Outerwear & Jackets</option>
                                                <option value="jackets">Jackets</option>
                                                <option value="accessories">Accessories</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    </FormField>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SelectField label="Brand Strategy *" value={data.brand_id} onChange={e => setData('brand_id', e.target.value)} options={brands} error={errors.brand_id} />
                                    <FormField label="Custom Brand (If not listed)" error={errors.custom_brand}>
                                        <input type="text" value={data.custom_brand} onChange={e => setData('custom_brand', e.target.value)} placeholder="Type new brand name" className="form-input bg-slate-50 italic" />
                                    </FormField>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField label="Target Gender *" error={errors.gender}>
                                        <div className="relative">
                                            <select value={data.gender} onChange={e => setData('gender', e.target.value)} className="form-input appearance-none cursor-pointer w-full">
                                                <option value="">Select Gender...</option>
                                                <option value="men">Men</option>
                                                <option value="women">Women</option>
                                                <option value="unisex">Unisex</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    </FormField>
                                    <FormField label="Fabric Detail" error={errors.fabric_detail}>
                                        <input type="text" value={data.fabric_detail} onChange={e => setData('fabric_detail', e.target.value)} className="form-input" />
                                    </FormField>
                                </div>
                            </div>
                        </div>

                        {/* Pricing Logic */}
                        <div className="bg-white border border-slate-200 p-8 shadow-sm">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#1E293B] mb-8 border-b border-slate-100 pb-4">Revenue Architecture</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField label="Retail MRP (₹) *" error={errors.mrp}>
                                    <input type="number" value={data.mrp} onChange={e => setData('mrp', e.target.value)} className="form-input" />
                                </FormField>
                                <FormField label="D2C Price (₹) *" error={errors.d2c_price}>
                                    <input type="number" value={data.d2c_price} onChange={e => setData('d2c_price', e.target.value)} className="form-input" />
                                </FormField>
                                <FormField label="B2B Franchise (₹) *" error={errors.b2b_price}>
                                    <input type="number" value={data.b2b_price} onChange={e => setData('b2b_price', e.target.value)} className="form-input bg-slate-50" />
                                </FormField>
                            </div>
                        </div>

                        {/* Variants Management */}
                        <div className="bg-white border border-slate-200 p-8 shadow-sm">
                            <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#1E293B]">Active Variants</h3>
                                <button type="button" onClick={() => setData('variants', [...data.variants, { size: '', color: '', qty: 0 }])} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#E94E3C] hover:text-[#1E293B] transition-colors"><Plus size={14} /> Add Variant</button>
                            </div>
                            <div className="space-y-4">
                                {data.variants.map((v, i) => (
                                    <div key={i} className="flex items-center gap-4 bg-slate-50 p-5 border border-slate-100 group hover:border-slate-300 transition-all">
                                        <div className="grid grid-cols-3 gap-4 flex-1">
                                            <div className="relative">
                                                <select value={v.size} onChange={e => {
                                                    const nv = [...data.variants]; nv[i].size = e.target.value; setData('variants', nv);
                                                }} className="form-input text-xs cursor-pointer appearance-none w-full" required>
                                                    <option value="">Select Size...</option>
                                                    {sizeOptions.map(s => <option key={s.id} value={s.code}>{s.name} ({s.code})</option>)}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <select value={v.color} onChange={e => {
                                                    const nv = [...data.variants]; nv[i].color = e.target.value; setData('variants', nv);
                                                }} className="form-input text-xs cursor-pointer appearance-none w-full" required>
                                                    <option value="">Select Color...</option>
                                                    {colorOptions.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                </div>
                                            </div>
                                            <input type="number" placeholder="Stock Qty" value={v.qty} onChange={e => {
                                                const nv = [...data.variants]; nv[i].qty = e.target.value; setData('variants', nv);
                                            }} className="form-input text-xs" required />
                                        </div>
                                        {data.variants.length > 1 && (
                                            <button type="button" onClick={() => setData('variants', data.variants.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-red-500 transition-colors p-2">
                                                <Trash2 size={20} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-10">
                        {/* Visual Assets */}
                        <div className="bg-white border border-slate-200 p-8 shadow-sm">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#1E293B] mb-6 border-b border-slate-100 pb-4">Studio Visuals</h3>

                            <label className="relative flex flex-col items-center justify-center w-full h-40 border-2 border-slate-300 border-dashed bg-slate-50 hover:bg-slate-100 hover:border-[#1E293B] transition-colors cursor-pointer mb-6 group">
                                <UploadCloud size={24} className="text-slate-400 mb-2 group-hover:text-[#1E293B] transition-colors" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-[#1E293B]">Add More Images</span>
                                <input type="file" multiple className="hidden" onChange={handleImageUpload} />
                            </label>

                            <div className="grid grid-cols-2 gap-3">
                                {/* Current Images */}
                                {data.existing_images.map((img, idx) => (
                                    <div key={idx} className="relative aspect-[3/4] border border-slate-200 group overflow-hidden bg-slate-100">
                                        <img src={img.image_path} className="w-full h-full object-cover" />
                                        <button type="button" className="absolute top-2 right-2 bg-white/90 p-1.5 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-[#E94E3C] hover:text-white"><X size={14} /></button>
                                        <div className="absolute bottom-0 left-0 w-full bg-[#1E293B]/90 text-white text-[7px] font-black text-center py-1.5 uppercase tracking-widest">Active</div>
                                    </div>
                                ))}
                                {/* New Previews */}
                                {data.new_images.map((file, idx) => (
                                    <div key={idx} className="relative aspect-[3/4] border border-slate-200 group overflow-hidden bg-slate-100">
                                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover opacity-60" />
                                        <button type="button" onClick={() => setData('new_images', data.new_images.filter((_, i) => i !== idx))} className="absolute top-2 right-2 bg-red-500 p-1.5 text-white hover:bg-red-600 transition-colors"><X size={14} /></button>
                                        <div className="absolute bottom-0 left-0 w-full bg-[#E94E3C]/90 text-white text-[7px] font-black text-center py-1.5 uppercase tracking-widest">Queued</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Visibility Controller */}
                        <div className="bg-white border border-slate-200 p-8 shadow-sm">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#1E293B] mb-8 border-b border-slate-100 pb-4">Storefront Controls</h3>
                            <div className="space-y-6">
                                <VisibilityToggle label="Visible on Storefront" checked={data.status === 'active'} onChange={v => setData('status', v ? 'active' : 'inactive')} />
                                <VisibilityToggle label="Feature on Homepage" checked={data.is_featured} onChange={v => setData('is_featured', v)} />
                                <VisibilityToggle label="Mark as Best Seller" checked={data.is_best_seller} onChange={v => setData('is_best_seller', v)} />
                                <VisibilityToggle label="Include in Men Collection" checked={data.show_on_men_page} onChange={v => setData('show_on_men_page', v)} />
                            </div>
                        </div>
                    </div>
                </form>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    .form-input { width: 100%; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 0.8rem 1rem; font-size: 0.8rem; font-weight: 700; color: #1E293B; outline: none; border-radius: 0; transition: all 0.2s; }
                    .form-input:focus { border-color: #0F172A; background: #FFF; box-shadow: 0 0 0 1px #0F172A; }
                `}} />
            </div>
        </AdminLayout>
    );
}

// 💎 Helpers
function FormField({ label, error, children }) {
    return (
        <label className="flex flex-col gap-2 relative">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#1E293B]">{label}</span>
            {children}
            {error && <span className="absolute -bottom-4 text-[8px] font-black text-red-500 uppercase tracking-widest">{error}</span>}
        </label>
    );
}

function SelectField({ label, value, onChange, options = [], error }) {
    return (
        <FormField label={label} error={error}>
            <div className="relative">
                <select value={value} onChange={onChange} className="form-input appearance-none cursor-pointer w-full">
                    <option value="">Select Identity...</option>
                    {options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
        </FormField>
    );
}

function VisibilityToggle({ label, checked, onChange }) {
    return (
        <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-black transition-colors">{label}</span>
            <div onClick={() => onChange(!checked)} className={`w-10 h-5 border flex items-center p-0.5 transition-colors ${checked ? 'bg-[#1E293B] border-[#1E293B]' : 'bg-white border-slate-200'}`}>
                <div className={`w-3.5 h-3.5 transition-transform ${checked ? 'translate-x-5 bg-white' : 'translate-x-0 bg-slate-200'}`} />
            </div>
        </label>
    );
}
