import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ChevronDown, ChevronUp, SlidersHorizontal, X } from 'lucide-react';
import PremiumProductCard from '@/Components/PremiumProductCard';

export default function Shop({ filters, products, categories = [] }) {
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [openFilterSections, setOpenFilterSections] = useState({
        categories: true,
        colors: true,
        sizes: true,
    });

    // Toggle filter accordions
    const toggleSection = (section) => {
        setOpenFilterSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const productRows = Array.isArray(products) ? products : products?.data;
    const displayProducts = productRows && productRows.length > 0 ? productRows : [
        { id: 1, name: 'Essential Boxy Tee', base_price: '2,499', category_name: 'T-Shirts', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop' },
        { id: 2, name: 'Technical Cargo Trousers', base_price: '4,999', category_name: 'Bottoms', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop' },
        { id: 3, name: 'Oversized Knit Sweater', base_price: '5,499', category_name: 'Knitwear', image: 'https://images.unsplash.com/photo-1614083321526-0e1cb2d74483?q=80&w=800&auto=format&fit=crop' },
        { id: 4, name: 'Nylon Track Jacket', base_price: '6,299', category_name: 'Outerwear', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop' },
        { id: 5, name: 'Premium Heavy Hoodie', base_price: '4,299', category_name: 'Fleece', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop' },
        { id: 6, name: 'Pleated Tailored Shorts', base_price: '3,499', category_name: 'Bottoms', image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800&auto=format&fit=crop' },
    ];

    // Filter UI Component
    const FilterSidebar = () => (
        <div className="flex flex-col gap-8 w-full">
            {/* Categories */}
            <div className="border-b border-[#E8E4D9] pb-6">
                <button onClick={() => toggleSection('categories')} className="flex justify-between items-center w-full text-sm font-black uppercase tracking-widest text-[#1A1A1A] mb-4">
                    Category {openFilterSections.categories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <AnimatePresence>
                    {openFilterSections.categories && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <ul className="flex flex-col gap-3 text-sm font-bold text-[#7A756B]">
                                {[{ name: 'All Items', slug: '' }, ...categories].map(cat => {
                                    const isActive = (filters?.category || '') === (cat.slug || '');
                                    return (
                                        <li key={cat.slug || 'all'}>
                                            <Link href={cat.slug ? `/shop?category=${cat.slug}` : '/shop'} className="flex items-center gap-3 hover:text-[#1A1A1A] transition-colors">
                                                <div className={`w-4 h-4 border ${isActive ? 'border-[#1A1A1A] bg-[#1A1A1A]' : 'border-[#A39E93]'} flex items-center justify-center rounded-sm`}>
                                                    {isActive && <div className="w-1.5 h-1.5 bg-[#F9F8F6]" />}
                                                </div>
                                                {cat.name}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Colors */}
            <div className="border-b border-[#E8E4D9] pb-6">
                <button onClick={() => toggleSection('colors')} className="flex justify-between items-center w-full text-sm font-black uppercase tracking-widest text-[#1A1A1A] mb-4">
                    Color {openFilterSections.colors ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <AnimatePresence>
                    {openFilterSections.colors && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="flex flex-wrap gap-3">
                                {['#1A1A1A', '#F9F8F6', '#4A001F', '#4A5568', '#9C4221'].map(color => (
                                    <button 
                                        key={color} 
                                        className="w-8 h-8 rounded-full border border-[#E8E4D9] hover:scale-110 transition-transform shadow-sm"
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Sizes */}
            <div className="border-b border-[#E8E4D9] pb-6">
                <button onClick={() => toggleSection('sizes')} className="flex justify-between items-center w-full text-sm font-black uppercase tracking-widest text-[#1A1A1A] mb-4">
                    Size {openFilterSections.sizes ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <AnimatePresence>
                    {openFilterSections.sizes && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="grid grid-cols-3 gap-2">
                                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                                    <button key={size} className="py-2 border border-[#E8E4D9] text-xs font-bold text-[#1A1A1A] hover:border-[#1A1A1A] transition-colors rounded-sm">
                                        {size}
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
            <Head title="Shop Collection | IHO Clothing" />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 md:py-24 min-h-screen">
                
                {/* Page Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-12 flex flex-col md:flex-row md:items-end justify-between border-b border-[#E8E4D9] pb-6 gap-6">
                    <div>
                        <nav className="mb-4 text-xs font-bold uppercase tracking-widest text-[#A39E93]">
                            <Link href="/" className="hover:text-[#1A1A1A] transition-colors">Home</Link>
                            <span className="mx-3">/</span>
                            <span className="text-[#1A1A1A]">Shop All</span>
                        </nav>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#1A1A1A] uppercase">
                            The Collection
                        </h1>
                        {filters?.search && (
                            <p className="mt-2 text-[#7A756B] text-sm font-bold uppercase tracking-widest">
                                Search results for: "{filters.search}"
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Mobile Filter Toggle */}
                        <button 
                            onClick={() => setIsMobileFilterOpen(true)}
                            className="lg:hidden flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#1A1A1A] border border-[#E8E4D9] px-4 py-2 rounded-sm"
                        >
                            <Filter size={16} /> Filters
                        </button>

                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-3">
                            <span className="hidden md:block text-xs font-bold uppercase tracking-widest text-[#A39E93]">Sort By</span>
                            <select className="bg-transparent border border-[#E8E4D9] text-sm font-bold text-[#1A1A1A] py-2 pl-4 pr-10 focus:ring-0 focus:border-[#1A1A1A] uppercase tracking-widest rounded-sm cursor-pointer outline-none appearance-none">
                                <option>Newest Arrivals</option>
                                <option>Price: Low to High</option>
                                <option>Price: High to Low</option>
                            </select>
                        </div>
                    </div>
                </motion.div>

                <div className="flex flex-col lg:flex-row gap-12">
                    
                    {/* Desktop Sidebar */}
                    <div className="hidden lg:block w-64 flex-shrink-0 sticky top-32 h-fit">
                        <div className="flex items-center gap-2 mb-8 text-[#1A1A1A]">
                            <SlidersHorizontal size={18} />
                            <span className="text-base font-black uppercase tracking-widest">Filters</span>
                        </div>
                        <FilterSidebar />
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-6 gap-y-16">
                            {displayProducts.map((product, index) => (
                                <PremiumProductCard key={product.id} product={product} index={index} />
                            ))}
                        </div>
                        
                        {/* Pagination Mockup */}
                        <div className="mt-20 border-t border-[#E8E4D9] pt-10 flex justify-center">
                            <button className="border border-[#1A1A1A] text-[#1A1A1A] px-10 py-3 text-sm font-bold uppercase tracking-widest hover:bg-[#1A1A1A] hover:text-[#F9F8F6] transition-colors rounded-sm">
                                Load More Products
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Filter Drawer */}
            <AnimatePresence>
                {isMobileFilterOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
                            onClick={() => setIsMobileFilterOpen(false)}
                        />
                        <motion.div 
                            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-[#F9F8F6] z-[70] shadow-2xl flex flex-col lg:hidden"
                        >
                            <div className="p-6 border-b border-[#E8E4D9] flex justify-between items-center bg-white">
                                <h2 className="text-xl font-black tracking-tight text-[#1A1A1A] uppercase flex items-center gap-2">
                                    <Filter size={20} /> Filters
                                </h2>
                                <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 -mr-2 text-[#7A756B] hover:text-[#1A1A1A] transition-colors">
                                    <X size={24} strokeWidth={1.5} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 bg-white">
                                <FilterSidebar />
                            </div>
                            <div className="p-6 bg-[#F3F0EA] border-t border-[#E8E4D9] flex gap-4">
                                <button className="flex-1 bg-white border border-[#1A1A1A] text-[#1A1A1A] py-3 text-sm font-bold uppercase tracking-widest rounded-sm">Clear</button>
                                <button onClick={() => setIsMobileFilterOpen(false)} className="flex-1 bg-[#1A1A1A] text-[#F9F8F6] py-3 text-sm font-bold uppercase tracking-widest rounded-sm">Apply</button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

        </AppLayout>
    );
}
