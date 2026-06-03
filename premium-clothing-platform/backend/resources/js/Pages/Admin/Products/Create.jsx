import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import {
    UploadCloud, X, Plus, Trash2, ChevronLeft, Image as ImageIcon, Save, Info
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function CreateProduct({ categories = [], brands = [], colors = [], sizes = [] }) {
    const fallbackSizes = [
        { id: 'XS', name: 'Extra Small', code: 'XS' },
        { id: 'S', name: 'Small', code: 'S' },
        { id: 'M', name: 'Medium', code: 'M' },
        { id: 'L', name: 'Large', code: 'L' },
        { id: 'XL', name: 'Extra Large', code: 'XL' },
        { id: 'XXL', name: 'Double Extra Large', code: 'XXL' },
        { id: 'FREE', name: 'Free Size', code: 'Free Size' },
    ];
    const fallbackColors = [
        ['White', '#FFFFFF'], ['Blue', '#2563EB'], ['Black', '#000000'], ['Multi', '#8B5CF6'],
        ['Green', '#16A34A'], ['Grey', '#ff3f6c'], ['Navy Blue', '#1E3A8A'], ['Brown', '#7C2D12'], ['Maroon', '#7F1D1D'], ['Pink', '#EC4899'],
        ['Red', '#DC2626'], ['Beige', '#D6C2A8'], ['Yellow', '#FACC15'], ['Purple', '#7C3AED'], ['Cream', '#FFF7D6'], ['Peach', '#FDBA74'],
        ['Olive', '#6B7D2A'], ['Teal', '#0F766E'], ['Off White', '#F8F4E3'], ['Orange', '#F97316'], ['Sea Green', '#2E8B57'], ['Turquoise Blue', '#06B6D4'],
        ['Lime Green', '#84CC16'], ['Mustard', '#D4A017'], ['Khaki', '#BDB76B'], ['Lavender', '#C4B5FD'], ['Coffee Brown', '#4B2E2A'], ['Rust', '#B45309'],
        ['Burgundy', '#800020'], ['Charcoal', '#36454F'], ['Mauve', '#B784A7'], ['Silver', '#C0C0C0'], ['Gold', '#D4AF37'], ['Tan', '#D2B48C'],
        ['Rose', '#F43F5E'], ['Metallic', '#8C8C8C'], ['Taupe', '#8B8589'], ['Grey Melange', '#A8A29E'], ['Camel Brown', '#C19A6B'], ['Nude', '#E3BC9A'],
        ['Violet', '#8B5CF6'], ['Fluorescent Green', '#39FF14'], ['Magenta', '#D946EF'], ['Coral', '#FF7F50'], ['Steel', '#71797E'], ['Rose Gold', '#B76E79'],
        ['Bronze', '#CD7F32'],
    ];
    const sizeOptions = [...sizes, ...fallbackSizes]
        .filter((size, index, list) => (size.code || size.name) && list.findIndex((item) => (item.code || item.name) === (size.code || size.name)) === index);
    const colorOptions = [
        ...colors,
        ...fallbackColors.map(([name, hex_code]) => ({ id: name, name, hex_code })),
    ].filter((color, index, list) => color.name && list.findIndex((item) => item.name.toLowerCase() === color.name.toLowerCase()) === index);
    // 🚀 Master Form State aligned with Collection Page UI
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '', // Auto-generated for backend
        sku: '',
        category_id: '',
        custom_brand: '', // Custom brand text input
        brand_id: '',
        gender: '',
        subcategory_slug: '',
        fabric_detail: '',
        mrp: '',
        d2c_price: '',      // D2C Price
        b2b_price: '', // B2B Price
        variants: [{ size: '', color: '', color_hex: '#000000', qty: '' }],
        is_featured: false,
        is_best_seller: false,
        show_on_men_page: false,
        status: 'active',
        images: []
    });

    // 🔗 Auto-generate Slug from Name for SEO
    const handleNameChange = (e) => {
        const val = e.target.value;
        setData(data => ({
            ...data,
            name: val,
            slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        }));
    };

    const handleGenderChange = (value) => {
        setData((current) => ({
            ...current,
            gender: value,
            show_on_men_page: value === 'men' || value === 'unisex',
        }));
    };

    // 📸 Studio Visuals Handler (Images + videos, max 5 total)
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (data.images.length + files.length > 5) {
            alert('Studio Policy: Maximum 5 images/videos allowed per product.');
            return;
        }
        setData('images', [...data.images, ...files]);
    };

    const removeImage = (index) => {
        setData('images', data.images.filter((_, i) => i !== index));
    };

    // 👕 Variant Handlers
    const addVariant = () => {
        setData('variants', [...data.variants, { size: '', color: '', color_hex: '#000000', qty: '' }]);
    };

    const removeVariant = (index) => {
        setData('variants', data.variants.filter((_, i) => i !== index));
    };

    const handleVariantChange = (index, field, value) => {
        const newVariants = [...data.variants];
        newVariants[index][field] = value;
        if (field === 'color') {
            const matchedColor = colorOptions.find((color) => color.name.toLowerCase() === value.toLowerCase());
            if (matchedColor?.hex_code) {
                newVariants[index].color_hex = matchedColor.hex_code;
            }
        }
        setData('variants', newVariants);
    };

    // 🔄 Dynamic Subcategory Mapping based on Parent Category
    const selectedCategory = categories.find((cat) => String(cat.id) === String(data.category_id));
    const subcategories = selectedCategory?.children || [];

    // 🚀 Submit Form
    const submit = (e) => {
        e.preventDefault();
        post('/franchise-superadmin/products', {
            forceFormData: true,
            preserveScroll: true
        });
    };

    return (
        <AdminLayout active="products">
            <Head title="Create New Product | Super Admin" />

            <div className="max-w-[1400px] mx-auto pb-24 px-6">

                {/* 🏆 Header Section */}
                <div className="mb-10 mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <Link href="/franchise-superadmin/products" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#ff3f6c] hover:text-black mb-4 transition-colors">
                            <ChevronLeft size={14} /> Return to Inventory
                        </Link>
                        <h1 className="text-4xl font-black text-[#282c3f] uppercase tracking-tighter italic border-l-8 border-[#282c3f] pl-6">
                            Deploy New Product
                        </h1>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={submit} disabled={processing} className="bg-[#282c3f] text-white px-10 py-5 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#ff3f6c] transition-all flex items-center gap-3 shadow-xl disabled:opacity-50">
                            <Save size={18} /> {processing ? 'UPLOADING ASSETS...' : 'PUSH TO STOREFRONT'}
                        </button>
                    </div>
                </div>

                <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* ⬅️ LEFT COLUMN: Taxonomy & Pricing */}
                    <div className="lg:col-span-8 space-y-10">

                        {/* Section 1: Taxonomy & Identity */}
                        <div className="bg-white border border-slate-200 p-10 shadow-sm">
                            <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-[#282c3f] mb-10 border-b border-slate-100 pb-5 flex items-center gap-3">
                                <Info size={16} /> Taxonomy & Identity
                            </h3>

                            <div className="grid gap-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <FormField label="Product Name *" error={errors.name}>
                                        <input type="text" value={data.name} onChange={handleNameChange} placeholder="e.g. Aero-Weave Running Tee" className="form-input" />
                                    </FormField>
                                    <FormField label="Auto-Generated URL Slug" error={errors.slug}>
                                        <input type="text" value={data.slug} readOnly className="form-input bg-slate-50 text-slate-400 outline-none" />
                                    </FormField>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <FormField label="Master SKU *" error={errors.sku}>
                                        <input type="text" value={data.sku} onChange={e => setData('sku', e.target.value.toUpperCase())} placeholder="IHO-RUN-001" className="form-input uppercase" />
                                    </FormField>
                                    <FormField label="Fabric Detail" error={errors.fabric_detail}>
                                        <input type="text" value={data.fabric_detail} onChange={e => setData('fabric_detail', e.target.value)} placeholder="e.g. 90% Polyester, 10% Spandex" className="form-input" />
                                    </FormField>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <SelectField label="Parent Category *" value={data.category_id} onChange={e => setData('category_id', e.target.value)} options={categories} error={errors.category_id} />
                                    <SelectField label="Select Brand" value={data.brand_id} onChange={e => setData('brand_id', e.target.value)} options={brands} error={errors.brand_id} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <FormField label="Custom Brand (If not listed)" error={errors.custom_brand}>
                                        <input type="text" value={data.custom_brand} onChange={e => setData('custom_brand', e.target.value)} placeholder="Enter Brand Name" className="form-input bg-slate-50 italic" />
                                    </FormField>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField label="Gender *" error={errors.gender}>
                                            <select value={data.gender} onChange={e => handleGenderChange(e.target.value)} className="form-input appearance-none cursor-pointer" required>
                                                <option value="">Select...</option>
                                                <option value="men">Men</option>
                                                <option value="women">Women</option>
                                                <option value="unisex">Unisex - shows in Men & Women</option>
                                            </select>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                                Unisex products are automatically included in both Men and Women shop filters.
                                            </p>
                                        </FormField>
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
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Pricing Strategy */}
                        <div className="bg-white border border-slate-200 p-10 shadow-sm">
                            <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-[#282c3f] mb-10 border-b border-slate-100 pb-5">
                                Pricing Strategy
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <FormField label="MRP (₹) *" error={errors.mrp}>
                                    <input type="number" value={data.mrp} onChange={e => setData('mrp', e.target.value)} placeholder="2999" className="form-input" />
                                </FormField>
                                <FormField label="D2C Selling Price (₹) *" error={errors.d2c_price}>
                                    <input type="number" value={data.d2c_price} onChange={e => setData('d2c_price', e.target.value)} placeholder="2499" className="form-input" />
                                </FormField>
                                <FormField label="B2B Franchise Price (₹) *" error={errors.b2b_price}>
                                    <input type="number" value={data.b2b_price} onChange={e => setData('b2b_price', e.target.value)} placeholder="1800" className="form-input bg-red-50/50 border-red-100 focus:border-[#ff3f6c]" />
                                </FormField>
                            </div>
                        </div>

                        {/* Section 3: Variants & Master Stock */}
                        <div className="bg-white border border-slate-200 p-10 shadow-sm">
                            <div className="flex justify-between items-center mb-10 border-b border-slate-100 pb-5">
                                <div>
                                    <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-[#282c3f]">Variants & Master Stock</h3>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manual SKU creation override</p>
                                </div>
                                <button type="button" onClick={addVariant} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#ff3f6c] hover:text-[#282c3f] transition-colors">
                                    <Plus size={16} strokeWidth={3} /> Add Variant
                                </button>
                            </div>
                            <div className="space-y-4">
                                {data.variants.map((v, i) => (
                                    <div key={i} className="flex items-center gap-4 bg-slate-50 p-5 border border-slate-100 group hover:border-slate-300 transition-all">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                                            <select value={v.size} onChange={e => handleVariantChange(i, 'size', e.target.value)} className="form-input text-xs cursor-pointer" required>
                                                <option value="">Select Size...</option>
                                                {sizeOptions.map(s => <option key={s.id} value={s.code}>{s.name} ({s.code})</option>)}
                                            </select>
                                            <div>
                                                <input
                                                    list={`color-options-${i}`}
                                                    value={v.color}
                                                    onChange={e => handleVariantChange(i, 'color', e.target.value)}
                                                    placeholder="Select or type color..."
                                                    className="form-input text-xs"
                                                    required
                                                />
                                                <datalist id={`color-options-${i}`}>
                                                    {colorOptions.map(c => <option key={c.id} value={c.name} />)}
                                                </datalist>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="color"
                                                    value={v.color_hex || '#000000'}
                                                    onChange={e => handleVariantChange(i, 'color_hex', e.target.value)}
                                                    className="h-12 w-14 shrink-0 cursor-pointer border border-slate-200 bg-white p-1"
                                                    title="Color code"
                                                />
                                                <input
                                                    type="text"
                                                    value={v.color_hex || ''}
                                                    onChange={e => handleVariantChange(i, 'color_hex', e.target.value)}
                                                    placeholder="#000000"
                                                    className="form-input text-xs uppercase"
                                                    pattern="^#[0-9A-Fa-f]{6}$"
                                                />
                                            </div>
                                            <input type="number" placeholder="Stock Qty" value={v.qty} onChange={e => handleVariantChange(i, 'qty', e.target.value)} className="form-input text-xs" required />
                                        </div>
                                        {data.variants.length > 1 && (
                                            <button type="button" onClick={() => removeVariant(i)} className="text-slate-300 hover:text-red-500 transition-colors p-2">
                                                <Trash2 size={20}/>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {errors.variants && <p className="mt-4 text-[9px] font-black text-red-500 tracking-widest uppercase">{errors.variants}</p>}
                        </div>
                    </div>

                    {/* ➡️ RIGHT COLUMN: Images & Storefront Visibility */}
                    <div className="lg:col-span-4 space-y-10">

                        {/* Studio Visuals */}
                        <div className="bg-white border border-slate-200 p-10 shadow-sm">
                            <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-[#282c3f] mb-8 border-b border-slate-100 pb-5">Studio Visuals *</h3>

                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-slate-300 border-dashed bg-slate-50 hover:bg-slate-100 hover:border-[#282c3f] transition-all cursor-pointer group mb-8">
                                <UploadCloud size={32} className="text-slate-300 group-hover:text-[#282c3f] mb-3 transition-colors" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#282c3f] mb-1">Click or drag images/videos</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">PNG, JPG, WEBP, MP4, WEBM, MOV up to 50MB</span>
                                <input type="file" multiple accept="image/*,video/mp4,video/webm,video/quicktime" className="hidden" onChange={handleImageUpload} />
                            </label>
                            {errors.images && <p className="text-[9px] text-red-500 font-black tracking-widest uppercase mb-4">{errors.images}</p>}

                            {data.images.length > 0 ? (
                                <div className="grid grid-cols-2 gap-4">
                                    {data.images.map((file, idx) => (
                                        <div key={idx} className="relative aspect-[3/4] border border-slate-200 group overflow-hidden bg-slate-100">
                                            {file.type.startsWith('video/') ? (
                                                <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" muted controls />
                                            ) : (
                                                <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="preview" />
                                            )}
                                            <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 bg-white text-red-500 p-1.5 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#ff3f6c] hover:text-white">
                                                <X size={14} />
                                            </button>
                                            <span className="absolute bottom-0 left-0 w-full bg-[#282c3f] text-white text-[8px] font-black text-center py-2 uppercase tracking-widest">
                                                {file.type.startsWith('video/') ? 'Product Video' : idx === 0 ? 'Main Cover' : 'Image'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 p-4 border border-slate-100">
                                    <ImageIcon size={14} /> No media selected yet
                                </div>
                            )}
                        </div>

                        {/* Visibility Controls */}
                        <div className="bg-white border border-slate-200 p-10 shadow-sm">
                            <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-[#282c3f] mb-10 border-b border-slate-100 pb-5">Visibility Attributes</h3>
                            <div className="space-y-8">
                                <ToggleButton label="Feature this Product" sub="Appears in hero highlights" checked={data.is_featured} onChange={v => setData('is_featured', v)} />
                                <ToggleButton label="Include in Men Collection" sub="Auto-on for Men and Unisex products" checked={data.show_on_men_page} onChange={v => setData('show_on_men_page', v)} />
                                <ToggleButton label="Best Seller" sub="Adds Best Seller badge" checked={data.is_best_seller} onChange={v => setData('is_best_seller', v)} />
                                <ToggleButton label="Visible on Storefront" sub="Live to Customers" checked={data.status === 'active'} onChange={v => setData('status', v ? 'active' : 'inactive')} />
                            </div>

                            <div className="mt-12 pt-10 border-t border-slate-100 flex flex-col gap-4">
                                <button type="submit" disabled={processing} className="w-full bg-[#282c3f] text-white py-5 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#ff3f6c] transition-all disabled:opacity-50">
                                    {processing ? 'UPLOADING ASSETS...' : 'SAVE PRODUCT'}
                                </button>
                                <Link href="/franchise-superadmin/products" className="w-full text-center border border-slate-200 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-[#282c3f] hover:border-[#282c3f] transition-colors">
                                    Cancel & Return
                                </Link>
                            </div>
                        </div>
                    </div>
                </form>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    .form-input { 
                        width: 100%; 
                        background: #f5f5f6; 
                        border: 1px solid #fff0f4; 
                        padding: 1rem 1.25rem; 
                        font-size: 0.875rem; 
                        font-weight: 700; 
                        color: #282c3f; 
                        outline: none; 
                        border-radius: 0; 
                        transition: all 0.3s; 
                    }
                    .form-input:focus { 
                        border-color: #282c3f; 
                        background: #FFFFFF; 
                        box-shadow: 0 0 0 1px #282c3f; 
                    }
                    .form-input::placeholder {
                        color: #ffe1e8;
                        font-weight: 500;
                    }
                `}} />
            </div>
        </AdminLayout>
    );
}

// 💎 Helper Components
function FormField({ label, error, children }) {
    return (
        <label className="flex flex-col gap-3 relative">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#282c3f]">{label}</span>
            {children}
            {error && <span className="absolute -bottom-5 text-[9px] font-black text-red-500 uppercase tracking-widest">{error}</span>}
        </label>
    );
}

function SelectField({ label, value, onChange, options = [], error }) {
    return (
        <FormField label={label} error={error}>
            <div className="relative">
                <select value={value} onChange={onChange} className="form-input appearance-none cursor-pointer w-full">
                    <option value="">Select option...</option>
                    {options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
        </FormField>
    );
}

function ToggleButton({ label, sub, checked, onChange }) {
    return (
        <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#282c3f] group-hover:text-black transition-colors">{label}</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{sub}</span>
            </div>
            <div onClick={() => onChange(!checked)} className={`w-12 h-6 border flex items-center p-1 transition-all ${checked ? 'bg-[#282c3f] border-[#282c3f]' : 'bg-white border-slate-300'}`}>
                <div className={`w-4 h-4 transition-transform ${checked ? 'translate-x-6 bg-white' : 'translate-x-0 bg-slate-200'}`} />
            </div>
        </label>
    );
}
