// resources/js/Layouts/AppLayout.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { User, Package, MapPin, HeartHandshake, ShoppingBag, Tag, FileText, Phone, Shield } from 'lucide-react';

// 🚀 Boutique Menu Style
export const ACCOUNT_MENU = [
    { key: 'profile', label: 'My Profile', href: '/account', icon: User },
    { key: 'orders', label: 'My Orders', href: '/account', icon: Package },
    { key: 'addresses', label: 'My Addresses', href: '/account', icon: MapPin },
    { key: 'wishlist', label: 'Wishlist', href: '/account', icon: HeartHandshake },
    { key: 'cart', label: 'Cart', href: '/account', icon: ShoppingBag },
    { key: 'coupons', label: 'Coupons', href: '/account', icon: Tag },
    { key: 'returns', label: 'Returns & Refunds', href: '/account', icon: FileText },
    { key: 'help', label: 'Help & Support', href: '/account', icon: Phone },
    { key: 'settings', label: 'Account Settings', href: '/account', icon: Shield },
];

export const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
export function imageFor(product) { return product?.images?.[0]?.image_path || ''; }
export function stockFor(product) { return product?.skus?.reduce((t, s) => t + Number(s.inventory?.stock_quantity || 0), 0) || 0; }

// 💎 Luxury Typography
export function SectionHeading({ title, description }) {
    return (
        <div className="mb-10 text-center md:text-left">
            <h2 className="text-4xl font-black text-[#1E293B] uppercase tracking-tighter italic border-l-4 border-black pl-4">
                {title}
            </h2>
            {description && <p className="mt-2 text-xs font-bold text-[#94A3B8] uppercase tracking-[0.2em]">{description}</p>}
        </div>
    );
}

export function EmptyState({ text }) {
    return <div className="p-16 text-center text-[#94A3B8] font-bold uppercase tracking-widest text-xs border border-dashed border-gray-200 rounded-3xl">{text}</div>;
}

// 💎 Glassmorphic Stat Card
export function Stat({ label, value }) {
    return (
        <div className="p-6 bg-white/40 backdrop-blur-[10px] border border-white/20 shadow-sm rounded-none hover:shadow-xl transition-all duration-500">
            <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] mb-1">{label}</p>
            <strong className="text-3xl font-black text-[#1E293B]">{value}</strong>
        </div>
    );
}

export function Field({ label, error, children }) {
    return (
        <label className="grid gap-2 text-[10px] font-black uppercase tracking-widest text-[#1E293B]">
            {label}
            {children}
            {error && <span className="text-red-500 normal-case tracking-normal font-bold">{error}</span>}
        </label>
    );
}

// 🚀 Main Layout Component
export default function AppLayout({ children, admin = false, verticalNav = false }) {
    const navLinks = [
        { name: 'Storefront', href: '/' },
        { name: 'Men', href: '/shop?category=men-sportswear' },
        { name: 'Women', href: '/shop?category=women-sportswear' },
        { name: 'Sports Wear', href: '/sports-wear' },
        { name: 'Franchise', href: '/franchise-apply' },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white text-[#1E293B] selection:bg-[#1E293B] selection:text-white relative overflow-hidden">

            {/* ❄️ Titanium Frost Orbs (Silver & Slate tones) */}
            {!admin && (
                <>
                    <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-[#F1F5F9] rounded-full blur-[120px] opacity-60 pointer-events-none" />
                    <div className="absolute bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-[#E2E8F0] rounded-full blur-[120px] opacity-60 pointer-events-none" />
                    <div className="absolute top-[30%] right-[10%] w-[20vw] h-[20vw] bg-slate-100 rounded-full blur-[100px] opacity-40 pointer-events-none" />
                </>
            )}

            {!admin && <Navbar navLinks={navLinks} vertical={verticalNav} />}

            <main className={`flex-grow w-full relative z-10 ${verticalNav ? 'pt-24 lg:pt-0 lg:pl-20' : 'pt-24'}`}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={typeof window !== 'undefined' ? window.location.pathname : 'page'}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            {!admin && <Footer />}

            <style dangerouslySetInnerHTML={{
                __html: `
                /* Minimalist Custom Scrollbar */
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: #f8fafc; }
                ::-webkit-scrollbar-thumb { background: #94a3b8; }
                ::-webkit-scrollbar-thumb:hover { background: #1e293b; }
            `}} />
        </div>
    );
}
