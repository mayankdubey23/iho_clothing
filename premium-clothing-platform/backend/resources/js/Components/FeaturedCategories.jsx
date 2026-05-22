import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';

export default function FeaturedCategories({ categories = [] }) {
    const [failedImages, setFailedImages] = useState({});
    const displayCategories = categories.filter((category) => category?.name && category?.slug);

    if (displayCategories.length === 0) {
        return null;
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 40 },
        show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
    };

    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div
                className="absolute inset-0 z-[0] pointer-events-none opacity-[0.02]"
                style={{
                    backgroundImage: `linear-gradient(#1E293B 1px, transparent 1px), linear-gradient(90deg, #1E293B 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                }}
            />

            <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div>
                        <div className="flex items-center gap-4 mb-3">
                            <div className="h-[1px] w-8 bg-slate-300" />
                            <span className="text-[10px] font-black tracking-[0.4em] uppercase text-[#94A3B8]">Browse By Discipline</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-[#1E293B] uppercase tracking-tighter italic leading-none">
                            The Collections
                        </h2>
                    </div>

                    <Link href="/shop" className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#1E293B] hover:text-slate-400 transition-colors pb-1 border-b border-[#1E293B] hover:border-slate-400">
                        View Complete Catalog <ArrowUpRight size={14} strokeWidth={2.5} />
                    </Link>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-100px' }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
                >
                    {displayCategories.map((cat, index) => {
                        const isFeatured = index === 0 || index === 1;
                        const imageSrc = cat.image || cat.image_url || (cat.image_path ? `/storage/${cat.image_path}` : null);
                        const imageKey = cat.id || cat.slug;
                        const imageFailed = failedImages[imageKey];

                        return (
                            <motion.div
                                variants={item}
                                key={imageKey}
                                className={`group relative bg-slate-50 overflow-hidden cursor-pointer ${isFeatured ? 'lg:col-span-2 aspect-[4/3] lg:aspect-[16/9]' : 'col-span-1 aspect-[3/4]'}`}
                            >
                                <Link href={`/category/${cat.slug}`} className="absolute inset-0 z-20" />

                                {imageSrc && !imageFailed ? (
                                    <img
                                        src={imageSrc}
                                        alt={cat.name}
                                        onError={() => setFailedImages((current) => ({ ...current, [imageKey]: true }))}
                                        className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-[1.5s] ease-out scale-105 group-hover:scale-100"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-slate-100 px-6 text-center">
                                        <span className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                                            {cat.name}
                                        </span>
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-[#0F172A]/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

                                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 flex items-end justify-between z-10 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                                    <div>
                                        <p className="text-[9px] font-black tracking-[0.3em] uppercase text-slate-300 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                            Explore Collection
                                        </p>
                                        <h3 className={`font-black text-white uppercase tracking-tight italic leading-none ${isFeatured ? 'text-3xl md:text-5xl' : 'text-2xl md:text-3xl'}`}>
                                            {cat.name}
                                        </h3>
                                    </div>
                                    <div className="size-10 rounded-none bg-white flex items-center justify-center text-[#1E293B] opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 shadow-xl">
                                        <ArrowUpRight size={18} strokeWidth={2.5} />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                <div className="mt-10 flex justify-center md:hidden">
                    <Link href="/shop" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#1E293B] border border-[#1E293B] px-8 py-4 w-full justify-center">
                        View Complete Catalog <ArrowUpRight size={14} strokeWidth={2} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
