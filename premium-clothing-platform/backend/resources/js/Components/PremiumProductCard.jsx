import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { ShoppingBag } from 'lucide-react';
import { addCartItem } from '@/lib/cart';

export default function PremiumProductCard({ product, index }) {
    const primarySku = product?.skus?.find((sku) => Number(sku.inventory?.stock_quantity || 0) > 0) || product?.skus?.[0];
    const image = product?.image || product?.images?.[0]?.image_path || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop';
    const categoryName = product?.category_name || product?.category?.name || 'Collection';
    const canAddToCart = Boolean(product?.id && primarySku?.id);

    const handleQuickAdd = (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!canAddToCart) return;

        addCartItem({
            id: primarySku.id,
            product_id: product.id,
            sku_id: primarySku.id,
            name: product.name,
            size: primarySku.size || 'Default',
            color: primarySku.color || 'Default',
            price: Number(product.base_price || 0),
            quantity: 1,
            image,
        });
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 },
        },
    };

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="group relative flex flex-col cursor-pointer"
        >
            <div className="relative overflow-hidden bg-[#F3F0EA] aspect-[3/4] mb-5 rounded-sm">
                <motion.img
                    src={image}
                    alt={product?.name || 'Product'}
                    className="object-cover w-full h-full transition-transform duration-1000 ease-out group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="absolute bottom-4 left-4 right-4 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-[0.16,1,0.3,1] z-10">
                    <button
                        type="button"
                        onClick={handleQuickAdd}
                        disabled={!canAddToCart}
                        className="w-full py-3.5 bg-white/80 backdrop-blur-md text-[#1A1A1A] text-xs font-bold tracking-widest uppercase border border-white/40 shadow-lg hover:bg-[#1A1A1A] hover:text-[#F9F8F6] hover:border-[#1A1A1A] transition-all flex items-center justify-center gap-2 rounded-sm disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <ShoppingBag size={16} strokeWidth={2} />
                        {canAddToCart ? 'Quick Add' : 'Out of Stock'}
                    </button>
                </div>
            </div>

            <div className="flex flex-col space-y-1.5 px-1">
                <div className="flex justify-between items-start gap-4">
                    <h3 className="text-sm font-bold text-[#1A1A1A] tracking-wide leading-tight line-clamp-1">
                        <Link href={`/product/${product?.id}`} className="hover:text-[#4A001F] transition-colors relative group/link">
                            {product?.name}
                            <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-[#4A001F] transition-all duration-300 group-hover/link:w-full" />
                        </Link>
                    </h3>
                    <span className="text-sm font-bold text-[#1A1A1A] whitespace-nowrap">
                        Rs {Number(product?.base_price || 0).toLocaleString('en-IN')}
                    </span>
                </div>
                <p className="text-xs text-[#7A756B] font-medium tracking-wider uppercase">
                    {categoryName}
                </p>
            </div>
        </motion.div>
    );
}
