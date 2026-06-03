import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { Heart, ShoppingBag, Truck, RotateCcw, ShieldCheck, ChevronDown, Star } from 'lucide-react';
import PremiumProductCard from '@/Components/PremiumProductCard';

export default function ProductDetail({ product, relatedProducts = [], reviews = [] }) {
    // 🚀 Strict State Management for Validation
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState('');

    const inStock = product.stock > 0 || product.in_stock;
    const hasDiscount = product.compare_at_price > product.price;
    const discountPercent = hasDiscount ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100) : 0;

    // Validation Logic Before Add to Cart
    const handleAddToCart = () => {
        setError('');
        if (product.available_sizes?.length > 0 && !selectedSize) {
            setError('Please select a size before adding to cart.');
            return;
        }
        if (product.available_colors?.length > 0 && !selectedColor) {
            setError('Please select a color before adding to cart.');
            return;
        }

        router.post('/cart/add', {
            product_id: product.id,
            size_id: selectedSize?.id,
            color_id: selectedColor?.id,
            quantity: quantity
        }, { preserveScroll: true });
    };

    return (
        <AppLayout>
            <Head title={`${product.name} | IHO STUDIO`} />

            <div className="mx-auto max-w-[1400px] px-6 py-12 lg:px-8">

                {/* 🚀 Top Section: Gallery & Buying Details */}
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">

                    {/* Left: Image Gallery */}
                    <div className="flex flex-col gap-4">
                        <div className="aspect-[4/5] w-full bg-slate-50 overflow-hidden relative">
                            {product.badge && (
                                <div className="absolute left-6 top-6 z-20 bg-[#ff3f6c] px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white">
                                    {product.badge}
                                </div>
                            )}
                            {product.image_path ? (
                                <img src={`/storage/${product.image_path}`} alt={`Main image of ${product.name}`} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-slate-300">
                                    <span className="text-xs font-black uppercase tracking-widest">No Image Available</span>
                                </div>
                            )}
                        </div>
                        {/* Thumbnails (If gallery array exists) */}
                        {product.gallery?.length > 0 && (
                            <div className="grid grid-cols-4 gap-4">
                                {product.gallery.map(img => (
                                    <div key={img.id} className="aspect-square bg-slate-50 cursor-pointer border-2 border-transparent hover:border-[#282c3f]">
                                        <img src={`/storage/${img.path}`} alt={`Thumbnail for ${product.name}`} className="h-full w-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Details & Actions */}
                    <div className="flex flex-col py-6 lg:pl-8">
                        {product.category?.name && (
                            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#ff3f6c]">
                                {product.category.name}
                            </p>
                        )}
                        <h1 className="mb-4 text-3xl font-black uppercase tracking-tighter text-[#282c3f] lg:text-5xl">
                            {product.name}
                        </h1>

                        <div className="mb-6 flex items-center gap-4">
                            <span className="text-2xl font-black text-[#282c3f]">₹{product.price}</span>
                            {hasDiscount && (
                                <>
                                    <span className="text-lg font-bold text-slate-400 line-through">MRP ₹{product.compare_at_price}</span>
                                    <span className="bg-green-100 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-green-700">
                                        {discountPercent}% OFF
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Description */}
                        <p className="mb-8 text-sm font-medium leading-relaxed text-slate-500">
                            {product.short_description || 'High-performance gear engineered for maximum output.'}
                        </p>

                        <div className="mb-8 h-[1px] w-full bg-slate-100" />

                        {/* 🚀 Validation Error Display */}
                        {error && (
                            <div className="mb-6 bg-red-50 p-4 border border-red-200 text-xs font-bold text-red-600 uppercase tracking-widest">
                                {error}
                            </div>
                        )}

                        {/* 🚀 Color Selector */}
                        {product.available_colors?.length > 0 && (
                            <div className="mb-8">
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#282c3f]">Color</span>
                                    <span className="text-[10px] font-bold text-slate-400">{selectedColor?.name || 'Select Color'}</span>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {product.available_colors.map(color => (
                                        <button
                                            key={color.id}
                                            onClick={() => setSelectedColor(color)}
                                            className={`size-10 rounded-none border-2 transition-transform ${selectedColor?.id === color.id ? 'border-[#282c3f] ring-2 ring-[#282c3f]/20 scale-110' : 'border-slate-200'}`}
                                            style={{ backgroundColor: color.hex_code }}
                                            title={color.name}
                                            aria-label={`Select ${color.name}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 🚀 Size Selector */}
                        {product.available_sizes?.length > 0 && (
                            <div className="mb-8">
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#282c3f]">Size</span>
                                    <button className="text-[10px] font-bold text-slate-400 underline uppercase tracking-widest hover:text-[#282c3f]">Size Guide</button>
                                </div>
                                <div className="grid grid-cols-4 gap-3">
                                    {product.available_sizes.map(size => (
                                        <button
                                            key={size.id}
                                            onClick={() => setSelectedSize(size)}
                                            className={`border py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${selectedSize?.id === size.id ? 'border-[#282c3f] bg-[#282c3f] text-white' : 'border-slate-200 bg-white text-[#282c3f] hover:border-[#282c3f]'}`}
                                        >
                                            {size.code}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 🚀 Quantity & Actions */}
                        <div className="mb-8 flex flex-col gap-4 sm:flex-row">
                            <div className="flex h-14 w-32 items-center justify-between border border-slate-200 bg-white px-4">
                                <button disabled={quantity <= 1 || !inStock} onClick={() => setQuantity(q => q - 1)} className="text-xl font-light disabled:opacity-30">-</button>
                                <span className="text-xs font-black">{quantity}</span>
                                <button disabled={!inStock} onClick={() => setQuantity(q => q + 1)} className="text-xl font-light disabled:opacity-30">+</button>
                            </div>
                            <button
                                onClick={handleAddToCart}
                                disabled={!inStock}
                                className="flex h-14 flex-1 items-center justify-center gap-2 bg-[#282c3f] text-xs font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#ff3f6c] disabled:bg-slate-200 disabled:text-slate-400"
                            >
                                <ShoppingBag size={16} /> {inStock ? 'Add to Cart' : 'Out of Stock'}
                            </button>
                            <button className="flex h-14 w-14 items-center justify-center border border-slate-200 bg-white text-[#282c3f] transition-colors hover:border-[#282c3f]">
                                <Heart size={20} />
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-8">
                            <div className="flex flex-col items-center gap-2 text-center">
                                <Truck size={24} strokeWidth={1.5} className="text-[#282c3f]" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Free Shipping</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 text-center border-x border-slate-100">
                                <RotateCcw size={24} strokeWidth={1.5} className="text-[#282c3f]" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">7-Day Returns</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 text-center">
                                <ShieldCheck size={24} strokeWidth={1.5} className="text-[#282c3f]" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Secure Checkout</span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* 🚀 Related Products Section */}
                {relatedProducts?.length > 0 && (
                    <div className="mt-24 border-t border-slate-100 pt-16">
                        <div className="mb-10 flex items-end justify-between">
                            <h2 className="text-2xl font-black uppercase tracking-tight text-[#282c3f]">Complete The Kit</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {relatedProducts.map(related => (
                                <PremiumProductCard key={related.id} product={related} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}