import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  Dumbbell,
  Flame,
  Layers,
  PackageCheck,
  Shirt,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import AppLayout, { SectionHeading, imageFor, money, stockFor } from '../Layouts/AppLayout';

const HERO_FALLBACK = 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1600&q=80';
const PRODUCT_FALLBACK = 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=70';

const focusAreas = [
  {
    id: 'training',
    icon: Dumbbell,
    title: 'Training fits',
    text: 'Dry-fit tees, compression layers, and stretch bottoms for daily gym and outdoor sessions.',
  },
  {
    id: 'teamwear',
    icon: Users,
    title: 'Teamwear',
    text: 'Jerseys, warm-up layers, and coordinated color stories for academies, clubs, and events.',
  },
  {
    id: 'franchise-packs',
    icon: Boxes,
    title: 'Franchise packs',
    text: 'Fast-moving sportswear bundles with retail and partner pricing already separated.',
  },
];

const buyingOptions = [
  [Zap, 'Performance drop', 'Limited seasonal capsules built around training, running, and recovery.'],
  [Layers, 'Mix-and-match sets', 'Tops, bottoms, and layers that work as full outfits or single pieces.'],
  [PackageCheck, 'Bulk ready', 'SKUs and stock tracking support club orders and franchise restocking.'],
  [Sparkles, 'Premium finish', 'Clean silhouettes, breathable fabric positioning, and retail-ready styling.'],
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.06 } },
};

export default function SportsWear({ products, categories, plans }) {
  const heroImage = imageFor(products?.[0]) || HERO_FALLBACK;

  return (
    <AppLayout active="sports">
      {/* ── Hero ── */}
      <motion.section
        className="relative flex min-h-[600px] items-end overflow-hidden bg-zinc-950 lg:min-h-[74vh]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img
          className="hero-media absolute inset-0 h-full w-full object-cover"
          src={heroImage}
          onError={(e) => {
            e.target.src = HERO_FALLBACK;
            e.target.onerror = null;
          }}
          alt=""
          loading="eager"
        />
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(9,9,11,.95)_0%,rgba(9,9,11,.65)_50%,rgba(9,9,11,.15)_100%)]" />

        <motion.div
          className="relative max-w-4xl px-6 pb-16 pt-32 text-white lg:px-16 lg:pb-24"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.p
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-orange-200"
            variants={fadeUp}
          >
            <Flame size={12} />
            Sports wear collection
          </motion.p>
          <motion.h1
          className="font-display mt-4 text-6xl font-black leading-none sm:text-7xl lg:text-8xl"
            variants={fadeUp}
          >
            Sports Wear
          </motion.h1>
          <motion.p className="mt-5 max-w-2xl text-lg leading-8 text-white/70" variants={fadeUp}>
            Performance clothing for customers, teams, and IHO franchise partners, organized into
            clear product options for faster buying.
          </motion.p>
          <motion.div className="mt-8 flex flex-wrap gap-3" variants={fadeUp}>
            <a
              href="#training"
              className="button-glow inline-flex min-h-12 items-center gap-2.5 rounded-xl bg-orange-700 px-6 text-sm font-bold hover:bg-orange-800"
            >
              Explore options
              <ArrowRight size={17} />
            </a>
            <Link
              href="/?category=premium-tshirts"
              className="button-glow inline-flex min-h-12 items-center gap-2.5 rounded-xl border border-white/20 bg-white/10 px-6 text-sm font-bold backdrop-blur-sm hover:bg-white/15"
            >
              <Shirt size={17} />
              Shop products
            </Link>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ── Focus areas ── */}
      <motion.section
        className="border-b border-stone-200 bg-white"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="mx-auto grid max-w-7xl divide-y divide-stone-200 px-4 lg:grid-cols-3 lg:divide-x lg:divide-y-0 lg:px-8">
          {focusAreas.map(({ id, icon: Icon, title, text }) => (
            <motion.a
              key={id}
              href={`#${id}`}
              className="group flex items-start gap-4 px-4 py-6 transition-colors hover:bg-stone-50"
              variants={fadeUp}
            >
              <div className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-teal-50 transition-colors group-hover:bg-teal-100">
                <Icon className="text-teal-700" size={20} />
              </div>
              <div>
                <strong className="block font-bold text-zinc-900">{title}</strong>
                <span className="mt-0.5 block text-sm leading-6 text-stone-500">{text}</span>
              </div>
            </motion.a>
          ))}
        </div>
      </motion.section>

      {/* ── Buying options ── */}
      <section id="training" className="mx-auto max-w-7xl px-4 py-14 lg:px-8 lg:py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <SectionHeading
            eyebrow="Sports options"
            title="Built for movement"
            aside={`${categories.length} active categories`}
          />
        </motion.div>
        <motion.div
          className="grid gap-5 md:grid-cols-2 xl:grid-cols-4"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {buyingOptions.map(([Icon, title, text]) => (
            <motion.article
              key={title}
              className="lift-card rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
              variants={fadeUp}
            >
              <div className="mb-5 grid size-11 place-items-center rounded-xl bg-orange-50">
                <Icon className="text-orange-700" size={22} />
              </div>
              <h2
              className="font-display text-xl font-black leading-tight text-zinc-900"
                  >
                {title}
              </h2>
              <p className="mt-2.5 text-sm leading-6 text-stone-500">{text}</p>
            </motion.article>
          ))}
        </motion.div>
      </section>

      {/* ── Product rail ── */}
      <ProductRail
        id="teamwear"
        eyebrow="Collection"
        title="Sportswear catalog"
        products={products}
      />

      {/* ── Franchise packs ── */}
      <section
        id="franchise-packs"
        className="border-t border-white/10 bg-zinc-900 px-4 py-14 text-white lg:px-8 lg:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
          >
            <SectionHeading
              eyebrow="Partner channel"
              title="Franchise-ready sports packs"
              aside={`${plans.length} plans`}
            />
          </motion.div>
          <motion.div
            className="grid gap-6 lg:grid-cols-3"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {plans.map((plan) => (
              <motion.article
                className="lift-card flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/10 p-7"
                key={plan.id}
                variants={fadeUp}
              >
                <div className="flex items-start justify-between">
                  <Boxes className="float-icon text-orange-300" size={26} />
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold capitalize text-white/60">
                    {plan.type}
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-2xl font-black">
                    {plan.name}
                  </h3>
                  <strong className="mt-1 block text-3xl font-black text-teal-300">
                    {money.format(Number(plan.price))}
                  </strong>
                </div>
                <p className="text-sm font-semibold capitalize text-white/50">
                  {plan.type} sportswear channel
                </p>
                <Link
                  className="button-glow mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 text-sm font-bold text-white hover:bg-orange-800"
                  href="/franchise-apply"
                >
                  Start application
                  <ArrowRight size={15} />
                </Link>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>
    </AppLayout>
  );
}

function ProductRail({ id, eyebrow, title, products }) {
  return (
    <section id={id} className="border-t border-stone-200 bg-stone-50 px-4 py-14 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <SectionHeading eyebrow={eyebrow} title={title} aside={`${products.length} products`} />
        </motion.div>
        <motion.div
          className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.08 }}
        >
          {products.map((product) => {
            const img = imageFor(product) || PRODUCT_FALLBACK;
            const stock = stockFor(product);
            return (
              <motion.article
                key={product.id}
                className="lift-card overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
                variants={fadeUp}
              >
                <div className="image-zoom h-64 overflow-hidden bg-stone-100">
                  <img
                    className="h-full w-full object-cover"
                    src={img}
                    onError={(e) => {
                      e.target.src = PRODUCT_FALLBACK;
                      e.target.onerror = null;
                    }}
                    alt={product.name}
                    loading="lazy"
                  />
                </div>
                <div className="grid gap-2.5 p-5">
                  <span className="text-xs font-bold uppercase tracking-wide text-teal-700">
                    {product.category?.name || 'Sports wear'}
                  </span>
                  <h3 className="min-h-12 text-lg font-black leading-tight text-zinc-900">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="line-clamp-2 text-sm leading-6 text-stone-500">
                      {product.description}
                    </p>
                  )}
                  <strong className="text-xl font-black text-zinc-900">
                    {money.format(Number(product.base_price))}
                  </strong>
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-teal-700">
                    <BadgeCheck size={15} />
                    {stock > 0 ? `${stock} units available` : 'Out of stock'}
                  </span>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
