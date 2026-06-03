import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { ShoppingBag, Heart, Star, TrendingUp } from 'lucide-react';
import { addCartItem, buildCartItemFromProduct, imageUrl } from '@/lib/cart';
import { isWishlisted, toggleWishlistItem } from '@/lib/wishlist';

export default function BestSellers({ products = [] }) {
    // 🚀 Dynamic Tabs based on your requirement
    const categories = ['All', 'T-Shirts', 'Track Pants', 'Gym Wear', 'Footwear'];
    const [activeTab, setActiveTab] = useState('All');
    const [, setWishlistVersion] = useState(0);

    React.useEffect(() => {
        const syncWishlist = () => setWishlistVersion((version) => version + 1);
        window.addEventListener('wishlist-updated', syncWishlist);
        window.addEventListener('storage', syncWishlist);
        return () => {
            window.removeEventListener('wishlist-updated', syncWishlist);
            window.removeEventListener('storage', syncWishlist);
        };
    }, []);

    // 🚀 Fallback Data (Ensuring it matches the categories if DB is empty)
    const displayProducts = products.length > 0 ? products : [
        { id: 101, name: 'Aero-Weave Running Tee', base_price: 2499, category: 'T-Shirts', rating: 4.9, sales: 1240, image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=800&auto=format&fit=crop' },
        { id: 102, name: 'Titanium Compression Shorts', base_price: 3299, category: 'Gym Wear', rating: 5.0, sales: 980, image: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?q=80&w=800&auto=format&fit=crop' },
        { id: 103, name: 'Core Tech Track Pants', base_price: 4599, discount_price: 3999, category: 'Track Pants', rating: 4.8, sales: 1105, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop' },
        { id: 104, name: 'Ultra-Light Carbon Runners', base_price: 8999, category: 'Footwear', rating: 4.9, sales: 850, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop' },
        { id: 105, name: 'Thermal Adapt Base Layer', base_price: 3599, category: 'Gym Wear', rating: 4.7, sales: 720, image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop' },
        { id: 106, name: 'Performance Graphic Tee', base_price: 1999, category: 'T-Shirts', rating: 4.6, sales: 1500, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop' },
        { id: 107, name: 'Studio Joggers', base_price: 3899, category: 'Track Pants', rating: 4.8, sales: 640, image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=800&auto=format&fit=crop' },
        { id: 108, name: 'Apex Training Shoes', base_price: 7499, discount_price: 6999, category: 'Footwear', rating: 4.9, sales: 920, image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800&auto=format&fit=crop' },
    ];

    // Filter Logic
    const filteredProducts = displayProducts.filter(product =>
        activeTab === 'All' ? true : product.category === activeTab
    ).slice(0, 8); // Max 8 products at a time for neat grid

    const handleQuickAdd = (e, product) => {
        e.preventDefault();
        const cartItem = buildCartItemFromProduct(product);
        if (cartItem) addCartItem(cartItem);
    };

    const handleWishlist = (e, product) => {
        e.preventDefault();
        toggleWishlistItem(product);
        setWishlistVersion((version) => version + 1);
    };

    return (
        <section className="py-24 bg-white border-t border-slate-100">
            <div className="max-w-[1400px] mx-auto px-6">

                {/* ❄️ Section Header & Tabs */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
                    <div>
                        <div className="flex items-center gap-4 mb-3">
                            <div className="h-[1px] w-8 bg-[#282c3f]" />
                            <span className="text-[10px] font-black tracking-[0.4em] uppercase text-[#282c3f] flex items-center gap-2">
                                <TrendingUp size={12} strokeWidth={3} /> Top Performing Gear
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-[#282c3f] uppercase tracking-tighter italic">
                            Best Sellers
                        </h2>
                    </div>

                    {/* 🚀 Dynamic Filter Tabs */}
                    <div className="flex overflow-x-auto custom-scrollbar pb-2 md:pb-0 gap-6 md:gap-8">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveTab(category)}
                                className={`relative pb-2 text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-colors ${activeTab === category ? 'text-[#282c3f]' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {category}
                                {activeTab === category && (
                                    <motion.div
                                        layoutId="bestseller-tab"
                                        className="absolute bottom-0 left-0 w-full h-[2px] bg-[#282c3f]"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ❄️ The Filterable Product Grid */}
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 min-h-[400px]">
                    <AnimatePresence mode="popLayout">
                        {filteredProducts.map((product, index) => {
                            const price = Number(product.base_price);
                            const discountPrice = product.discount_price ? Number(product.discount_price) : null;
                            const mainImage = imageUrl(product.image || product.image_path || product.images?.[0]?.image_path)
                                || 'https://placehold.co/800x1000/f8fafc/94a3b8?text=No+Image';
                            const productUrl = product.slug ? `/product/${product.slug}` : '/shop';

                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                    key={product.id}
                                    className="group flex flex-col cursor-pointer"
                                >
                                    {/* Image Box */}
                                    <div className="relative aspect-[3/4] bg-slate-50 overflow-hidden mb-5 border border-slate-100">
                                        <Link href={productUrl} className="absolute inset-0 z-10" />
                                        <img
                                            src={mainImage}
                                            onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x1000/f8fafc/94a3b8?text=No+Image'; }}
                                            alt={product.name}
                                            className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 transition-all duration-[1.5s] ease-out scale-105 group-hover:scale-100"
                                        />

                                        {/* Badges */}
                                        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                                            <span className="bg-white border border-slate-200 text-[#282c3f] text-[8px] font-black uppercase tracking-widest px-2 py-1 shadow-sm flex items-center gap-1">
                                                <TrendingUp size={10} /> Hot
                                            </span>
                                            {discountPrice && (
                                                <span className="bg-red-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1">
                                                    Sale
                                                </span>
                                            )}
                                        </div>

                                        {/* Wishlist Button */}
                                        <button onClick={(e) => handleWishlist(e, product)} className="absolute top-4 right-4 z-20 p-2 bg-white/80 backdrop-blur-md rounded-none text-slate-400 hover:text-red-500 hover:bg-white transition-all opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
                                            <Heart size={16} strokeWidth={2} fill={isWishlisted(product.id) ? 'currentColor' : 'none'} />
                                        </button>

                                        {/* Quick Add Button */}
                                        <div className="absolute bottom-0 left-0 right-0 z-20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1]">
                                            <button
                                                onClick={(e) => handleQuickAdd(e, product)}
                                                className="w-full py-4 bg-black/90 backdrop-blur-md text-[10px] font-black tracking-[0.2em] uppercase text-white hover:bg-black transition-colors flex items-center justify-center gap-2"
                                            >
                                                <ShoppingBag size={14} strokeWidth={2} /> Quick Add
                                            </button>
                                        </div>
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex flex-col px-1">
                                        <div className="flex justify-between items-start gap-4 mb-2">
                                            <h3 className="text-xs font-black text-[#282c3f] uppercase tracking-tight leading-snug line-clamp-2">
                                                <Link href={productUrl} className="hover:text-slate-500 transition-colors">
                                                    {product.name}
                                                </Link>
                                            </h3>

                                            {/* Rating Minimalist */}
                                            <div className="flex items-center gap-1 shrink-0 bg-slate-50 border border-slate-100 px-1.5 py-0.5">
                                                <span className="text-[10px] font-bold text-[#282c3f]">{product.rating || 4.8}</span>
                                                <Star size={10} className="text-[#282c3f] fill-[#282c3f]" />
                                            </div>
                                        </div>

                                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                                            {product.category}
                                        </p>

                                        {/* Pricing Logic */}
                                        <div className="flex items-center gap-3">
                                            {discountPrice ? (
                                                <>
                                                    <span className="text-sm font-black text-red-500">₹{discountPrice.toLocaleString('en-IN')}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 line-through decoration-slate-300">₹{price.toLocaleString('en-IN')}</span>
                                                </>
                                            ) : (
                                                <span className="text-sm font-black text-[#282c3f]">₹{price.toLocaleString('en-IN')}</span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>

                {/* View All Best Sellers Button */}
                <div className="mt-12 flex justify-center">
                    <Link href="/shop?sort=bestselling" className="bg-white border border-slate-200 text-[#282c3f] px-10 py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:border-black transition-all rounded-none">
                        View All Best Sellers
                    </Link>
                </div>
            </div>
        </section>
    );
}
