import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, usePage, router } from '@inertiajs/react';
import {
    Search, ShoppingBag, User, Menu, X, LogOut, Heart,
    ChevronDown, Package, MapPin, Ticket, RefreshCcw, HelpCircle,
    Home, Activity, Dumbbell, Flame, Tag
} from 'lucide-react';
import CartDrawer from '@/Components/CartDrawer';
import { getCartItems } from '@/lib/cart';
import { getWishlistItems } from '@/lib/wishlist';

export default function Navbar({ admin = false, vertical = false }) {
    const page = usePage();
    const { auth } = page.props;
    const user = auth?.user;
    const currentUrl = page.url || '/';

    const [isScrolled, setIsScrolled] = useState(false);

    // 🚀 FIXED: Consistent state variable for Mobile Menu
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [hoveredLink, setHoveredLink] = useState(null);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    // Dynamic Navigation Links
    const navLinks = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Men', href: '/shop?category=men-sportswear', icon: User },
        { name: 'Women', href: '/shop?category=women-sportswear', icon: Heart },
        { name: 'Gym Wear', href: '/shop?category=gym-wear', icon: Dumbbell },
        { name: 'Running Wear', href: '/shop?category=running-wear', icon: Activity },
        { name: 'New Arrivals', href: '/shop?sort=newest', highlight: true, icon: Flame },
        { name: 'Offers', href: '/shop?offers=1', sale: true, icon: Tag },
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
        const syncCart = () => {
            setCartCount(getCartItems().reduce((total, item) => total + Number(item.quantity || 1), 0));
        };
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
            {vertical && !admin && (
                <motion.aside
                    initial={{ x: -280 }}
                    animate={{ x: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="group/sidebar fixed inset-y-0 left-0 z-50 hidden w-20 overflow-hidden border-r border-white/10 bg-[#1F1F1F] text-white shadow-[10px_0_30px_rgba(15,23,42,0.12)] transition-[width] duration-300 ease-out hover:w-72 lg:flex lg:flex-col"
                >
                    <div className="flex h-full w-72 flex-col py-5">
                        <Link href="/" className="ml-[18px] grid size-11 place-items-center bg-[#0F172A] text-[9px] font-black tracking-widest text-white" title="IHO Studio">
                            IHO
                        </Link>

                        <div className="pointer-events-none absolute left-0 top-1/2 flex w-20 -translate-y-1/2 justify-center transition-opacity duration-200 group-hover/sidebar:opacity-0">
                            <span className="-rotate-90 text-[9px] font-black uppercase tracking-[0.45em] text-white/40">Menu</span>
                        </div>

                        <div className="flex flex-1 translate-x-4 flex-col opacity-0 transition-all duration-300 ease-out group-hover/sidebar:translate-x-0 group-hover/sidebar:opacity-100">
                        <div className="px-4 pb-6 pt-6">
                            <p className="text-lg font-black uppercase italic tracking-tight text-white">IHO Studio</p>
                            <p className="mt-1 text-[8px] font-black uppercase tracking-[0.35em] text-white/35">Performance Store</p>
                        </div>

                            <nav className="flex flex-1 flex-col gap-2 px-0 pt-2">
                                {[...navLinks, { name: user ? 'Account' : 'Login', href: user ? '/account' : '/login' }, { name: 'Wishlist', href: '/wishlist' }].map((link, index) => {
                                    const isActive = link.href === '/'
                                        ? currentUrl === '/'
                                        : currentUrl.startsWith(link.href.split('?')[0]) && currentUrl.includes(link.href.split('?')[1]?.split('=')[1] || '');

                                    return (
                                        <Link
                                            key={`vertical-label-${index}`}
                                            href={link.href}
                                            className={`relative flex min-h-11 items-center rounded-r-xl px-5 text-sm font-black transition-colors ${isActive ? 'bg-[#2378C8] text-white' : link.sale ? 'text-red-400 hover:bg-white/10' : 'text-slate-200 hover:bg-white/10 hover:text-white'}`}
                                        >
                                            {link.name}
                                            {link.name === 'Wishlist' && wishlistCount > 0 && <span className="ml-2 text-[10px] text-white/40">({wishlistCount})</span>}
                                            {link.highlight && <span className="ml-2 rounded bg-[#E94E3C] px-1.5 py-0.5 text-[7px] font-black uppercase tracking-widest text-white">New</span>}
                                        </Link>
                                    );
                                })}

                                <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="flex min-h-11 items-center rounded-r-xl px-5 text-left text-sm font-black text-slate-200 transition-colors hover:bg-white/10 hover:text-white">
                                    Search
                                </button>
                                <button onClick={() => setIsCartOpen(true)} className="flex min-h-11 items-center rounded-r-xl px-5 text-left text-sm font-black text-slate-200 transition-colors hover:bg-white/10 hover:text-white">
                                    Cart {cartCount > 0 ? `(${cartCount})` : ''}
                                </button>
                            </nav>
                        </div>
                    </div>
                </motion.aside>
            )}

            <AnimatePresence>
                {vertical && isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className="fixed left-24 top-6 z-[60] hidden w-[min(520px,calc(100vw-8rem))] border border-slate-200 bg-white p-4 shadow-2xl lg:block"
                    >
                        <form onSubmit={handleSearchSubmit} className="flex items-center gap-4">
                            <Search size={20} className="text-slate-300" />
                            <input
                                type="text"
                                autoFocus
                                placeholder="SEARCH PERFORMANCE GEAR..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="min-w-0 flex-1 border-none bg-transparent p-0 text-xs font-black uppercase tracking-widest text-[#1E293B] outline-none placeholder:text-slate-300 focus:ring-0"
                            />
                            <button type="button" onClick={() => setIsSearchOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black">
                                Close
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500 pt-0 sm:pt-4 px-0 sm:px-4 ${vertical ? 'lg:hidden' : ''} ${isScrolled ? 'pt-0 sm:pt-2' : ''}`}
            >
                <div
                    className={`relative flex items-center justify-between w-full transition-all duration-500 bg-white/90 backdrop-blur-2xl border-b border-slate-100 ${isScrolled ? 'shadow-[0_10px_30px_rgba(30,41,59,0.05)] sm:rounded-none' : 'sm:rounded-none'
                        } px-5 py-3`}
                >
                    {/* 📱 Mobile Menu Toggle & Search */}
                    <div className="flex-1 flex items-center gap-4 lg:hidden">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[#1E293B] hover:text-slate-400 transition-colors p-1">
                            {isMobileMenuOpen ? <X size={24} strokeWidth={2} /> : <Menu size={24} strokeWidth={2} />}
                        </button>
                        <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="text-[#1E293B] hover:text-slate-400 transition-colors p-1">
                            <Search size={20} strokeWidth={2} />
                        </button>
                    </div>

                    {/* ❄️ Logo */}
                    <div className="flex-shrink-0 flex items-center justify-center lg:justify-start lg:w-48 z-20">
                        <Link href={admin ? '/franchise-superadmin' : '/'} className="flex items-center gap-3">
                            <div className="grid size-8 place-items-center bg-[#1E293B] text-white text-[10px] font-black tracking-widest">
                                IHO
                            </div>
                            <span className="hidden md:block text-2xl font-black tracking-tighter uppercase leading-none text-[#1E293B] italic">
                                STUDIO
                            </span>
                        </Link>
                    </div>

                    {/* 💻 Desktop Navigation Links */}
                    <nav className="hidden lg:flex flex-1 justify-center gap-6" onMouseLeave={() => setHoveredLink(null)}>
                        {navLinks.map((link, index) => (
                            <Link
                                key={`desktop-nav-${index}`}
                                href={link.href}
                                onMouseEnter={() => setHoveredLink(link.name)}
                                className="relative py-2 text-[11px] font-black uppercase tracking-[0.15em] text-[#1E293B] transition-colors group"
                            >
                                <span className={link.sale ? 'text-red-500' : ''}>
                                    {link.name}
                                </span>
                                {/* Subtle Hover Underline */}
                                <motion.div
                                    className={`absolute bottom-0 left-0 h-[2px] ${link.sale ? 'bg-red-500' : 'bg-[#1E293B]'}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: hoveredLink === link.name ? '100%' : 0 }}
                                    transition={{ duration: 0.3 }}
                                />
                                {/* New Indicator Badge */}
                                {link.highlight && (
                                    <span className="absolute -top-2 -right-3 text-[7px] bg-[#1E293B] text-white px-1.5 py-0.5 font-black uppercase tracking-widest">
                                        NEW
                                    </span>
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* 🛒 Actions (Right Side) */}
                    <div className="flex-1 flex justify-end items-center gap-4 lg:gap-6 lg:w-48">
                        {!admin && (
                            <>
                                {/* Desktop Search */}
                                <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="text-[#1E293B] hover:text-slate-400 transition-colors hidden lg:block p-1">
                                    <Search size={20} strokeWidth={2} />
                                </button>

                                {/* Wishlist */}
                                <Link href="/wishlist" className="relative text-[#1E293B] hover:text-slate-400 transition-colors hidden sm:block p-1">
                                    <Heart size={20} strokeWidth={2} />
                                    {wishlistCount > 0 && (
                                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1.5 -right-2 size-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white">
                                            {wishlistCount}
                                        </motion.span>
                                    )}
                                </Link>
                            </>
                        )}

                        {/* Profile / Auth */}
                        {user ? (
                            <div className="relative hidden sm:block" ref={userMenuRef}>
                                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2 text-[#1E293B] hover:text-slate-400 transition-colors p-1">
                                    <User size={20} strokeWidth={2} />
                                    <ChevronDown size={12} className={`transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown */}
                                <AnimatePresence>
                                    {isUserMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }}
                                            className="absolute right-0 top-10 w-64 bg-white border border-slate-100 shadow-2xl rounded-none z-[100] flex flex-col"
                                        >
                                            <div className="p-5 bg-slate-50 border-b border-slate-100 flex flex-col gap-1">
                                                <p className="text-xs font-black uppercase tracking-widest text-[#1E293B] truncate">{user.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{user.email}</p>
                                            </div>
                                            <div className="p-2">
                                                {USER_MENU_ITEMS.map((item, i) => {
                                                    const Icon = item.icon;
                                                    return item.isButton ? (
                                                        <button key={`user-menu-${i}`} onClick={item.action} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-slate-500 hover:text-[#1E293B] hover:bg-slate-50 transition-all text-left">
                                                            <Icon size={14} className="text-slate-400" /> {item.label}
                                                        </button>
                                                    ) : (
                                                        <Link key={`user-menu-${i}`} href={item.href} onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-slate-500 hover:text-[#1E293B] hover:bg-slate-50 transition-all">
                                                            <Icon size={14} className="text-slate-400" /> {item.label}
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                            <div className="p-2 border-t border-slate-100">
                                                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-red-500 hover:bg-red-50 transition-all">
                                                    <LogOut size={14} /> Secure Logout
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link href="/login" className="hidden sm:block text-[#1E293B] hover:text-slate-400 transition-colors p-1">
                                <User size={20} strokeWidth={2} />
                            </Link>
                        )}

                        {/* Cart */}
                        {!admin && (
                            <button onClick={() => setIsCartOpen(true)} className="relative text-[#1E293B] hover:text-slate-400 transition-colors flex items-center p-1">
                                <ShoppingBag size={20} strokeWidth={2} />
                                {cartCount > 0 && (
                                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1.5 -right-2 size-4 bg-[#1E293B] text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white">
                                        {cartCount}
                                    </motion.span>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* ❄️ Expandable Search Bar */}
                <AnimatePresence>
                    {isSearchOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="absolute top-full left-0 w-full bg-white border-b border-slate-100 shadow-xl overflow-hidden z-[40]"
                        >
                            <div className="max-w-4xl mx-auto px-6 py-6">
                                <form onSubmit={handleSearchSubmit} className="flex items-center gap-4">
                                    <Search size={24} className="text-slate-300" strokeWidth={1.5} />
                                    <input
                                        type="text" autoFocus placeholder="SEARCH FOR RUNNING GEAR, GYM WEAR..."
                                        value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                        className="flex-1 bg-transparent border-none outline-none text-sm font-black uppercase tracking-widest text-[#1E293B] placeholder:text-slate-300 focus:ring-0 p-0"
                                    />
                                    <button type="button" onClick={() => setIsSearchOpen(false)} className="text-slate-400 hover:text-black uppercase text-[10px] font-black tracking-widest">
                                        Close
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.header>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

            {/* 📱 MOBILE MENU DRAWER (Fixed state variable: isMobileMenuOpen) */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-md z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
                        <motion.div
                            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white z-50 lg:hidden flex flex-col shadow-2xl"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <span className="text-xl font-black tracking-tighter uppercase text-[#1E293B] italic">Studio Menu</span>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-black p-1">
                                    <X size={24} />
                                </button>
                            </div>

                            <nav className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                                {navLinks.map((link, index) => (
                                    <Link key={`mobile-nav-${index}`} href={link.href} className={`text-xl font-black uppercase tracking-tight ${link.sale ? 'text-red-500' : 'text-[#1E293B]'}`} onClick={() => setIsMobileMenuOpen(false)}>
                                        {link.name}
                                        {link.highlight && <span className="ml-3 text-[8px] bg-black text-white px-2 py-1 align-middle rounded-sm">NEW</span>}
                                    </Link>
                                ))}
                            </nav>

                            <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
                                {user ? (
                                    <>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8] mb-2">Signed in as {user.name}</p>
                                        <Link href="/account" className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-[#1E293B]" onClick={() => setIsMobileMenuOpen(false)}><User size={16} /> My Profile</Link>
                                        <Link href="/wishlist" className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-[#1E293B]" onClick={() => setIsMobileMenuOpen(false)}><Heart size={16} /> Wishlist</Link>
                                        <button onClick={handleLogout} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-red-500 pt-4"><LogOut size={16} /> Secure Logout</button>
                                    </>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <Link href="/login" className="bg-black text-white text-center py-4 text-[10px] font-black uppercase tracking-widest w-full block rounded-none" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                                        <Link href="/register" className="bg-white border border-slate-200 text-black text-center py-4 text-[10px] font-black uppercase tracking-widest w-full block rounded-none" onClick={() => setIsMobileMenuOpen(false)}>Create Profile</Link>
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
