import React from 'react';
import { Link } from '@inertiajs/react';
import { imageUrl } from '@/lib/cart';

const fallbackProducts = [
    { id: 'tee', name: 'Aero-Weave Performance Tee', base_price: 2499, category_name: 'Training', image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=900&auto=format&fit=crop' },
    { id: 'shorts', name: 'Titanium Compression Shorts', base_price: 3299, category_name: 'Gym Wear', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=900&auto=format&fit=crop' },
    { id: 'layer', name: 'Thermal Adapt Base Layer', base_price: 4599, category_name: 'Running', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=900&auto=format&fit=crop' },
    { id: 'jacket', name: 'Velocity Windbreaker', base_price: 6999, category_name: 'Outerwear', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=900&auto=format&fit=crop' },
];

export default function NewArrivals({ products = [], eyebrow = 'Just Dropped', title = 'New Arrivals', href = '/shop?sort=newest', reverse = false }) {
    const displayProducts = (products.length > 0 ? products : fallbackProducts).slice(0, 16);
    const productRail = [...displayProducts, ...displayProducts, ...displayProducts];
    const animationClass = reverse ? 'animate-product-card-rail-reverse' : 'animate-product-card-rail';

    return (
        <section className="overflow-hidden bg-white py-8 sm:py-10">
            <div className="mx-auto mb-5 flex max-w-[1400px] items-end justify-between gap-4 px-4 sm:px-6 lg:px-10">
                <div>
                    <p className="mb-1 text-[9px] font-black uppercase tracking-[0.36em] text-[#ff3f6c]">{eyebrow}</p>
                    <h2 className="text-xl font-black uppercase italic tracking-tight text-[#282c3f] sm:text-3xl">{title}</h2>
                </div>
                <Link href={href} className="text-[9px] font-black uppercase tracking-[0.22em] text-[#ff3f6c] hover:text-[#282c3f]">
                    View All
                </Link>
            </div>

            <div className="overflow-hidden px-4 py-4 sm:px-6 lg:px-10">
                <div className={`group/rail flex w-max snap-x snap-mandatory gap-4 ${animationClass} hover:[animation-play-state:paused]`}>
                    {productRail.map((product, index) => {
                        const price = Number(product.discount_price || product.base_price || 0);
                        const href = product.slug ? `/product/${product.slug}` : `/shop?search=${encodeURIComponent(product.name)}`;
                        const mainImage = imageUrl(product.image || product.image_path || product.images?.[0]?.image_path) || 'https://placehold.co/700x900/f8fafc/94a3b8?text=IHO';

                        return (
                            <Link
                                key={`${product.id}-${index}`}
                                href={href}
                                className="group/card relative z-0 w-[74vw] max-w-[320px] shrink-0 snap-start transition-all duration-300 group-hover/rail:opacity-60 hover:z-40 hover:-translate-y-6 hover:scale-[1.16] hover:opacity-100 sm:w-[42vw] lg:w-[300px]"
                            >
                                <div className="relative aspect-[3/4] overflow-hidden border border-slate-200 bg-slate-50 shadow-none transition-all duration-300 group-hover/card:border-[#282c3f] group-hover/card:shadow-[0_28px_70px_rgba(15,23,42,0.35)]">
                                    <img
                                        src={mainImage}
                                        alt={product.name}
                                        onError={(e) => { e.currentTarget.src = 'https://placehold.co/700x900/f8fafc/94a3b8?text=IHO'; }}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-125"
                                    />
                                    <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover/rail:bg-black/55 group-hover/card:bg-black/0" />
                                    <span className="absolute left-3 top-3 bg-white px-2 py-1 text-[8px] font-black uppercase tracking-widest text-[#282c3f]">
                                        {product.category_name || product.category || 'IHO'}
                                    </span>
                                    <div className="absolute inset-x-0 bottom-0 translate-y-full bg-white/95 p-4 backdrop-blur transition-transform duration-300 group-hover/card:translate-y-0">
                                        <p className="mb-2 line-clamp-2 text-[10px] font-bold uppercase leading-relaxed tracking-widest text-slate-500">
                                            {product.description || 'Premium performance gear for daily movement.'}
                                        </p>
                                        <span className="inline-flex bg-[#282c3f] px-4 py-2 text-[8px] font-black uppercase tracking-[0.24em] text-white">
                                            View Product
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-start justify-between gap-3">
                                    <h3 className="text-[11px] font-black uppercase leading-snug tracking-widest text-[#282c3f]">
                                        {product.name}
                                    </h3>
                                    <span className="text-xs font-black text-[#282c3f]">₹{price.toLocaleString('en-IN')}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            <style>{`
                @keyframes product-card-rail {
                    from { transform: translateX(0); }
                    to { transform: translateX(-33.333%); }
                }
                @keyframes product-card-rail-reverse {
                    from { transform: translateX(-33.333%); }
                    to { transform: translateX(0); }
                }
                .animate-product-card-rail {
                    animation: product-card-rail 22s linear infinite;
                }
                .animate-product-card-rail-reverse {
                    animation: product-card-rail-reverse 25s linear infinite;
                }
            `}</style>
        </section>
    );
}
