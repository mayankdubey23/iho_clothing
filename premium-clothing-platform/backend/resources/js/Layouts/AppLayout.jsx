// resources/js/Layouts/AppLayout.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { User, Package, MapPin, HeartHandshake, ShoppingBag, Tag, FileText, Phone, Shield } from 'lucide-react';

// Required Exports for Account.jsx & Auth Pages
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

export function SectionHeading({ title, description }) {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-black text-gray-900">{title}</h2>
      {description && <p className="mt-2 text-sm text-gray-500">{description}</p>}
    </div>
  );
}
export function EmptyState({ text }) { return <div className="p-8 text-center text-gray-500">{text}</div>; }
export function Stat({ label, value }) { return <div className="p-5 bg-white shadow-sm rounded-xl"><p className="text-sm text-gray-500">{label}</p><strong className="text-2xl font-bold">{value}</strong></div>; }
export function Field({ label, error, children }) { return <label className="grid gap-1.5 text-sm font-semibold">{label}{children}{error && <span className="text-red-500">{error}</span>}</label>; }

// Main Layout Component
export default function AppLayout({ children, admin = false }) {
    const navLinks = [
        { name: 'Storefront', href: '/' },
        { name: 'Sports Wear', href: '/sports-wear' },
        { name: 'Franchise', href: '/franchise-apply' },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-[#F9F8F6] selection:bg-[#E94E3C] selection:text-white relative overflow-hidden">
            {/* Gradient Orbs for premium background effect */}
            {!admin && (
                <>
                    <div className="gradient-orb gradient-orb-1" />
                    <div className="gradient-orb gradient-orb-2" />
                    <div className="gradient-orb gradient-orb-3" />
                </>
            )}
            
            {!admin && <Navbar navLinks={navLinks} />}
            
            {/* Added relative positioning to fix Framer Motion scroll calculations */}
            <main className="flex-grow w-full relative pt-[72px] z-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={typeof window !== 'undefined' ? window.location.pathname : 'page'}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                            {children}
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </main>

            {!admin && <Footer />}
        </div>
    );
}
