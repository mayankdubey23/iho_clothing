// resources/js/Components/Navbar.jsx
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

const IconMap = { Home, User, Heart, Dumbbell, Activity, Flame, Tag, Package, MapPin, Ticket, RefreshCcw, HelpCircle };

export default function Navbar({ admin = false, vertical = false }) {
    const page = usePage();
    const { auth, site = {}, navigationMenu = [] } = page.props;
    const user = auth?.user;
    const currentUrl = page.url || '/';
    const logoUrl = site.site_logo ? `/storage/${site.site_logo}` : null;
    const logoMark = site.site_logo_mark || 'IHO';
    const brandName = site.site_brand_name || 'STUDIO';
    const brandTagline = site.site_tagline || 'Performance Store';

    // 🚀 NEW STATE: Controls whether the hover-navbar is visible
    const [isNavVisible, setIsNavVisible] = useState(false);
    
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [hoveredLink, setHoveredLink] = useState(null);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    const navLinks = navigationMenu.length > 0
        ? navigationMenu.filter(menu => {
            const href = menu.href || '';
            return href !== '/offers' && href !== '/shop?offers=1' && String(menu.name || '').toLowerCase() !== 'offers';
        }).map(menu => ({
            name: menu.name, href: menu.href, icon: IconMap[menu.icon] || Tag, highlight: menu.highlight, sale: menu.sale
        }))
        : [
            { name: 'Men', href: '/shop?gender=men', icon: User },
            { name: 'Women', href: '/shop?gender=women', icon: Heart },
            { name: 'Gym Wear', href: '/shop?category=gym-wear', icon: Dumbbell },
            { name: 'Running Wear', href: '/shop?category=running-wear', icon: Activity },
            { name: 'New Arrivals', href: '/shop?sort=newest', highlight: true, icon: Flame },
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

    const trendingSearches = ['oversized t-shirts', 'gym joggers', 'running shorts', 'black hoodie', 'compression wear', 'new arrivals'];

    useEffect(() => {
        function handleClickOutside(event) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setIsUserMenuOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const syncCart = () => setCartCount(getCartItems().reduce((total, item) => total + Number(item.quantity || 1), 0));
        const syncWishlist = () => setWishlistCount(getWishlistItems().length);
        syncCart(); syncWishlist();
        window.addEventListener('cart-updated', syncCart);
        window.addEventListener('wishlist-updated', syncWishlist);
        window.addEventListener('storage', () => { syncCart(); syncWishlist(); });
        return () => {
            window.removeEventListener('cart-updated', syncCart);
            window.removeEventListener('wishlist-updated', syncWishlist);
        };
    }, []);

    const handleLogout = () => { setIsMobileMenuOpen(false); setIsUserMenuOpen(false); router.post('/logout'); };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setIsSearchOpen(false); router.get('/shop', { search: searchQuery }); setSearchQuery('');
        }
    };

    // Determine if the nav should be locked open (e.g. searching, mobile menu open, user menu open)
    const isNavLockedOpen = isMobileMenuOpen || isSearchOpen || isUserMenuOpen || hoveredLink;

    return (
        <>
            {/* 🚀 INVISIBLE TRIGGER ZONE: Drop nav when mouse hits top 40px */}
            <div 
                className="fixed top-0 left-0 right-0 h-16 z-[60] hidden lg:block pointer-events-auto"
                onMouseEnter={() => setIsNavVisible(true)}
            />

            {/* 🚀 THEME UPDATED: Floating Unique Pill Navbar */}
            <motion.header
                initial={{ y: '-100%', opacity: 0 }}
                animate={{ 
                    y: isNavVisible || isNavLockedOpen ? 0 : '-100%', 
                    opacity: isNavVisible || isNavLockedOpen ? 1 : 0 
                }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                onMouseEnter={() => setIsNavVisible(true)}
                onMouseLeave={() => setIsNavVisible(false)}
                className={`fixed top-4 left-4 right-4 z-[70] flex justify-center transition-all ${vertical ? 'lg:hidden' : ''}`}
            >
                <div className="relative flex items-center justify-between w-full max-w-7xl bg-white/80 backdrop-blur-2xl border border-white/40 shadow-[0_20px_40px_rgba(0,0,0,0.1)] rounded-2xl px-6 py-3">

                    {/* Mobile Menu & Search */}
                    <div className="flex-1 flex items-center gap-4 lg:hidden">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[#282c3f] hover:text-[#ff3f6c] transition-colors p-1 active:scale-90">
                            {isMobileMenuOpen ? <X size={24} strokeWidth={2} /> : <Menu size={24} strokeWidth={2} />}
                        </button>
                    </div>

                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center justify-center lg:justify-start lg:w-48 z-20">
                        <Link href={admin ? '/franchise-superadmin' : '/'} className="flex items-center gap-3 group">
                            <div className="grid size-10 place-items-center bg-[#282c3f] rounded-lg text-white text-[12px] font-black tracking-widest group-hover:bg-[#ff3f6c] transition-colors shadow-lg">
                                {logoUrl ? <img src={logoUrl} alt={brandName} className="h-full w-full object-contain p-1" /> : logoMark}
                            </div>
                            <span className="hidden md:block text-xl font-black tracking-tighter uppercase leading-none text-[#282c3f] italic">
                                {brandName}
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden lg:flex flex-1 justify-center gap-6 xl:gap-8" onMouseLeave={() => setHoveredLink(null)}>
                        {navLinks.map((link, index) => (
                            <div key={`desktop-nav-${index}`} onMouseEnter={() => setHoveredLink(link.name)} className="relative h-full flex items-center">
                                <Link
                                    href={link.href} 
                                    className={`relative whitespace-nowrap py-2 text-[10px] font-black uppercase tracking-[0.15em] transition-colors group xl:text-[11px] ${link.sale ? 'text-red-500' : 'text-[#282c3f] hover:text-[#ff3f6c]'}`}
                                >
                                    {link.name}
                                    {hoveredLink === link.name && (
                                        <motion.div layoutId="nav-underline" className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#ff3f6c]" />
                                    )}
                                    {link.highlight && <span className="absolute -top-3 -right-4 text-[7px] bg-[#282c3f] text-white px-1.5 py-0.5 font-black uppercase tracking-widest rounded-md">NEW</span>}
                                </Link>
                            </div>
                        ))}
                    </nav>

                    {/* Right Actions */}
                    <div className="flex-1 flex justify-end items-center gap-4 lg:gap-6 lg:w-48">
                        {!admin && (
                            <>
                                <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="text-[#282c3f] hover:text-[#ff3f6c] transition-colors p-1 active:scale-95">
                                    <Search size={20} strokeWidth={2.5} />
                                </button>
                                <Link href="/wishlist" className="relative text-[#282c3f] hover:text-[#ff3f6c] transition-colors hidden sm:block p-1 active:scale-95">
                                    <Heart size={20} strokeWidth={2.5} />
                                    {wishlistCount > 0 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-2 size-4 bg-[#ff3f6c] text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white">{wishlistCount}</motion.span>}
                                </Link>
                            </>
                        )}

                        {user ? (
                            <div className="relative hidden sm:block" ref={userMenuRef}>
                                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2 text-[#282c3f] hover:text-[#ff3f6c] transition-colors p-1 active:scale-95">
                                    <User size={20} strokeWidth={2.5} />
                                    <ChevronDown size={12} className={`transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {isUserMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }}
                                            className="absolute right-0 top-12 w-64 bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden flex flex-col"
                                        >
                                            <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex flex-col gap-1">
                                                <p className="text-xs font-black uppercase tracking-widest text-[#282c3f] truncate">{user.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{user.email}</p>
                                            </div>
                                            <div className="p-2">
                                                {USER_MENU_ITEMS.map((item, i) => {
                                                    const Icon = item.icon;
                                                    return (
                                                        <Link key={`user-menu-${i}`} href={item.href} onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-slate-500 hover:text-[#ff3f6c] hover:bg-slate-50 rounded-xl transition-all">
                                                            <Icon size={14} className="text-slate-400 group-hover:text-[#ff3f6c]" /> {item.label}
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
                            <Link href="/login" className="hidden sm:block text-[#282c3f] hover:text-[#ff3f6c] transition-colors p-1 active:scale-95"><User size={20} strokeWidth={2.5} /></Link>
                        )}

                        {!admin && (
                            <button onClick={() => setIsCartOpen(true)} className="relative text-[#282c3f] hover:text-[#ff3f6c] transition-colors flex items-center p-1 active:scale-95">
                                <ShoppingBag size={20} strokeWidth={2.5} />
                                {cartCount > 0 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-2 size-4 bg-[#282c3f] text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white shadow-sm">{cartCount}</motion.span>}
                            </button>
                        )}
                    </div>
                </div>

                {/* Search Expand built directly into the floating pill */}
                <AnimatePresence>
                    {!vertical && isSearchOpen && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-slate-100 shadow-2xl rounded-2xl overflow-hidden z-[40]">
                            <div className="p-6">
                                <form onSubmit={handleSearchSubmit} className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <Search size={20} className="text-[#ff3f6c]" strokeWidth={2} />
                                    <input type="text" autoFocus placeholder={site.nav_search_placeholder || 'SEARCH PERFORMANCE GEAR...'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-transparent border-none outline-none text-xs font-black uppercase tracking-widest text-[#282c3f] placeholder:text-slate-400 focus:ring-0 p-0" />
                                    <button type="button" onClick={() => setIsSearchOpen(false)} className="text-slate-400 hover:text-red-500 uppercase text-[10px] font-black tracking-widest transition-colors">Close</button>
                                </form>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {trendingSearches.map((term) => (
                                        <button key={term} type="button" onClick={() => { setIsSearchOpen(false); router.get('/shop', { search: term }); }} className="bg-white border border-slate-200 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-slate-500 transition hover:bg-[#ff3f6c] hover:border-[#ff3f6c] hover:text-white rounded-lg">
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

            {/* Mobile Sidebar Navigation stays mostly the same */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 bg-[#282c3f]/40 backdrop-blur-sm z-[100] lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
                        <motion.div
                            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white/95 backdrop-blur-2xl z-[110] lg:hidden flex flex-col shadow-[20px_0_40px_rgba(0,0,0,0.1)] border-r border-white/20"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-transparent">
                                <span className="text-xl font-black tracking-tighter uppercase text-[#282c3f] italic">{site.nav_mobile_title || 'Studio Menu'}</span>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors p-1 active:scale-90">
                                    <X size={24} strokeWidth={2} />
                                </button>
                            </div>

                            <nav className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 no-scrollbar">
                                {navLinks.map((link, index) => {
                                    const IconComponent = link.icon;
                                    return (
                                        <motion.div key={`mobile-nav-${index}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 + 0.1 }}>
                                            <Link href={link.href} className={`text-xl font-black uppercase tracking-tight flex items-center justify-between group ${link.sale ? 'text-red-500' : 'text-[#282c3f]'}`} onClick={() => setIsMobileMenuOpen(false)}>
                                                <span className="group-hover:translate-x-2 transition-transform duration-300 flex items-center gap-3">
                                                    {IconComponent && <IconComponent size={20} className="text-slate-300 group-hover:text-[#ff3f6c] transition-colors" />}
                                                    {link.name}
                                                </span>
                                                {link.highlight && <span className="text-[8px] bg-[#282c3f] text-white px-2 py-1 rounded-sm shadow-sm">NEW</span>}
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </nav>

                            <div className="p-6 bg-slate-50/50 border-t border-slate-100 space-y-4">
                                {user ? (
                                    <>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#ff3f6c] mb-2 truncate">Signed in as {user.name}</p>
                                        <Link href="/account" className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-[#282c3f] hover:text-[#ff3f6c] transition-colors" onClick={() => setIsMobileMenuOpen(false)}><User size={16} /> My Profile</Link>
                                        <Link href="/wishlist" className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-[#282c3f] hover:text-[#ff3f6c] transition-colors" onClick={() => setIsMobileMenuOpen(false)}><Heart size={16} /> Wishlist</Link>
                                        <button onClick={handleLogout} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors pt-4"><LogOut size={16} /> Secure Logout</button>
                                    </>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <Link href="/login" className="bg-[#282c3f] hover:bg-[#ff3f6c] transition-colors text-white text-center py-4 text-[10px] font-black uppercase tracking-widest w-full block rounded-xl active:scale-95 shadow-md" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                                        <Link href="/register" className="bg-white hover:bg-slate-50 border border-slate-200 text-[#282c3f] text-center py-4 text-[10px] font-black uppercase tracking-widest w-full block rounded-xl active:scale-95" onClick={() => setIsMobileMenuOpen(false)}>Create Profile</Link>
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