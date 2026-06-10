import React, { useEffect, useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, Star, PackageCheck, Truck, ShieldCheck, Sparkles } from 'lucide-react';
import CartDrawer from '@/Components/CartDrawer';
import { addCartItem, buildCartItemFromProduct, imageUrl } from '@/lib/cart';
import { isWishlisted, toggleWishlistItem } from '@/lib/wishlist';

// --- CMS FALLBACKS ---
const fallbackCms = {
    home_seo_title: 'IHO STUDIO | Premium Performance Wear',
    home_top_strip: 'FLAT 40-70% OFF • FREE SHIPPING ABOVE RS 999 • NEW DROPS EVERY WEEK',
    home_hero_title: 'Defy',
    home_hero_subtitle: 'Gravity',
    home_hero_cta_text: 'Explore Collection',
    home_hero_cta_link: '/shop',
    home_categories_title: 'The Archives',
    home_best_sellers_title: 'Iconic Pieces',
    home_new_arrivals_title: 'Latest Drops',
    home_gym_title: 'Performance Core',
    home_offers_title: 'Campaigns',
    home_reviews_title: 'Community Voices',
    home_trust_title: 'The IHO Standard',
    home_franchise_title: 'Join The Movement',
    home_franchise_subtitle: 'Partner with IHO Studio for exclusive B2B pricing and territorial rights.',
    home_franchise_cta_text: 'Apply For Franchise',
    home_franchise_cta_link: '/franchise-enquiry',
};

const defaultBenefits = [
    { title: 'Free Returns', body: '30-day seamless return policy.', icon: PackageCheck },
    { title: 'Express Delivery', body: 'Priority dispatch on all active gear.', icon: Truck },
    { title: 'Secure Vault', body: 'Encrypted checkout & data protection.', icon: ShieldCheck },
    { title: 'Exclusive Drops', body: 'Early access to limited collections.', icon: Sparkles },
];

// --- UTILITIES ---
function asList(value) { return Array.isArray(value) ? value : Array.isArray(value?.data) ? value.data : []; }
function mediaUrl(path) {
    if (!path || typeof path !== 'string') return null;
    if (path.startsWith('http') || path.startsWith('https')) return path;
    if (path.startsWith('/storage/')) return path;
    if (path.startsWith('/')) return path;
    return `/storage/${path}`;
}
function currency(value) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0)); }
function discountFor(product, price) {
    const mrp = Number(product.mrp || 0); const sale = Number(price || 0);
    return (mrp && sale && mrp > sale) ? Math.round(((mrp - sale) / mrp) * 100) : null;
}

// --- ANIMATIONS ---
const fadeUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

// --- COMPONENTS ---

function CinematicHero({ cms, banner }) {
    const bgMedia = banner?.desktop_image || mediaUrl(cms.home_hero_media) || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop';
    
    return (
        <section className="relative h-[100dvh] w-full overflow-hidden bg-[#111]">
            <motion.div initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 2, ease: "easeOut" }} className="absolute inset-0 z-0">
                <img src={bgMedia} alt="Hero" className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            </motion.div>

            <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4 mix-blend-difference">
                <h1 className="flex flex-col text-[18vw] md:text-[12rem] font-black uppercase italic leading-[0.8] tracking-tighter text-white">
                    <motion.span initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}>
                        {cms.home_hero_title || 'Defy'}
                    </motion.span>
                    <motion.span initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.4 }} className="ml-12 md:ml-32 text-transparent" style={{ WebkitTextStroke: '2px white' }}>
                        {cms.home_hero_subtitle || 'Limits'}
                    </motion.span>
                </h1>
                
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.8 }} className="mt-16">
                    <Link href={cms.home_hero_cta_link || '/shop'} className="group relative inline-flex items-center gap-4 bg-white px-8 py-4 text-xs font-black uppercase tracking-[0.2em] text-black transition-colors hover:bg-[#ff3f6c] hover:text-white">
                        {cms.home_hero_cta_text || 'Explore'}
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}

function InfiniteMarquee({ text }) {
    const items = text ? text.split('•').map(t => t.trim()) : ['NEW DROPS', 'FREE SHIPPING', 'PREMIUM GEAR'];
    return (
        <div className="bg-[#111] border-y border-gray-800 py-3 overflow-hidden flex whitespace-nowrap">
            <div className="animate-marquee flex items-center gap-8 min-w-full">
                {[...items, ...items, ...items, ...items].map((item, i) => (
                    <div key={i} className="flex items-center gap-8">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-200">{item}</span>
                        <span className="h-1 w-1 bg-gray-500 rounded-full opacity-50" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// 🚀 Dynamic Categories Grid with per-card unique banner & style
function EditorialCategories({ categories, title }) {
    const fallbackColors = ['#1a1a2e', '#16213e', '#0f3460', '#533483', '#e94560', '#111', '#2d4059', '#ea5455'];

    const displayCats = (categories && categories.length > 0) ? categories.slice(0, 8) : [];
    const [imgErrors, setImgErrors] = React.useState({});
    const [bannerErrors, setBannerErrors] = React.useState({});

    const handleImgError = (id) => {
        setImgErrors(prev => ({ ...prev, [id]: true }));
    };
    const handleBannerError = (id) => {
        setBannerErrors(prev => ({ ...prev, [id]: true }));
    };

    if (displayCats.length === 0) return null;

    // Style theme overlays to make each card visually distinct
    const themedOverlays = {
        default: (accent) => ({
            gradient: `linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.1) 70%, transparent 100%)`,
            label: accent || '#ff3f6c',
            hoverGlow: accent || '#ff3f6c',
        }),
        minimal: (accent) => ({
            gradient: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)`,
            label: '#ffffff',
            hoverGlow: accent || '#ffffff',
        }),
        bold: (accent) => ({
            gradient: `linear-gradient(135deg, ${accent || '#ff3f6c'}dd 0%, #000000dd 50%, #000000 100%)`,
            label: '#ffffff',
            hoverGlow: accent || '#ff3f6c',
        }),
        mono: (accent) => ({
            gradient: `linear-gradient(to top, #000 0%, rgba(40,44,63,0.9) 40%, rgba(40,44,63,0.3) 70%, transparent 100%)`,
            label: accent || '#e2e8f0',
            hoverGlow: accent || '#cbd5e1',
        }),
        gradient: (accent) => ({
            gradient: `linear-gradient(160deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.1) 50%, ${accent || '#ff3f6c'}44 80%, transparent 100%)`,
            label: accent || '#ff3f6c',
            hoverGlow: accent || '#ff3f6c',
        }),
    };

    return (
        <section className="bg-white pt-24 pb-12 px-4 sm:px-8 lg:px-16">
            <motion.div {...fadeUp} className="mb-12 flex justify-between items-end border-b border-black pb-4">
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-[#282c3f]">{title}</h2>
                <Link href="/shop" className="hidden md:flex text-xs font-black uppercase tracking-widest text-[#ff3f6c] hover:text-black transition-colors">View Directory</Link>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[280px] md:auto-rows-[320px]">
                {displayCats.map((cat, idx) => {
                    const cardImgUrl = mediaUrl(cat.image);
                    const bannerImgUrl = mediaUrl(cat.banner_image);
                    const hasCardImgError = imgErrors[cat.id || idx];
                    const hasBannerError = bannerErrors[cat.id || idx];

                    const theme = themedOverlays[cat.style_theme] || themedOverlays.default;
                    const accent = cat.accent_color || fallbackColors[idx % fallbackColors.length];
                    const bgColor = fallbackColors[idx % fallbackColors.length];
                    const style = theme(accent);

                    return (
                        <Link 
                            key={cat.id || idx} href={`/shop?category=${cat.slug}`} 
                            className={`group relative overflow-hidden ${idx === 0 ? 'md:col-span-2 md:row-span-2' : 'md:col-span-1 md:row-span-1'}`}
                            style={{ backgroundColor: bgColor }}
                        >
                            {/* Layer 1: Collection banner (unique per category) */}
                            {bannerImgUrl && !hasBannerError ? (
                                <img 
                                    src={bannerImgUrl} 
                                    alt="" 
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[12s] group-hover:scale-110 opacity-80"
                                    onError={() => handleBannerError(cat.id || idx)}
                                />
                            ) : cardImgUrl && !hasCardImgError ? (
                                <img 
                                    src={cardImgUrl} 
                                    alt={cat.name} 
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110 opacity-90"
                                    onError={() => handleImgError(cat.id || idx)}
                                />
                            ) : null}

                            {/* Layer 2: Themed gradient overlay unique to this card */}
                            <div 
                                className="absolute inset-0 transition-opacity duration-500"
                                style={{ background: style.gradient }}
                            />
                            
                            {/* Layer 3: Hover accent glow */}
                            <div 
                                className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 mix-blend-overlay"
                                style={{ backgroundColor: style.hoverGlow }}
                            />

                            {/* Layer 4: Diagonal accent line for premium feel */}
                            {idx % 2 === 0 && (
                                <div 
                                    className="absolute top-0 right-0 w-32 h-32 -translate-y-1/2 translate-x-1/2 rotate-45 opacity-30 group-hover:opacity-60 transition-opacity duration-700"
                                    style={{ backgroundColor: style.hoverGlow }}
                                />
                            )}

                            {/* Layer 5: Text content */}
                            <div className="absolute inset-x-6 bottom-6 md:inset-x-8 md:bottom-8 flex justify-between items-end z-10">
                                <div>
                                    <p 
                                        className="text-[9px] font-black uppercase tracking-[0.3em] mb-2 drop-shadow-md transition-colors duration-300"
                                        style={{ color: style.label }}
                                    >
                                        Collection
                                    </p>
                                    <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-white drop-shadow-lg leading-none">
                                        {cat.name}
                                    </h3>
                                </div>
                                <div 
                                    className="size-10 md:size-12 rounded-full backdrop-blur-md border flex items-center justify-center translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 shadow-xl"
                                    style={{ 
                                        backgroundColor: style.hoverGlow + '22',
                                        borderColor: style.hoverGlow + '44',
                                    }}
                                >
                                    <ArrowRight size={20} className="text-white -rotate-45" />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}

function PremiumProductCard({ product, onAddedToBag }) {
    const [isSaved, setIsSaved] = useState(false);
    const price = product.selling_price || product.discount_price || product.base_price;
    const mrp = product.mrp;
    const discount = discountFor(product, price);
    const skus = Array.isArray(product.skus) ? product.skus : [];
    const canAddToBag = product.is_available && skus.length > 0;

    useEffect(() => {
        setIsSaved(isWishlisted(product.id));
        const sync = () => setIsSaved(isWishlisted(product.id));
        window.addEventListener('wishlist-updated', sync);
        return () => window.removeEventListener('wishlist-updated', sync);
    }, [product.id]);

    const handleWishlist = (e) => {
        e.preventDefault(); e.stopPropagation();
        toggleWishlistItem({ ...product, price, image: mediaUrl(product.image) });
        setIsSaved(isWishlisted(product.id));
    };

    const handleAdd = (e) => {
        e.preventDefault(); e.stopPropagation();
        if (!canAddToBag) return;
        const cartItem = buildCartItemFromProduct({ ...product, price }, 1);
        if (cartItem) { addCartItem(cartItem); onAddedToBag?.(); }
    };

    return (
        <Link href={`/product/${product.slug}`} className="group relative block flex-col">
            <div className="relative aspect-[4/5] overflow-hidden bg-[#f5f5f6]">
                <img src={mediaUrl(product.image)} alt={product.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    {product.is_best_seller && <span className="bg-black text-white px-2 py-1 text-[8px] font-black uppercase tracking-widest shadow-sm">Iconic</span>}
                    {discount && <span className="bg-[#ff3f6c] text-white px-2 py-1 text-[8px] font-black uppercase tracking-widest shadow-sm">-{discount}%</span>}
                </div>

                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 bg-gradient-to-t from-black/60 to-transparent flex gap-2 z-20">
                    <button onClick={handleAdd} disabled={!canAddToBag} className="flex-1 bg-white text-black py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#ff3f6c] hover:text-white transition-colors disabled:opacity-50">
                        {canAddToBag ? 'Quick Add' : 'Sold Out'}
                    </button>
                    <button onClick={handleWishlist} className={`w-12 flex items-center justify-center bg-white transition-colors ${isSaved ? 'text-[#ff3f6c]' : 'text-black hover:text-[#ff3f6c]'}`}>
                        <Heart size={16} className={isSaved ? 'fill-current' : ''} />
                    </button>
                </div>
            </div>
            
            <div className="pt-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-1">{product.category_name || 'Studio'}</p>
                <h3 className="text-sm font-black uppercase tracking-tight text-[#282c3f] group-hover:text-[#ff3f6c] transition-colors truncate">{product.name}</h3>
                <div className="mt-2 flex items-center gap-3">
                    <span className="text-sm font-black">{currency(price)}</span>
                    {mrp && <span className="text-xs text-gray-400 line-through">{currency(mrp)}</span>}
                </div>
            </div>
        </Link>
    );
}

function ProductRail({ title, products, onAddedToBag }) {
    if (!products?.length) return null;

    return (
        <section className="bg-white py-20 px-4 sm:px-8 lg:px-16 border-t border-slate-50">
            <motion.div {...fadeUp} className="mb-10 flex justify-between items-end">
                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic text-[#282c3f] border-l-4 border-[#ff3f6c] pl-4">{title}</h2>
                <Link href="/shop" className="hidden md:flex text-xs font-black uppercase tracking-widest text-gray-400 hover:text-[#ff3f6c] transition-colors">View All</Link>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-y-12 md:gap-x-8">
                {products.slice(0, 8).map((prod, i) => (
                    <motion.div key={prod.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 4) * 0.1 }}>
                        <PremiumProductCard product={prod} onAddedToBag={onAddedToBag} />
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

function ImmersiveOffer({ offer, title, cms }) {
    if (!offer) return null;
    
    const bgImage = mediaUrl(offer.bg_image || offer.image || offer.image_path) 
        || mediaUrl(cms.home_offers_media) 
        || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=2070&auto=format&fit=crop';

    return (
        <section className="relative h-[70vh] min-h-[500px] bg-black text-white flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img src={bgImage} alt={title} className="w-full h-full object-cover opacity-50 filter grayscale-[30%]" />
                <div className="absolute inset-0 bg-black/40" />
            </div>
            <div className="relative z-10 text-center px-4 max-w-4xl">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff3f6c] mb-6">Exclusive Campaign</p>
                <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter mb-6 drop-shadow-2xl">{offer.title || title}</h2>
                <p className="text-sm md:text-base font-bold uppercase tracking-widest text-white/80 mb-10 drop-shadow-md">{offer.subtitle}</p>
                <Link href={offer.target_url || '/shop'} className="bg-white text-black px-10 py-4 text-xs font-black uppercase tracking-[0.2em] hover:bg-[#ff3f6c] hover:text-white transition-colors">
                    Access Now
                </Link>
            </div>
        </section>
    );
}

function PremiumReviews({ reviews, title }) {
    if (!reviews || !reviews.length) return null;
    
    const row1 = reviews.filter((_, index) => index % 2 === 0);
    const row2 = reviews.filter((_, index) => index % 2 === 1);
    const rows = [row1.length ? row1 : reviews, row2.length ? row2 : [...reviews].reverse()];

    return (
        <section className="bg-[#f5f5f6] py-24 overflow-hidden border-t border-slate-200">
            <div className="px-4 sm:px-8 lg:px-16 mb-12">
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic text-[#282c3f] text-center">{title}</h2>
            </div>
            
            <div className="relative space-y-6">
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#f5f5f6] to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#f5f5f6] to-transparent" />
                
                {rows.map((row, rowIndex) => (
                    <div key={`review-row-${rowIndex}`} className={`flex w-max gap-6 ${rowIndex % 2 === 1 ? 'animate-marquee-reverse' : 'animate-marquee'}`}>
                        {[...row, ...row, ...row, ...row].map((review, index) => (
                            <article key={`${rowIndex}-${review.id || index}-${index}`} className="w-[300px] md:w-[400px] shrink-0 bg-white p-6 shadow-sm border border-slate-100 group hover:border-[#ff3f6c] transition-colors">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} size={14} className={Number(review.rating) >= star ? 'fill-[#282c3f] text-[#282c3f] group-hover:fill-[#ff3f6c] group-hover:text-[#ff3f6c] transition-colors' : 'text-slate-200'} />
                                        ))}
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Verified</span>
                                </div>
                                <p className="text-sm font-semibold leading-relaxed text-slate-600 mb-6 line-clamp-3">
                                    "{review.text || review.comment}"
                                </p>
                                <div className="border-t border-slate-100 pt-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#282c3f]">{review.customer_name || review.name || 'Customer'}</h3>
                                </div>
                            </article>
                        ))}
                    </div>
                ))}
            </div>
        </section>
    );
}

function PremiumFranchiseCta({ cms }) {
    return (
        <section className="relative bg-[#0b1a2a] text-white py-24 px-4 sm:px-8 lg:px-16 text-center md:text-left overflow-hidden selection:bg-white selection:text-[#0b1a2a]">
            <div
                className="absolute inset-0 opacity-[0.12] mix-blend-overlay pointer-events-none"
                style={{
                    backgroundImage:
                        'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
                }}
            ></div>

            <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="max-w-2xl">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-4">Partner Program</p>
                    <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-4 drop-shadow-sm">{cms.home_franchise_title}</h2>
                    <p className="text-sm md:text-base font-semibold leading-relaxed text-white/85">{cms.home_franchise_subtitle}</p>
                </div>
                <div className="shrink-0">
                    <Link
                        href={cms.home_franchise_cta_link || '/franchise-enquiry'}
                        className="group inline-flex items-center gap-4 bg-white px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-[#0b1a2a] hover:bg-[#cbd5e1] transition-all shadow-xl border border-white/20"
                    >
                        {cms.home_franchise_cta_text || 'Apply Now'}
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

function TrustFooter({ cms }) {
    return (
        <section className="bg-white py-20 px-4 sm:px-8 lg:px-16 border-t border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 max-w-7xl mx-auto">
                {defaultBenefits.map((item, i) => {
                    const Icon = item.icon;
                    return (
                        <div key={i} className="text-center group">
                            <Icon size={32} strokeWidth={1.5} className="mx-auto mb-4 text-[#282c3f] group-hover:text-[#ff3f6c] transition-colors" />
                            <h4 className="text-[11px] font-black uppercase tracking-widest mb-2 text-[#282c3f]">{item.title}</h4>
                            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold leading-relaxed">{item.body}</p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default function Storefront({ categories, featuredCategories, products, newArrivals, bestSellers, gymProducts, offers, banners, testimonials, cms = {} }) {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const content = { ...fallbackCms, ...cms };
    
    const allCategories = asList(categories);
    const safeFeaturedCategories = asList(featuredCategories).length ? asList(featuredCategories) : allCategories;
    const heroBanner = asList(banners).find(b => b.placement_type === 'main_hero_slider') || asList(banners)[0];
    const mainOffer = asList(offers)[0];
    const reviewList = asList(testimonials);

    return (
        <AppLayout>
            <Head title={content.home_seo_title} />
            <main className="bg-white selection:bg-[#ff3f6c] selection:text-white">
                
                <InfiniteMarquee text={content.home_top_strip} />
                
                <CinematicHero cms={content} banner={heroBanner} />
                
                <EditorialCategories categories={safeFeaturedCategories} title={content.home_categories_title} />
                
                <ProductRail title={content.home_best_sellers_title} products={asList(bestSellers)} onAddedToBag={() => setIsCartOpen(true)} />
                
                <ImmersiveOffer offer={mainOffer} title={content.home_offers_title} cms={content} />
                
                <ProductRail title={content.home_new_arrivals_title} products={asList(newArrivals)} onAddedToBag={() => setIsCartOpen(true)} />
                
                {asList(gymProducts).length > 0 && (
                    <ProductRail title={content.home_gym_title} products={asList(gymProducts)} onAddedToBag={() => setIsCartOpen(true)} />
                )}

                <PremiumReviews reviews={reviewList} title={content.home_reviews_title} />

                <PremiumFranchiseCta cms={content} />

                <TrustFooter cms={content} />

            </main>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

            <style>{`
                @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                @keyframes marqueeReverse { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
                
                .animate-marquee { animation: marquee 35s linear infinite; }
                .animate-marquee-reverse { animation: marqueeReverse 45s linear infinite; }
                
                .animate-marquee:hover, .animate-marquee-reverse:hover { animation-play-state: paused; }
                
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: #111; }
                ::-webkit-scrollbar-thumb { background: #ff3f6c; }
            `}</style>
        </AppLayout>
    );
}