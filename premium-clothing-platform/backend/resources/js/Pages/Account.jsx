import React, { useState, useEffect } from 'react';
import { Head, usePage, Link, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Package, MapPin, ChevronRight, PackageOpen,
    Heart, Ticket, RefreshCcw, ShieldCheck, Bell, CreditCard,
    Lock, HelpCircle, Trash2, LogOut, Wrench
} from 'lucide-react';
import {
    ProfileSettings,
    SecuritySettings,
    DeleteAccount,
    AddressBook,
    HelpSupport,
    Notifications,
    PrivacySettings,
    PaymentMethods,
    Coupons,
    ReturnsRefunds
} from '@/Components/Account/SettingsTabs';

export default function Account() {
    const { auth } = usePage().props;
    const user = auth?.user;

    const queryParams = new URLSearchParams(window.location.search);
    const initialTab = queryParams.get('tab') || 'profile';
    const [activeTab, setActiveTab] = useState(initialTab);

    useEffect(() => {
        window.history.pushState(null, '', `?tab=${activeTab}`);
    }, [activeTab]);

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    const orders = [];
    const wishlistItems = [];

    const MENU_GROUPS = [
        {
            title: 'My Dashboard',
            items: [
                { id: 'profile', label: 'Profile Details', icon: User },
                { id: 'orders', label: 'My Orders', icon: Package },
                { id: 'addresses', label: 'Address Book', icon: MapPin },
                { id: 'wishlist', label: 'Wishlist', icon: Heart },
                { id: 'coupons', label: 'Coupons', icon: Ticket },
                { id: 'returns', label: 'Returns & Refunds', icon: RefreshCcw },
            ],
        },
        {
            title: 'Account Settings',
            items: [
                { id: 'security', label: 'Login & Security', icon: ShieldCheck },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'payments', label: 'Payment Methods', icon: CreditCard },
                { id: 'privacy', label: 'Privacy Settings', icon: Lock },
                { id: 'support', label: 'Help & Support', icon: HelpCircle },
                { id: 'delete', label: 'Delete Account', icon: Trash2, danger: true },
            ],
        },
    ];

    if (!user) return null;

    const getUnderConstructionTitle = () =>
        MENU_GROUPS.flatMap((g) => g.items).find((i) => i.id === activeTab)?.label;

    return (
        <div className="min-h-screen bg-[#f9f8f6] font-sans pb-20">
            <Head title="My Account | IHO Clothing" />

            <div className="bg-[#1A1A2E] text-white pt-32 pb-20 px-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#E94E3C]/20 to-transparent rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"></div>
                <div className="max-w-7xl mx-auto flex items-center gap-6">
                    <div className="size-20 rounded-full bg-gradient-to-tr from-[#E94E3C] to-[#c0392b] text-white flex items-center justify-center font-black text-3xl shadow-lg border-4 border-white/10 shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
                            {user.name}
                        </h1>
                        <p className="mt-1 text-gray-400 font-bold tracking-widest text-sm">{user.email}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 -mt-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="w-full lg:w-80 shrink-0">
                        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 p-4 border border-gray-100 sticky top-28">
                            {MENU_GROUPS.map((group, idx) => (
                                <div key={idx} className="mb-6 last:mb-2">
                                    <p className="px-4 text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase mb-3">
                                        {group.title}
                                    </p>
                                    <nav className="space-y-1">
                                        {group.items.map((tab) => {
                                            const Icon = tab.icon;
                                            const isActive = activeTab === tab.id;
                                            return (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setActiveTab(tab.id)}
                                                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all group ${isActive
                                                        ? 'bg-[#1A1A2E] text-white shadow-md'
                                                        : 'text-gray-600 hover:bg-gray-50 hover:text-[#1A1A2E]'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Icon
                                                            size={18}
                                                            className={`${isActive
                                                                ? 'text-[#E94E3C]'
                                                                : tab.danger
                                                                    ? 'text-red-400 group-hover:text-red-500'
                                                                    : 'text-gray-400'
                                                                }`}
                                                        />
                                                        <span
                                                            className={`text-sm font-bold ${tab.danger && !isActive ? 'text-red-500' : ''
                                                                }`}
                                                        >
                                                            {tab.label}
                                                        </span>
                                                    </div>
                                                    <ChevronRight
                                                        size={16}
                                                        className={`transition-transform ${isActive
                                                            ? 'text-gray-400'
                                                            : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                                                            }`}
                                                    />
                                                </button>
                                            );
                                        })}
                                    </nav>
                                </div>
                            ))}

                            <div className="h-px bg-gray-100 my-4"></div>

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all text-red-500 font-bold text-sm hover:bg-red-50"
                            >
                                <LogOut size={18} /> Logout
                            </button>
                        </div>
                    </div>

                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white rounded-3xl shadow-xl shadow-black/5 p-6 md:p-10 border border-gray-100 min-h-[600px]"
                            >
                                {activeTab === 'profile' && <ProfileSettings user={user} />}

                                {activeTab === 'addresses' && <AddressBook />}

                                {activeTab === 'orders' && (
                                    <div>
                                        <h3 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-wide border-b border-gray-100 pb-4 mb-6">
                                            Order History
                                        </h3>
                                        {orders.length > 0 ? (
                                            <div className="space-y-4">{/* Render Orders Here */}</div>
                                        ) : (
                                            <EmptyState
                                                icon={PackageOpen}
                                                color="text-blue-400"
                                                bg="bg-blue-50"
                                                title="No orders yet"
                                                message="Looks like you haven't made your first purchase. Discover our latest collections now!"
                                                btnText="Start Shopping"
                                            />
                                        )}
                                    </div>
                                )}

                                {activeTab === 'wishlist' && (
                                    <div>
                                        <h3 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-wide border-b border-gray-100 pb-4 mb-6">
                                            My Wishlist
                                        </h3>
                                        {wishlistItems.length > 0 ? (
                                            <div className="space-y-4">{/* Render Wishlist Here */}</div>
                                        ) : (
                                            <EmptyState
                                                icon={Heart}
                                                color="text-[#E94E3C]"
                                                bg="bg-[#E94E3C]/10"
                                                title="Your Wishlist is Empty"
                                                message="You haven't saved any items yet. Find something you love and tap the heart icon to save it here."
                                                btnText="Explore Collection"
                                            />
                                        )}
                                    </div>
                                )}

                                {activeTab === 'security' && <SecuritySettings />}

                                {activeTab === 'support' && <HelpSupport />}

                                {activeTab === 'delete' && <DeleteAccount />}

                                {/* Phase 2 tabs already handled above (avoid duplicate rendering) */}

                                {/* Premium additional tabs */}
                                {activeTab === 'notifications' && <Notifications />}
                                {activeTab === 'privacy' && <PrivacySettings />}
                                {activeTab === 'payments' && <PaymentMethods />}
                                {activeTab === 'coupons' && <Coupons />}
                                {activeTab === 'returns' && <ReturnsRefunds />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailBox({ label, value }) {
    return (
        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</p>
            <p className="text-sm font-bold text-[#1A1A2E]">{value}</p>
        </div>
    );
}

function EmptyState({ icon: Icon, color, bg, title, message, btnText }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className={`size-24 ${bg} rounded-full flex items-center justify-center mb-6`}>
                <Icon size={40} className={color} strokeWidth={1.5} />
            </div>
            <h4 className="text-2xl font-black text-[#1A1A2E] mb-3 uppercase tracking-tight">{title}</h4>
            <p className="text-gray-500 font-medium mb-8 max-w-sm">{message}</p>
            <Link
                href="/shop"
                className="bg-[#1A1A2E] text-white px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-[#E94E3C] transition-all shadow-lg hover:-translate-y-0.5"
            >
                {btnText}
            </Link>
        </div>
    );
}

function UnderConstruction({ title }) {
    return (
        <div>
            <h3 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-wide border-b border-gray-100 pb-4 mb-6">
                {title}
            </h3>
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <motion.div
                    animate={{ rotate: [0, -15, 15, -15, 15, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                    className="size-24 bg-orange-50 rounded-full flex items-center justify-center mb-6"
                >
                    <Wrench size={40} className="text-orange-400" strokeWidth={1.5} />
                </motion.div>
                <h4 className="text-2xl font-black text-[#1A1A2E] mb-3 uppercase tracking-tight">Feature Coming Soon</h4>
                <p className="text-gray-500 font-medium mb-8 max-w-md mx-auto">
                    We are currently building the <strong className="text-[#1A1A2E]">{title}</strong> feature to give you a
                    seamless and premium experience. Check back soon!
                </p>
                <Link
                    href="/shop"
                    className="bg-gray-100 text-[#1A1A2E] px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all font-bold"
                >
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
}

