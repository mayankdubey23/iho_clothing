import React, { useEffect, useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Heart, X } from 'lucide-react';
import PremiumProductCard from '@/Components/PremiumProductCard';
import { getWishlistItems, removeWishlistItem } from '@/lib/wishlist';

export default function Wishlist() {
    const [displayItems, setDisplayItems] = useState([]);

    useEffect(() => {
        setDisplayItems(getWishlistItems());
        const syncWishlist = () => setDisplayItems(getWishlistItems());
        window.addEventListener('wishlist-updated', syncWishlist);
        window.addEventListener('storage', syncWishlist);
        return () => {
            window.removeEventListener('wishlist-updated', syncWishlist);
            window.removeEventListener('storage', syncWishlist);
        };
    }, []);

    const removeItem = (id) => {
        setDisplayItems(removeWishlistItem(id));
    };

    return (
        <AppLayout>
            <Head title="My Wishlist | IHO Clothing" />

            <div className="max-w-6xl mx-auto px-6 lg:px-8 py-24 md:py-32 min-h-[70vh]">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                    className="mb-12 border-b border-[#E8E4D9] pb-6 flex justify-between items-end"
                >
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-[#1A1A1A] uppercase">Wishlist</h1>
                        <p className="mt-2 text-[#7A756B] text-sm font-bold uppercase tracking-widest">
                            {displayItems.length} Saved Items
                        </p>
                    </div>
                </motion.div>

                {displayItems.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                        className="flex flex-col items-center justify-center py-24 bg-[#F3F0EA] rounded-sm"
                    >
                        <Heart size={48} className="text-[#A39E93] mb-6" strokeWidth={1} />
                        <h2 className="text-xl font-bold text-[#1A1A1A] mb-2 uppercase tracking-widest">Nothing saved yet</h2>
                        <p className="text-[#7A756B] text-sm mb-8 text-center max-w-sm">
                            Keep track of your favorite pieces by clicking the heart icon on any product.
                        </p>
                        <Link href="/shop" className="bg-[#1A1A1A] text-[#F9F8F6] px-8 py-3.5 text-sm font-bold uppercase tracking-widest hover:bg-[#4A001F] transition-colors rounded-sm">
                            Explore Collections
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
                        {displayItems.map((product, index) => (
                            <div key={product.id} className="relative">
                                {/* Delete button absolute positioned over the card */}
                                <button onClick={() => removeItem(product.id)} className="absolute top-4 right-4 z-30 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-[#1A1A1A] hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm">
                                    <X size={14} strokeWidth={2} />
                                </button>
                                
                                <PremiumProductCard product={product} index={index} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
