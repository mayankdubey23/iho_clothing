import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, Dumbbell, Gauge, Heart, ShoppingBag, Timer, Zap } from 'lucide-react';
import PremiumProductCard from '@/Components/PremiumProductCard';

const categoryImages = [
    'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1591115765373-5207764f72e7?q=80&w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=900&auto=format&fit=crop',
];

export default function Men({ categories = [], featuredProducts = [], offer = null, cms = {} }) {
    const products = Array.isArray(featuredProducts) ? featuredProducts : featuredProducts?.data || [];
    const title = cms.men_hero_title || 'Men Sportswear Collection';
    const subtitle = cms.men_hero_subtitle || 'Performance wear built for gym, running, training, and everyday comfort.';
    const heroImage = cms.men_hero_bg_image ? `/storage/${cms.men_hero_bg_image}` : 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2200&auto=format&fit=crop';
    const offerText = offer?.title || cms.men_offer_text || 'Flat 30% Off On Men Sportswear';

    return (
        <AppLayout>
            <Head title={`${title} | IHO STUDIO`} />

            <section className="relative min-h-[calc(100vh-6rem)] overflow-hidden bg-[#0F172A] text-white">
                <img src={heroImage} alt="Men sportswear" className="absolute inset-0 h-full w-full object-cover opacity-40 grayscale-[20%]" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/78 to-transparent" />
                <div className="relative z-10 mx-auto grid min-h-[calc(100vh-6rem)] max-w-[1400px] grid-cols-1 items-center px-6 py-20 lg:grid-cols-12">
                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="lg:col-span-7"
                    >
                        <div className="mb-5 flex items-center gap-3">
                            <span className="grid size-11 place-items-center border border-white/20 bg-white text-[#0F172A]"><Dumbbell size={19} /></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">IHO Performance</span>
                        </div>
                        <h1 className="max-w-4xl text-5xl font-black uppercase italic tracking-tight sm:text-6xl lg:text-7xl">{title}</h1>
                        <p className="mt-6 max-w-2xl text-sm font-bold uppercase leading-7 tracking-[0.16em] text-slate-300">{subtitle}</p>
                        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                            <Link href="/shop?gender=men" className="group inline-flex items-center justify-center gap-3 bg-white px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-[#0F172A] transition-colors hover:bg-[#E94E3C] hover:text-white">
                                Shop Men Collection <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </motion.div>

                    <div className="mt-14 grid gap-3 sm:grid-cols-3 lg:col-span-5 lg:mt-0">
                        <HeroMetric icon={Zap} label="Quick Dry" />
                        <HeroMetric icon={Gauge} label="Training Fit" />
                        <HeroMetric icon={Timer} label="All Day Comfort" />
                    </div>
                </div>
            </section>

            <section className="bg-white py-20">
                <div className="mx-auto max-w-[1400px] px-6">
                    <SectionHeader eyebrow="Men Categories" title="Choose Your Arena" />
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {categories.map((category, index) => (
                            <motion.div
                                key={category.slug}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.04 }}
                            >
                                <Link href={category.href} className="group block overflow-hidden border border-slate-200 bg-slate-50">
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        <img src={categoryImages[index % categoryImages.length]} alt={category.name} className="h-full w-full object-cover grayscale-[35%] transition duration-700 group-hover:scale-105 group-hover:grayscale-0" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                                        <h3 className="absolute bottom-4 left-4 right-4 text-lg font-black uppercase italic tracking-tight text-white">{category.name}</h3>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-[#F8FAFC] py-20">
                <div className="mx-auto max-w-[1400px] px-6">
                    <div className="mb-10 flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 md:flex-row md:items-end">
                        <SectionHeader eyebrow="Featured Gear" title="Men Performance Picks" />
                        <Link href="/shop?gender=men" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#1E293B] hover:text-[#E94E3C]">
                            View All Men Products <ArrowRight size={14} />
                        </Link>
                    </div>

                    {products.length > 0 ? (
                        <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
                            {products.map((product, index) => <PremiumProductCard key={product.id} product={product} index={index} />)}
                        </div>
                    ) : (
                        <div className="border border-dashed border-slate-300 bg-white py-20 text-center">
                            <ShoppingBag size={38} className="mx-auto mb-4 text-slate-300" />
                            <p className="text-lg font-black uppercase italic tracking-tight text-[#1E293B]">No active men products yet</p>
                            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">Add active men products from Super Admin products.</p>
                        </div>
                    )}
                </div>
            </section>

            {(offer || cms.men_offer_text) && (
                <section className="bg-white py-16">
                    <div className="mx-auto max-w-[1400px] px-6">
                        <Link href="/shop?gender=men&offer=active" className="group flex flex-col justify-between gap-8 bg-[#1E293B] p-8 text-white transition-colors hover:bg-black md:flex-row md:items-center md:p-12">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-300">Limited Men Drop</p>
                                <h2 className="mt-3 text-3xl font-black uppercase italic tracking-tight md:text-5xl">{offerText}</h2>
                            </div>
                            <span className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.28em]">
                                Shop Offer <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                            </span>
                        </Link>
                    </div>
                </section>
            )}
        </AppLayout>
    );
}

function HeroMetric({ icon: Icon, label }) {
    return (
        <div className="border border-white/15 bg-white/10 p-5 backdrop-blur">
            <Icon size={22} className="mb-5 text-[#E94E3C]" />
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white">{label}</p>
        </div>
    );
}

function SectionHeader({ eyebrow, title }) {
    return (
        <div>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-[#E94E3C]">{eyebrow}</p>
            <h2 className="text-4xl font-black uppercase italic tracking-tight text-[#1E293B]">{title}</h2>
        </div>
    );
}
