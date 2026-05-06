import React, { useState, useRef } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  CreditCard,
  Filter,
  HeartHandshake,
  Mail,
  MapPin,
  Package,
  PackageCheck,
  Search,
  Shield,
  ShoppingBag,
  Star,
  Store,
  Truck,
  X,
  Zap,
} from 'lucide-react';
import AppLayout, { EmptyState, Field, SectionHeading, imageFor, money, stockFor } from '../Layouts/AppLayout';

const HERO_FALLBACK   = 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=1600&q=80';
const PRODUCT_FALLBACK = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=70';

const CAT_COLORS = [
  'from-teal-900 to-teal-700',
  'from-orange-900 to-orange-700',
  'from-zinc-900 to-zinc-700',
  'from-stone-800 to-stone-600',
  'from-cyan-900 to-cyan-700',
  'from-slate-800 to-slate-600',
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const trustItems = [
  [PackageCheck, 'SKU inventory', 'Products include SKU and live stock data.'],
  [HeartHandshake, 'Franchise pricing', 'Retail and partner prices stay separate.'],
  [Truck, 'Smart Delivery', 'Auto-routes orders based on customer Pincode.'],
];

const marqueeItems = [
  '✦ Free delivery above ₹999',
  '✦ Premium activewear',
  '✦ Franchise opportunities available',
  '✦ SKU-level inventory tracking',
  '✦ Smart checkout with pincode routing',
  '✦ Premium Quality Guaranteed',
];

const howItWorks = [
  {
    step: '01',
    icon: Search,
    title: 'Browse & Filter',
    desc: 'Explore our premium catalog. Filter by category, price, and size to find exactly what you need.',
  },
  {
    step: '02',
    icon: CreditCard,
    title: 'Quick Checkout',
    desc: 'Fill your delivery details with pincode. Our system routes your order to the nearest franchise.',
  },
  {
    step: '03',
    icon: MapPin,
    title: 'Fast Delivery',
    desc: 'Your order is dispatched from the closest IHO franchise for the fastest possible delivery.',
  },
];

const testimonials = [
  {
    name: 'Rahul Sharma',
    city: 'New Delhi',
    role: 'Regular Customer',
    text: 'IHO Clothing has the best quality sportswear I have found online. The fabric is premium, delivery was super fast, and the franchise pricing is really transparent.',
    rating: 5,
    avatar: 'RS',
    color: 'bg-teal-600',
  },
  {
    name: 'Priya Mehta',
    city: 'Mumbai',
    role: 'Franchise Partner',
    text: 'I applied for a franchise 3 months ago and the support has been excellent. Stock management is seamless and the retail margin is very healthy.',
    rating: 5,
    avatar: 'PM',
    color: 'bg-orange-600',
  },
  {
    name: 'Arjun Singh',
    city: 'Bangalore',
    role: 'Sports Academy Coach',
    text: 'We ordered teamwear sets for 40 players. The bulk pricing and SKU-level customization options were exactly what we needed for our academy.',
    rating: 5,
    avatar: 'AS',
    color: 'bg-zinc-700',
  },
];

export default function Storefront({ products, categories, plans, filters }) {
  const { data, setData, get } = useForm({
    category: filters.category || 'all',
    search: filters.search || '',
    min_price: filters.min_price || '',
    max_price: filters.max_price || '',
  });

  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterDone, setNewsletterDone] = useState(false);

  const {
    data: orderData,
    setData: setOrderData,
    post: placeOrder,
    processing,
    reset,
  } = useForm({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    shipping_address: '',
    pincode: '',
    total_amount: 0,
    items: [],
  });

  // ── Hero parallax ──────────────────────────────────────────────────────────
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const bgY   = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-18%']);

  // Mouse-tracking parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX    = useSpring(mouseX, { damping: 20, stiffness: 100, mass: 0.5 });
  const smoothY    = useSpring(mouseY, { damping: 20, stiffness: 100, mass: 0.5 });
  const bgParallaxX = useTransform(smoothX, [-1, 1], [-10, 10]);
  const bgParallaxY = useTransform(smoothY, [-1, 1], [-7, 7]);
  const orb1X       = useTransform(smoothX, [-1, 1], [-28, 28]);
  const orb1Y       = useTransform(smoothY, [-1, 1], [-20, 20]);
  const orb2X       = useTransform(smoothX, [-1, 1], [18, -18]);

  function handleHeroMouseMove(e) {
    const r = e.currentTarget.getBoundingClientRect();
    mouseX.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    mouseY.set(((e.clientY - r.top) / r.height - 0.5) * 2);
  }
  function handleHeroMouseLeave() { mouseX.set(0); mouseY.set(0); }
  // ───────────────────────────────────────────────────────────────────────────

  const heroImg = imageFor(products.data?.[0]) || HERO_FALLBACK;
  const featuredProducts = products.data?.slice(0, 4) || [];

  const siteStats = [
    { value: `${products.total}+`, label: 'Products', sub: 'Active listings' },
    { value: `${categories.length}+`, label: 'Categories', sub: 'Product types' },
    { value: `${plans.length}`, label: 'Franchise Plans', sub: 'Partnership tiers' },
    { value: '100%', label: 'Premium Quality', sub: 'Certified fabric' },
  ];

  function applyFilters(event) {
    event.preventDefault();
    get('/', { preserveState: true, preserveScroll: true });
  }

  function handleBuyNow(product) {
    const sku = product.skus?.[0];
    if (!sku) return alert('Out of stock!');
    setCheckoutProduct(product);
    setOrderData({
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      shipping_address: '',
      pincode: '',
      total_amount: product.base_price,
      items: [{ product_id: product.id, sku_id: sku.id, quantity: 1, price: product.base_price }],
    });
  }

  function submitOrder(e) {
    e.preventDefault();
    placeOrder('/orders', {
      preserveScroll: true,
      onSuccess: () => {
        setCheckoutProduct(null);
        reset();
        alert('🎉 Order Placed Successfully! Sent to the nearest Franchise.');
      },
    });
  }

  function handleNewsletter(e) {
    e.preventDefault();
    setNewsletterDone(true);
  }

  return (
    <AppLayout active="storefront">

      {/* ══════════════════════════════════
          1. HERO  — premium Framer Motion
      ══════════════════════════════════ */}
      <motion.section
        ref={heroRef}
        className="relative flex min-h-[700px] items-end overflow-hidden bg-zinc-950 lg:min-h-[90vh]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9 }}
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
      >
        {/* ── Parallax background (scroll + mouse) ──────────────── */}
        <motion.div className="absolute inset-0 scale-[1.12]" style={{ y: bgY }}>
          <motion.div className="absolute inset-0" style={{ x: bgParallaxX, y: bgParallaxY }}>
            <img
              className="h-full w-full object-cover"
              src={heroImg}
              onError={(e) => { e.target.src = HERO_FALLBACK; e.target.onerror = null; }}
              alt=""
              loading="eager"
            />
          </motion.div>
        </motion.div>

        {/* ── Multi-layer dark overlay ───────────────────────────── */}
        <div className="absolute inset-0 bg-[linear-gradient(108deg,rgba(9,9,11,.98)_0%,rgba(9,9,11,.80)_46%,rgba(9,9,11,.18)_100%)]" />
        {/* Radial spotlight behind text */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_75%_at_5%_68%,rgba(20,184,166,0.14),transparent_72%)]" />

        {/* ── Ambient orbs — mouse-reactive ─────────────────────── */}
        <motion.div
          className="pointer-events-none absolute right-[7%] top-[8%] h-[440px] w-[440px] rounded-full bg-teal-500/[0.18] blur-[150px]"
          style={{ x: orb1X, y: orb1Y }}
          animate={{ scale: [1, 1.22, 1], opacity: [0.5, 0.88, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="pointer-events-none absolute bottom-[4%] right-[20%] h-80 w-80 rounded-full bg-orange-500/[0.14] blur-[130px]"
          style={{ x: orb2X }}
          animate={{ scale: [1.1, 0.84, 1.1], opacity: [0.38, 0.72, 0.38] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2.2 }}
        />
        <motion.div
          className="pointer-events-none absolute left-[40%] top-[28%] h-56 w-56 rounded-full bg-violet-500/[0.09] blur-[100px]"
          animate={{ scale: [0.82, 1.32, 0.82], opacity: [0.22, 0.5, 0.22] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />

        {/* ── Floating geometric accents ────────────────────────── */}
        <motion.div
          className="pointer-events-none absolute right-[13%] top-[19%] h-32 w-32 rounded-3xl border border-white/[0.06] bg-white/[0.025]"
          animate={{ y: [0, -26, 0], rotate: [0, 7, 0], opacity: [0.18, 0.48, 0.18] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="pointer-events-none absolute right-[34%] top-[15%] h-[60px] w-[60px] rounded-2xl border border-teal-400/[0.22] bg-teal-400/[0.04]"
          animate={{ y: [0, 19, 0], rotate: [0, -11, 0], opacity: [0.28, 0.62, 0.28] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1.6 }}
        />
        <motion.div
          className="pointer-events-none absolute right-[22%] bottom-[18%] h-10 w-10 rounded-xl border border-orange-400/[0.22] bg-orange-400/[0.04]"
          animate={{ y: [0, -14, 0], rotate: [0, 16, 0], opacity: [0.22, 0.58, 0.22] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 3.2 }}
        />

        {/* ── Hero text content ──────────────────────────────────── */}
        <motion.div
          className="relative z-10 max-w-3xl px-6 pb-16 pt-36 text-white lg:px-16 lg:pb-32"
          style={{ y: textY }}
        >
          {/* Eyebrow badge with pulsing live dot */}
          <motion.p
            className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.14] bg-white/[0.08] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-orange-200 backdrop-blur-md"
            initial={{ opacity: 0, y: 22, scale: 0.84 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            {/* Pulsing live indicator */}
            <span className="relative flex h-2 w-2 shrink-0">
              <motion.span
                className="absolute inline-flex h-full w-full rounded-full bg-orange-400"
                animate={{ scale: [1, 2.2, 1], opacity: [0.75, 0, 0.75] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-400" />
            </span>
            <motion.span
              animate={{ rotate: [0, 20, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
              className="inline-flex"
            >
              <Zap size={12} />
            </motion.span>
            Premium activewear franchise
          </motion.p>

          {/* H1 — word-clip reveal + gradient on "IHO" */}
          <h1 className="font-display mt-5 text-6xl font-black leading-none sm:text-7xl lg:text-8xl">
            <div className="overflow-hidden leading-[1.06]">
              <motion.span
                className="inline-block bg-gradient-to-r from-white via-teal-100 to-teal-300 bg-clip-text text-transparent"
                initial={{ y: '115%', opacity: 0, skewY: 4 }}
                animate={{ y: 0, opacity: 1, skewY: 0 }}
                transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: 0.28 }}
              >
                IHO
              </motion.span>
            </div>
            <div className="overflow-hidden leading-[1.06]">
              <motion.span
                className="inline-block text-white"
                initial={{ y: '115%', opacity: 0, skewY: 4 }}
                animate={{ y: 0, opacity: 1, skewY: 0 }}
                transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: 0.44 }}
              >
                Clothing
              </motion.span>
            </div>
          </h1>

          {/* Animated gradient underline */}
          <motion.div
            className="mt-4 h-[3px] w-28 rounded-full bg-gradient-to-r from-teal-400 via-teal-300 to-orange-400"
            style={{ transformOrigin: 'left' }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: 0.66 }}
          />

          {/* Subtitle */}
          <motion.p
            className="mt-6 max-w-lg text-lg leading-8 text-white/65"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.76 }}
          >
            Premium sportswear, clean catalog browsing, and franchise-ready pricing — all in one place.
          </motion.p>

          {/* CTA buttons — staggered entrance + hover/tap */}
          <motion.div
            className="mt-8 flex flex-wrap gap-3"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.11, delayChildren: 0.92 } } }}
          >
            <motion.a
              href="#catalog"
              className="button-glow inline-flex min-h-12 items-center gap-2.5 rounded-xl bg-teal-600 px-6 text-sm font-bold transition-colors hover:bg-teal-700"
              variants={fadeUp}
              whileHover={{ scale: 1.06, y: -3, transition: { duration: 0.18 } }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingBag size={17} /> Shop catalog
            </motion.a>
            <motion.div
              variants={fadeUp}
              whileHover={{ scale: 1.06, y: -3, transition: { duration: 0.18 } }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/sports-wear" className="button-glow inline-flex min-h-12 items-center gap-2.5 rounded-xl border border-white/20 bg-white/10 px-6 text-sm font-bold backdrop-blur-sm transition-colors hover:bg-white/[0.15]">
                <PackageCheck size={17} /> Sports wear
              </Link>
            </motion.div>
            <motion.div
              variants={fadeUp}
              whileHover={{ scale: 1.06, y: -3, transition: { duration: 0.18 } }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/franchise-apply" className="button-glow inline-flex min-h-12 items-center gap-2.5 rounded-xl border border-white/20 bg-white/10 px-6 text-sm font-bold backdrop-blur-sm transition-colors hover:bg-white/[0.15]">
                <Store size={17} /> Apply franchise
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ── Floating stat pills (xl+ only) ────────────────────── */}
        <div className="absolute right-10 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-3 xl:flex">
          {[
            { icon: Package,       label: `${products?.total ?? '500'}+`, sub: 'Products',        delay: 1.1 },
            { icon: Truck,         label: 'Pan India',                     sub: 'Delivery',        delay: 1.3 },
            { icon: BadgeCheck,    label: '100%',                          sub: 'Premium Quality', delay: 1.5 },
            { icon: HeartHandshake,label: `${plans?.length ?? 3}`,         sub: 'Franchise Plans', delay: 1.7 },
          ].map(({ icon: Icon, label, sub, delay }) => (
            <motion.div
              key={sub}
              className="flex items-center gap-3 rounded-2xl border border-white/[0.10] bg-white/[0.07] px-4 py-3 backdrop-blur-md"
              initial={{ opacity: 0, x: 50, scale: 0.88 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1], delay }}
              whileHover={{ scale: 1.05, x: -6, backgroundColor: 'rgba(255,255,255,0.12)', transition: { duration: 0.18 } }}
            >
              <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-teal-500/[0.22]">
                <Icon size={16} className="text-teal-300" />
              </div>
              <div>
                <p className="text-sm font-black leading-tight text-white">{label}</p>
                <p className="text-[11px] font-medium text-white/40">{sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Scroll indicator ──────────────────────────────────── */}
        <motion.div
          className="pointer-events-none absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.6, duration: 1.2 }}
        >
          <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/20">Scroll</span>
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowDown size={14} className="text-white/25" />
          </motion.div>
        </motion.div>
      </motion.section>


      {/* ══════════════════════════════════
          2. PREMIUM PRODUCT CAROUSEL
      ══════════════════════════════════ */}
      <section className="relative z-20 bg-white border-b border-stone-200 py-10 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
            <SectionHeading eyebrow="Trending now" title="Best Sellers" aside="Handpicked for you" />
          </motion.div>
          <motion.div
            className="flex gap-7 overflow-x-auto py-4 hide-scrollbar"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {products.data.slice(0, 10).map((product, i) => {
              const img = imageFor(product) || PRODUCT_FALLBACK;
              const stock = stockFor(product);
              return (
                <motion.div
                  key={product.id}
                  className="min-w-[260px] max-w-[260px] flex-shrink-0 rounded-2xl border border-stone-200 bg-white shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col"
                  variants={fadeUp}
                  whileHover={{ scale: 1.04, y: -6 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="h-44 overflow-hidden rounded-t-2xl bg-stone-100 flex items-center justify-center">
                    <img
                      src={img}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                      onError={e => { e.target.src = PRODUCT_FALLBACK; e.target.onerror = null; }}
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <span className="text-xs font-bold uppercase tracking-wide text-teal-700">{product.category?.name || 'Clothing'}</span>
                    <h3 className="font-bold leading-tight text-zinc-900 text-base min-h-10">{product.name}</h3>
                    <div className="flex items-center justify-between gap-2 mt-auto pt-2">
                      <strong className="text-lg font-bold text-zinc-900">{money.format(Number(product.base_price))}</strong>
                      <button
                        onClick={() => handleBuyNow(product)}
                        disabled={stock === 0}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-800 disabled:opacity-50"
                      >
                        <CreditCard size={14} /> Buy
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════
          3. MARQUEE
      ══════════════════════════════════ */}
      <div className="overflow-hidden border-y border-stone-300 bg-zinc-900 py-3">
        <div className="marquee-track flex whitespace-nowrap text-sm font-semibold text-zinc-400">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="px-8">{item}</span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════
          3. TRUST STRIP
      ══════════════════════════════════ */}
      <motion.section
        className="border-b border-stone-200 bg-white"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
      >
        <div className="mx-auto grid max-w-7xl divide-y divide-stone-200 px-4 lg:grid-cols-3 lg:divide-x lg:divide-y-0 lg:px-8">
          {trustItems.map(([Icon, title, text]) => (
            <motion.div key={title} className="flex items-start gap-4 px-4 py-6" variants={fadeUp}>
              <div className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-teal-50">
                <Icon className="text-teal-700" size={20} />
              </div>
              <div>
                <strong className="block font-bold text-zinc-900">{title}</strong>
                <span className="mt-0.5 block text-sm leading-6 text-stone-500">{text}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ══════════════════════════════════
          4. CATEGORY GRID
      ══════════════════════════════════ */}
      {categories.length > 0 && (
        <section className="border-b border-stone-200 bg-[#f9f7f4] px-4 py-14 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
              <SectionHeading eyebrow="Browse by" title="Category" aside={`${categories.length} collections`} />
            </motion.div>
            <motion.div
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
            >
              {categories.map((cat, i) => (
                <motion.div key={cat.id} variants={fadeUp}>
                  <Link
                    href={`/?category=${cat.slug}`}
                    className={`group flex flex-col items-center justify-end overflow-hidden rounded-2xl bg-gradient-to-b ${CAT_COLORS[i % CAT_COLORS.length]} p-5 pt-16 text-center text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-xl`}
                  >
                    <strong className="block text-sm font-bold leading-tight">{cat.name}</strong>
                    <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-white/60 group-hover:text-white/90 transition-colors">
                      Shop <ArrowRight size={11} />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════
          5. FEATURED / NEW ARRIVALS
      ══════════════════════════════════ */}
      {featuredProducts.length > 0 && (
        <section className="border-b border-stone-200 bg-white px-4 py-14 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
              <SectionHeading eyebrow="Just in" title="New Arrivals" aside="Fresh collection" />
            </motion.div>
            <motion.div
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              {featuredProducts.map((product, i) => {
                const img = imageFor(product) || PRODUCT_FALLBACK;
                const stock = stockFor(product);
                const isFeatured = i === 0;
                return (
                  <motion.article
                    key={product.id}
                    className={`lift-card flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm ${isFeatured ? 'sm:col-span-2 sm:row-span-2' : ''}`}
                    variants={fadeUp}
                  >
                    <div className={`image-zoom overflow-hidden bg-stone-100 ${isFeatured ? 'h-72 sm:h-80' : 'h-52'}`}>
                      <img
                        className="h-full w-full object-cover"
                        src={img}
                        onError={(e) => { e.target.src = PRODUCT_FALLBACK; e.target.onerror = null; }}
                        alt={product.name}
                        loading="lazy"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-5">
                      {isFeatured && (
                        <span className="w-fit rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                          Featured Pick
                        </span>
                      )}
                      <span className="text-xs font-bold uppercase tracking-wide text-teal-700">
                        {product.category?.name || 'Clothing'}
                      </span>
                      <h3 className={`font-bold leading-tight text-zinc-900 ${isFeatured ? 'text-xl' : 'text-base'}`}>
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between gap-2 mt-auto pt-2">
                        <strong className="text-lg font-bold text-zinc-900">
                          {money.format(Number(product.base_price))}
                        </strong>
                        <button
                          onClick={() => handleBuyNow(product)}
                          disabled={stock === 0}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-800 disabled:opacity-50"
                        >
                          <CreditCard size={14} /> Buy
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════
          6. STATS BANNER
      ══════════════════════════════════ */}
      <section className="bg-zinc-900 px-4 py-16 text-white lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="grid grid-cols-2 gap-8 lg:grid-cols-4"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {siteStats.map(({ value, label, sub }) => (
              <motion.div key={label} className="text-center" variants={fadeUp}>
                <strong className="font-display block text-5xl font-black text-white lg:text-6xl">
                  {value}
                </strong>
                <p className="mt-2 font-bold text-teal-300">{label}</p>
                <p className="mt-0.5 text-xs font-medium text-zinc-500">{sub}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════
          7. HOW IT WORKS
      ══════════════════════════════════ */}
      <section className="border-b border-stone-200 bg-[#f9f7f4] px-4 py-14 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
            <SectionHeading eyebrow="Simple process" title="How it works" />
          </motion.div>
          <motion.div
            className="grid gap-6 md:grid-cols-3"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {howItWorks.map(({ step, icon: Icon, title, desc }) => (
              <motion.div key={step} className="relative rounded-2xl border border-stone-200 bg-white p-7 shadow-sm" variants={fadeUp}>
                <span className="font-display absolute right-5 top-5 text-6xl font-black leading-none text-stone-100 select-none">
                  {step}
                </span>
                <div className="mb-5 grid size-12 place-items-center rounded-xl bg-teal-50">
                  <Icon className="text-teal-700" size={22} />
                </div>
                <h3 className="text-xl font-bold text-zinc-900">{title}</h3>
                <p className="mt-2.5 text-sm leading-7 text-stone-500">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════
          8. CATALOG WITH FILTERS
      ══════════════════════════════════ */}
      <section id="catalog" className="mx-auto max-w-7xl px-4 py-14 lg:px-8 lg:py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
          <SectionHeading eyebrow="Catalog" title="Retail collection" aside={`${products.total} products`} />
        </motion.div>

        <div className="grid items-start gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Filter Sidebar */}
          <motion.form
            onSubmit={applyFilters}
            className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm lg:sticky lg:top-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
          >
            <div className="flex items-center gap-2 font-bold text-zinc-900">
              <Filter size={17} /> Filters
            </div>
            <Field label="Search">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                <input className="input pl-10" value={data.search} onChange={(e) => setData('search', e.target.value)} placeholder="Search product" />
              </div>
            </Field>
            <Field label="Category">
              <select className="input" value={data.category} onChange={(e) => setData('category', e.target.value)}>
                <option value="all">All categories</option>
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Min price">
                <input className="input" type="number" min="0" value={data.min_price} onChange={(e) => setData('min_price', e.target.value)} placeholder="₹ 0" />
              </Field>
              <Field label="Max price">
                <input className="input" type="number" min="0" value={data.max_price} onChange={(e) => setData('max_price', e.target.value)} placeholder="₹ max" />
              </Field>
            </div>
            <button className="button-glow inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 text-sm font-bold text-white hover:bg-zinc-800" type="submit">
              Apply filters
            </button>
            {(data.search || data.category !== 'all' || data.min_price || data.max_price) && (
              <button type="button" onClick={() => { setData({ category: 'all', search: '', min_price: '', max_price: '' }); router.get('/', {}, { preserveState: false }); }} className="text-center text-xs font-semibold text-stone-400 hover:text-stone-600">
                Clear all filters
              </button>
            )}
          </motion.form>

          {/* Product Grid */}
          <motion.div
            className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.06 }}
          >
            {products.data.map((product) => {
              const img = imageFor(product) || PRODUCT_FALLBACK;
              const stock = stockFor(product);
              return (
                <motion.article key={product.id} className="lift-card flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm" variants={fadeUp}>
                  <div className="image-zoom h-72 overflow-hidden bg-stone-100">
                    <img
                      className="h-full w-full object-cover"
                      src={img}
                      onError={(e) => { e.target.src = PRODUCT_FALLBACK; e.target.onerror = null; }}
                      alt={product.name}
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <span className="text-xs font-bold uppercase tracking-wide text-teal-700">
                      {product.category?.name || 'Clothing'}
                    </span>
                    <h3 className="min-h-12 text-lg font-bold leading-tight text-zinc-900">{product.name}</h3>
                    {product.description && (
                      <p className="line-clamp-2 text-sm leading-6 text-stone-500">{product.description}</p>
                    )}
                    <div className="flex items-end justify-between gap-2">
                      <strong className="text-xl font-bold text-zinc-900">{money.format(Number(product.base_price))}</strong>
                      <small className="rounded-md bg-orange-50 px-2 py-0.5 text-xs font-bold text-orange-700">
                        Franchise {money.format(Number(product.franchise_price))}
                      </small>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-teal-700">
                      <BadgeCheck size={15} />
                      {stock > 0 ? `${stock} units in stock` : 'Out of stock'}
                    </div>
                    <button
                      onClick={() => handleBuyNow(product)}
                      disabled={stock === 0}
                      className="button-glow mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-bold text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <CreditCard size={16} /> Buy Now
                    </button>
                  </div>
                </motion.article>
              );
            })}
            {products.data.length === 0 && (
              <div className="col-span-full">
                <EmptyState text="No products match your filters." />
              </div>
            )}
          </motion.div>
        </div>

        {/* Pagination */}
        {products.last_page > 1 && (
          <div className="mt-10 flex justify-center gap-2">
            {products.links?.map((link, i) => (
              <button
                key={i}
                disabled={!link.url}
                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                className={`min-h-9 min-w-9 rounded-lg px-3 text-sm font-semibold transition-colors ${
                  link.active ? 'bg-zinc-900 text-white' : link.url ? 'bg-white text-stone-600 hover:bg-stone-100' : 'cursor-not-allowed text-stone-300'
                }`}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════
          9. TESTIMONIALS
      ══════════════════════════════════ */}
      <section className="border-t border-stone-200 bg-stone-100 px-4 py-14 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
            <SectionHeading eyebrow="Reviews" title="What customers say" />
          </motion.div>
          <motion.div
            className="grid gap-6 md:grid-cols-3"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {testimonials.map(({ name, city, role, text, rating, avatar, color }) => (
              <motion.div key={name} className="lift-card flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm" variants={fadeUp}>
                <div className="flex gap-1">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="flex-1 text-sm leading-7 text-stone-600">"{text}"</p>
                <div className="flex items-center gap-3 border-t border-stone-100 pt-4">
                  <div className={`grid size-10 shrink-0 place-items-center rounded-full ${color} text-sm font-black text-white`}>
                    {avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{name}</p>
                    <p className="text-xs font-medium text-stone-400">{role} · {city}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════
          10. WHY CHOOSE US
      ══════════════════════════════════ */}
      <section className="border-t border-stone-200 bg-white px-4 py-14 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 lg:items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
              <motion.p className="mb-2 text-xs font-bold uppercase tracking-widest text-orange-700" variants={fadeUp}>
                Why IHO
              </motion.p>
              <motion.h2 className="font-display text-4xl font-black leading-tight text-zinc-900 sm:text-5xl" variants={fadeUp}>
                Built for quality.<br />Built to scale.
              </motion.h2>
              <motion.p className="mt-5 text-base leading-8 text-stone-500" variants={fadeUp}>
                IHO Clothing is more than just a clothing brand — it's a fully integrated retail and franchise platform with live SKU tracking, smart order routing, and premium garment standards.
              </motion.p>
              <motion.div className="mt-8 grid gap-4" variants={stagger}>
                {[
                  [Shield, 'Premium quality fabric', 'Every piece is tested to meet our quality standards before it reaches you.'],
                  [Package, 'Live inventory tracking', 'Real-time SKU and stock data ensures you always know what\'s available.'],
                  [Store, 'Franchise network', 'Orders are routed to the nearest franchise for fast, local delivery.'],
                ].map(([Icon, title, desc]) => (
                  <motion.div key={title} className="flex gap-4" variants={fadeUp}>
                    <div className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-teal-50">
                      <Icon size={18} className="text-teal-700" />
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900">{title}</p>
                      <p className="mt-0.5 text-sm leading-6 text-stone-500">{desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            <motion.div
              className="grid grid-cols-2 gap-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
            >
              {[
                { icon: CheckCircle2, label: 'ISO-grade stitching', color: 'bg-teal-50 text-teal-700' },
                { icon: Truck, label: 'Same-city delivery', color: 'bg-orange-50 text-orange-700' },
                { icon: BadgeCheck, label: 'Authentic products', color: 'bg-zinc-100 text-zinc-700' },
                { icon: HeartHandshake, label: 'Partner support 24/7', color: 'bg-stone-100 text-stone-700' },
              ].map(({ icon: Icon, label, color }) => (
                <motion.div key={label} className={`flex flex-col items-center gap-3 rounded-2xl border border-stone-200 p-6 text-center ${color.split(' ')[0]}`} variants={fadeUp}>
                  <Icon size={28} className={color.split(' ')[1]} />
                  <p className="text-sm font-semibold text-zinc-800">{label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          11. NEWSLETTER
      ══════════════════════════════════ */}
      <section className="border-t border-teal-800 bg-teal-700 px-4 py-14 text-white lg:px-8 lg:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} variants={stagger}>
            <motion.div className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-white/15" variants={fadeUp}>
              <Mail size={22} />
            </motion.div>
            <motion.h2 className="font-display text-3xl font-black sm:text-4xl" variants={fadeUp}>
              Stay in the loop
            </motion.h2>
            <motion.p className="mt-3 text-base text-teal-100" variants={fadeUp}>
              Get new arrivals, exclusive franchise deals and seasonal drops straight to your inbox.
            </motion.p>
            {newsletterDone ? (
              <motion.div
                className="mt-6 flex items-center justify-center gap-3 rounded-xl bg-white/15 px-6 py-4 text-sm font-semibold"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <CheckCircle2 size={18} /> You're subscribed! Welcome to IHO family.
              </motion.div>
            ) : (
              <motion.form onSubmit={handleNewsletter} className="mt-6 flex gap-3" variants={fadeUp}>
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 rounded-xl border-0 bg-white/15 px-4 py-3 text-sm font-medium text-white placeholder-teal-200 outline-none ring-1 ring-white/20 transition focus:bg-white/20 focus:ring-white/40"
                />
                <button type="submit" className="button-glow inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-teal-700 transition-colors hover:bg-teal-50">
                  Subscribe <ArrowRight size={15} />
                </button>
              </motion.form>
            )}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════
          12. FRANCHISE PLANS
      ══════════════════════════════════ */}
      <section className="border-t border-stone-200 bg-stone-100 px-4 py-14 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
            <SectionHeading eyebrow="Franchise" title="Partner plans" aside={`${plans.length} plans`} />
          </motion.div>
          <motion.div
            className="grid gap-6 lg:grid-cols-3"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.12 }}
          >
            {plans.map((plan) => (
              <motion.article className="lift-card flex flex-col gap-5 rounded-2xl border border-stone-200 bg-white p-7 shadow-sm" key={plan.id} variants={fadeUp}>
                <div className="flex items-start justify-between">
                  <Store className="float-icon text-orange-700" size={26} />
                  <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold capitalize text-orange-700">{plan.type}</span>
                </div>
                <div>
                  <h3 className="font-display text-2xl font-black text-zinc-900">{plan.name}</h3>
                  <strong className="mt-1 block text-3xl font-bold text-teal-700">{money.format(Number(plan.price))}</strong>
                </div>
                <ul className="grid flex-1 gap-2.5">
                  {(plan.features_list || []).map((feature) => (
                    <li className="flex gap-2.5 text-sm text-stone-600" key={feature}>
                      <Check className="mt-0.5 shrink-0 text-teal-600" size={15} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link className="button-glow inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 text-sm font-bold text-white hover:bg-orange-800 transition-colors" href="/franchise-apply">
                  Apply now <ArrowRight size={15} />
                </Link>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════
          CHECKOUT MODAL
      ══════════════════════════════════ */}
      <AnimatePresence>
        {checkoutProduct && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setCheckoutProduct(null)}
          >
            <motion.div
              className="w-full max-w-lg overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl"
              initial={{ scale: 0.94, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, y: 24, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between border-b border-stone-100 bg-zinc-900 px-6 py-4">
                <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                  <PackageCheck size={20} className="text-teal-400" /> Express Checkout
                </h3>
                <button onClick={() => setCheckoutProduct(null)} className="rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-5 flex items-center gap-4 rounded-xl bg-stone-50 p-3">
                  <img
                    src={imageFor(checkoutProduct) || PRODUCT_FALLBACK}
                    onError={(e) => { e.target.src = PRODUCT_FALLBACK; e.target.onerror = null; }}
                    alt=""
                    className="h-16 w-16 flex-shrink-0 rounded-xl object-cover bg-stone-200"
                  />
                  <div>
                    <h4 className="font-bold leading-tight text-zinc-900">{checkoutProduct.name}</h4>
                    <p className="mt-0.5 text-lg font-bold text-teal-700">{money.format(Number(checkoutProduct.base_price))}</p>
                  </div>
                </div>
                <form onSubmit={submitOrder} className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Full Name">
                      <input required className="input" value={orderData.customer_name} onChange={(e) => setOrderData('customer_name', e.target.value)} />
                    </Field>
                    <Field label="Phone">
                      <input required className="input" value={orderData.customer_phone} onChange={(e) => setOrderData('customer_phone', e.target.value)} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-[1fr_130px] gap-4">
                    <Field label="Delivery Address">
                      <input required className="input" value={orderData.shipping_address} onChange={(e) => setOrderData('shipping_address', e.target.value)} />
                    </Field>
                    <Field label="Pincode">
                      <input required className="input border-teal-400 bg-teal-50 font-bold" value={orderData.pincode} onChange={(e) => setOrderData('pincode', e.target.value)} placeholder="201309" />
                    </Field>
                  </div>
                  <button
                    disabled={processing}
                    className="button-glow mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-700 text-base font-bold text-white transition-colors hover:bg-orange-800 disabled:opacity-60"
                  >
                    {processing ? 'Processing…' : `Pay ${money.format(Number(checkoutProduct.base_price))}`}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
