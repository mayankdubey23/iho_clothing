import { Link, router, usePage } from '@inertiajs/react';
import { ChevronDown, Dumbbell, LayoutDashboard, LogOut, Menu, Package, ShoppingBag, User } from 'lucide-react';
import { useState } from 'react';

export const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function imageFor(product) {
  return product?.images?.find((image) => image.is_primary)?.image_path || product?.images?.[0]?.image_path || '';
}

export function stockFor(product) {
  return product?.skus?.reduce((total, sku) => total + Number(sku.inventory?.stock_quantity || 0), 0) || 0;
}

export default function AppLayout({ children, active = 'home', admin = false }) {
  const { auth, flash } = usePage().props;
  const [open, setOpen] = useState(false);
  const user = auth?.user;

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

  return (
    <div className="min-h-screen bg-stone-100 text-zinc-900">
      <header className="sticky top-0 z-30 border-b border-stone-300 bg-stone-50/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-8">
          <Link href={admin ? '/admin' : '/'} className="flex items-center gap-3">
            <span className="grid size-11 place-items-center bg-zinc-900 text-sm font-black text-white">IHO</span>
            <span>
              <strong className="block leading-tight">IHO Clothing</strong>
              <small className="block text-zinc-500">{admin ? 'Management' : 'Retail and franchise'}</small>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-none border border-stone-300 bg-stone-200/70 p-1 md:flex">
            {nav.map((item) => (
              <div key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className={`inline-flex min-h-10 items-center gap-2 px-4 text-sm font-bold ${
                    active === item.key ? 'bg-white shadow-sm' : 'text-zinc-500'
                  }`}
                >
                  {item.key === 'sports' && <Dumbbell size={16} />}
                  {item.label}
                  {item.options && <ChevronDown size={15} />}
                </Link>
                {item.options && (
                  <div className="invisible absolute left-0 top-full z-40 min-w-56 border border-stone-300 bg-white p-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
                    {item.options.map(([href, label]) => (
                      <Link key={href} href={href} className="block px-3 py-2 text-sm font-bold text-zinc-600 hover:bg-stone-100 hover:text-zinc-900">
                        {label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                {user.role === 'admin' && !admin && (
                  <Link href="/admin" className="inline-flex min-h-10 items-center gap-2 bg-stone-200 px-4 text-sm font-bold">
                    <LayoutDashboard size={17} />
                    Admin
                  </Link>
                )}
                {!admin && (
                  <Link href="/account" className="inline-flex min-h-10 items-center gap-2 bg-teal-700 px-4 text-sm font-bold text-white">
                    <User size={17} />
                    Account
                  </Link>
                )}
                <button onClick={logout} className="grid size-10 place-items-center bg-zinc-900 text-white" aria-label="Logout">
                  <LogOut size={17} />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 font-bold text-teal-700">Login</Link>
                <Link href="/register" className="bg-zinc-900 px-4 py-2 font-bold text-white">Register</Link>
              </>
            )}
          </div>

          <button className="grid size-10 place-items-center bg-stone-200 md:hidden" onClick={() => setOpen(!open)} aria-label="Open menu">
            <Menu size={20} />
          </button>
        </div>

        {open && (
          <div className="grid gap-2 border-t border-stone-300 bg-stone-50 px-4 py-3 md:hidden">
            {nav.map((item) => (
              <div key={item.href} className="grid gap-1">
                <Link href={item.href} className="py-2 font-bold text-zinc-700">{item.label}</Link>
                {item.options && (
                  <div className="grid gap-1 border-l border-stone-300 pl-3">
                    {item.options.map(([href, label]) => (
                      <Link key={href} href={href} className="py-1 text-sm font-bold text-zinc-500">{label}</Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {user ? (
              <>
                {user.role === 'admin' && <Link href="/admin" className="py-2 font-bold text-zinc-700">Admin</Link>}
                <Link href="/account" className="py-2 font-bold text-zinc-700">Account</Link>
                <button onClick={logout} className="py-2 text-left font-bold text-red-700">Logout</button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" className="flex-1 bg-stone-200 px-4 py-2 text-center font-bold">Login</Link>
                <Link href="/register" className="flex-1 bg-zinc-900 px-4 py-2 text-center font-bold text-white">Register</Link>
              </div>
            )}
          </div>
        )}
      </header>

      {flash?.success && <Flash tone="success" text={flash.success} />}
      {flash?.error && <Flash tone="error" text={flash.error} />}

      {children}
    </div>
  );
}

function Flash({ tone, text }) {
  const classes = tone === 'success' ? 'border-teal-300 bg-teal-50 text-teal-900' : 'border-red-300 bg-red-50 text-red-900';

  return <div className={`mx-auto mt-4 max-w-7xl border px-4 py-3 text-sm font-bold ${classes}`}>{text}</div>;
}

export function SectionHeading({ eyebrow, title, aside }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-black uppercase text-orange-700">{eyebrow}</p>
        <h2 className="text-4xl font-black leading-none sm:text-5xl">{title}</h2>
      </div>
      {aside && <span className="font-bold text-zinc-500">{aside}</span>}
    </div>
  );
}

export function EmptyState({ icon = Package, text, action }) {
  const Icon = icon;

  return (
    <div className="grid min-h-48 place-items-center border border-stone-300 bg-white p-8 text-center">
      <div>
        <Icon className="mx-auto text-stone-400" size={36} />
        <p className="mt-3 font-bold text-zinc-500">{text}</p>
        {action}
      </div>
    </div>
  );
}

export function Stat({ icon = ShoppingBag, label, value }) {
  const Icon = icon;

  return (
    <div className="border border-stone-300 bg-white p-5">
      <Icon className="text-teal-700" size={22} />
      <p className="mt-4 text-sm font-bold text-zinc-500">{label}</p>
      <strong className="mt-1 block text-3xl">{value}</strong>
    </div>
  );
}

export function Field({ label, error, children }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-zinc-500">
      {label}
      {children}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}
