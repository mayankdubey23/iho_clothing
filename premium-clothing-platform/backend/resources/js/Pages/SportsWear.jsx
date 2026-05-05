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
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

export default function SportsWear({ products, categories, plans }) {
  const heroImage = imageFor(products?.[0]) || 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1400&q=80';

  return (
    <AppLayout active="sports">
      <motion.section
        className="relative flex min-h-[600px] items-end overflow-hidden bg-zinc-950 lg:min-h-[72vh]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <img className="hero-media absolute inset-0 h-full w-full object-cover" src={heroImage} alt="" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,9,11,.94),rgba(9,9,11,.66),rgba(9,9,11,.18))]" />
        <motion.div className="relative max-w-4xl px-4 pb-14 pt-28 text-white lg:px-16 lg:pb-18" variants={stagger} initial="hidden" animate="visible">
          <motion.p className="inline-flex items-center gap-2 text-xs font-black uppercase text-orange-200" variants={fadeUp}>
            <Flame size={16} />
            Sports wear collection
          </motion.p>
          <motion.h1 className="mt-3 text-6xl font-black leading-none tracking-normal sm:text-7xl lg:text-8xl" variants={fadeUp}>Sports Wear</motion.h1>
          <motion.p className="mt-6 max-w-2xl text-lg leading-8 text-white/80" variants={fadeUp}>
            Performance clothing for customers, teams, and IHO franchise partners, organized into clear product options for faster buying.
          </motion.p>
          <motion.div className="mt-8 flex flex-wrap gap-3" variants={fadeUp}>
            <a className="button-glow inline-flex min-h-12 items-center gap-2 bg-orange-700 px-5 font-black" href="#training">
              Explore options
              <ArrowRight size={18} />
            </a>
            <Link className="button-glow inline-flex min-h-12 items-center gap-2 border border-white/30 bg-white/15 px-5 font-black" href="/?category=premium-tshirts">
              Shop products
              <Shirt size={18} />
            </Link>
          </motion.div>
        </motion.div>
      </motion.section>

      <motion.section className="grid border-b border-stone-300 bg-stone-50 lg:grid-cols-3" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }}>
        {focusAreas.map(({ id, icon: Icon, title, text }) => (
          <motion.a key={id} href={`#${id}`} className="min-h-32 border-b border-stone-300 p-6 transition hover:bg-white lg:border-b-0 lg:border-r" variants={fadeUp}>
            <Icon className="float-icon text-teal-700" size={24} />
            <strong className="mt-3 block text-lg">{title}</strong>
            <span className="mt-1 block leading-6 text-zinc-500">{text}</span>
          </motion.a>
        ))}
      </motion.section>

      <section id="training" className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }} variants={fadeUp}>
          <SectionHeading eyebrow="Sports options" title="Built for movement" aside={`${categories.length} active categories`} />
        </motion.div>
        <motion.div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
          {buyingOptions.map(([Icon, title, text]) => (
            <motion.article key={title} className="lift-card border border-stone-300 bg-white p-6 shadow-sm" variants={fadeUp}>
              <Icon className="float-icon text-orange-700" size={24} />
              <h2 className="mt-5 text-2xl font-black leading-tight">{title}</h2>
              <p className="mt-3 leading-7 text-zinc-500">{text}</p>
            </motion.article>
          ))}
        </motion.div>
      </section>

      <ProductRail
        id="teamwear"
        eyebrow="Collection"
        title="Sportswear catalog"
        products={products}
      />

      <section id="franchise-packs" className="border-t border-stone-300 bg-zinc-900 px-4 py-12 text-white lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }} variants={fadeUp}>
            <SectionHeading eyebrow="Partner channel" title="Franchise-ready sports packs" aside={`${plans.length} plans`} />
          </motion.div>
          <motion.div className="grid gap-5 lg:grid-cols-3" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
            {plans.map((plan) => (
              <motion.article className="lift-card grid gap-5 border border-white/15 bg-white/10 p-6 shadow-sm" key={plan.id} variants={fadeUp}>
                <Boxes className="float-icon text-orange-200" size={24} />
                <h3 className="text-2xl font-black">{plan.name}</h3>
                <strong className="text-3xl">{money.format(Number(plan.price))}</strong>
                <p className="font-bold capitalize text-teal-200">{plan.type} sportswear channel</p>
                <Link className="button-glow inline-flex min-h-11 items-center justify-center gap-2 bg-orange-700 px-4 font-black text-white" href="/franchise-apply">
                  Start application
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

function ProductRail({ id, eyebrow, title, products }) {
  return (
    <section id={id} className="border-t border-stone-300 bg-stone-100 px-4 py-12 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }} variants={fadeUp}>
          <SectionHeading eyebrow={eyebrow} title={title} aside={`${products.length} products`} />
        </motion.div>
        <motion.div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.12 }}>
          {products.map((product) => (
            <motion.article key={product.id} className="lift-card overflow-hidden border border-stone-300 bg-white shadow-sm" variants={fadeUp}>
              <div className="image-zoom h-64 bg-stone-200">
                {imageFor(product) && <img className="h-full w-full object-cover" src={imageFor(product)} alt={product.name} />}
              </div>
              <div className="grid gap-3 p-5">
                <span className="text-xs font-black uppercase text-teal-700">{product.category?.name || 'Sports wear'}</span>
                <h3 className="min-h-14 text-xl font-black leading-tight">{product.name}</h3>
                <p className="line-clamp-3 text-sm leading-6 text-zinc-500">{product.description}</p>
                <strong className="text-xl">{money.format(Number(product.base_price))}</strong>
                <span className="flex items-center gap-2 text-sm font-bold text-teal-700">
                  <BadgeCheck size={16} />
                  {stockFor(product)} units available
                </span>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
