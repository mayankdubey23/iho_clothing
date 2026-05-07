import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, usePage, router } from '@inertiajs/react';
import { Search, ShoppingBag, User, Menu, X, LogOut, Heart, ChevronDown } from 'lucide-react';
import { ACCOUNT_MENU } from '@/Layouts/AppLayout';
import CartDrawer from '@/Components/CartDrawer';

export default function Navbar({ navLinks, admin = false }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [hoveredLink, setHoveredLink] = useState(null);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        setIsMobileMenuOpen(false);
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

    // Spring animation config for micro-interactions
    const springConfig = { type: 'spring', stiffness: 400, damping: 17 };

    return (
        <>
            {/* Main Header */}
            <motion.header
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500 pt-4 px-4 ${
                    isScrolled ? 'py-2' : 'py-6'
                }`}
            >
                <motion.div
                    layout
                    className={`relative flex items-center justify-between w-full mx-auto transition-all duration-500 overflow-hidden ${
                        isScrolled || isSearchOpen
                            ? 'max-w-5xl bg-white/80 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.06)] rounded-full px-6 py-2'
                            : 'max-w-7xl bg-transparent px-4 py-2'
                    }`}
                >
                    {/* Mobile Menu Toggle */}
                    <div className="flex-1 md:hidden">
                        <motion.button 
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                            className="p-2 -ml-2 text-[#1A1A2E] hover:text-[#E94E3C] transition-colors rounded-full bg-gray-50/50"
                        >
                            {isMobileMenuOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
                        </motion.button>
                    </div>

                    {/* Desktop Links (Left) */}
                    <nav className="hidden md:flex flex-1 gap-1 items-center" onMouseLeave={() => setHoveredLink(null)}>
                        {navLinks.map((link) => (
                            <Link 
                                key={link.name} 
                                href={link.href}
                                onMouseEnter={() => setHoveredLink(link.name)}
                                className="relative px-4 py-2 text-sm font-bold uppercase tracking-wider text-[#1A1A2E] transition-colors group z-10"
                            >
                                {hoveredLink === link.name && (
                                    <motion.div
                                        layoutId="nav-pill"
                                        className="absolute inset-0 bg-gray-100/80 rounded-full -z-10"
                                        transition={springConfig}
                                    />
                                )}
                                <span className="relative z-10 group-hover:text-[#E94E3C] transition-colors">{link.name}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Logo (Center) */}
                    <div className="flex-shrink-0 flex items-center justify-center z-20">
                        <Link href={admin ? '/admin' : '/'} className="flex items-center gap-2 group">
                            <motion.div 
                                whileHover={{ rotate: 90 }}
                                transition={springConfig}
                                className="grid size-9 place-items-center bg-[#1A1A2E] rounded-xl text-[10px] tracking-widest text-white shadow-md group-hover:shadow-lg group-hover:bg-[#E94E3C] transition-colors"
                            >
                                IHO
                            </motion.div>
                            <div className="hidden sm:block overflow-hidden">
                                <motion.span 
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="block text-2xl font-black tracking-tighter uppercase leading-none text-[#1A1A2E]"
                                >
                                    IHO<span className="font-light text-[#E94E3C]">CLOTHING</span>
                                </motion.span>
                            </div>
                        </Link>
                    </div>

                    {/* Actions (Right) */}
                    <div className="flex-1 flex justify-end items-center gap-2 sm:gap-4">
                        {!admin && (
                            <>
                                <motion.button 
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsSearchOpen(!isSearchOpen)} 
                                    className="p-2 text-[#1A1A2E] hover:text-[#E94E3C] hover:bg-gray-50/50 rounded-full transition-colors hidden sm:block"
                                >
                                    {isSearchOpen ? <X size={20} strokeWidth={2} /> : <Search size={20} strokeWidth={2} />}
                                </motion.button>
                                
                                <motion.button
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-2 text-[#1A1A2E] hover:text-[#E94E3C] hover:bg-gray-50/50 rounded-full transition-colors hidden sm:block"
                                >
                                    <Heart size={20} strokeWidth={2} />
                                </motion.button>
                            </>
                        )}
                        
                        {user ? (
                            <div className="relative group hidden sm:block">
                                <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-gray-50/50 border border-gray-100 rounded-full hover:border-[#E94E3C]/30 transition-all"
                                >
                                    <div className="grid size-7 place-items-center rounded-full bg-[#1A1A2E] text-white font-bold text-xs">
                                        {user.name.charAt(0)}
                                    </div>
                                    <ChevronDown size={14} className="text-gray-500 transition-transform duration-300 group-hover:rotate-180" />
                                </motion.button>
                                
                                {/* Modern Floating Dropdown */}
                                <div className="absolute right-0 top-[calc(100%+1rem)] w-[280px] origin-top-right opacity-0 invisible translate-y-4 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-out z-50">
                                    <div className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-[0_16px_40px_rgba(0,0,0,0.1)] rounded-2xl p-2 overflow-hidden">
                                        <div className="p-4 border-b border-gray-100/50 flex items-center gap-3">
                                            <div className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-[#1A1A2E] to-[#2A2A4E] text-white font-bold text-sm shadow-inner">
                                                {user.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-black text-[#1A1A2E] truncate">{user.name}</p>
                                                <p className="text-xs font-medium text-gray-500 truncate">{user.email}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="p-2 space-y-1">
                                            {ACCOUNT_MENU.map((item) => {
                                                const Icon = item.icon;
                                                return (
                                                    <Link key={item.key} href={item.href} className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-600 hover:text-[#1A1A2E] hover:bg-gray-100/50 rounded-xl transition-all">
                                                        <Icon size={16} strokeWidth={2} className="text-gray-400" /> {item.label}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                        
                                        <div className="p-2 border-t border-gray-100/50">
                                            <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50/50 rounded-xl transition-all">
                                                <LogOut size={16} strokeWidth={2} /> Sign Out
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Link href="/login" className="hidden sm:block text-xs font-black uppercase tracking-widest bg-[#1A1A2E] text-white px-5 py-2.5 rounded-full hover:bg-[#E94E3C] transition-colors shadow-md">
                                Login
                            </Link>
                        )}
                        
                        {!admin && (
                            <motion.button
                                whileHover={{ scale: 1.1, y: -2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsCartOpen(true)}
                                className="p-2 text-[#1A1A2E] hover:text-[#E94E3C] relative flex items-center bg-gray-50/50 rounded-full transition-colors"
                            >
                                <ShoppingBag size={20} strokeWidth={2} />
                                <motion.span 
                                    initial={{ scale: 0 }} 
                                    animate={{ scale: 1 }} 
                                    transition={{ type: 'spring', delay: 0.5 }}
                                    className="absolute top-0 right-0 w-3 h-3 bg-[#E94E3C] rounded-full border-2 border-white shadow-sm" 
                                />
                            </motion.button>
                        )}
                    </div>
                </motion.div>

                {/* Expanding Search Bar */}
                <AnimatePresence>
                    {isSearchOpen && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20, scale: 0.95 }} 
                            animate={{ opacity: 1, y: 16, scale: 1 }} 
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="absolute top-full left-1/2 -translate-x-1/2 w-[95%] max-w-2xl bg-white border border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.08)] rounded-2xl overflow-hidden z-[-1]"
                        >
                            <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 p-2">
                                <div className="flex-1 flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                                    <Search size={20} className="text-gray-400" strokeWidth={2} />
                                    <input 
                                        type="text" autoFocus placeholder="Search products, collections..." 
                                        value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                        className="flex-1 bg-transparent border-none outline-none text-base text-[#1A1A2E] placeholder:text-gray-400 focus:ring-0 p-0"
                                    />
                                </div>
                                <button type="submit" className="text-sm font-bold tracking-wider text-white bg-[#1A1A2E] hover:bg-[#E94E3C] px-6 py-3 transition-colors rounded-xl hidden sm:block">
                                    Search
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.header>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

            {/* Futuristic Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-[#1A1A2E]/20 backdrop-blur-md z-40 md:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <motion.div 
                            initial={{ x: '-100%', borderTopRightRadius: '100px', borderBottomRightRadius: '100px' }} 
                            animate={{ x: 0, borderTopRightRadius: '0px', borderBottomRightRadius: '0px' }} 
                            exit={{ x: '-100%', borderTopRightRadius: '100px', borderBottomRightRadius: '100px' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white z-50 md:hidden flex flex-col shadow-2xl"
                        >
                            <div className="p-6 bg-white flex flex-col gap-8 pt-8">
                                <div className="flex justify-between items-center">
                                    <span className="text-2xl font-black tracking-tighter uppercase text-[#1A1A2E]">Menu</span>
                                    <motion.button 
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setIsMobileMenuOpen(false)} 
                                        className="p-2 -mr-2 bg-gray-50 rounded-full text-gray-500 hover:text-[#1A1A2E]"
                                    >
                                        <X size={20} strokeWidth={2} />
                                    </motion.button>
                                </div>
                                
                                {!admin && (
                                    <form onSubmit={handleSearchSubmit} className="flex items-center bg-gray-50 rounded-xl px-4 py-3">
                                        <Search size={18} className="text-gray-400 mr-3" />
                                        <input 
                                            type="text" placeholder="Search store..." 
                                            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                            className="flex-1 bg-transparent border-none outline-none text-sm text-[#1A1A2E] placeholder:text-gray-400 focus:ring-0 p-0"
                                        />
                                    </form>
                                )}
                            </div>

                            <nav className="px-6 py-4 flex flex-col gap-6 bg-white flex-shrink-0">
                                {navLinks.map((link, i) => (
                                    <motion.div key={link.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + (i * 0.05) }}>
                                        <Link 
                                            href={link.href}
                                            className="text-3xl font-bold text-[#1A1A2E] tracking-tight hover:text-[#E94E3C] transition-colors"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {link.name}
                                        </Link>
                                    </motion.div>
                                ))}
                            </nav>

                            <div className="flex-1 overflow-y-auto bg-gray-50 mt-auto rounded-t-3xl border-t border-gray-100">
                                {user ? (
                                    <div className="p-6">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="grid size-12 place-items-center rounded-xl bg-[#1A1A2E] text-white font-bold text-base shadow-md">
                                                {user.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-[#1A1A2E] leading-tight">{user.name}</p>
                                                <p className="text-sm font-medium text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            {ACCOUNT_MENU.map((item) => {
                                                const Icon = item.icon;
                                                return (
                                                    <Link 
                                                        key={item.key} href={item.href} onClick={() => setIsMobileMenuOpen(false)} 
                                                        className="flex items-center gap-3 p-3 text-sm font-bold text-gray-600 bg-white rounded-xl hover:text-[#1A1A2E] hover:shadow-sm transition-all"
                                                    >
                                                        <Icon size={18} strokeWidth={2} className="text-gray-400" /> {item.label}
                                                    </Link>
                                                );
                                            })}
                                            <button onClick={handleLogout} className="flex items-center gap-3 p-3 text-sm font-bold text-red-500 bg-red-50 rounded-xl transition-colors mt-4">
                                                <LogOut size={18} strokeWidth={2} /> Sign Out
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-6 flex flex-col gap-3">
                                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="bg-[#1A1A2E] text-white text-center py-4 rounded-xl text-sm font-bold uppercase tracking-widest shadow-lg shadow-[#1A1A2E]/20 hover:bg-[#E94E3C] transition-colors">Sign In</Link>
                                        <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="bg-white text-[#1A1A2E] border-2 border-gray-100 text-center py-4 rounded-xl text-sm font-bold uppercase tracking-widest hover:border-[#1A1A2E] transition-colors">Create Account</Link>
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