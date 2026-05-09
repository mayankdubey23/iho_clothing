import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShoppingBag, Box, Users, Package,
  LogOut, Menu, X, Store, Globe, ChevronRight
} from 'lucide-react';

export default function AdminLayout({ active = '', children }) {
  const { auth } = usePage().props;

  // Safety lock for user
  const user = auth?.user || { name: 'Admin User', email: 'Loading...', role: 'franchise' };
  const isAdmin = ['super_admin', 'admin'].includes(user?.role);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // 🚀 UPDATED: Dynamic Navigation Links with Correct Prefix
  const navItems = isAdmin ? [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard, href: '/franchise-superadmin/command-center' },
    { id: 'orders', label: 'Network Orders', icon: ShoppingBag, href: '/franchise-superadmin/orders' },
    { id: 'inventory', label: 'Master Stock', icon: Box, href: '/franchise-superadmin/master-stock' },
    { id: 'franchises', label: 'Franchises', icon: Store, href: '/franchise-superadmin/franchises' },
    { id: 'customers', label: 'Customers', icon: Users, href: '/franchise-superadmin/customers' },
    { id: 'products', label: 'Products', icon: Package, href: '/franchise-superadmin/products' },
  ] : [
    { id: 'dashboard', label: 'Franchise Hub', icon: LayoutDashboard, href: '/franchise/dashboard' },
    { id: 'orders', label: 'Local Orders', icon: ShoppingBag, href: '/franchise/orders' },
    { id: 'inventory', label: 'Local Stock', icon: Box, href: '/franchise/inventory' },
  ];

  const handleLogout = (e) => {
    e.preventDefault();
    router.post('/logout');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#1A1A2E] text-slate-300 shadow-2xl">
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#E94E3C]/20 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        {/* 🚀 UPDATED Logo Link */}
        <Link href={isAdmin ? '/franchise-superadmin/command-center' : '/franchise/dashboard'} className="flex items-center gap-3 relative z-10">
          <div className="grid size-9 place-items-center bg-gradient-to-tr from-[#E94E3C] to-[#c0392b] rounded-xl text-[10px] font-black tracking-widest text-white shadow-lg shadow-[#E94E3C]/20">
            IHO
          </div>
          <div>
            <span className="block text-xl font-black tracking-tighter uppercase leading-none text-white">
              IHO<span className="font-light text-slate-400">ADMIN</span>
            </span>
            <span className="text-[9px] font-black tracking-widest text-[#E94E3C] uppercase">
              {isAdmin ? 'Global Network' : 'Franchise Portal'}
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
        <p className="px-3 text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase mb-4">Management</p>
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsMobileSidebarOpen(false)}
                className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group overflow-hidden ${isActive
                  ? 'bg-gradient-to-r from-[#E94E3C]/15 to-transparent text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-sidebar-pill"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-[#E94E3C] rounded-r-full shadow-[0_0_10px_rgba(233,78,60,0.8)]"
                  />
                )}
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-colors ${isActive ? 'text-[#E94E3C]' : 'group-hover:text-[#E94E3C]'}`}
                />
                <span className={`text-sm font-bold tracking-wide ${isActive ? 'text-white' : ''}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile Area */}
      <div className="p-4 border-t border-white/5">
        <div className="bg-black/20 border border-white/5 rounded-2xl p-3 flex items-center gap-3 mb-2 hover:bg-black/30 transition-colors cursor-pointer">
          <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-[#16213E] to-[#0F3460] text-white font-black shadow-inner border border-white/10">
            {user.name.split(' ').map(p => p[0]).slice(0, 2).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user.name}</p>
            <p className="text-[10px] font-medium text-slate-500 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
        >
          <LogOut size={18} strokeWidth={2.5} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f9f8f6] font-sans flex">

      {/* 🖥️ DESKTOP SIDEBAR */}
      <aside className="hidden lg:block w-72 h-screen sticky top-0 z-40">
        <SidebarContent />
      </aside>

      {/* 📱 MOBILE SIDEBAR */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-[#1A1A2E]/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-72 bg-[#1A1A2E] z-50 lg:hidden shadow-2xl"
            >
              <SidebarContent />
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="absolute top-6 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
              >
                <X size={20} />
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">

        {/* 🔝 TOP HEADER BAR */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 bg-slate-100 rounded-xl text-slate-600 hover:text-[#1A1A2E] hover:bg-slate-200 transition-colors"
            >
              <Menu size={20} strokeWidth={2.5} />
            </button>

            <div className="hidden sm:flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest">
              <span>{isAdmin ? 'Admin' : 'Franchise'}</span>
              {active && (
                <>
                  <ChevronRight size={14} />
                  <span className="text-[#1A1A2E] capitalize tracking-normal">
                    {active.replace('_', ' ')}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-[#E94E3C]/10 text-[#E94E3C] hover:bg-[#E94E3C] hover:text-white rounded-full text-xs font-black uppercase tracking-widest transition-colors"
            >
              <Globe size={14} strokeWidth={2.5} />
              <span className="hidden sm:inline">View Live Website</span>
            </a>
          </div>
        </header>

        {/* 📄 PAGE CONTENT */}
        <div className="flex-1 p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
