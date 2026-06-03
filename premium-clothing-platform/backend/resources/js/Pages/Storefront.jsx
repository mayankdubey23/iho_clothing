import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    BadgePercent,
    CheckCircle2,
    Copy,
    Heart,
    PackageCheck,
    ShieldCheck,
    ShoppingBag,
    Sparkles,
    Star,
    Truck,
    Zap,
} from 'lucide-react';
import CartDrawer from '@/Components/CartDrawer';
import { addCartItem, buildCartItemFromProduct, imageUrl } from '@/lib/cart';
import { isWishlisted, toggleWishlistItem } from '@/lib/wishlist';

const fallbackCms = {
    home_seo_title: 'IHO STUDIO | Online Fashion Store',
    home_top_strip: 'FLAT 40-70% OFF | FREE SHIPPING ABOVE RS 999 | NEW DROPS EVERY WEEK',
    home_hero_badge: 'Big Fashion Festival',
    home_hero_title: 'IHO Style Days',
    home_hero_subtitle: 'Fresh sportswear, streetwear, and daily essentials with a clean Myntra-inspired shopping experience.',
    home_hero_cta_text: 'Shop Now',
    home_hero_cta_link: '/shop',
    home_hero_secondary_text: 'Shop Deals',
    home_hero_secondary_link: '/shop?discount=40',
    home_sale_title: '50-80% OFF',
    home_sale_subtitle: 'On latest active storefront picks',
    home_coupon_text: 'Use code IHOSTYLE for extra savings at checkout',
    home_hidden_sections: '',
    home_section_order: 'hero,promo,categories,best,new,gym,offers,reviews,trust,franchise',
    home_product_section_count: '4',
    home_category_offers_json: '',
    home_categories_title: 'Shop By Category',
    home_categories_subtitle: 'Browse curated edits for every training, travel, and weekend plan.',
    home_best_sellers_title: 'Deals Of The Day',
    home_best_sellers_subtitle: 'Best-selling products selected from Super Admin.',
    home_new_arrivals_title: 'New In Store',
    home_new_arrivals_subtitle: 'Latest active products published to the storefront.',
    home_gym_title: 'Activewear Edit',
    home_gym_subtitle: 'Gym, training, and performance-ready picks.',
    home_offers_title: 'Coupons Corner',
    home_offers_subtitle: 'Live store offers created from Super Admin.',
    home_reviews_title: 'Customer Love',
    home_reviews_subtitle: 'Approved reviews from verified storefront activity.',
    home_trust_title: 'Why Shop With IHO',
    home_trust_subtitle: 'Everything shoppers expect from a polished online fashion store.',
    home_franchise_title: 'Own An IHO Territory',
    home_franchise_subtitle: 'Partner with IHO Studio for local fulfillment, B2B pricing, and launch support.',
    home_franchise_cta_text: 'Apply For Franchise',
    home_franchise_cta_link: '/franchise-enquiry',
};

const defaultBenefits = [
    { title: 'Easy Returns', body: 'Simple exchange and return support.', icon: PackageCheck },
    { title: 'Fast Shipping', body: 'Quick dispatch for active catalog products.', icon: Truck },
    { title: 'Secure Checkout', body: 'Protected payments and account handling.', icon: ShieldCheck },
    { title: 'Fresh Drops', body: 'New styles and offers keep the store moving.', icon: Sparkles },
];

const defaultPromoTiles = [
    { title: 'Min. 50% Off', subtitle: 'Performance Tees', href: '/shop?subcategory=t-shirts', from: '#ff3f6c', to: '#ff905a' },
    { title: 'Buy 2 Save More', subtitle: 'Gym Essentials', href: '/shop?category=gym-wear', from: '#14b8a6', to: '#2563eb' },
    { title: 'New Season', subtitle: 'Running Gear', href: '/shop?category=running-wear', from: '#f59e0b', to: '#ef4444' },
];

const sectionMotion = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.18 },
    transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] },
};

function asList(value) {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    return [];
}

function mediaUrl(path) {
    if (!path || typeof path !== 'string') return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/storage/') || path.startsWith('/images/') || path.startsWith('/assets/')) return path;
    if (path.startsWith('storage/')) return `/${path}`;
    return `/storage/${path.replace(/^\/+/, '')}`;
}

function currency(value) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));
}

function discountFor(product, price) {
    const mrp = Number(product.mrp || 0);
    const sale = Number(price || 0);
    if (!mrp || !sale || mrp <= sale) return null;
    return Math.round(((mrp - sale) / mrp) * 100);
}

function parseJsonList(raw, fallback) {
    if (!raw) return fallback;
    try {
        const decoded = JSON.parse(raw);
        return Array.isArray(decoded) && decoded.length ? decoded : fallback;
    } catch {
        return fallback;
    }
}

function fillProductSection(primary, fallback, count = 4) {
    const selected = [];
    const seen = new Set();

    [...asList(primary), ...asList(fallback)].forEach((product) => {
        if (!product || seen.has(product.id) || selected.length >= count) return;
        seen.add(product.id);
        selected.push(product);
    });

    return selected;
}

function settingNumber(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function StorefrontImage({ src, alt, className = '', children }) {
    if (!src) {
        return (
            <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#ffe5ec] via-white to-[#fff1d6] text-center ${className}`}>
                <div className="px-5">
                    <Sparkles className="mx-auto mb-3 text-[#ff3f6c]" size={28} />
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">IHO Studio</p>
                </div>
                {children}
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden ${className}`}>
            <img src={src} alt={alt} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
            {children}
        </div>
    );
}

function SectionHeader({ eyebrow, title, subtitle, action, dark = false }) {
    return (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
                {eyebrow && <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${dark ? 'text-white/65' : 'text-[#ff3f6c]'}`}>{eyebrow}</p>}
                <h2 className={`mt-1 text-2xl font-black uppercase tracking-tight sm:text-3xl ${dark ? 'text-white' : 'text-[#282c3f]'}`}>{title}</h2>
                {subtitle && <p className={`mt-2 max-w-2xl text-sm font-semibold leading-6 ${dark ? 'text-white/65' : 'text-slate-500'}`}>{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}

function Hero({ cms, categories, products, banners = [] }) {
    const heroBanner = banners.find((banner) => banner.placement_type === 'main_hero_slider') || banners[0];
    const heroMedia = heroBanner?.desktop_image || mediaUrl(cms.home_hero_media) || products.find((product) => product.image)?.image;

    return (
        <section className="bg-[#f5f5f6] lg:flex lg:h-[calc(100dvh-5rem)] lg:flex-col lg:overflow-hidden">
            <div className="shrink-0 border-y border-slate-100 bg-[#ff3f6c] px-4 py-1.5 text-center text-[10px] font-black uppercase tracking-[0.24em] text-white sm:text-xs">
                {cms.home_top_strip}
            </div>

            <div className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col px-4 py-4 sm:px-6 lg:min-h-0 lg:px-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55 }}
                    className="grid flex-1 overflow-hidden bg-white shadow-sm lg:min-h-0 lg:grid-cols-[1fr_0.92fr]"
                >
                    <div className="flex min-h-[340px] flex-col justify-center bg-gradient-to-br from-[#fff0f4] via-white to-[#fff6df] p-6 sm:min-h-[390px] sm:p-8 lg:h-full lg:min-h-0 lg:p-10">
                        <div className="mb-4 inline-flex w-fit items-center gap-2 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#ff3f6c] shadow-sm">
                            <Zap size={14} />
                            {cms.home_hero_badge}
                        </div>
                        <h1 className="max-w-3xl text-[clamp(2.75rem,6vw,5.6rem)] font-black uppercase leading-[0.92] tracking-tight text-[#282c3f]">
                            {cms.home_hero_title}
                        </h1>
                        <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-slate-600 sm:text-base">
                            {cms.home_hero_subtitle}
                        </p>
                        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                            <Link href={cms.home_hero_cta_link || '/shop'} className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#ff3f6c] px-7 text-xs font-black uppercase tracking-widest text-white transition hover:bg-[#282c3f]">
                                {cms.home_hero_cta_text}
                                <ArrowRight size={16} />
                            </Link>
                            <Link href={(cms.home_hero_secondary_link || '/shop?discount=40').startsWith('/offers') ? '/shop?discount=40' : (cms.home_hero_secondary_link || '/shop?discount=40')} className="inline-flex min-h-12 items-center justify-center border border-[#282c3f]/15 bg-white px-7 text-xs font-black uppercase tracking-widest text-[#282c3f] transition hover:border-[#ff3f6c] hover:text-[#ff3f6c]">
                                {cms.home_hero_secondary_text}
                            </Link>
                        </div>
                    </div>

                    {heroBanner ? (
                        <Link href={heroBanner.target_url || '/shop'} className="group relative min-h-[340px] overflow-hidden bg-slate-100 sm:min-h-[390px] lg:h-full lg:min-h-0">
                            <picture>
                                <source media="(max-width: 767px)" srcSet={heroBanner.mobile_image || heroBanner.desktop_image} />
                                <img src={heroMedia} alt={heroBanner.title || cms.home_hero_title} className="h-full min-h-[340px] w-full object-cover transition duration-700 group-hover:scale-105 sm:min-h-[390px] lg:min-h-0" />
                            </picture>
                            <div className="absolute inset-x-5 bottom-5 bg-white/92 p-5 shadow-xl backdrop-blur">
                                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#ff3f6c]">{cms.home_sale_title}</p>
                                <p className="mt-1 text-xl font-black uppercase text-[#282c3f]">{heroBanner.title || cms.home_sale_subtitle}</p>
                            </div>
                        </Link>
                    ) : (
                        <StorefrontImage src={heroMedia} alt={cms.home_hero_media_alt || cms.home_hero_title} className="group min-h-[340px] sm:min-h-[390px] lg:h-full lg:min-h-0">
                            <div className="absolute inset-x-5 bottom-5 bg-white/92 p-5 shadow-xl backdrop-blur">
                                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#ff3f6c]">{cms.home_sale_title}</p>
                                <p className="mt-1 text-xl font-black uppercase text-[#282c3f]">{cms.home_sale_subtitle}</p>
                            </div>
                        </StorefrontImage>
                    )}
                </motion.div>
            </div>
        </section>
    );
}

function PromoTiles({ cms }) {
    const tiles = parseJsonList(cms.home_promo_tiles_json, defaultPromoTiles);

    return (
        <motion.section {...sectionMotion} className="bg-white">
            <div className="mx-auto grid max-w-[1500px] gap-4 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-10">
                {tiles.map((tile, index) => (
                    <Link
                        key={`${tile.title}-${index}`}
                        href={tile.href || '/shop'}
                        className="group min-h-36 p-6 text-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                        style={{
                            background: `linear-gradient(135deg, ${tile.from || defaultPromoTiles[index % defaultPromoTiles.length].from}, ${tile.to || defaultPromoTiles[index % defaultPromoTiles.length].to})`,
                        }}
                    >
                        <BadgePercent className="mb-6" size={24} />
                        <h3 className="text-2xl font-black uppercase leading-tight">{tile.title}</h3>
                        <p className="mt-2 text-xs font-black uppercase tracking-[0.2em] text-white/80">{tile.subtitle}</p>
                    </Link>
                ))}
            </div>
        </motion.section>
    );
}

function CategoryStrip({ categories, cms }) {
    if (!categories.length) return null;
    const categoryOffers = parseJsonList(cms.home_category_offers_json, []);

    return (
        <motion.section {...sectionMotion} className="relative overflow-hidden bg-white">
            <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#fff0f4] to-white" />
            <div className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 lg:px-10">
                <div className="relative mb-10 overflow-hidden border-y border-[#ff3f6c]/15 bg-white py-8 text-center shadow-sm">
                    <div className="category-light-trail category-light-trail-left" />
                    <div className="category-light-trail category-light-trail-right" />
                    <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#ff3f6c]">Collections</p>
                    <h2 className="mt-2 text-4xl font-black uppercase tracking-tight text-[#282c3f] sm:text-5xl">
                        {cms.home_categories_title}
                    </h2>
                    {cms.home_categories_subtitle && (
                        <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                            {cms.home_categories_subtitle}
                        </p>
                    )}
                    <Link href="/shop" className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 bg-[#282c3f] px-6 text-xs font-black uppercase tracking-widest text-white shadow-xl transition hover:bg-[#ff3f6c]">
                        Shop Now <ArrowRight size={15} />
                    </Link>
                </div>

                <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                    {categories.map((category, index) => (
                        <CategoryCampaignCard
                            key={`${category.slug}-${index}`}
                            category={category}
                            index={index}
                            offer={categoryOffers[index]}
                        />
                    ))}
                </div>
            </div>
        </motion.section>
    );
}

function CategoryCampaignCard({ category, index, offer }) {
    const discount = offer?.discount || ['Fresh Edit', 'Studio Picks', 'Active Drop', 'Weekend Ready'][index % 4];
    const label = offer?.title || category.name;
    const palettes = [
        ['#ff3f6c', '#ff905a', '#282c3f'],
        ['#14b8a6', '#22c55e', '#282c3f'],
        ['#6366f1', '#ff3f6c', '#282c3f'],
        ['#f59e0b', '#ff3f6c', '#282c3f'],
    ];
    const [from, to, ink] = palettes[index % palettes.length];

    return (
        <motion.div
            initial={{ opacity: 0, y: 24, rotate: index % 2 === 0 ? -1.5 : 1.5 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ delay: Math.min(index * 0.045, 0.28), duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -10, rotate: index % 2 === 0 ? 1 : -1 }}
            className="h-full"
        >
            <Link
                href={offer?.href || `/shop?category=${category.slug}`}
                className="category-card group relative block h-full overflow-hidden bg-white p-2 shadow-[0_18px_36px_rgba(40,44,63,0.12)]"
                style={{ '--cat-from': from, '--cat-to': to, '--cat-ink': ink }}
            >
                <div className="absolute inset-0 category-card-bg opacity-95" />
                <div className="absolute inset-x-4 top-4 h-20 rounded-full bg-white/25 blur-2xl transition duration-500 group-hover:scale-125" />
                <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.38), transparent 58%)' }} />
                <div className="relative">
                    <StorefrontImage src={category.image} alt={category.image_alt || category.name} className="aspect-[4/5] border-4 border-white/70 bg-white shadow-inner">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                    </StorefrontImage>
                    <div className="relative px-2 pb-3 pt-3 text-center text-white">
                        <h3 className="mx-auto max-w-[12rem] text-sm font-black uppercase leading-tight tracking-tight sm:text-base">
                            {label}
                        </h3>
                        <p className="mt-1 text-xl font-black uppercase leading-none tracking-tight sm:text-2xl">
                            {discount}
                        </p>
                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest text-white/90">
                            Shop Now <ArrowRight size={13} className="transition group-hover:translate-x-1" />
                        </span>
                    </div>
                </div>
                <span className="absolute -right-10 -top-10 size-20 rounded-full bg-white/20 blur-lg transition group-hover:scale-150" />
            </Link>
        </motion.div>
    );
}

function ProductCard({ product, onAddedToBag }) {
    const [isSaved, setIsSaved] = useState(false);
    const [isSizeOpen, setIsSizeOpen] = useState(false);
    const price = product.selling_price || product.discount_price || product.d2c_price || product.base_price;
    const mrp = product.mrp && Number(product.mrp) > Number(price) ? product.mrp : null;
    const discount = discountFor(product, price);
    const productHref = product.slug ? `/product/${product.slug}` : '/shop';
    const skus = Array.isArray(product.skus) ? product.skus : [];
    const availableSkus = skus;
    const uniqueSizes = [...new Map(availableSkus.filter((sku) => sku.size).map((sku) => [sku.size, sku])).values()];
    const canAddToBag = product.is_available && availableSkus.length > 0;

    useEffect(() => {
        setIsSaved(isWishlisted(product.id));

        const syncWishlist = () => setIsSaved(isWishlisted(product.id));
        window.addEventListener('wishlist-updated', syncWishlist);
        window.addEventListener('storage', syncWishlist);
        return () => {
            window.removeEventListener('wishlist-updated', syncWishlist);
            window.removeEventListener('storage', syncWishlist);
        };
    }, [product.id]);

    const wishlist = (event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleWishlistItem({
            ...product,
            price,
            image: imageUrl(product.image),
            image_path: product.image,
        });
        setIsSaved(isWishlisted(product.id));
    };

    const addSkuToBag = (sku) => {
        const cartItem = sku?.id
            ? {
                id: sku.id,
                sku_id: sku.id,
                product_id: product.id,
                name: product.name,
                slug: product.slug,
                size: sku.size || product.available_sizes?.[0] || 'Default',
                color: sku.color || product.available_colors?.[0] || 'Default',
                price: Number(price || 0),
                quantity: 1,
                image: imageUrl(product.image),
            }
            : buildCartItemFromProduct({ ...product, price }, 1);

        if (!cartItem) return;
        addCartItem(cartItem);
        setIsSizeOpen(false);
        onAddedToBag?.();
    };

    const addToBag = (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!canAddToBag) return;

        if (uniqueSizes.length > 1) {
            setIsSizeOpen((value) => !value);
            return;
        }

        addSkuToBag(uniqueSizes[0] || availableSkus[0]);
    };

    return (
        <article className="group relative bg-white transition hover:shadow-xl">
            <Link href={productHref} className="block">
                <StorefrontImage src={product.image} alt={product.image_alt || product.name} className="aspect-[3/4] bg-slate-100">
                    <button type="button" onClick={wishlist} aria-label={`Wishlist ${product.name}`} className={`absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white shadow-sm transition hover:bg-[#ff3f6c] hover:text-white ${isSaved ? 'text-[#ff3f6c]' : 'text-[#282c3f]'}`}>
                        <Heart size={16} className={isSaved ? 'fill-current' : ''} />
                    </button>
                    {(product.is_best_seller || product.is_featured) && (
                        <span className="absolute left-3 top-3 bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-[#ff3f6c] shadow-sm">
                            {product.is_best_seller ? 'Best Seller' : 'Featured'}
                        </span>
                    )}
                    {!product.is_available && (
                        <span className="absolute inset-x-0 bottom-0 bg-[#282c3f]/90 px-3 py-2 text-center text-[10px] font-black uppercase tracking-widest text-white">
                            Out Of Stock
                        </span>
                    )}
                </StorefrontImage>
            </Link>
            <div className="p-4">
                <p className="truncate text-[11px] font-black uppercase tracking-wider text-slate-400">{product.category_name || product.category || 'IHO Studio'}</p>
                <Link href={productHref} className="mt-1 block truncate text-sm font-black text-[#282c3f] hover:text-[#ff3f6c]">{product.name}</Link>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-black text-[#282c3f]">{currency(price)}</span>
                    {mrp && <span className="text-xs font-bold text-slate-400 line-through">{currency(mrp)}</span>}
                    {discount && <span className="text-xs font-black text-[#ff905a]">({discount}% OFF)</span>}
                </div>
                <div className="mt-4 flex items-center gap-2">
                    <button type="button" onClick={addToBag} disabled={!canAddToBag} className="flex min-h-10 flex-1 items-center justify-center gap-2 border border-slate-200 text-[10px] font-black uppercase tracking-widest text-[#282c3f] transition hover:border-[#ff3f6c] hover:bg-[#ff3f6c] hover:text-white disabled:cursor-not-allowed disabled:opacity-50">
                        <ShoppingBag size={14} />
                        {canAddToBag ? (uniqueSizes.length > 1 ? 'Add Size' : 'Add Bag') : 'View Item'}
                    </button>
                    <Link href={productHref} className="flex min-h-10 items-center justify-center border border-slate-200 px-3 text-[10px] font-black uppercase tracking-widest text-[#282c3f] transition hover:border-[#282c3f]">
                        View
                    </Link>
                </div>
            </div>

            {isSizeOpen && (
                <div className="absolute inset-x-3 bottom-20 z-20 border border-slate-100 bg-white p-4 shadow-2xl">
                    <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Select Size</p>
                    <div className="grid grid-cols-4 gap-2">
                        {uniqueSizes.map((sku) => (
                            <button key={`${product.id}-${sku.id}-${sku.size}`} type="button" onClick={() => addSkuToBag(sku)} className="min-h-10 border border-slate-200 text-xs font-black uppercase text-[#282c3f] hover:border-[#ff3f6c] hover:bg-[#ff3f6c] hover:text-white">
                                {sku.size}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </article>
    );
}

function ProductRail({ eyebrow, title, subtitle, products, href = '/shop', soft = false, productCount = 4, onAddedToBag }) {
    const visibleProducts = products.slice(0, productCount);

    return (
        <motion.section {...sectionMotion} className={soft ? 'bg-[#f5f5f6]' : 'bg-white'}>
            <div className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 lg:px-10">
                <SectionHeader
                    eyebrow={eyebrow}
                    title={title}
                    subtitle={subtitle}
                    action={<Link href={href} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#ff3f6c]">View All <ArrowRight size={14} /></Link>}
                />
                {visibleProducts.length ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {visibleProducts.map((product) => <ProductCard key={product.id} product={product} onAddedToBag={onAddedToBag} />)}
                    </div>
                ) : (
                    <EmptySection message="No active products are assigned to this section yet." />
                )}
            </div>
        </motion.section>
    );
}

function Offers({ offers, cms }) {
    const [copiedCode, setCopiedCode] = useState(null);
    const activeOffers = Array.isArray(offers) ? offers : [];
    const featureOffer = activeOffers.find((offer) => offer.display_type === 'hero_banner') || activeOffers[0] || null;
    const sideOffers = activeOffers.filter((offer) => offer !== featureOffer).slice(0, 3);
    const featureCode = featureOffer?.offer_code || featureOffer?.code;
    const featureImage = mediaUrl(featureOffer?.bg_image || featureOffer?.image || featureOffer?.image_path) || mediaUrl(cms.home_offers_media);
    const shopHref = featureOffer?.target_url || featureOffer?.href || '/shop?discount=40';

    const copyCode = (code) => {
        if (!code) return;
        navigator.clipboard?.writeText(code);
        setCopiedCode(code);
        window.setTimeout(() => setCopiedCode(null), 1800);
    };

    return (
        <motion.section {...sectionMotion} className="bg-white">
            <div className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 lg:px-10">
                <SectionHeader
                    eyebrow="Store Offer"
                    title={cms.home_offers_title}
                    subtitle={cms.home_offers_subtitle}
                    action={<Link href="/shop?discount=40" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#ff3f6c]">Shop Deals <ArrowRight size={14} /></Link>}
                />
                {featureOffer ? (
                    <div className="grid overflow-hidden bg-[#282c3f] text-white shadow-sm lg:grid-cols-[1.35fr_0.85fr]">
                        <Link href={shopHref} className="group relative flex min-h-[360px] flex-col justify-end overflow-hidden p-6 sm:p-10 lg:min-h-[460px]">
                            {featureImage ? (
                                <img src={featureImage} alt={featureOffer.title || cms.home_offers_title} className="absolute inset-0 h-full w-full object-cover opacity-55 transition duration-700 group-hover:scale-105" />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-[#ff3f6c] via-[#ff905a] to-[#282c3f]" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                            <div className="relative max-w-3xl">
                                <span className="inline-flex items-center gap-2 bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.26em] text-[#282c3f]">
                                    <BadgePercent size={13} /> Limited Time
                                </span>
                                <h2 className="mt-4 text-4xl font-black uppercase italic leading-none tracking-tight sm:text-6xl">
                                    {featureOffer.title}
                                </h2>
                                {(featureOffer.subtitle || cms.home_coupon_text) && (
                                    <p className="mt-4 max-w-xl text-sm font-bold uppercase leading-7 tracking-widest text-white/75">
                                        {featureOffer.subtitle || cms.home_coupon_text}
                                    </p>
                                )}
                                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <span className="inline-flex min-h-12 items-center justify-center bg-[#ff3f6c] px-7 text-xs font-black uppercase tracking-widest text-white transition group-hover:bg-white group-hover:text-[#282c3f]">
                                        Shop Offer <ArrowRight className="ml-2" size={16} />
                                    </span>
                                    {featureCode && (
                                        <button type="button" onClick={(event) => { event.preventDefault(); copyCode(featureCode); }} className="inline-flex min-h-12 items-center justify-center gap-3 border border-white/30 bg-black/25 px-5 text-xs font-black uppercase tracking-widest text-white backdrop-blur transition hover:border-white hover:bg-white hover:text-[#282c3f]">
                                            {featureCode}
                                            {copiedCode === featureCode ? <CheckCircle2 size={15} /> : <Copy size={15} />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </Link>

                        <div className="grid gap-px bg-white/10 p-px">
                            {(sideOffers.length ? sideOffers : activeOffers.slice(0, 3)).map((offer) => {
                                const code = offer.offer_code || offer.code;
                                return (
                                    <div key={offer.id || code || offer.title} className="flex flex-col justify-center bg-[#282c3f] p-6">
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#ff905a]">Extra Deal</p>
                                        <h3 className="mt-2 text-xl font-black uppercase leading-tight">{offer.title}</h3>
                                        {offer.subtitle && <p className="mt-2 text-xs font-semibold uppercase leading-6 tracking-widest text-white/60">{offer.subtitle}</p>}
                                        {code && (
                                            <button type="button" onClick={() => copyCode(code)} className="mt-5 inline-flex w-fit items-center gap-3 border border-dashed border-white/30 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition hover:border-[#ff3f6c] hover:text-[#ff905a]">
                                                {code}
                                                {copiedCode === code ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <EmptySection message="No active offers are published right now." />
                )}
            </div>
        </motion.section>
    );
}

function Reviews({ reviews, cms }) {
    const marqueeReviews = reviews.length ? reviews : [];
    const firstRow = marqueeReviews.filter((_, index) => index % 2 === 0);
    const secondRow = marqueeReviews.filter((_, index) => index % 2 === 1);
    const rows = [
        firstRow.length ? firstRow : marqueeReviews,
        secondRow.length ? secondRow : marqueeReviews.slice().reverse(),
    ];

    return (
        <motion.section {...sectionMotion} className="bg-white">
            <div className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 lg:px-10">
                <SectionHeader eyebrow="Reviews" title={cms.home_reviews_title} subtitle={cms.home_reviews_subtitle} />
                {reviews.length ? (
                    <div className="relative overflow-hidden bg-[#f5f5f6] py-6">
                        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#f5f5f6] to-transparent" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#f5f5f6] to-transparent" />
                        <div className="space-y-4">
                            {rows.map((row, rowIndex) => (
                                <div
                                    key={`review-row-${rowIndex}`}
                                    className={`review-marquee flex w-max gap-4 ${rowIndex % 2 === 1 ? 'review-marquee-reverse' : ''}`}
                                >
                                    {[...row, ...row, ...row].map((review, index) => (
                                        <article key={`${rowIndex}-${review.id}-${index}`} className="group grid min-h-[190px] w-[320px] shrink-0 grid-rows-[auto_1fr_auto] border border-white bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#ff3f6c]/30 hover:shadow-xl sm:w-[410px]">
                                            <div className="mb-4 flex items-center justify-between gap-4">
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star key={star} size={15} className={Number(review.rating) >= star ? 'fill-[#ffb100] text-[#ffb100]' : 'text-slate-200'} />
                                                    ))}
                                                </div>
                                                <span className="bg-[#fff0f4] px-3 py-1 text-[9px] font-black uppercase tracking-widest text-[#ff3f6c]">
                                                    Verified
                                                </span>
                                            </div>
                                            <p className="text-sm font-semibold leading-7 text-slate-600">"{review.text || review.comment}"</p>
                                            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                                                <h3 className="truncate text-xs font-black uppercase tracking-widest text-[#282c3f]">{review.customer_name || review.name || 'Customer'}</h3>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{review.product || 'IHO Pick'}</span>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <EmptySection message="Approved featured reviews will appear here after customers submit them." />
                )}
            </div>
        </motion.section>
    );
}

function TrustSection({ cms }) {
    const benefits = parseJsonList(cms.home_benefits_json, defaultBenefits).map((item, index) => ({
        ...item,
        icon: defaultBenefits[index % defaultBenefits.length].icon,
    }));

    return (
        <motion.section {...sectionMotion} className="bg-[#f5f5f6]">
            <div className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 lg:px-10">
                <SectionHeader eyebrow="Assurance" title={cms.home_trust_title} subtitle={cms.home_trust_subtitle} />
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {benefits.map((benefit, index) => {
                        const Icon = benefit.icon;
                        return (
                            <div key={`${benefit.title}-${index}`} className="bg-white p-6 shadow-sm">
                                <Icon className="mb-6 text-[#ff3f6c]" size={26} />
                                <h3 className="text-base font-black uppercase text-[#282c3f]">{benefit.title}</h3>
                                <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">{benefit.body}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.section>
    );
}

function FranchiseCta({ cms }) {
    return (
        <motion.section {...sectionMotion} className="bg-white">
            <div className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 lg:px-10">
                <div className="grid items-center gap-6 bg-gradient-to-r from-[#ff3f6c] to-[#ff905a] p-6 text-white sm:p-10 lg:grid-cols-[1fr_auto]">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">Franchise Program</p>
                        <h2 className="mt-2 text-3xl font-black uppercase tracking-tight sm:text-5xl">{cms.home_franchise_title}</h2>
                        <p className="mt-4 max-w-3xl text-sm font-semibold leading-7 text-white/82">{cms.home_franchise_subtitle}</p>
                    </div>
                    <Link href={cms.home_franchise_cta_link || '/franchise-enquiry'} className="inline-flex min-h-12 items-center justify-center gap-2 bg-white px-7 text-xs font-black uppercase tracking-widest text-[#282c3f] transition hover:bg-[#282c3f] hover:text-white">
                        {cms.home_franchise_cta_text}
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </motion.section>
    );
}

function EmptySection({ message, dark = false }) {
    return (
        <div className={`flex min-h-[220px] items-center justify-center border border-dashed p-8 text-center ${dark ? 'border-white/15 bg-white/5 text-white/55' : 'border-slate-200 bg-white text-slate-400'}`}>
            <p className="max-w-sm text-[11px] font-black uppercase tracking-[0.24em]">{message}</p>
        </div>
    );
}

export default function Storefront({
    categories,
    featuredCategories,
    products,
    newArrivals,
    bestSellers,
    gymProducts,
    allProducts,
    offers,
    banners,
    testimonials,
    cms = {},
}) {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const content = { ...fallbackCms, ...cms };
    const categoryList = asList(featuredCategories).length ? asList(featuredCategories) : asList(categories);
    const newArrivalsList = asList(newArrivals);
    const bestSellersList = asList(bestSellers);
    const gymProductsList = asList(gymProducts);
    const allProductsList = asList(allProducts).length ? asList(allProducts) : asList(products);
    const offersList = asList(offers);
    const bannerList = asList(banners);
    const reviewList = asList(testimonials);
    const hiddenSections = new Set(String(content.home_hidden_sections || '').split(',').map((item) => item.trim()).filter(Boolean));
    const sectionOrder = String(content.home_section_order || fallbackCms.home_section_order)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .reduce((map, id, index) => ({ ...map, [id]: index }), {});

    const homeProductCount = settingNumber(content.home_product_section_count, 4);

    const rails = useMemo(() => [
        {
            eyebrow: 'Limited Time',
            title: content.home_best_sellers_title,
            subtitle: content.home_best_sellers_subtitle,
            products: fillProductSection(bestSellersList, allProductsList, homeProductCount),
            productCount: homeProductCount,
            href: '/shop?sort=popular',
            soft: true,
        },
        {
            eyebrow: 'Fresh Finds',
            title: content.home_new_arrivals_title,
            subtitle: content.home_new_arrivals_subtitle,
            products: fillProductSection(newArrivalsList, allProductsList, homeProductCount),
            productCount: homeProductCount,
            href: '/shop?sort=newest',
        },
        {
            eyebrow: 'Workout Ready',
            title: content.home_gym_title,
            subtitle: content.home_gym_subtitle,
            products: fillProductSection(gymProductsList, allProductsList, homeProductCount),
            productCount: homeProductCount,
            href: '/shop?category=gym-wear',
            soft: true,
        },
    ], [allProductsList, bestSellersList, content.home_best_sellers_subtitle, content.home_best_sellers_title, content.home_gym_subtitle, content.home_gym_title, content.home_new_arrivals_subtitle, content.home_new_arrivals_title, gymProductsList, homeProductCount, newArrivalsList]);

    const sections = [
        { id: 'hero', node: <Hero cms={content} categories={categoryList} products={allProductsList} banners={bannerList} /> },
        { id: 'promo', node: <PromoTiles cms={content} /> },
        { id: 'categories', node: <CategoryStrip categories={categoryList} cms={content} /> },
        { id: 'best', node: <ProductRail {...rails[0]} onAddedToBag={() => setIsCartOpen(true)} /> },
        { id: 'new', node: <ProductRail {...rails[1]} onAddedToBag={() => setIsCartOpen(true)} /> },
        { id: 'gym', node: <ProductRail {...rails[2]} onAddedToBag={() => setIsCartOpen(true)} /> },
        { id: 'offers', node: <Offers offers={offersList} cms={content} /> },
        { id: 'reviews', node: <Reviews reviews={reviewList} cms={content} /> },
        { id: 'trust', node: <TrustSection cms={content} /> },
        { id: 'franchise', node: <FranchiseCta cms={content} /> },
    ].filter((section) => !hiddenSections.has(section.id))
        .sort((a, b) => (sectionOrder[a.id] ?? 999) - (sectionOrder[b.id] ?? 999));

    return (
        <AppLayout>
            <Head title={content.home_seo_title || 'IHO STUDIO'} />
            <div className="myntra-storefront overflow-x-hidden bg-white text-[#282c3f]">
                {sections.map((section) => <React.Fragment key={section.id}>{section.node}</React.Fragment>)}
            </div>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

            <style>{`
                html {
                    scroll-behavior: smooth;
                }

                body {
                    overflow-x: hidden;
                }

                .myntra-storefront {
                    overflow-x: clip;
                }

                .category-card {
                    transform-style: preserve-3d;
                }

                .category-card-bg {
                    background:
                        linear-gradient(145deg, var(--cat-from), var(--cat-to) 58%, var(--cat-ink)),
                        radial-gradient(circle at 30% 20%, rgba(255,255,255,0.55), transparent 30%);
                }

                .category-light-trail {
                    position: absolute;
                    bottom: -28px;
                    width: 48%;
                    height: 58px;
                    pointer-events: none;
                    background:
                        linear-gradient(90deg, rgba(255,63,108,0), rgba(255,63,108,0.42), rgba(255,144,90,0.55), rgba(255,255,255,0)),
                        radial-gradient(circle at 75% 35%, rgba(255,255,255,0.8), transparent 22%);
                    filter: blur(0.5px) saturate(1.15);
                    animation: categoryTrailFloat 5s ease-in-out infinite alternate;
                }

                .category-light-trail-left {
                    left: -8%;
                    border-top-right-radius: 100% 70%;
                    transform: skewX(18deg);
                }

                .category-light-trail-right {
                    right: -8%;
                    border-top-left-radius: 100% 70%;
                    transform: skewX(-18deg) scaleX(-1);
                    animation-delay: -1.5s;
                }

                .review-marquee {
                    animation: reviewMarquee 34s linear infinite;
                }

                .review-marquee-reverse {
                    animation-name: reviewMarqueeReverse;
                    animation-duration: 42s;
                }

                .review-marquee:hover {
                    animation-play-state: paused;
                }

                @keyframes reviewMarquee {
                    from { transform: translateX(0); }
                    to { transform: translateX(-33.333%); }
                }

                @keyframes reviewMarqueeReverse {
                    from { transform: translateX(-33.333%); }
                    to { transform: translateX(0); }
                }

                @keyframes categoryTrailFloat {
                    from { translate: 0 0; }
                    to { translate: 18px -6px; }
                }

                @media (prefers-reduced-motion: reduce) {
                    .review-marquee,
                    .review-marquee-reverse,
                    .category-light-trail {
                        animation: none;
                    }
                }
            `}</style>
        </AppLayout>
    );
}
