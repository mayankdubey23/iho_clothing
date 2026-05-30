import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, usePage, router } from '@inertiajs/react';
import {
    Search, ShoppingBag, User, Menu, X, LogOut, Heart,
    ChevronDown, Package, MapPin, Ticket, RefreshCcw, HelpCircle,
    Home, Activity, Dumbbell, Flame, Tag, ArrowRight
} from 'lucide-react';
import CartDrawer from '@/Components/CartDrawer';
import { getCartItems } from '@/lib/cart';
import { getWishlistItems } from '@/lib/wishlist';

// 🚀 NAYA: Icon Map to dynamically render Lucide icons from database string
const IconMap = {
    Home, User, Heart, Dumbbell, Activity, Flame, Tag, Package, MapPin, Ticket, RefreshCcw, HelpCircle
};

export default function Navbar({ admin = false, vertical = false }) {
    const page = usePage();
    // 🚀 NAYA: Grabbing dynamic navigationMenu from Inertia Props
    const { auth, site = {}, navigationMenu = [] } = page.props;
    const user = auth?.user;
    const currentUrl = page.url || '/';
    const logoUrl = site.site_logo ? `/storage/${site.site_logo}` : null;
    const logoMark = site.site_logo_mark || 'IHO';
    const brandName = site.site_brand_name || 'STUDIO';
    const brandTagline = site.site_tagline || 'Performance Store';

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [hoveredLink, setHoveredLink] = useState(null);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    // 🚀 DYNAMIC NAV LINKS: Using DB data if available, else standard fallback
    const navLinks = navigationMenu.length > 0
        ? navigationMenu.map(menu => ({
            name: menu.name,
            href: menu.href === '/shop?offers=1' ? '/offers' : menu.href,
            icon: IconMap[menu.icon] || Tag,
            highlight: menu.highlight,
            sale: menu.sale
        }))
        : [
            { name: 'Men', href: '/shop?gender=men', icon: User },
            { name: 'Women', href: '/shop?gender=women', icon: Heart },
            { name: 'Gym Wear', href: '/shop?category=gym-wear', icon: Dumbbell },
            { name: 'Running Wear', href: '/shop?category=running-wear', icon: Activity },
            { name: 'New Arrivals', href: '/shop?sort=newest', highlight: true, icon: Flame },
            { name: 'Offers', href: '/offers', sale: true, icon: Tag },
        ];

    const USER_MENU_ITEMS = [
        { label: 'Studio Profile', href: '/account?tab=profile', icon: User },
        { label: 'Order Archive', href: '/account?tab=orders', icon: Package },
        { label: 'Saved Destinations', href: '/account?tab=addresses', icon: MapPin },
        { label: 'Wishlist', href: '/wishlist', icon: Heart },
        { label: 'Exclusive Offers', href: '/account?tab=coupons', icon: Ticket },
        { label: 'Returns', href: '/account?tab=returns', icon: RefreshCcw },
        { label: 'Concierge Support', href: '/support', icon: HelpCircle },
    ];

    // Safe Static Mega Menus (No JSON Parsing Required)
    const megaMenus = {
        Men: [
            { title: 'Topwear', links: [['T-Shirts', '/shop?gender=men&subcategory=t-shirts'], ['Hoodies', '/shop?gender=men&subcategory=hoodies'], ['Jackets', '/shop?gender=men&subcategory=jackets'], ['Training Tanks', '/shop?gender=men&subcategory=tanks']] },
            { title: 'Bottomwear', links: [['Joggers', '/shop?gender=men&subcategory=joggers'], ['Shorts', '/shop?gender=men&subcategory=shorts'], ['Track Pants', '/shop?gender=men&subcategory=track-pants']] },
            { title: 'Shop By Sport', links: [['Gym Wear', '/shop?category=gym-wear'], ['Running Wear', '/shop?category=running-wear'], ['Activewear', '/shop?gender=men']] },
        ],
        Women: [
            { title: 'Topwear', links: [['Sports Bras', '/shop?gender=women&subcategory=sports-bras'], ['T-Shirts', '/shop?gender=women&subcategory=t-shirts'], ['Tanks', '/shop?gender=women&subcategory=tanks'], ['Jackets', '/shop?gender=women&subcategory=jackets']] },
            { title: 'Bottomwear', links: [['Tights', '/shop?gender=women&subcategory=tights'], ['Joggers', '/shop?gender=women&subcategory=joggers'], ['Shorts', '/shop?gender=women&subcategory=shorts']] },
            { title: 'Shop By Sport', links: [['Gym Wear', '/shop?category=gym-wear'], ['Running Wear', '/shop?category=running-wear'], ['Activewear', '/shop?gender=women']] },
        ],
        'Gym Wear': [
            { title: 'Training', links: [['Compression', '/shop?category=gym-wear&subcategory=compression'], ['Oversized Tees', '/shop?category=gym-wear&subcategory=oversized'], ['Lifting Gear', '/shop?category=gym-wear&subcategory=lifting']] },
            { title: 'Intensity', links: [['Light Training', '/shop?category=gym-wear&discount=20'], ['High Performance', '/shop?category=gym-wear&sort=popular'], ['New Gym Drops', '/shop?category=gym-wear&sort=newest']] },
        ],
        'Running Wear': [
            { title: 'Run Essentials', links: [['Running Tees', '/shop?category=running-wear&subcategory=t-shirts'], ['Shorts', '/shop?category=running-wear&subcategory=shorts'], ['Track Pants', '/shop?category=running-wear&subcategory=track-pants']] },
            { title: 'Pace Picks', links: [['Lightweight', '/shop?category=running-wear&sort=newest'], ['Best Sellers', '/shop?category=running-wear&sort=popular'], ['Deals', '/shop?category=running-wear&discount=30']] },
        ],
        Offers: [
            { title: 'Deals', links: [['All Offers', '/offers'], ['Under Rs 999', '/shop?max_price=999'], ['40% Off And More', '/shop?discount=40'], ['Best Seller Deals', '/shop?sort=popular']] },
        ],
    };

    const trendingSearches = ['oversized t-shirts', 'gym joggers', 'running shorts', 'black hoodie', 'compression wear', 'new arrivals'];

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setIsUserMenuOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const syncCart = () => setCartCount(getCartItems().reduce((total, item) => total + Number(item.quantity || 1), 0));
        syncCart();
        window.addEventListener('cart-updated', syncCart);
        window.addEventListener('storage', syncCart);
        return () => {
            window.removeEventListener('cart-updated', syncCart);
            window.removeEventListener('storage', syncCart);
        };
    }, []);

    useEffect(() => {
        const syncWishlist = () => setWishlistCount(getWishlistItems().length);
        syncWishlist();
        window.addEventListener('wishlist-updated', syncWishlist);
        window.addEventListener('storage', syncWishlist);
        return () => {
            window.removeEventListener('wishlist-updated', syncWishlist);
            window.removeEventListener('storage', syncWishlist);
        };
    }, []);

    const handleLogout = () => {
        setIsMobileMenuOpen(false);
        setIsUserMenuOpen(false);
        router.post('/logout');
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setIsSearchOpen(false);
            router.get('/shop', { search: searchQuery });
            setSearchQuery('');
        }
    };

    return (
        <>
            {/* 🚀 LEFT VERTICAL SIDEBAR (GLASSMORPHISM & BLUE-WHITE THEME) */}
            {vertical && !admin && (
                <motion.aside
                    initial={{ x: -280 }} animate={{ x: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="group/sidebar fixed inset-y-0 left-0 z-50 hidden w-20 overflow-hidden border-r border-slate-200/50 bg-white/80 backdrop-blur-2xl shadow-[10px_0_30px_rgba(0,0,0,0.03)] transition-[width] duration-500 ease-out hover:w-72 lg:flex lg:flex-col"
                >
                    <div className="flex h-full w-72 flex-col py-6">
                        <Link href="/" className="ml-[18px] grid size-12 place-items-center bg-[#1E293B] text-[10px] font-black tracking-widest text-white shadow-md transition-transform hover:scale-105" title={brandName}>
                            {logoUrl ? <img src={logoUrl} alt={brandName} className="h-full w-full object-contain p-1" /> : logoMark}
                        </Link>

                        <div className="pointer-events-none absolute left-0 top-1/2 flex w-20 -translate-y-1/2 justify-center transition-opacity duration-200 group-hover/sidebar:opacity-0">
                            <span className="-rotate-90 text-[9px] font-black uppercase tracking-[0.45em] text-[#1E293B]/40">Menu</span>
                        </div>

                        <div className="flex flex-1 translate-x-4 flex-col opacity-0 transition-all duration-500 ease-out group-hover/sidebar:translate-x-0 group-hover/sidebar:opacity-100">
                            <div className="px-6 pb-8 pt-6">
                                <p className="text-xl font-black uppercase italic tracking-tighter text-[#1E293B]">{brandName}</p>
                                <p className="mt-1 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">{brandTagline}</p>
                            </div>

                            <nav className="flex flex-1 flex-col gap-2 px-2 pt-2">
                                {[...navLinks, { name: user ? 'Account' : 'Login', href: user ? '/account' : '/login' }, { name: 'Wishlist', href: '/wishlist' }].map((link, index) => {
                                    const isActive = link.href === '/'
                                        ? currentUrl === '/'
                                        : currentUrl.startsWith(link.href.split('?')[0]) && currentUrl.includes(link.href.split('?')[1]?.split('=')[1] || '');

                                    return (
                                        <Link
                                            key={`vertical-label-${index}`}
                                            href={link.href}
                                            className={`relative flex min-h-12 items-center rounded-xl px-5 text-xs font-black tracking-wider uppercase transition-all duration-300 ${isActive ? 'bg-[#0B5CAD] text-white shadow-[0_5px_15px_rgba(11,92,173,0.2)]' : link.sale ? 'text-red-500 hover:bg-slate-50' : 'text-slate-600 hover:bg-slate-50 hover:text-[#0B5CAD] hover:translate-x-1'}`}
                                        >
                                            {link.name}
                                            {link.name === 'Wishlist' && wishlistCount > 0 && <span className="ml-2 text-[10px] text-red-500 font-bold">({wishlistCount})</span>}
                                            {link.highlight && <span className="ml-auto rounded-md bg-[#1E293B] px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-white shadow-sm">New</span>}
                                        </Link>
                                    );
                                })}

                                <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="flex min-h-12 items-center rounded-xl px-5 text-left text-xs font-black uppercase tracking-wider text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#0B5CAD]">
                                    Search
                                </button>
                                <button onClick={() => setIsCartOpen(true)} className="flex min-h-12 items-center rounded-xl px-5 text-left text-xs font-black uppercase tracking-wider text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#0B5CAD]">
                                    Cart {cartCount > 0 ? <span className="ml-2 text-red-500">({cartCount})</span> : ''}
                                </button>
                            </nav>
                        </div>
                    </div>
                </motion.aside>
            )}

            {/* ❄️ Expandable Search Bar (Vertical Desktop) */}
            <AnimatePresence>
                {vertical && isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="fixed left-24 top-6 z-[60] hidden w-[min(520px,calc(100vw-8rem))] border border-slate-100 bg-white/95 backdrop-blur-xl p-4 shadow-2xl rounded-2xl lg:block"
                    >
                        <form onSubmit={handleSearchSubmit} className="flex items-center gap-4">
                            <Search size={20} className="text-[#0B5CAD]" />
                            <input
                                type="text" autoFocus placeholder={site.nav_search_placeholder || 'SEARCH PERFORMANCE GEAR...'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                className="min-w-0 flex-1 border-none bg-transparent p-0 text-xs font-black uppercase tracking-widest text-[#1E293B] outline-none placeholder:text-slate-300 focus:ring-0"
                            />
                            <button type="button" onClick={() => setIsSearchOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors">Close</button>
                        </form>
                        <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
                            {trendingSearches.map((term) => (
                                <button key={term} type="button" onClick={() => { setIsSearchOpen(false); router.get('/shop', { search: term }); }} className="bg-slate-50 border border-slate-200 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition hover:bg-[#0B5CAD] hover:text-white rounded-lg">
                                    {term}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 🚀 HORIZONTAL HEADER (Mobiles & Non-Vertical Desktops) */}
            <motion.header
                initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={`fixed top-0 left-0 right-0 z-40 flex justify-center transition-all duration-500 pt-0 sm:pt-4 px-0 sm:px-4 ${vertical ? 'lg:hidden' : ''} ${isScrolled ? 'pt-0 sm:pt-0' : ''}`}
            >
                <div className={`relative flex items-center justify-between w-full transition-all duration-500 bg-white/90 backdrop-blur-2xl border-b border-slate-100 ${isScrolled ? 'shadow-[0_10px_30px_rgba(30,41,59,0.05)] sm:rounded-none' : 'sm:rounded-xl'} px-5 py-3 md:py-4`}>

                    {/* Mobile Menu & Search */}
                    <div className="flex-1 flex items-center gap-4 lg:hidden">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[#1E293B] hover:text-[#0B5CAD] transition-colors p-1 active:scale-90">
                            {isMobileMenuOpen ? <X size={24} strokeWidth={2} /> : <Menu size={24} strokeWidth={2} />}
                        </button>
                        <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="text-[#1E293B] hover:text-[#0B5CAD] transition-colors p-1 active:scale-90">
                            <Search size={20} strokeWidth={2} />
                        </button>
                    </div>

                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center justify-center lg:justify-start lg:w-48 z-20">
                        <Link href={admin ? '/franchise-superadmin' : '/'} className="flex items-center gap-3 group">
                            <div className="grid size-8 md:size-9 place-items-center bg-[#1E293B] text-white text-[10px] md:text-[11px] font-black tracking-widest group-hover:bg-[#0B5CAD] transition-colors shadow-md">
                                {logoUrl ? <img src={logoUrl} alt={brandName} className="h-full w-full object-contain p-1" /> : logoMark}
                            </div>
                            <span className="hidden md:block text-2xl font-black tracking-tighter uppercase leading-none text-[#1E293B] italic">
                                {brandName}
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden lg:flex flex-1 justify-center gap-8" onMouseLeave={() => setHoveredLink(null)}>
                        {navLinks.map((link, index) => (
                            <Link
                                key={`desktop-nav-${index}`} href={link.href} onMouseEnter={() => setHoveredLink(link.name)}
                                className={`relative py-2 text-[11px] font-black uppercase tracking-[0.15em] transition-colors group ${link.sale ? 'text-red-500' : 'text-[#1E293B] hover:text-[#0B5CAD]'}`}
                            >
                                {link.name}
                                <motion.div
                                    className={`absolute bottom-0 left-0 h-[2px] ${link.sale ? 'bg-red-500' : 'bg-[#0B5CAD]'}`}
                                    initial={{ width: 0 }} animate={{ width: hoveredLink === link.name ? '100%' : 0 }} transition={{ duration: 0.3 }}
                                />
                                {link.highlight && <span className="absolute -top-2.5 -right-4 text-[7px] bg-[#1E293B] text-white px-1.5 py-0.5 font-black uppercase tracking-widest rounded-sm">NEW</span>}
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop Mega Menu */}
                    <AnimatePresence>
                        {!admin && hoveredLink && megaMenus[hoveredLink] && (
                            <motion.div
                                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
                                onMouseEnter={() => setHoveredLink(hoveredLink)} onMouseLeave={() => setHoveredLink(null)}
                                className="absolute left-1/2 top-full z-[90] hidden w-[min(920px,calc(100vw-4rem))] -translate-x-1/2 border border-slate-100 bg-white/95 backdrop-blur-2xl p-7 shadow-2xl rounded-b-2xl lg:block"
                            >
                                <div className="grid gap-8 md:grid-cols-[1fr_1fr_1fr_220px]">
                                    {megaMenus[hoveredLink].map((column) => (
                                        <div key={column.title}>
                                            <p className="mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-[#0B5CAD]">{column.title}</p>
                                            <div className="flex flex-col gap-3">
                                                {column.links.map(([label, href]) => (
                                                    <Link key={href} href={href} className="text-xs font-bold uppercase tracking-widest text-slate-500 transition hover:text-[#1E293B] hover:translate-x-1">
                                                        {label}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="bg-gradient-to-br from-blue-50 to-slate-100 p-5 rounded-xl border border-blue-100/50">
                                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0B5CAD]">{site.nav_promo_eyebrow || 'IHO Style Days'}</p>
                                        <h3 className="mt-3 text-2xl font-black uppercase leading-tight text-[#1E293B]">{site.nav_promo_title || 'Fresh drops, sharper deals'}</h3>
                                        <Link href={site.nav_promo_link || '/shop?sort=newest'} className="mt-5 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#1E293B] hover:text-[#0B5CAD] transition-colors">
                                            {site.nav_promo_cta || 'Explore'} <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Right Actions */}
                    <div className="flex-1 flex justify-end items-center gap-4 lg:gap-6 lg:w-48">
                        {!admin && (
                            <>
                                <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="text-[#1E293B] hover:text-[#0B5CAD] transition-colors hidden lg:block p-1 active:scale-95">
                                    <Search size={20} strokeWidth={2} />
                                </button>
                                <Link href="/wishlist" className="relative text-[#1E293B] hover:text-[#0B5CAD] transition-colors hidden sm:block p-1 active:scale-95">
                                    <Heart size={20} strokeWidth={2} />
                                    {wishlistCount > 0 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1.5 -right-2 size-4 bg-[#E94E3C] text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white">{wishlistCount}</motion.span>}
                                </Link>
                            </>
                        )}

                        {user ? (
                            <div className="relative hidden sm:block" ref={userMenuRef}>
                                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2 text-[#1E293B] hover:text-[#0B5CAD] transition-colors p-1 active:scale-95">
                                    <User size={20} strokeWidth={2} />
                                    <ChevronDown size={12} className={`transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {isUserMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }}
                                            className="absolute right-0 top-12 w-64 bg-white/95 backdrop-blur-xl border border-slate-100 shadow-2xl rounded-2xl overflow-hidden z-[100] flex flex-col"
                                        >
                                            <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex flex-col gap-1">
                                                <p className="text-xs font-black uppercase tracking-widest text-[#1E293B] truncate">{user.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{user.email}</p>
                                            </div>
                                            <div className="p-2">
                                                {USER_MENU_ITEMS.map((item, i) => {
                                                    const Icon = item.icon;
                                                    return (
                                                        <Link key={`user-menu-${i}`} href={item.href} onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-slate-500 hover:text-[#0B5CAD] hover:bg-blue-50/50 rounded-xl transition-all">
                                                            <Icon size={14} className="text-slate-400 group-hover:text-[#0B5CAD]" /> {item.label}
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                            <div className="p-2 border-t border-slate-100">
                                                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                                    <LogOut size={14} /> Secure Logout
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link href="/login" className="hidden sm:block text-[#1E293B] hover:text-[#0B5CAD] transition-colors p-1 active:scale-95"><User size={20} strokeWidth={2} /></Link>
                        )}

                        {!admin && (
                            <button onClick={() => setIsCartOpen(true)} className="relative text-[#1E293B] hover:text-[#0B5CAD] transition-colors flex items-center p-1 active:scale-95">
                                <ShoppingBag size={20} strokeWidth={2} />
                                {cartCount > 0 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1.5 -right-2 size-4 bg-[#1E293B] text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white shadow-sm">{cartCount}</motion.span>}
                            </button>
                        )}
                    </div>
                </div>

                {/* Horizontal Search Expand */}
                <AnimatePresence>
                    {!vertical && isSearchOpen && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-xl overflow-hidden z-[40]">
                            <div className="max-w-4xl mx-auto px-6 py-6">
                                <form onSubmit={handleSearchSubmit} className="flex items-center gap-4">
                                    <Search size={24} className="text-[#0B5CAD]" strokeWidth={2} />
                                    <input type="text" autoFocus placeholder={site.nav_search_placeholder || 'SEARCH FOR RUNNING GEAR, GYM WEAR...'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-transparent border-none outline-none text-sm font-black uppercase tracking-widest text-[#1E293B] placeholder:text-slate-300 focus:ring-0 p-0" />
                                    <button type="button" onClick={() => setIsSearchOpen(false)} className="text-slate-400 hover:text-red-500 uppercase text-[10px] font-black tracking-widest transition-colors">Close</button>
                                </form>
                                <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100/50 pt-5">
                                    {trendingSearches.map((term) => (
                                        <button key={term} type="button" onClick={() => { setIsSearchOpen(false); router.get('/shop', { search: term }); }} className="bg-slate-50/50 border border-slate-200 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition hover:bg-[#0B5CAD] hover:text-white rounded-lg">
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.header>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

            {/* 🚀 MOBILE MENU DRAWER (SMOOTH LEFT SLIDE) */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-[100] lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
                        <motion.div
                            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white/95 backdrop-blur-2xl z-[110] lg:hidden flex flex-col shadow-[20px_0_40px_rgba(0,0,0,0.1)] border-r border-white/20"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-transparent">
                                <span className="text-xl font-black tracking-tighter uppercase text-[#1E293B] italic">{site.nav_mobile_title || 'Studio Menu'}</span>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors p-1 active:scale-90">
                                    <X size={24} strokeWidth={2} />
                                </button>
                            </div>

                            <nav className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 no-scrollbar">
                                {navLinks.map((link, index) => {
                                    const IconComponent = link.icon;
                                    return (
                                        <motion.div key={`mobile-nav-${index}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 + 0.1 }}>
                                            <Link href={link.href} className={`text-xl font-black uppercase tracking-tight flex items-center justify-between group ${link.sale ? 'text-red-500' : 'text-[#1E293B]'}`} onClick={() => setIsMobileMenuOpen(false)}>
                                                <span className="group-hover:translate-x-2 transition-transform duration-300 flex items-center gap-3">
                                                    {IconComponent && <IconComponent size={20} className="text-slate-300 group-hover:text-[#0B5CAD] transition-colors" />}
                                                    {link.name}
                                                </span>
                                                {link.highlight && <span className="text-[8px] bg-[#1E293B] text-white px-2 py-1 rounded-sm shadow-sm">NEW</span>}
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </nav>

                            <div className="p-6 bg-slate-50/50 border-t border-slate-100 space-y-4">
                                {user ? (
                                    <>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#0B5CAD] mb-2 truncate">Signed in as {user.name}</p>
                                        <Link href="/account" className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-[#1E293B] hover:text-[#0B5CAD] transition-colors" onClick={() => setIsMobileMenuOpen(false)}><User size={16} /> My Profile</Link>
                                        <Link href="/wishlist" className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-[#1E293B] hover:text-[#0B5CAD] transition-colors" onClick={() => setIsMobileMenuOpen(false)}><Heart size={16} /> Wishlist</Link>
                                        <button onClick={handleLogout} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors pt-4"><LogOut size={16} /> Secure Logout</button>
                                    </>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <Link href="/login" className="bg-[#1E293B] hover:bg-[#0B5CAD] transition-colors text-white text-center py-4 text-[10px] font-black uppercase tracking-widest w-full block rounded-xl active:scale-95 shadow-md" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                                        <Link href="/register" className="bg-white hover:bg-slate-50 border border-slate-200 text-[#1E293B] text-center py-4 text-[10px] font-black uppercase tracking-widest w-full block rounded-xl active:scale-95" onClick={() => setIsMobileMenuOpen(false)}>Create Profile</Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
