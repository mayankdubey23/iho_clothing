import { Link, router, useForm } from '@inertiajs/react';
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  Filter,
  HeartHandshake,
  PackageCheck,
  Plus,
  Search,
  ShoppingBag,
  Store,
  Truck,
} from 'lucide-react';
import AppLayout, { EmptyState, Field, SectionHeading, imageFor, money, stockFor } from '../Layouts/AppLayout';

export default function Storefront({ products, categories, plans, filters }) {
  const { data, setData, get } = useForm({
    category: filters.category || 'all',
    search: filters.search || '',
    min_price: filters.min_price || '',
    max_price: filters.max_price || '',
  });

  function applyFilters(event) {
    event.preventDefault();
    get('/', { preserveState: true, preserveScroll: true });
  }

  return (
    <AppLayout active="storefront">
      <section className="relative flex min-h-[620px] items-end overflow-hidden bg-zinc-900 lg:min-h-[76vh]">
        {products.data?.[0] && <img className="absolute inset-0 h-full w-full object-cover" src={imageFor(products.data[0])} alt="" />}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(24,24,27,.94),rgba(24,24,27,.58),rgba(24,24,27,.12))]" />
        <div className="relative max-w-3xl px-4 pb-14 pt-28 text-white lg:px-16 lg:pb-20">
          <p className="text-xs font-black uppercase text-orange-200">Premium activewear franchise</p>
          <h1 className="mt-2 text-6xl font-black leading-none tracking-normal sm:text-7xl lg:text-8xl">IHO Clothing</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
            A single Laravel-powered commerce and franchise platform with React screens, session auth, and simple management.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="inline-flex min-h-12 items-center gap-2 bg-orange-700 px-5 font-black" href="#catalog">
              <ShoppingBag size={18} />
              Shop catalog
            </a>
            <Link className="inline-flex min-h-12 items-center gap-2 border border-white/30 bg-white/15 px-5 font-black" href="/franchise-apply">
              <Store size={18} />
              Apply franchise
            </Link>
          </div>
        </div>
      </section>

      <section className="grid border-b border-stone-300 bg-stone-50 lg:grid-cols-3">
        {[
          [PackageCheck, 'SKU inventory', 'Products include SKU and live stock data.'],
          [HeartHandshake, 'Franchise pricing', 'Retail and partner prices stay separate.'],
          [Truck, 'Easy management', 'Catalog, plans, and applications live in Laravel.'],
        ].map(([Icon, title, text]) => (
          <div key={title} className="min-h-28 border-b border-stone-300 p-6 lg:border-b-0 lg:border-r">
            <Icon className="text-teal-700" size={22} />
            <strong className="mt-3 block">{title}</strong>
            <span className="mt-1 block text-zinc-500">{text}</span>
          </div>
        ))}
      </section>

      <section id="catalog" className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <SectionHeading eyebrow="Catalog" title="Retail collection" aside={`${products.total} products`} />
        <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <form onSubmit={applyFilters} className="grid gap-4 border border-stone-300 bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <div className="flex items-center gap-2 font-black">
              <Filter size={18} />
              Filters
            </div>
            <Field label="Search">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={17} />
                <input className="input pl-10" value={data.search} onChange={(event) => setData('search', event.target.value)} placeholder="Search product" />
              </div>
            </Field>
            <Field label="Category">
              <select className="input" value={data.category} onChange={(event) => setData('category', event.target.value)}>
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>{category.name}</option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Min price">
                <input className="input" type="number" min="0" value={data.min_price} onChange={(event) => setData('min_price', event.target.value)} />
              </Field>
              <Field label="Max price">
                <input className="input" type="number" min="0" value={data.max_price} onChange={(event) => setData('max_price', event.target.value)} />
              </Field>
            </div>
            <button className="min-h-11 bg-zinc-900 px-4 font-black text-white" type="submit">Apply filters</button>
          </form>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {products.data.map((product) => (
              <article key={product.id} className="overflow-hidden border border-stone-300 bg-white shadow-sm">
                <div className="h-72 bg-stone-200">
                  {imageFor(product) && <img className="h-full w-full object-cover" src={imageFor(product)} alt={product.name} />}
                </div>
                <div className="grid gap-3 p-5">
                  <span className="text-xs font-black uppercase text-teal-700">{product.category?.name || 'Clothing'}</span>
                  <h3 className="min-h-14 text-xl font-black leading-tight">{product.name}</h3>
                  <p className="line-clamp-3 text-sm leading-6 text-zinc-500">{product.description}</p>
                  <div className="flex items-end justify-between gap-3">
                    <strong className="text-xl">{money.format(Number(product.base_price))}</strong>
                    <small className="font-black text-orange-700">Franchise {money.format(Number(product.franchise_price))}</small>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-teal-700">
                    <BadgeCheck size={16} />
                    {stockFor(product)} units available
                  </div>
                  <button className="inline-flex min-h-11 items-center justify-center gap-2 bg-stone-200 px-4 font-black" type="button">
                    Add inquiry
                    <Plus size={16} />
                  </button>
                </div>
              </article>
            ))}
            {products.data.length === 0 && <EmptyState text="No products found for these filters." />}
          </div>
        </div>
      </section>

      <section className="border-t border-stone-300 bg-stone-200 px-4 py-12 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Franchise" title="Partner plans" aside={`${plans.length} plans`} />
          <div className="grid gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <article className="grid gap-5 border border-stone-300 bg-white p-6 shadow-sm" key={plan.id}>
                <Store className="text-orange-700" size={24} />
                <h3 className="text-2xl font-black">{plan.name}</h3>
                <strong className="text-3xl">{money.format(Number(plan.price))}</strong>
                <p className="font-bold capitalize text-teal-700">{plan.type} channel</p>
                <ul className="grid gap-3">
                  {(plan.features_list || []).map((feature) => (
                    <li className="flex gap-2 text-zinc-600" key={feature}>
                      <Check className="mt-1 shrink-0 text-teal-700" size={16} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link className="inline-flex min-h-11 items-center justify-center gap-2 bg-orange-700 px-4 font-black text-white" href="/franchise-apply">
                  Apply now
                  <ArrowRight size={16} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
