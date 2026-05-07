import React, { useState } from 'react';
import AppLayout, { ACCOUNT_MENU, SectionHeading, EmptyState } from '@/Layouts/AppLayout';
import { Head, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, MapPin, Edit2, Plus, LogOut } from 'lucide-react';

export default function Account() {
    const { auth } = usePage().props;
    const user = auth?.user || { name: 'Guest User', email: 'guest@example.com' };
    
    // State to handle which tab is currently active
    const [activeTab, setActiveTab] = useState('profile');

    // Tab transition animations
    const tabVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
        exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
    };

    // Render content based on active tab
    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <motion.div key="profile" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-8">
                        <SectionHeading title="My Profile" description="Manage your personal information and security settings." />
                        
                        <div className="bg-white border border-[#E8E4D9] rounded-sm p-6 md:p-8 shadow-sm">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-black text-[#1A1A1A] uppercase tracking-widest">Personal Info</h3>
                                    <p className="text-sm text-[#7A756B] mt-1">Your basic account details.</p>
                                </div>
                                <button className="text-sm font-bold uppercase tracking-widest text-[#7A756B] flex items-center gap-2 hover:text-[#4A001F] transition-colors">
                                    <Edit2 size={16} /> Edit
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <span className="block text-xs font-bold uppercase tracking-widest text-[#A39E93] mb-1">Full Name</span>
                                    <p className="text-base font-bold text-[#1A1A1A]">{user.name}</p>
                                </div>
                                <div>
                                    <span className="block text-xs font-bold uppercase tracking-widest text-[#A39E93] mb-1">Email Address</span>
                                    <p className="text-base font-bold text-[#1A1A1A]">{user.email}</p>
                                </div>
                                <div>
                                    <span className="block text-xs font-bold uppercase tracking-widest text-[#A39E93] mb-1">Phone Number</span>
                                    <p className="text-base font-bold text-[#1A1A1A]">+91 98765 43210</p>
                                </div>
                                <div>
                                    <span className="block text-xs font-bold uppercase tracking-widest text-[#A39E93] mb-1">Password</span>
                                    <p className="text-base font-bold text-[#1A1A1A]">••••••••</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );

            case 'orders':
                return (
                    <motion.div key="orders" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-8">
                        <SectionHeading title="Order History" description="Check the status of recent orders, manage returns, and discover similar products." />
                        <EmptyState 
                            icon={Package} 
                            text="You haven't placed any orders yet." 
                            action={
                                <a href="/shop" className="inline-block mt-4 bg-[#1A1A1A] text-[#F9F8F6] px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-[#4A001F] transition-colors rounded-sm">
                                    Start Shopping
                                </a>
                            }
                        />
                    </motion.div>
                );

            case 'addresses':
                return (
                    <motion.div key="addresses" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-8">
                        <div className="flex justify-between items-end mb-2">
                            <SectionHeading title="Saved Addresses" description="Manage your delivery addresses for faster checkout." />
                            <button className="hidden sm:flex bg-[#1A1A1A] text-[#F9F8F6] px-6 py-2.5 text-sm font-bold uppercase tracking-widest hover:bg-[#4A001F] transition-colors rounded-sm items-center gap-2">
                                <Plus size={16} /> Add New
                            </button>
                        </div>
                        <EmptyState 
                            icon={MapPin} 
                            text="You haven't saved any addresses yet." 
                            action={
                                <button className="sm:hidden mt-4 bg-[#1A1A1A] text-[#F9F8F6] px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-[#4A001F] transition-colors rounded-sm flex items-center justify-center gap-2 w-full">
                                    <Plus size={16} /> Add Address
                                </button>
                            }
                        />
                    </motion.div>
                );

            default:
                return (
                    <motion.div key="default" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                        <SectionHeading title={ACCOUNT_MENU.find(i => i.key === activeTab)?.label || 'Dashboard'} />
                        <div className="p-12 text-center border border-dashed border-[#E8E4D9] rounded-sm bg-white">
                            <p className="text-[#7A756B] font-bold uppercase tracking-widest">This section is currently under construction.</p>
                        </div>
                    </motion.div>
                );
        }
    };

    return (
        <AppLayout>
            <Head title="My Account | IHO Clothing" />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 md:py-24 min-h-[75vh]">
                
                {/* Mobile Welcome Header */}
                <div className="md:hidden mb-8 pb-8 border-b border-[#E8E4D9]">
                    <h1 className="text-3xl font-black tracking-tight text-[#1A1A1A] uppercase">Hello, {user.name.split(' ')[0]}</h1>
                    <p className="text-sm text-[#7A756B] mt-1 font-medium">{user.email}</p>
                </div>

                <div className="flex flex-col md:flex-row gap-12">
                    
                    {/* Sidebar Navigation */}
                    <aside className="w-full md:w-64 flex-shrink-0">
                        {/* Desktop Welcome */}
                        <div className="hidden md:block mb-8 pb-8 border-b border-[#E8E4D9]">
                            <div className="grid size-16 place-items-center rounded-full bg-[#1A1A1A] text-[#F9F8F6] font-black text-xl tracking-widest mb-4">
                                {user.name.split(' ').map(p => p[0]).slice(0, 2).join('')}
                            </div>
                            <h2 className="text-xl font-black tracking-tight text-[#1A1A1A] uppercase truncate">{user.name}</h2>
                            <p className="text-sm text-[#7A756B] mt-1 truncate">{user.email}</p>
                        </div>

                        {/* Navigation Links - Scrollable horizontally on mobile, vertical on desktop */}
                        <nav className="flex md:flex-col overflow-x-auto md:overflow-visible pb-4 md:pb-0 gap-2 md:gap-1 no-scrollbar">
                            {ACCOUNT_MENU.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.key;
                                
                                return (
                                    <button
                                        key={item.key}
                                        onClick={() => {
                                            // Redirect for cart and wishlist since they are standalone pages
                                            if (item.key === 'cart' || item.key === 'wishlist') {
                                                window.location.href = item.href;
                                            } else {
                                                setActiveTab(item.key);
                                            }
                                        }}
                                        className={`flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-widest whitespace-nowrap rounded-sm transition-all ${
                                            isActive 
                                                ? 'bg-[#1A1A1A] text-[#F9F8F6] md:translate-x-2' 
                                                : 'text-[#7A756B] hover:bg-[#F3F0EA] hover:text-[#1A1A1A]'
                                        }`}
                                    >
                                        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} /> 
                                        {item.label}
                                    </button>
                                );
                            })}
                            
                            <button className="flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 rounded-sm transition-colors md:mt-8">
                                <LogOut size={18} strokeWidth={2} /> Sign Out
                            </button>
                        </nav>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            {renderContent()}
                        </AnimatePresence>
                    </main>

                </div>
            </div>
        </AppLayout>
    );
}