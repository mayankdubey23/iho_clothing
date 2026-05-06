import React, { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Filter,
  HeartHandshake,
  PackageCheck,
  Plus,
  Search,
  ShoppingBag,
  Store,
  Truck,
  CreditCard,
  X
} from 'lucide-react';
import AppLayout, { EmptyState, Field, SectionHeading, money, stockFor } from '../Layouts/AppLayout';

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11, delayChildren: 0.08 } },
};

export default function Storefront({ products, categories, plans, filters }) {
  // Filters State
  const { data, setData, get } = useForm({
    category: filters.category || 'all',
    search: filters.search || '',
    min_price: filters.min_price || '',
    max_price: filters.max_price || '',
  });

  // Checkout Form State
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const { data: orderData, setData: setOrderData, post: placeOrder, processing, reset } = useForm({
    customer_name: '', customer_phone: '', customer_email: '',
    shipping_address: '', pincode: '', total_amount: 0, items: [],
  });

  function applyFilters(event) {
    event.preventDefault();
    get('/', { preserveState: true, preserveScroll: true });
  }

  function handleBuyNow(product) {
    const sku = product.skus?.[0];
    if (!sku) return alert("Out of stock!");
    setCheckoutProduct(product);
    setOrderData({
      customer_name: '', customer_phone: '', customer_email: '', shipping_address: '', pincode: '',
      total_amount: product.base_price,
      items: [{ product_id: product.id, sku_id: sku.id, quantity: 1, price: product.base_price }]
    });
  }

  function submitOrder(e) {
    e.preventDefault();
    placeOrder('/orders', {
      preserveScroll: true,
      onSuccess: () => {
        setCheckoutProduct(null);
        reset();
        alert("🎉 Order Placed Successfully! Sent to the nearest Franchise.");
      },
    });
  }

  return (
    <AppLayout active="storefront">
      <motion.section
        className="relative flex min-h-[620px] items-end overflow-hidden bg-zinc-900 lg:min-h-[76vh]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Exact image requested */}
        {products.data?.[0] && <img className="hero-media absolute inset-0 h-full w-full object-cover" src="image_9465f4.png" alt="" />}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(24,24,27,.94),rgba(24,24,27,.58),rgba(24,24,27,.12))]" />
        <motion.div className="relative max-w-3xl px-4 pb-14 pt-28 text-white lg:px-16 lg:pb-20" variants={stagger} initial="hidden" animate="visible">
          <motion.p className="text-xs font-black uppercase text-orange-200" variants={fadeUp}>Premium activewear franchise</motion.p>
          <motion.h1 className="mt-2 text-6xl font-black leading-none tracking-normal sm:text-7xl lg:text-8xl" variants={fadeUp}>IHO Clothing</motion.h1>
          <motion.p className="mt-6 max-w-2xl text-lg leading-8 text-white/80" variants={fadeUp}>
            Premium sportswear, clean catalog browsing, and franchise-ready pricing in one simple IHO platform.
          </motion.p>
          <motion.div className="mt-8 flex flex-wrap gap-3" variants={fadeUp}>
            <a className="button-glow inline-flex min-h-12 items-center gap-2 bg-orange-700 px-5 font-black" href="#catalog">
              <ShoppingBag size={18} />
              Shop catalog
            </a>
            <Link className="button-glow inline-flex min-h-12 items-center gap-2 border border-white/30 bg-white/15 px-5 font-black" href="/sports-wear">
              <PackageCheck size={18} />
              Sports wear
            </Link>
            <Link className="button-glow inline-flex min-h-12 items-center gap-2 border border-white/30 bg-white/15 px-5 font-black" href="/franchise-apply">
              <Store size={18} />
              Apply franchise
            </Link>
          </motion.div>
        </motion.div>
      </motion.section>

      <motion.section className="grid border-b border-stone-300 bg-stone-50 lg:grid-cols-3" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }}>
        {[
          [PackageCheck, 'SKU inventory', 'Products include SKU and live stock data.'],
          [HeartHandshake, 'Franchise pricing', 'Retail and partner prices stay separate.'],
          [Truck, 'Smart Delivery', 'Auto-routes orders based on customer Pincode.'],
        ].map(([Icon, title, text]) => (
          <motion.div key={title} className="min-h-28 border-b border-stone-300 p-6 lg:border-b-0 lg:border-r" variants={fadeUp}>
            <Icon className="float-icon text-teal-700" size={22} />
            <strong className="mt-3 block">{title}</strong>
            <span className="mt-1 block text-zinc-500">{text}</span>
          </motion.div>
        ))}
      </motion.section>

      <section id="catalog" className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }} variants={fadeUp}>
          <SectionHeading eyebrow="Catalog" title="Retail collection" aside={`${products.total} products`} />
        </motion.div>
        <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <motion.form onSubmit={applyFilters} className="grid gap-4 border border-stone-300 bg-white p-5 shadow-sm lg:sticky lg:top-24" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
            <div className="flex items-center gap-2 font-black"><Filter size={18} />Filters</div>
            <Field label="Search">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={17} />
                <input className="input pl-10" value={data.search} onChange={(e) => setData('search', e.target.value)} placeholder="Search product" />
              </div>
            </Field>
            <Field label="Category">
              <select className="input" value={data.category} onChange={(e) => setData('category', e.target.value)}>
                <option value="all">All categories</option>
                {categories.map((cat) => <option key={cat.slug} value={cat.slug}>{cat.name}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Min price"><input className="input" type="number" min="0" value={data.min_price} onChange={(e) => setData('min_price', e.target.value)} /></Field>
              <Field label="Max price"><input className="input" type="number" min="0" value={data.max_price} onChange={(e) => setData('max_price', e.target.value)} /></Field>
            </div>
            <button className="button-glow min-h-11 bg-zinc-900 px-4 font-black text-white" type="submit">Apply filters</button>
          </motion.form>

          <motion.div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.12 }}>
            {products.data.map((product) => (
              <motion.article key={product.id} className="lift-card overflow-hidden border border-stone-300 bg-white shadow-sm flex flex-col justify-between" variants={fadeUp}>
                <div>
                  <div className="image-zoom h-72 bg-stone-200">
                    {/* Exact image requested */}
                    <img className="h-full w-full object-cover" src="image_9465f4.png" alt={product.name} />
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
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <button onClick={() => handleBuyNow(product)} className="button-glow w-full inline-flex min-h-11 items-center justify-center gap-2 bg-teal-700 text-white px-4 font-black transition hover:bg-teal-800" type="button">
                    Buy Now <CreditCard size={18} />
                  </button>
                </div>
              </motion.article>
            ))}
            {products.data.length === 0 && <EmptyState text="No products found." />}
          </motion.div>
        </div>
      </section>

      {/* Smart Checkout Modal */}
      <AnimatePresence>
        {checkoutProduct && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-stone-300" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}>
              <div className="bg-zinc-900 text-white p-5 flex justify-between items-center">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <PackageCheck size={20} className="text-teal-400"/> Express Checkout
                </h3>
                <button onClick={() => setCheckoutProduct(null)} className="text-white/70 hover:text-white"><X size={24} /></button>
              </div>
              <div className="p-6">
                <div className="flex gap-4 items-center mb-6 border-b border-stone-200 pb-4">
                  <img src="image_9465f4.png" alt="" className="w-16 h-16 object-cover rounded-md bg-stone-100" />
                  <div>
                    <h4 className="font-bold text-lg leading-tight">{checkoutProduct.name}</h4>
                    <p className="text-teal-700 font-black">{money.format(Number(checkoutProduct.base_price))}</p>
                  </div>
                </div>
                <form onSubmit={submitOrder} className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Full Name"><input required className="input w-full border border-stone-300" value={orderData.customer_name} onChange={e => setOrderData('customer_name', e.target.value)} /></Field>
                    <Field label="Phone"><input required className="input w-full border border-stone-300" value={orderData.customer_phone} onChange={e => setOrderData('customer_phone', e.target.value)} /></Field>
                  </div>
                  <div className="grid grid-cols-[1fr_120px] gap-4">
                    <Field label="Delivery Address"><input required className="input w-full border border-stone-300" value={orderData.shipping_address} onChange={e => setOrderData('shipping_address', e.target.value)} /></Field>
                    <Field label="Pincode"><input required className="input w-full border-2 border-teal-500 bg-teal-50 font-black" value={orderData.pincode} onChange={e => setOrderData('pincode', e.target.value)} placeholder="201309" /></Field>
                  </div>
                  <button disabled={processing} className="button-glow w-full flex min-h-12 items-center justify-center gap-2 bg-orange-700 text-white font-black text-lg mt-4 disabled:opacity-50" type="submit">
                    {processing ? 'Processing...' : `Pay ${money.format(Number(checkoutProduct.base_price))}`}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Franchise Plan Section (Original) */}
      <section className="border-t border-stone-300 bg-stone-200 px-4 py-12 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }} variants={fadeUp}>
            <SectionHeading eyebrow="Franchise" title="Partner plans" aside={`${plans.length} plans`} />
          </motion.div>
          <motion.div className="grid gap-5 lg:grid-cols-3" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
            {plans.map((plan) => (
              <motion.article className="lift-card grid gap-5 border border-stone-300 bg-white p-6 shadow-sm" key={plan.id} variants={fadeUp}>
                <Store className="float-icon text-orange-700" size={24} />
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
                <Link className="button-glow inline-flex min-h-11 items-center justify-center gap-2 bg-orange-700 px-4 font-black text-white" href="/franchise-apply">
                  Apply now
                  <ArrowRight size={16} />
                </Link>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>
    </AppLayout>
  );
}