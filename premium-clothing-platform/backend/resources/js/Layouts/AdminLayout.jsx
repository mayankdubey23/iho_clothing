import { motion } from 'framer-motion';
import { Link, usePage } from '@inertiajs/react';
import {
  ChevronRight,
  Globe,
  LayoutDashboard,
  LogOut,
  Package,
  ShieldCheck,
  Store,
  Tags,
} from 'lucide-react';

export default function AdminLayout({ children, active }) {
  const { auth } = usePage().props;
  const isSuperAdmin = auth.user.role === 'super_admin';
  const initials = auth.user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="z-20 flex w-64 flex-col bg-slate-900 shadow-2xl">
        {/* Brand */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6">
          <div className="grid size-8 place-items-center bg-blue-600 text-[11px] font-black text-white">
            IHO
          </div>
          <div>
            <p className="text-sm font-black tracking-wide text-white">
              IHO <span className="text-blue-400">ADMIN</span>
            </p>
            <p className="text-[10px] font-semibold capitalize text-slate-500">
              {auth.user.role.replace('_', ' ')}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">
            Management
          </p>
          <div className="grid gap-0.5">
            <SidebarLink
              href="/admin"
              icon={<LayoutDashboard size={17} />}
              label="Dashboard"
              isActive={active === 'dashboard'}
            />
            {isSuperAdmin && (
              <>
                <SidebarLink
                  href="/admin/products"
                  icon={<Package size={17} />}
                  label="Products"
                  isActive={active === 'products'}
                />
                <SidebarLink
                  href="/admin/categories"
                  icon={<Tags size={17} />}
                  label="Categories"
                  isActive={active === 'categories'}
                />
                <SidebarLink
                  href="/admin/franchises"
                  icon={<Store size={17} />}
                  label="Franchises"
                  isActive={active === 'franchises'}
                />
              </>
            )}
          </div>
        </nav>

        {/* User & Logout */}
        <div className="border-t border-slate-800 px-4 py-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-800/60 px-3 py-2.5">
            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-blue-600 text-xs font-black text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold leading-tight text-white">{auth.user.name}</p>
              <p className="truncate text-[11px] text-slate-400">{auth.user.email}</p>
            </div>
          </div>
          <Link
            method="post"
            href="/logout"
            as="button"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-400 transition-colors hover:bg-slate-800 hover:text-red-400"
          >
            <LogOut size={16} />
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex h-screen flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
            <ShieldCheck size={15} className="text-blue-500" />
            <span>Admin</span>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="font-semibold capitalize text-slate-700">{active}</span>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 transition-all duration-200 hover:bg-blue-100 hover:shadow-sm"
          >
            <Globe size={16} />
            View Live Website
          </Link>
        </header>

        {/* Page Content */}
        <motion.div
          className="flex-1 overflow-y-auto p-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}

function SidebarLink({ href, icon, label, isActive }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
