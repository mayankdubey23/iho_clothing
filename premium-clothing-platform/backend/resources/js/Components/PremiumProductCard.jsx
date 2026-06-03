import React, { useEffect, useState, useCallback } from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { addCartItem, buildCartItemFromProduct, imageUrl } from '@/lib/cart';
import { isWishlisted, toggleWishlistItem } from '@/lib/wishlist';

export default function PremiumProductCard({ product }) {
    if (!product) return null;

    const inStock = product.stock > 0 || product.in_stock;
    const hasDiscount = product.compare_at_price > product.price;
    const productUrl = `/product/${product.slug}`;
    const [quickAddLabel, setQuickAddLabel] = useState('Add');
    const [saved, setSaved] = useState(false);
    const mainImage = imageUrl(product.image || product.image_path || product.images?.[0]?.image_path);

    useEffect(() => {
        setSaved(isWishlisted(product.id));
        const syncWishlist = () => setSaved(isWishlisted(product.id));
        window.addEventListener('wishlist-updated', syncWishlist);
        window.addEventListener('storage', syncWishlist);
        return () => {
            window.removeEventListener('wishlist-updated', syncWishlist);
            window.removeEventListener('storage', syncWishlist);
        };
    }, [product.id]);

    // Optimized: Memoized handler
    const handleQuickAdd = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();

        const cartItem = buildCartItemFromProduct(product);
        if (!cartItem || !inStock) {
            setQuickAddLabel('Unavailable');
            window.setTimeout(() => setQuickAddLabel('Add'), 1400);
            return;
        }

        addCartItem(cartItem);
        setQuickAddLabel('Added');
        window.setTimeout(() => setQuickAddLabel('Add'), 1400);
    }, [product, inStock]);

    // Optimized: Memoized handler
    const handleWishlist = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
        const nextItems = toggleWishlistItem(product);
        setSaved(nextItems.some((item) => String(item.id) === String(product.id)));
    }, [product]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="group relative flex flex-col bg-white transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]"
        >
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-50">
                {product.badge && (
                    <div className="absolute left-4 top-4 z-20 bg-[#282c3f] px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white">
                        {product.badge}
                    </div>
                )}

                {!inStock && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-[2px]">
                        <span className="border-2 border-[#282c3f] bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-[#282c3f]">
                            Out of Stock
                        </span>
                    </div>
                )}

                <Link href={productUrl} className="absolute inset-0 z-10 block">
                    {mainImage ? (
                        <img
                            src={mainImage}
                            alt={`Image of ${product.name}`}
                            loading="lazy" // Optimized
                            decoding="async" // Optimized
                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-slate-100 text-slate-300">
                            <span className="text-[10px] font-black uppercase tracking-widest">No Image Available</span>
                        </div>
                    )}
                </Link>

                <div className="absolute bottom-0 left-0 right-0 z-30 translate-y-4 flex flex-col gap-3 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    {(product.available_sizes?.length > 0 || product.available_colors?.length > 0) && (
                        <div className="flex items-center justify-between bg-white/90 px-3 py-2 backdrop-blur-sm">
                            <div className="flex gap-1.5">
                                {product.available_colors?.slice(0, 4).map(color => (
                                    <div key={color.id} className="size-3 rounded-full border border-slate-200" style={{ backgroundColor: color.hex_code }} title={color.name} />
                                ))}
                            </div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-[#282c3f]">
                                {product.available_sizes?.slice(0, 3).map(s => s.code).join(' / ')}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button onClick={handleQuickAdd} disabled={!inStock} className="flex flex-1 items-center justify-center gap-2 bg-[#282c3f] py-3 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-[#ff3f6c] disabled:bg-slate-300">
                            <ShoppingBag size={14} /> {quickAddLabel}
                        </button>
                        <button onClick={handleWishlist} className={`flex items-center justify-center bg-white p-3 transition-colors hover:bg-slate-100 ${saved ? 'text-red-500' : 'text-[#282c3f]'}`} aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}>
                            <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col p-5">
                <div className="mb-2 flex items-start justify-between gap-4">
                    <div>
                        {product.category?.name && (
                            <p className="mb-1 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                                {product.category.name}
                            </p>
                        )}
                        <Link href={productUrl}>
                            <h3 className="text-sm font-black uppercase tracking-tight text-[#282c3f] transition-colors group-hover:text-[#ff3f6c]">
                                {product.name}
                            </h3>
                        </Link>
                    </div>
                    <Link href={productUrl} className="text-slate-300 transition-colors group-hover:text-[#282c3f]">
                        <ArrowUpRight size={18} />
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-[#282c3f]">₹{product.price}</span>
                    {hasDiscount && (
                        <span className="text-xs font-bold text-slate-400 line-through">₹{product.compare_at_price}</span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}