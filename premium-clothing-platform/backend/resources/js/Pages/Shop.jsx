import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ChevronDown, ChevronUp, SlidersHorizontal, X } from 'lucide-react';
import PremiumProductCard from '@/Components/PremiumProductCard';

const colorPalette = [
    ['White', '#FFFFFF'], ['Blue', '#2563EB'], ['Black', '#000000'], ['Multi', 'linear-gradient(135deg,#ef4444 0%,#f59e0b 25%,#22c55e 50%,#3b82f6 75%,#8b5cf6 100%)'],
    ['Green', '#16A34A'], ['Grey', '#94A3B8'], ['Navy Blue', '#1E3A8A'], ['Brown', '#7C2D12'], ['Maroon', '#7F1D1D'], ['Pink', '#EC4899'],
    ['Red', '#DC2626'], ['Beige', '#D6C2A8'], ['Yellow', '#FACC15'], ['Purple', '#7C3AED'], ['Cream', '#FFF7D6'], ['Peach', '#FDBA74'],
    ['Olive', '#6B7D2A'], ['Teal', '#0F766E'], ['Off White', '#F8F4E3'], ['Orange', '#F97316'], ['Sea Green', '#2E8B57'], ['Turquoise Blue', '#06B6D4'],
    ['Lime Green', '#84CC16'], ['Mustard', '#D4A017'], ['Khaki', '#BDB76B'], ['Lavender', '#C4B5FD'], ['Coffee Brown', '#4B2E2A'], ['Rust', '#B45309'],
    ['Burgundy', '#800020'], ['Charcoal', '#36454F'], ['Mauve', '#B784A7'], ['Silver', '#C0C0C0'], ['Gold', '#D4AF37'], ['Tan', '#D2B48C'],
    ['Rose', '#F43F5E'], ['Metallic', '#8C8C8C'], ['Taupe', '#8B8589'], ['Grey Melange', '#A8A29E'], ['Camel Brown', '#C19A6B'], ['Nude', '#E3BC9A'],
    ['Violet', '#8B5CF6'], ['Fluorescent Green', '#39FF14'], ['Magenta', '#D946EF'], ['Coral', '#FF7F50'], ['Steel', '#71797E'], ['Rose Gold', '#B76E79'],
    ['Bronze', '#CD7F32'],
];

const fallbackSizes = [
    { id: 'XS', name: 'Extra Small', code: 'XS' },
    { id: 'S', name: 'Small', code: 'S' },
    { id: 'M', name: 'Medium', code: 'M' },
    { id: 'L', name: 'Large', code: 'L' },
    { id: 'XL', name: 'Extra Large', code: 'XL' },
    { id: 'XXL', name: 'Double Extra Large', code: 'XXL' },
    { id: 'FREE', name: 'Free Size', code: 'Free Size' },
];

const discountRanges = [10, 20, 30, 40, 50, 60, 70, 80];

export default function Shop({ filters = {}, products, categories = [], brands = [], colors = [], sizes = [], cms = {} }) {
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [openFilterSections, setOpenFilterSections] = useState({
        gender: true,
        categories: true,
        brands: true,
        price: true,
        colors: true,
        sizes: true,
        discount: true,
    });
    const [priceDraft, setPriceDraft] = useState({
        min_price: filters?.min_price || '',
        max_price: filters?.max_price || '',
    });

    const toggleSection = (section) => {
        setOpenFilterSections((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    const filterUrl = (updates = {}) => {
        const params = new URLSearchParams();
        Object.entries({ ...filters, ...updates }).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });
        return `/shop${params.toString() ? `?${params.toString()}` : ''}`;
    };

    const applyFilter = (updates = {}) => {
        router.get(filterUrl(updates), {}, { preserveState: true, preserveScroll: true });
    };

    const productRows = Array.isArray(products) ? products : products?.data;
    const displayProducts = productRows && productRows.length > 0 ? productRows : [];
    const colorOptions = [
        ...colors.map((color) => ({
            id: color.id || color.name,
            name: color.name,
            hex_code: color.hex_code || '#CBD5E1',
        })),
        ...colorPalette.map(([name, hex]) => ({ id: name, name, hex_code: hex })),
    ].filter((color, index, list) => color.name && list.findIndex((item) => item.name.toLowerCase() === color.name.toLowerCase()) === index);
    const sizeOptions = [
        ...sizes,
        ...fallbackSizes,
    ].filter((size, index, list) => (size.code || size.name) && list.findIndex((item) => (item.code || item.name) === (size.code || size.name)) === index);

    const allCategoryItems = categories.flatMap((cat) => [cat, ...(cat.children || [])]);
    const activeCategory = allCategoryItems.find((cat) => cat.slug === filters?.category);

    const heroTitle = cms?.shop_hero_title || 'The Collection';
    const heroSubtitle = cms?.shop_hero_subtitle || 'Engineered for peak performance.';
    const headerImage = cms?.shop_hero_bg_image ? `/storage/${cms.shop_hero_bg_image}` : '/images/hero-model.png';

    const FilterSidebar = () => (
        <div className="flex w-full flex-col gap-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <span className="text-xs font-black uppercase tracking-[0.22em] text-[#1E293B]">Filters</span>
                <Link href="/shop" className="text-[9px] font-black uppercase tracking-[0.2em] text-[#E94E3C] hover:text-[#1E293B]">
                    Clear All
                </Link>
            </div>

            <div className="border-b border-slate-200 pb-6">
                <button onClick={() => toggleSection('gender')} className="mb-4 flex w-full items-center justify-between text-xs font-black uppercase tracking-widest text-[#1E293B]">
                    Gender {openFilterSections.gender ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <AnimatePresence>
                    {openFilterSections.gender && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="grid grid-cols-2 gap-2">
                                {['men', 'women', 'unisex'].map((gender) => (
                                    <button
                                        key={gender}
                                        type="button"
                                        onClick={() => applyFilter({
                                            gender,
                                            category: '',
                                            subcategory: '',
                                            brand: '',
                                            color: '',
                                            size: '',
                                            discount: '',
                                            min_price: '',
                                            max_price: '',
                                        })}
                                        className={`border px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${filters?.gender === gender ? 'border-[#1E293B] bg-[#1E293B] text-white' : 'border-slate-200 bg-slate-50 text-[#1E293B] hover:border-[#1E293B]'}`}
                                    >
                                        {gender}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="border-b border-slate-200 pb-6">
                <button onClick={() => toggleSection('categories')} className="mb-4 flex w-full items-center justify-between text-xs font-black uppercase tracking-widest text-[#1E293B]">
                    Categories {openFilterSections.categories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <AnimatePresence>
                    {openFilterSections.categories && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <ul className="flex flex-col gap-4 pl-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                                <li>
                                    <Link href={filterUrl({ category: '', subcategory: '' })} className={`transition-colors hover:text-[#1E293B] ${!filters?.category ? 'border-l-2 border-[#E94E3C] pl-2 font-black text-[#1E293B]' : ''}`}>
                                        All Gear
                                    </Link>
                                </li>

                                {/* 🚀 Refined Category Mapping */}
                                {categories.map((cat) => {
                                    const isParentActive = activeCategory?.parent_id === cat.id || activeCategory?.id === cat.id;

                                    return (
                                        <li key={cat.id} className="flex flex-col gap-2">
                                            <Link href={filterUrl({ category: cat.slug, subcategory: '' })} className={`transition-colors hover:text-[#1E293B] ${isParentActive ? 'font-black text-[#1E293B]' : ''}`}>
                                                {cat.name}
                                            </Link>

                                            {/* Subcategories (only show when parent is active) */}
                                            <AnimatePresence>
                                                {cat.children && cat.children.length > 0 && isParentActive && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                        <ul className="ml-2 mt-2 flex flex-col gap-3 border-l-2 border-slate-100 pl-3">
                                                            {cat.children.map((subCat) => (
                                                                <li key={subCat.id}>
                                                                    <Link href={filterUrl({ category: subCat.slug, subcategory: '' })} className={`text-[10px] transition-colors hover:text-[#1E293B] ${activeCategory?.id === subCat.id ? 'font-black text-[#E94E3C]' : 'text-slate-400'}`}>
                                                                        {subCat.name}
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </li>
                                    );
                                })}
                            </ul>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {brands.length > 0 && (
                <div className="border-b border-slate-200 pb-6">
                    <button onClick={() => toggleSection('brands')} className="mb-4 flex w-full items-center justify-between text-xs font-black uppercase tracking-widest text-[#1E293B]">
                        Brands {openFilterSections.brands ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <AnimatePresence>
                        {openFilterSections.brands && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="flex flex-col gap-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                                    {brands.map((brand) => (
                                        <button
                                            key={brand.id}
                                            type="button"
                                            onClick={() => applyFilter({ brand: brand.slug || brand.name })}
                                            className={`text-left transition-colors hover:text-[#1E293B] ${filters?.brand === brand.slug || filters?.brand === brand.name ? 'border-l-2 border-[#E94E3C] pl-2 font-black text-[#1E293B]' : ''}`}
                                        >
                                            {brand.name}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            <div className="border-b border-slate-200 pb-6">
                <button onClick={() => toggleSection('price')} className="mb-4 flex w-full items-center justify-between text-xs font-black uppercase tracking-widest text-[#1E293B]">
                    Price Adjuster {openFilterSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <AnimatePresence>
                    {openFilterSections.price && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="grid grid-cols-2 gap-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                    Min
                                    <input type="number" min="0" placeholder="₹100" value={priceDraft.min_price} onChange={(e) => setPriceDraft((prev) => ({ ...prev, min_price: e.target.value }))} className="mt-2 w-full border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-black text-[#1E293B] outline-none focus:border-[#1E293B]" />
                                </label>
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                    Max
                                    <input type="number" min="0" placeholder="₹600" value={priceDraft.max_price} onChange={(e) => setPriceDraft((prev) => ({ ...prev, max_price: e.target.value }))} className="mt-2 w-full border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-black text-[#1E293B] outline-none focus:border-[#1E293B]" />
                                </label>
                            </div>
                            <button type="button" onClick={() => applyFilter(priceDraft)} className="mt-3 w-full bg-[#1E293B] py-3 text-[9px] font-black uppercase tracking-widest text-white hover:bg-[#E94E3C]">
                                Apply ₹100 - ₹600
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Colors Section */}
            {colorOptions.length > 0 && (
                <div className="border-b border-slate-200 pb-6">
                    <button onClick={() => toggleSection('colors')} className="mb-4 flex w-full items-center justify-between text-xs font-black uppercase tracking-widest text-[#1E293B]">
                        Color {openFilterSections.colors ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <AnimatePresence>
                        {openFilterSections.colors && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="grid grid-cols-2 gap-3">
                                    {colorOptions.map((color) => (
                                        <button
                                            key={color.id}
                                            type="button"
                                            title={color.name}
                                            onClick={() => applyFilter({ color: color.name })}
                                            className={`flex items-center gap-2 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-[#1E293B] ${filters?.color === color.name ? 'font-black text-[#1E293B]' : ''}`}
                                        >
                                            <span
                                                className={`h-4 w-4 shrink-0 rounded-full border border-slate-300 ${filters?.color === color.name ? 'ring-2 ring-[#1E293B]/20' : ''}`}
                                                style={{ background: color.hex_code }}
                                            />
                                            {color.name}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Sizes Section */}
            {sizeOptions.length > 0 && (
                <div className="border-b border-slate-200 pb-6">
                    <button onClick={() => toggleSection('sizes')} className="mb-4 flex w-full items-center justify-between text-xs font-black uppercase tracking-widest text-[#1E293B]">
                        Size {openFilterSections.sizes ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <AnimatePresence>
                        {openFilterSections.sizes && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="grid grid-cols-3 gap-2">
                                    {sizeOptions.map((size) => (
                                        <button
                                            key={size.id}
                                            type="button"
                                            onClick={() => applyFilter({ size: size.code })}
                                            className={`border py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${filters?.size === size.code ? 'border-[#1E293B] bg-[#1E293B] text-white' : 'border-slate-200 bg-slate-50 text-[#1E293B] hover:border-[#1E293B]'}`}
                                        >
                                            {size.code}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            <div className="border-b border-slate-200 pb-6">
                <button onClick={() => toggleSection('discount')} className="mb-4 flex w-full items-center justify-between text-xs font-black uppercase tracking-widest text-[#1E293B]">
                    Discount Range {openFilterSections.discount ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <AnimatePresence>
                    {openFilterSections.discount && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="flex flex-col gap-3">
                                {discountRanges.map((discount) => (
                                    <button
                                        key={discount}
                                        type="button"
                                        onClick={() => applyFilter({ discount })}
                                        className={`text-left text-[11px] font-bold uppercase tracking-widest transition-colors hover:text-[#1E293B] ${Number(filters?.discount) === discount ? 'border-l-2 border-[#E94E3C] pl-2 font-black text-[#1E293B]' : 'text-slate-500'}`}
                                    >
                                        {discount}% and above
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );

    return (
        <AppLayout>
            <Head title={cms?.shop_seo_title || 'The Collection | IHO STUDIO'} />

            {cms?.shop_promo_banner && (
                <div className="bg-[#E94E3C] px-4 py-2.5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-white">
                    {cms.shop_promo_banner}
                </div>
            )}

            <div className="relative flex items-center justify-center overflow-hidden border-b border-slate-800 bg-[#0F172A] py-32">
                <img src={headerImage} alt={heroTitle} className="absolute inset-0 h-full w-full object-cover object-top opacity-45" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/50 to-[#0F172A]/20" />
                <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
                    <h1 className="mb-4 text-4xl font-black uppercase tracking-tight text-white italic md:text-6xl">{heroTitle}</h1>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 md:text-sm">{heroSubtitle}</p>
                </div>
            </div>

            <div className="mx-auto min-h-screen max-w-[1400px] px-6 py-12 lg:px-8">
                <div className="mb-12 flex flex-col justify-between gap-6 border-b border-slate-200 pb-6 md:flex-row md:items-end">
                    <nav className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <Link href="/" className="transition-colors hover:text-[#1E293B]">Studio</Link>
                        <span>/</span>
                        <span className="text-[#1E293B]">{activeCategory?.name || 'Collection'}</span>
                    </nav>

                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMobileFilterOpen(true)} className="flex items-center gap-2 border border-slate-200 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#1E293B] lg:hidden">
                            <Filter size={14} /> Filters
                        </button>
                        <select value={filters?.sort || ''} onChange={(e) => applyFilter({ sort: e.target.value })} className="border border-slate-200 bg-slate-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#1E293B] outline-none">
                            <option value="">New Arrivals</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="popular">Popularity</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col gap-12 lg:flex-row">
                    <div className="sticky top-32 hidden h-fit w-64 shrink-0 lg:block">
                        <div className="mb-8 flex items-center gap-3 text-[#1E293B]">
                            <SlidersHorizontal size={16} />
                            <span className="text-xs font-black uppercase tracking-[0.2em]">Filters</span>
                        </div>
                        <FilterSidebar />
                    </div>

                    <div className="flex-1">
                        {displayProducts.length > 0 ? (
                            <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                                {displayProducts.map((product, index) => (
                                    <PremiumProductCard key={product.id} product={product} index={index} />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-slate-300 py-24 text-center">
                                <p className="mb-2 text-lg font-black uppercase tracking-tight text-[#1E293B]">No Styles Found</p>
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Try a different category, gender, size, or price filter.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isMobileFilterOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-[#0F172A]/80 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileFilterOpen(false)} />
                        <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="fixed inset-y-0 left-0 z-[70] flex w-[85%] max-w-sm flex-col bg-white shadow-2xl lg:hidden">
                            <div className="flex items-center justify-between border-b border-slate-100 bg-white p-6">
                                <h2 className="text-sm font-black uppercase tracking-widest">Filters</h2>
                                <button onClick={() => setIsMobileFilterOpen(false)}><X size={20} /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto bg-white p-6"><FilterSidebar /></div>
                            <div className="flex gap-4 border-t bg-slate-50 p-6">
                                <button onClick={() => setIsMobileFilterOpen(false)} className="flex-1 bg-[#1A1A2E] py-4 text-[10px] font-black uppercase text-white">
                                    Done
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </AppLayout>
    );
}
