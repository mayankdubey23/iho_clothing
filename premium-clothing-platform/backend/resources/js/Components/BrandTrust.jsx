import React from 'react';
import { motion } from 'framer-motion';
import {
    Hexagon, Wind, RefreshCcw, Zap,
    ShieldCheck, Tag, Globe
} from 'lucide-react';

const features = [
    {
        title: "Aero-Titanium Fabric",
        desc: "Engineered micro-polyester blends that adapt to your body temperature.",
        icon: Hexagon,
        colSpan: "md:col-span-2 lg:col-span-2",
        bgImage: "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?q=80&w=800&auto=format&fit=crop", // Dark fabric texture
        isHero: true
    },
    {
        title: "Global Franchise Support",
        desc: "Backed by an elite B2B network ensuring priority availability.",
        icon: Globe,
        colSpan: "md:col-span-2 lg:col-span-1 lg:row-span-2",
        isDark: true
    },
    {
        title: "Sweat-Wicking Tech",
        desc: "Hydrophobic fibers keep you dry during peak performance.",
        icon: Wind,
        colSpan: "md:col-span-1 lg:col-span-1",
    },
    {
        title: "Lightning Delivery",
        desc: "Express logistics network for rapid fulfillment.",
        icon: Zap,
        colSpan: "md:col-span-1 lg:col-span-1",
    },
    {
        title: "No-Friction Returns",
        desc: "30-day seamless return policy. No questions asked.",
        icon: RefreshCcw,
        colSpan: "md:col-span-1 lg:col-span-1",
    },
    {
        title: "Direct-to-Studio Pricing",
        desc: "Luxury performance gear at accessible price points.",
        icon: Tag,
        colSpan: "md:col-span-1 lg:col-span-1",
    },
    {
        title: "Vault-Level Security",
        desc: "256-bit encrypted transactions for ultimate peace of mind.",
        icon: ShieldCheck,
        colSpan: "md:col-span-2 lg:col-span-1",
        isDark: true
    }
];

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 20 } }
};

export default function BrandTrust() {
    return (
        <section className="py-24 bg-[#0F172A] relative overflow-hidden">

            {/* ❄️ Subtle Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#1E293B] rounded-full blur-[120px] opacity-50 pointer-events-none" />

            <div className="max-w-[1400px] mx-auto px-6 relative z-10">

                {/* ❄️ Header */}
                <div className="mb-16">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-[1px] w-8 bg-slate-500" />
                        <span className="text-[10px] font-black tracking-[0.4em] uppercase text-slate-400">The Titanium Standard</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter italic max-w-3xl leading-none">
                        Engineered for <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-300 to-slate-600">Peak Performance.</span>
                    </h2>
                </div>

                {/* ❄️ The Bento Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-3 gap-4 md:gap-6"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className={`group relative overflow-hidden border border-white/10 p-8 flex flex-col justify-between transition-all duration-500 hover:border-white/30 ${feature.colSpan} ${feature.isDark ? 'bg-[#1E293B]' : 'bg-white/5 backdrop-blur-sm'}`}
                        >
                            {/* Hero Card Image Background */}
                            {feature.isHero && (
                                <>
                                    <div className="absolute inset-0 z-0">
                                        <img src={feature.bgImage} alt="Fabric" className="w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-[2s] ease-out mix-blend-overlay" />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent z-0" />
                                </>
                            )}

                            {/* Content */}
                            <div className="relative z-10">
                                <div className="mb-8">
                                    <div className="inline-flex size-12 items-center justify-center bg-white/10 rounded-none border border-white/20 text-white group-hover:bg-white group-hover:text-[#0F172A] transition-colors duration-500">
                                        <feature.icon size={20} strokeWidth={2} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className={`font-black uppercase tracking-tight text-white mb-2 ${feature.isHero || feature.isDark ? 'text-2xl md:text-3xl italic' : 'text-xl'}`}>
                                        {feature.title}
                                    </h3>
                                    <p className={`font-medium tracking-wide ${feature.isHero ? 'text-slate-300 max-w-sm' : 'text-slate-400 text-xs leading-relaxed'}`}>
                                        {feature.desc}
                                    </p>
                                </div>
                            </div>

                            {/* Subtle Hover Glow Effect */}
                            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 pointer-events-none" />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}