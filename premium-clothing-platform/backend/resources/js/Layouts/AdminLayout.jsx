import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShoppingBag, Box, Users, Package,
  LogOut, X, ChevronRight, Menu, Store, Globe, LayoutGrid, PackageSearch, Map, Banknote, Tag, RotateCcw, BarChart3, LayoutTemplate,
  BellRing, LifeBuoy, ShieldCheck, Receipt, Truck, Settings, ShieldAlert
} from 'lucide-react';

export default function AdminLayout({ active = '', children }) {
  const { auth } = usePage().props;

  // Safety lock for user & Role Check
  const user = auth?.user || { name: 'Admin User', email: 'Loading...', role: 'franchise' };
  const isAdmin = ['super_admin', 'admin'].includes(user?.role);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // 🚀 WIRING 1: SUPER ADMIN MENUS
  const adminNavItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard, href: '/franchise-superadmin/command-center' },
    { id: 'orders', label: 'Network Orders', icon: ShoppingBag, href: '/franchise-superadmin/orders' },
    { id: 'inventory', label: 'Master Stock', icon: Box, href: '/franchise-superadmin/master-stock' },
    { id: 'stock-requests', label: 'Stock Requests', icon: PackageSearch, href: '/franchise-superadmin/stock-requests' },
    { id: 'franchises', label: 'Franchises', icon: Store, href: '/franchise-superadmin/franchises' },
    { id: 'customers', label: 'Customers', icon: Users, href: '/franchise-superadmin/customers' },
    { id: 'products', label: 'Products', icon: Package, href: '/franchise-superadmin/products' },
    { id: 'categories', label: 'Categories', icon: LayoutGrid, href: '/franchise-superadmin/categories' },
    { id: 'service-areas', label: 'Service Areas', icon: Map, href: '/franchise-superadmin/service-areas' },
    { id: 'payments', label: 'Payments', icon: Banknote, href: '/franchise-superadmin/payments' },
    { id: 'promotions', label: 'Coupons & Offers', icon: Tag, href: '/franchise-superadmin/coupons' },
    { id: 'returns', label: 'Returns', icon: RotateCcw, href: '/franchise-superadmin/returns' },
    { id: 'analytics', label: 'Reports & Analytics', icon: BarChart3, href: '/franchise-superadmin/analytics' },
    { id: 'content', label: 'Website Content', icon: LayoutTemplate, href: '/franchise-superadmin/content' },
    { id: 'notifications', label: 'Notifications', icon: BellRing, href: '/franchise-superadmin/notifications' },
    { id: 'support', label: 'Support Tickets', icon: LifeBuoy, href: '/franchise-superadmin/tickets' },
    { id: 'staff', label: 'Staff & Roles', icon: ShieldCheck, href: '/franchise-superadmin/staff' },
    { id: 'logs', label: 'Activity Logs', icon: ShieldAlert, href: '/franchise-superadmin/activity-logs' },
    { id: 'billing', label: 'Billing & Invoices', icon: Receipt, href: '/franchise-superadmin/invoices' },
    { id: 'delivery', label: 'Delivery Settings', icon: Truck, href: '/franchise-superadmin/delivery' },
    { id: 'settings', label: 'Control Room (Settings)', icon: Settings, href: '/franchise-superadmin/settings' },
  ];

  // 🚀 WIRING 2: FRANCHISE ADMIN MENUS
  const franchiseNavItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard, href: '/franchise/dashboard' },
    { id: 'analytics', label: 'Reports & Analytics', icon: BarChart3, href: '/franchise/analytics' },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag, href: '/franchise/orders' },
    { id: 'customers', label: 'Local Customers', icon: Users, href: '/franchise/customers' },
    { id: 'profile', label: 'Store Profile', icon: Store, href: '/franchise/profile' },
    { id: 'catalog', label: 'Store Catalog', icon: LayoutGrid, href: '/franchise/catalog' },
    { id: 'inventory', label: 'My Inventory', icon: Package, href: '/franchise/inventory' },
    { id: 'returns', label: 'Returns & Refunds', icon: RotateCcw, href: '/franchise/returns' },
    { id: 'wallet', label: 'Payments & Wallet', icon: Banknote, href: '/franchise/wallet' },
    { id: 'service_area', label: 'Service Zones', icon: Map, href: '/franchise/service-area' },
    { id: 'notifications', label: 'Notifications', icon: BellRing, href: '/franchise/notifications' },
    { id: 'support', label: 'Support Tickets', icon: LifeBuoy, href: '/franchise/support' },
    { id: 'logs', label: 'Activity Logs', icon: ShieldAlert, href: '/franchise/activity-logs' },
  ];

  // 🚀 WIRING 3: DYNAMIC ASSIGNMENT
  const navItems = isAdmin ? adminNavItems : franchiseNavItems;

  const handleLogout = () => {
    router.post('/logout', {}, {
      onSuccess: () => setIsLogoutModalOpen(false),
    });
  };

  const SidebarContent = () => {
    const sidebarRef = useRef(null);
    const itemRefs = useRef({});

    useEffect(() => {
      // Scroll the active item into view if it exists
      const activeItem = Object.values(itemRefs.current).find(ref => ref && ref.dataset.active === 'true');
      if (activeItem && sidebarRef.current) {
        // Scroll so the active item is visible in the sidebar
        activeItem.scrollIntoView({ block: 'nearest', behavior: 'auto' });
      }
    }, [active]);

    return (
      <div ref={sidebarRef} className="flex flex-col h-full bg-[#0F172A] text-slate-300 shadow-2xl border-r border-slate-800 relative overflow-hidden">
        {/* ❄️ Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-slate-800/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        {/* Logo Area */}
        <div className="h-24 flex items-center px-8 border-b border-white/5 relative z-10">
          <Link href={isAdmin ? '/franchise-superadmin/command-center' : '/franchise/dashboard'} className="flex items-center gap-4">
            <div className="grid size-10 place-items-center bg-white text-[#0F172A] font-black text-xs tracking-widest shadow-xl">
              IHO
            </div>
            <div>
              <span className="block text-xl font-black tracking-tighter uppercase leading-none text-white italic">
                STUDIO<span className="font-light text-slate-400">CTRL</span>
              </span>
              <span className="text-[8px] font-black tracking-[0.3em] text-[#94A3B8] uppercase mt-1 block">
                {isAdmin ? 'Global Network' : 'Franchise Partner'}
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-8 px-4 custom-scrollbar relative z-10">
          <p className="px-4 text-[9px] font-black tracking-[0.3em] text-slate-500 uppercase mb-6">Management</p>
          <nav className="space-y-1">
            {navItems.length === 0 && (
              <div className="border border-white/5 bg-white/5 px-4 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">
                Modules will appear here.
              </div>
            )}
            {navItems.map((item) => {
              const Icon = item.icon;
              const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
              const autoActive = item.href && currentPath === item.href;
              const isActive = active === item.id || autoActive;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  ref={el => { itemRefs.current[item.id] = el; }}
                  data-active={isActive ? 'true' : 'false'}
                  className={`relative flex items-center gap-4 px-4 py-3.5 transition-all duration-500 group overflow-hidden ${isActive
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-sidebar-indicator"
                      className="absolute left-0 top-0 w-1 h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                    />
                  )}
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    className={`transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}
                  />
                  <span className={`text-[11px] font-bold tracking-[0.15em] uppercase ${isActive ? 'text-white' : ''}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Area */}
        <div className="p-6 border-t border-white/5 relative z-10 bg-black/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="grid size-10 place-items-center bg-slate-800 text-white font-black text-xs border border-slate-700">
              {user.name.split(' ').map(p => p[0]).slice(0, 2).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white uppercase tracking-widest truncate">{user.name}</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center justify-center gap-3 w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 border border-slate-700 hover:text-white hover:border-white hover:bg-white/5 transition-all"
          >
            <LogOut size={14} strokeWidth={2} /> Terminate Session
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex"> {/* ❄️ Cool Slate Background */}

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
              className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-md z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.5 }}
              className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-[#0F172A] z-50 lg:hidden shadow-2xl border-r border-slate-800"
            >
              <SidebarContent />
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="absolute top-8 right-6 p-2 bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden relative">

        {/* 🔝 TOP HEADER BAR */}
        <header className="h-24 bg-white/90 backdrop-blur-2xl border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-6 md:px-10">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-3 bg-slate-50 border border-slate-200 text-[#1E293B] hover:bg-slate-100 transition-colors"
            >
              <Menu size={20} strokeWidth={2} />
            </button>

            <div className="hidden sm:flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
              <span>{isAdmin ? 'System Admin' : 'Franchise'}</span>
              {active && (
                <>
                  <ChevronRight size={14} className="text-slate-300" />
                  <span className="text-[#1E293B]">
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
              className="flex items-center gap-3 px-8 py-3.5 bg-black text-white hover:bg-[#1E293B] text-[9px] font-black uppercase tracking-[0.3em] transition-all shadow-xl shadow-black/10"
            >
              <Globe size={14} strokeWidth={2} />
              <span className="hidden sm:inline">Live Studio</span>
            </a>
          </div>
        </header>

        {/* 📄 PAGE CONTENT */}
        <div className="flex-1 p-6 md:p-10">
          {children}
        </div>
      </main>

      {/* LOGOUT CONFIRMATION MODAL (Boutique Style) */}
      <AnimatePresence>
        {isLogoutModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0F172A]/90 backdrop-blur-lg">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden text-center p-12"
            >
              <div className="size-16 border border-slate-200 text-[#1E293B] flex items-center justify-center mx-auto mb-8 bg-slate-50">
                <LogOut size={24} strokeWidth={1.5} className="ml-1" />
              </div>

              <h3 className="font-black text-2xl text-[#1E293B] mb-3 uppercase tracking-tighter italic">
                Terminate Session?
              </h3>
              <p className="text-[11px] font-bold text-slate-500 mb-10 uppercase tracking-widest leading-relaxed">
                You are about to securely exit the control panel. Unsaved changes may be lost.
              </p>

              <div className="flex flex-col gap-4">
                <button
                  onClick={handleLogout}
                  className="w-full bg-black text-white py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#1E293B] transition-all shadow-2xl shadow-black/20"
                >
                  Confirm Exit
                </button>
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="w-full bg-white border border-slate-200 text-[#1E293B] py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:border-black transition-all"
                >
                  Return to Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}} />
    </div>
  );
}
