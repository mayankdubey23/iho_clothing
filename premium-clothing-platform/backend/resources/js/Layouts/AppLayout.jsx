import { AnimatePresence, motion } from 'framer-motion';
import { Link, router, usePage } from '@inertiajs/react';
import {
  ChevronDown,
  Dumbbell,
  FileText,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Package,
  Phone,
  Shield,
  Share2,
  ShoppingBag,
  Store,
  Tag,
  User,
  X,
} from 'lucide-react';
// ACCOUNT menu items are shared across desktop avatar dropdown and mobile menu.
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

import { useEffect, useState } from 'react';

export const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function imageFor(product) {
  return product?.images?.find((img) => img.is_primary)?.image_path || product?.images?.[0]?.image_path || '';
}

export function stockFor(product) {
  return product?.skus?.reduce((total, sku) => total + Number(sku.inventory?.stock_quantity || 0), 0) || 0;
}

export default function AppLayout({ children, active = 'home', admin = false }) {
  const { auth, flash } = usePage().props;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const user = auth?.user;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const nav = admin
    ? [
        { href: '/admin', label: 'Dashboard', key: 'dashboard' },
        { href: '/admin/products', label: 'Products', key: 'products' },
        { href: '/admin/categories', label: 'Categories', key: 'categories' },
        { href: '/admin/franchises', label: 'Franchises', key: 'franchises' },
      ]
    : [
        { href: '/', label: 'Storefront', key: 'storefront' },
        { href: '/#catalog', label: 'Catalog', key: 'catalog' },
        {
          href: '/sports-wear',
          label: 'Sports Wear',
          key: 'sports',
          options: [
            ['/sports-wear#training', 'Training fits'],
            ['/sports-wear#teamwear', 'Teamwear'],
            ['/sports-wear#franchise-packs', 'Franchise packs'],
          ],
        },
        { href: '/franchise-apply', label: 'Franchise', key: 'franchise' },
      ];

  function logout() {
    router.post('/logout');
  }

  const isStaff = user && ['super_admin', 'franchise'].includes(user.role);

  return (
    <div className="min-h-screen bg-[#f9f7f4] text-stone-900">
      <header
        className={`sticky top-0 z-30 transition-all duration-300 ${
          scrolled
            ? 'bg-[#f9f7f4]/92 backdrop-blur-xl shadow-[0_1px_0_0_rgba(28,25,23,0.08)]'
            : 'bg-[#f9f7f4] border-b border-stone-200/80'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-8">
          {/* Logo */}
          <Link href={admin ? '/admin' : '/'} className="group flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center bg-zinc-900 text-[11px] font-black tracking-widest text-white ring-2 ring-transparent transition-all duration-200 group-hover:ring-zinc-900/20">
              IHO
            </span>
            <span className="hidden sm:block">
              <strong className="block text-sm font-bold leading-tight tracking-tight text-zinc-900">
                IHO Clothing
              </strong>
              <small className="block text-[11px] font-medium text-stone-400">
                {admin ? 'Management' : 'Retail & Franchise'}
              </small>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {nav.map((item) => (
              <div key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3.5 text-sm font-semibold transition-all duration-150 ${
                    active === item.key
                      ? 'bg-zinc-900 text-white shadow-sm'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  {item.key === 'sports' && <Dumbbell size={14} />}
                  {item.label}
                  {item.options && (
                    <ChevronDown size={13} className="transition-transform duration-200 group-hover:rotate-180" />
                  )}
                </Link>
                {item.options && (
                  <div className="invisible absolute left-0 top-full z-40 mt-2 min-w-52 overflow-hidden rounded-xl border border-stone-200 bg-white p-1.5 opacity-0 shadow-xl shadow-stone-900/8 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                    {item.options.map(([href, label]) => (
                      <Link
                        key={href}
                        href={href}
                        className="block rounded-lg px-3 py-2 text-sm font-semibold text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-900"
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                {isStaff && !admin && (
                  <Link
                    href="/admin"
                    className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-stone-100 px-4 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-200"
                  >
                    <LayoutDashboard size={15} />
                    Admin
                  </Link>
                )}

                {!admin && (
                  <div className="relative group">
                    <button
                      type="button"
                      className="flex min-h-9 items-center gap-2 rounded-lg bg-zinc-900 px-3.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 focus:outline-none"
                      aria-label="Open account menu"
                    >
                      <span className="grid size-7 place-items-center rounded-full bg-white/10 ring-1 ring-white/10">
                        <User size={15} />
                      </span>
                      <span className="hidden lg:inline">{user.name.split(' ')[0]}</span>
                      <ChevronDown size={14} className="transition-transform duration-200 group-hover:rotate-180" />
                    </button>

                    <div className="pointer-events-none invisible absolute right-0 top-[calc(100%+10px)] w-[320px] translate-y-2 rounded-xl border border-stone-200 bg-white p-2.5 opacity-0 shadow-xl shadow-stone-900/10 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-hover:visible group-hover:translate-y-0">
                      <div className="mb-2 rounded-lg bg-stone-50 p-3">
                        <div className="flex items-center gap-3">
                          <span className="grid size-10 place-items-center rounded-full bg-zinc-900 text-white">
                            {user.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-zinc-900">{user.name}</p>
                            <p className="text-xs font-semibold text-stone-500">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid">
                        {ACCOUNT_MENU.map(({ key, label, href, icon: Icon }) => (
                          <Link
                            key={key}
                            href={href}
                            className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-100"
                          >
                            <span className="grid size-9 place-items-center rounded-lg bg-stone-100 text-stone-600">
                              <Icon size={16} />
                            </span>
                            {label}
                          </Link>
                        ))}
                      </div>

                      <div className="mt-2 border-t border-stone-100 pt-2">
                        <button
                          type="button"
                          onClick={logout}
                          className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                        >
                          <span className="grid size-9 place-items-center rounded-lg bg-red-50 text-red-600">
                            <LogOut size={16} />
                          </span>
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-100">
                  Login
                </Link>
                <Link href="/register" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-800">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="grid size-9 place-items-center rounded-lg bg-stone-100 text-stone-700 transition-colors hover:bg-stone-200 md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X size={18} />
                </motion.span>
              ) : (
                <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu size={18} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-stone-200 bg-white md:hidden"
            >
              <div className="grid gap-0.5 px-4 py-3">
                {nav.map((item) => (
                  <div key={item.href} className="grid gap-0.5">
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                        active === item.key ? 'bg-zinc-900 text-white' : 'text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {item.label}
                    </Link>
                    {item.options && (
                      <div className="mb-1 grid gap-0.5 pl-3">
                        {item.options.map(([href, label]) => (
                          <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-md px-3 py-1.5 text-sm font-medium text-stone-500 transition-colors hover:bg-stone-50 hover:text-stone-700">
                            {label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div className="mt-2 grid gap-1.5 border-t border-stone-100 pt-2">
                  {user ? (
                    <>
                      {!admin && (
                        <div className="grid gap-1">
                          {ACCOUNT_MENU.map(({ key, label, href, icon: Icon }) => (
                            <Link
                              key={key}
                              href={href}
                              onClick={() => setOpen(false)}
                              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50"
                            >
                              <span className="grid size-9 place-items-center rounded-lg bg-stone-100 text-stone-600">
                                <Icon size={16} />
                              </span>
                              {label}
                            </Link>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => {
                          logout();
                          setOpen(false);
                        }}
                        className="mt-1 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <div className="flex gap-2">
                      <Link href="/login" onClick={() => setOpen(false)} className="flex-1 rounded-lg bg-stone-100 px-3 py-2.5 text-center text-sm font-semibold text-stone-700">Login</Link>
                      <Link href="/register" onClick={() => setOpen(false)} className="flex-1 rounded-lg bg-zinc-900 px-3 py-2.5 text-center text-sm font-semibold text-white">Register</Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Flash Messages */}
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <AnimatePresence>
          {flash?.success && <FlashMessage key="flash-success" tone="success" text={flash.success} />}
          {flash?.error && <FlashMessage key="flash-error" tone="error" text={flash.error} />}
        </AnimatePresence>
      </div>

      {children}

      {!admin && <Footer />}
    </div>
  );
}

function FlashMessage({ tone, text }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const styles =
    tone === 'success'
      ? 'border-teal-200 bg-teal-50 text-teal-900'
      : 'border-red-200 bg-red-50 text-red-800';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      transition={{ duration: 0.25 }}
      className={`mt-4 flex items-center justify-between overflow-hidden rounded-xl border px-4 py-3 text-sm font-semibold ${styles}`}
    >
      <span>{text}</span>
      <button onClick={() => setVisible(false)} className="ml-4 rounded-md p-0.5 opacity-60 transition-opacity hover:opacity-100">
        <X size={15} />
      </button>
    </motion.div>
  );
}

function Footer() {
  const links = [
    { label: 'Storefront', href: '/' },
    { label: 'Sports Wear', href: '/sports-wear' },
    { label: 'Franchise', href: '/franchise-apply' },
    { label: 'Account', href: '/account' },
    { label: 'Login', href: '/login' },
    { label: 'Register', href: '/register' },
  ];

  return (
    <footer className="border-t border-stone-200 bg-zinc-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1fr_auto_auto]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center bg-white text-xs font-black text-zinc-900">IHO</span>
              <div>
                <p className="font-bold text-white">IHO Clothing</p>
                <p className="text-xs text-zinc-500">Retail & Franchise Platform</p>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-7 text-zinc-400">
              Premium sportswear with franchise-ready pricing. Quality activewear for customers and partners across India.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a href="mailto:hello@ihoclothing.com" className="flex items-center gap-2 text-xs font-medium text-zinc-500 transition-colors hover:text-teal-400">
                <Mail size={14} /> hello@ihoclothing.com
              </a>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs font-medium text-zinc-500">
              <Phone size={14} />
              <span>+91 98765 43210</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs font-medium text-zinc-500">
              <MapPin size={14} />
              <span>Delhi NCR, India</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Quick Links</p>
            <ul className="grid gap-2.5">
              {links.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Collections</p>
            <ul className="grid gap-2.5">
              {[
                ['Training Fits', '/sports-wear#training'],
                ['Teamwear', '/sports-wear#teamwear'],
                ['Franchise Packs', '/sports-wear#franchise-packs'],
                ['Premium T-Shirts', '/?category=premium-tshirts'],
                ['Performance Bottoms', '/?category=performance-bottoms'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-800 pt-6 sm:flex-row">
          <p className="text-xs text-zinc-600">© 2025 IHO Clothing. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-600">Premium Activewear & Franchise</span>
            <div className="flex items-center gap-2">
              <a href="#" className="grid size-8 place-items-center rounded-full bg-zinc-800 text-zinc-400 transition-colors hover:bg-teal-700 hover:text-white" aria-label="Social">
                <Share2 size={15} />
              </a>
              <a href="#" className="grid size-8 place-items-center rounded-full bg-zinc-800 text-zinc-400 transition-colors hover:bg-teal-700 hover:text-white" aria-label="Store">
                <Store size={15} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function SectionHeading({ eyebrow, title, aside }) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-orange-700">{eyebrow}</p>
        <h2 className="font-display text-4xl font-black leading-none sm:text-5xl">{title}</h2>
      </div>
      {aside && (
        <span className="w-fit rounded-full bg-stone-100 px-3 py-1 text-sm font-semibold text-stone-500">
          {aside}
        </span>
      )}
    </div>
  );
}

export function EmptyState({ icon = Package, text, action }) {
  const Icon = icon;
  return (
    <div className="grid min-h-56 place-items-center rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center">
      <div>
        <div className="mx-auto mb-4 grid size-14 place-items-center rounded-xl bg-stone-100">
          <Icon className="text-stone-400" size={28} />
        </div>
        <p className="font-semibold text-stone-500">{text}</p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}

export function Stat({ icon = ShoppingBag, label, value }) {
  const Icon = icon;
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-teal-50">
        <Icon className="text-teal-700" size={20} />
      </div>
      <p className="text-sm font-semibold text-stone-500">{label}</p>
      <strong className="mt-1 block text-3xl font-bold">{value}</strong>
    </div>
  );
}

export function Field({ label, error, children }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-stone-600">
      {label}
      {children}
      {error && <span className="text-xs font-medium text-red-500">{error}</span>}
    </label>
  );
}
