import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft, Image as ImageIcon, Plus, Trash2, UploadCloud } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function EditProduct({ product, categories = [], brands = [], sizes = [], colors = [] }) {
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

    const defaultSubcategories = [
        { slug: 't-shirts', name: 'T-Shirts & Tops' },
        { slug: 'women-t-shirts', name: 'Women T-Shirts' },
        { slug: 'sports-bras', name: 'Sports Bras' },
        { slug: 'leggings', name: 'Leggings' },
        { slug: 'premium-hoodies', name: 'Premium Hoodies' },
        { slug: 'track-pants', name: 'Track Pants & Joggers' },
        { slug: 'shorts', name: 'Shorts' },
        { slug: 'gym-wear', name: 'Gym Wear' },
        { slug: 'gym-t-shirts', name: 'Gym T-Shirts' },
        { slug: 'compression-wear', name: 'Compression Wear' },
        { slug: 'training-shoes', name: 'Training Shoes' },
        { slug: 'gym-accessories', name: 'Gym Accessories' },
        { slug: 'yoga-wear', name: 'Yoga Wear' },
        { slug: 'running-wear', name: 'Running Wear' },
        { slug: 'running-shoes', name: 'Running Shoes' },
        { slug: 'shoes', name: 'Shoes' },
        { slug: 'outerwear-jackets', name: 'Outerwear & Jackets' },
        { slug: 'jackets', name: 'Jackets' },
        { slug: 'accessories', name: 'Accessories' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        name: product.name || '',
        sku: product.sku || '',
        category_id: product.category_id || '',
        brand_id: product.brand_id || '',
        custom_brand: '',
        gender: product.gender || '',
        subcategory_slug: product.subcategory_slug || '',
        fabric_detail: product.fabric_detail || '',
        mrp: product.mrp || '',
        d2c_price: product.d2c_price || product.base_price || '',
        b2b_price: product.b2b_price || product.franchise_price || '',
        variants: product.variants?.length
            ? product.variants.map((variant) => ({
                id: variant.id,
                size: variant.size || '',
                color: variant.color || '',
                color_hex: colorOptions.find((color) => color.name === variant.color)?.hex_code || '#000000',
                qty: variant.qty ?? '',
            }))
            : [{ size: '', color: '', color_hex: '#000000', qty: '' }],
        is_featured: Boolean(product.is_featured),
        is_best_seller: Boolean(product.is_best_seller),
        show_on_men_page: Boolean(product.show_on_men_page),
        status: product.status || (product.is_active ? 'active' : 'inactive'),
        images: [],
        remove_media_ids: [],
    });

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);

        if (data.images.length + files.length > 5) {
            alert('You can upload a maximum of 5 new images/videos at a time.');
            return;
        }

        setData('images', [...data.images, ...files]);
    };

    const removeImage = (index) => {
        setData('images', data.images.filter((_, i) => i !== index));
    };

    const toggleRemoveMedia = (id) => {
        const selected = data.remove_media_ids.includes(id);
        setData('remove_media_ids', selected
            ? data.remove_media_ids.filter((mediaId) => mediaId !== id)
            : [...data.remove_media_ids, id]
        );
    };

    const addVariant = () => {
        setData('variants', [...data.variants, { size: '', color: '', color_hex: '#000000', qty: '' }]);
    };

    const handleGenderChange = (value) => {
        setData((current) => ({
            ...current,
            gender: value,
            show_on_men_page: value === 'men' || value === 'unisex',
        }));
    };

    const selectedCategory = categories.find((cat) => String(cat.id) === String(data.category_id));
    const categorySubcategories = selectedCategory?.children || [];
    const subcategories = [
        ...categorySubcategories.map((subCat) => ({
            slug: subCat.slug,
            name: subCat.name,
        })),
        ...defaultSubcategories,
    ].filter((subCat, index, list) => subCat.slug && list.findIndex((item) => item.slug === subCat.slug) === index);

    const submit = (e) => {
        e.preventDefault();
        post(`/franchise-superadmin/products/${product.id}`, {
            forceFormData: true,
        });
    };

    return (
        <AdminLayout active="products">
            <Head title={`Edit ${product.name} | Super Admin`} />

            <div className="max-w-7xl mx-auto pb-24">
                <div className="mb-10">
                    <Link href="/franchise-superadmin/products" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#ff3f6c] hover:text-[#282c3f] transition-colors mb-6">
                        <ChevronLeft size={14} /> Back to Inventory
                    </Link>
                    <h1 className="text-3xl font-black text-[#282c3f] uppercase tracking-tighter italic border-l-4 border-[#282c3f] pl-4">
                        Edit Product
                    </h1>
                    <p className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#ff3f6c]">
                        Update product details, pricing, visibility and master stock
                    </p>
                </div>

                <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-10">
                        <div className="bg-white border border-slate-200 p-8 shadow-sm">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#282c3f] mb-8 border-b border-slate-100 pb-4">
                                Basic Information
                            </h3>
                            <div className="grid gap-6">
                                <FormField label="Product Name *" error={errors.name}>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="form-input" />
                                </FormField>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField label="Master SKU *" error={errors.sku}>
                                        <input type="text" value={data.sku} onChange={e => setData('sku', e.target.value.toUpperCase())} className="form-input uppercase" />
                                    </FormField>
                                    <FormField label="Fabric Detail" error={errors.fabric_detail}>
                                        <input type="text" value={data.fabric_detail} onChange={e => setData('fabric_detail', e.target.value)} className="form-input" />
                                    </FormField>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SelectField label="Category *" value={data.category_id} onChange={e => setData('category_id', e.target.value)} options={categories} error={errors.category_id} />
                                    <SelectField label="Brand *" value={data.brand_id} onChange={e => setData('brand_id', e.target.value)} options={brands} error={errors.brand_id} />
                                </div>
                                <FormField label="Custom Brand" error={errors.custom_brand}>
                                    <input type="text" value={data.custom_brand} onChange={e => setData('custom_brand', e.target.value)} placeholder="Add brand if not listed" className="form-input" />
                                </FormField>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField label="Gender *" error={errors.gender}>
                                        <select value={data.gender} onChange={e => handleGenderChange(e.target.value)} className="form-input" required>
                                            <option value="">Select gender...</option>
                                            <option value="men">Men</option>
                                            <option value="women">Women</option>
                                            <option value="unisex">Unisex - shows in Men & Women</option>
                                        </select>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                            Unisex products are automatically included in both Men and Women shop filters.
                                        </p>
                                    </FormField>
                                    <FormField label="Sub-category" error={errors.subcategory_slug}>
                                        <select value={data.subcategory_slug} onChange={e => setData('subcategory_slug', e.target.value)} className="form-input">
                                            <option value="">Select subcategory...</option>
                                            {subcategories.map((subCat) => (
                                                <option key={subCat.slug} value={subCat.slug}>{subCat.name}</option>
                                            ))}
                                        </select>
                                    </FormField>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 p-8 shadow-sm">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#282c3f] mb-8 border-b border-slate-100 pb-4">
                                Pricing Strategy
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField label="MRP *" error={errors.mrp}>
                                    <input type="number" value={data.mrp} onChange={e => setData('mrp', e.target.value)} className="form-input" />
                                </FormField>
                                <FormField label="D2C Selling Price *" error={errors.d2c_price}>
                                    <input type="number" value={data.d2c_price} onChange={e => setData('d2c_price', e.target.value)} className="form-input" />
                                </FormField>
                                <FormField label="B2B Franchise Price *" error={errors.b2b_price}>
                                    <input type="number" value={data.b2b_price} onChange={e => setData('b2b_price', e.target.value)} className="form-input bg-slate-50 focus:bg-white" />
                                </FormField>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 p-8 shadow-sm">
                            <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#282c3f]">
                                    Variants & Master Stock
                                </h3>
                                <button type="button" onClick={addVariant} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#282c3f] hover:text-[#ff3f6c] transition-colors">
                                    <Plus size={14} strokeWidth={3} /> Add Variant
                                </button>
                            </div>

                            <div className="space-y-4">
                                {data.variants.map((v, i) => (
                                    <div key={i} className="flex items-center gap-4 bg-slate-50 p-5 border border-slate-100 group hover:border-slate-300 transition-all">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                                            <select
                                                value={v.size}
                                                onChange={e => {
                                                    const newVariants = [...data.variants];
                                                    newVariants[i].size = e.target.value;
                                                    setData('variants', newVariants);
                                                }}
                                                className="form-input text-xs cursor-pointer"
                                                required
                                            >
                                                <option value="">Select Size...</option>
                                                {sizeOptions.map(s => (
                                                    <option key={s.id} value={s.code}>{s.name} ({s.code})</option>
                                                ))}
                                            </select>

                                            <div>
                                                <input
                                                    list={`edit-color-options-${i}`}
                                                    value={v.color}
                                                    onChange={e => {
                                                        const newVariants = [...data.variants];
                                                        newVariants[i].color = e.target.value;
                                                        const matchedColor = colorOptions.find((color) => color.name.toLowerCase() === e.target.value.toLowerCase());
                                                        if (matchedColor?.hex_code) {
                                                            newVariants[i].color_hex = matchedColor.hex_code;
                                                        }
                                                        setData('variants', newVariants);
                                                    }}
                                                    placeholder="Select or type color..."
                                                    className="form-input text-xs"
                                                    required
                                                />
                                                <datalist id={`edit-color-options-${i}`}>
                                                    {colorOptions.map(c => (
                                                        <option key={c.id} value={c.name} />
                                                    ))}
                                                </datalist>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="color"
                                                    value={v.color_hex || '#000000'}
                                                    onChange={e => {
                                                        const newVariants = [...data.variants];
                                                        newVariants[i].color_hex = e.target.value;
                                                        setData('variants', newVariants);
                                                    }}
                                                    className="h-12 w-14 shrink-0 cursor-pointer border border-slate-200 bg-white p-1"
                                                    title="Color code"
                                                />
                                                <input
                                                    type="text"
                                                    value={v.color_hex || ''}
                                                    onChange={e => {
                                                        const newVariants = [...data.variants];
                                                        newVariants[i].color_hex = e.target.value;
                                                        setData('variants', newVariants);
                                                    }}
                                                    placeholder="#000000"
                                                    className="form-input text-xs uppercase"
                                                    pattern="^#[0-9A-Fa-f]{6}$"
                                                />
                                            </div>

                                            <input
                                                type="number"
                                                placeholder="Stock Qty"
                                                value={v.qty}
                                                onChange={e => {
                                                    const newVariants = [...data.variants];
                                                    newVariants[i].qty = e.target.value;
                                                    setData('variants', newVariants);
                                                }}
                                                className="form-input text-xs"
                                                required
                                            />
                                        </div>
                                        {data.variants.length > 1 && (
                                            <button type="button" onClick={() => setData('variants', data.variants.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-red-500 transition-colors p-2">
                                                <Trash2 size={20}/>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-10">
                        <div className="bg-white border border-slate-200 p-8 shadow-sm">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#282c3f] mb-6 border-b border-slate-100 pb-4">
                                Studio Visuals
                            </h3>

                            {product.images?.length > 0 && (
                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    {product.images.map((image) => (
                                        <div key={image.id} className={`relative aspect-[3/4] bg-slate-100 border border-slate-200 overflow-hidden ${data.remove_media_ids.includes(image.id) ? 'opacity-40 ring-2 ring-red-500' : ''}`}>
                                            {(image.media_type || 'image') === 'video' ? (
                                                <video src={`/storage/${image.image_path}`} className="w-full h-full object-cover" muted controls />
                                            ) : (
                                                <img src={`/storage/${image.image_path}`} alt={product.name} className="w-full h-full object-cover" />
                                            )}
                                            <button type="button" onClick={() => toggleRemoveMedia(image.id)} className="absolute top-2 right-2 bg-white px-2 py-1 text-[8px] font-black uppercase tracking-widest text-red-500 shadow">
                                                {data.remove_media_ids.includes(image.id) ? 'Undo' : 'Remove'}
                                            </button>
                                            {image.is_primary && (
                                                <span className="absolute bottom-0 left-0 w-full bg-[#282c3f] text-white text-[8px] font-black text-center py-1 uppercase tracking-widest">Main</span>
                                            )}
                                            {(image.media_type || 'image') === 'video' && (
                                                <span className="absolute bottom-0 left-0 w-full bg-black text-white text-[8px] font-black text-center py-1 uppercase tracking-widest">Video</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <label className="relative flex flex-col items-center justify-center w-full h-40 border-2 border-slate-300 border-dashed bg-slate-50 hover:bg-slate-100 hover:border-[#282c3f] transition-colors cursor-pointer group mb-6">
                                <UploadCloud size={28} className="text-slate-400 group-hover:text-[#282c3f] transition-colors mb-3" strokeWidth={1.5} />
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#282c3f] mb-1">Add more images/videos</p>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">PNG, JPG, WEBP, MP4, WEBM, MOV up to 50MB</p>
                                <input type="file" multiple accept="image/*,video/mp4,video/webm,video/quicktime" onChange={handleImageUpload} className="hidden" />
                            </label>
                            {errors.images && <p className="text-[9px] text-red-500 font-black tracking-widest uppercase mb-4">{errors.images}</p>}

                            {data.images.length > 0 ? (
                                <div className="grid grid-cols-3 gap-3">
                                    {data.images.map((file, index) => (
                                        <div key={index} className="relative aspect-[3/4] bg-slate-100 border border-slate-200 group overflow-hidden">
                                            {file.type.startsWith('video/') ? (
                                                <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" muted controls />
                                            ) : (
                                                <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                                            )}
                                            <button type="button" onClick={() => removeImage(index)} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                <Trash2 size={14} />
                                            </button>
                                            <span className="absolute bottom-0 left-0 w-full bg-[#282c3f] text-white text-[8px] font-black text-center py-1 uppercase tracking-widest">
                                                {file.type.startsWith('video/') ? 'New Video' : 'New Image'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                    <ImageIcon size={14} /> No new media selected
                                </div>
                            )}
                        </div>

                        <div className="bg-white border border-slate-200 p-8 shadow-sm">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#282c3f] mb-6 border-b border-slate-100 pb-4">
                                Visibility
                            </h3>
                            <label className="flex items-start gap-3 cursor-pointer group mb-5">
                                <input type="checkbox" checked={data.is_featured} onChange={e => setData('is_featured', e.target.checked)} className="mt-0.5 rounded-none text-black border-slate-300 focus:ring-black size-4 transition-all" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#282c3f]">Feature this product</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer group mb-5">
                                <input type="checkbox" checked={data.show_on_men_page} onChange={e => setData('show_on_men_page', e.target.checked)} className="mt-0.5 rounded-none text-black border-slate-300 focus:ring-black size-4 transition-all" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#282c3f]">Include in Men collection</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer group mb-5">
                                <input type="checkbox" checked={data.is_best_seller} onChange={e => setData('is_best_seller', e.target.checked)} className="mt-0.5 rounded-none text-black border-slate-300 focus:ring-black size-4 transition-all" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#282c3f]">Best seller</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer group mb-10">
                                <input type="checkbox" checked={data.status === 'active'} onChange={e => setData('status', e.target.checked ? 'active' : 'inactive')} className="mt-0.5 rounded-none text-black border-slate-300 focus:ring-black size-4 transition-all" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#282c3f]">Visible on storefront</span>
                            </label>

                            <div className="space-y-4">
                                <button type="submit" disabled={processing} className="w-full bg-[#000000] text-white py-5 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#282c3f] transition-all disabled:opacity-50 shadow-xl shadow-black/10">
                                    {processing ? 'Saving...' : 'Update Product'}
                                </button>
                                <Link href="/franchise-superadmin/products" className="w-full block text-center bg-white border border-slate-200 text-[#282c3f] py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:border-black transition-all">
                                    Cancel
                                </Link>
                            </div>
                        </div>
                    </div>
                </form>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    .form-input {
                        width: 100%;
                        background-color: #f5f5f6;
                        border: 1px solid #fff0f4;
                        padding: 0.875rem 1.25rem;
                        font-size: 0.875rem;
                        font-weight: 700;
                        color: #282c3f;
                        outline: none;
                        transition: all 0.3s ease;
                    }
                    .form-input:focus {
                        border-color: #000000;
                        box-shadow: 0 0 0 1px #000000;
                        background-color: #FFFFFF;
                    }
                `}} />
            </div>
        </AdminLayout>
    );
}

function FormField({ label, error, children }) {
    return (
        <label className="grid gap-2 relative">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#282c3f]">{label}</span>
            {children}
            {error && <span className="absolute -bottom-5 left-0 text-[9px] font-black tracking-widest text-red-500 uppercase">{error}</span>}
        </label>
    );
}

function SelectField({ label, value, onChange, options = [], error }) {
    return (
        <div className="space-y-2 relative">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#282c3f]">{label}</label>
            <select value={value} onChange={onChange} className="form-input appearance-none cursor-pointer">
                <option value="" disabled className="text-slate-400">Select an option...</option>
                {options.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
            </select>
            {error && <span className="absolute -bottom-5 left-0 text-[9px] font-black tracking-widest text-red-500 uppercase">{error}</span>}
        </div>
    );
}
