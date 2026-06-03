import React from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, BadgeIndianRupee, MapPinned, PackageCheck, Store, TrendingUp } from 'lucide-react';

const stats = [
    { label: 'Launch Support', value: '360°', icon: PackageCheck },
    { label: 'Territory Model', value: 'Local', icon: MapPinned },
    { label: 'B2B Pricing', value: 'Partner', icon: BadgeIndianRupee },
];

const nodes = [
    'left-[8%] top-[22%]',
    'left-[23%] top-[64%]',
    'left-[42%] top-[34%]',
    'left-[61%] top-[70%]',
    'left-[78%] top-[28%]',
    'left-[90%] top-[58%]',
];

export default function FranchiseEnquiryBanner() {
    return (
        <section className="relative overflow-hidden bg-[#f5f5f6] border-t border-slate-200">
            <div className="max-w-[1400px] mx-auto px-6 py-20 lg:py-24">
                <div className="relative overflow-hidden bg-[#282c3f] text-white min-h-[460px]">
                    <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(90deg,#ffffff_1px,transparent_1px),linear-gradient(180deg,#ffffff_1px,transparent_1px)] bg-[size:48px_48px]" />

                    <motion.div
                        aria-hidden="true"
                        className="absolute inset-x-8 top-16 bottom-16 hidden lg:block"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 320" preserveAspectRatio="none">
                            <motion.path
                                d="M50 78 C180 260 270 250 405 120 C540 -10 620 292 760 102 C850 -20 905 170 960 150"
                                fill="none"
                                stroke="rgba(255,255,255,0.22)"
                                strokeWidth="2"
                                strokeDasharray="8 12"
                                initial={{ pathLength: 0 }}
                                whileInView={{ pathLength: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.4, ease: 'easeOut' }}
                            />
                        </svg>
                        {nodes.map((position, index) => (
                            <motion.span
                                key={position}
                                className={`absolute ${position} grid size-3 place-items-center bg-white`}
                                initial={{ scale: 0, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.25 + index * 0.1, duration: 0.4 }}
                            >
                                <span className="absolute size-8 border border-white/25" />
                            </motion.span>
                        ))}
                    </motion.div>

                    <div className="relative z-10 grid min-h-[460px] grid-cols-1 lg:grid-cols-12">
                        <div className="lg:col-span-7 flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-14">
                            <motion.div
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-80px' }}
                                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="grid size-10 place-items-center border border-white/20 bg-white text-[#282c3f]">
                                        <Store size={18} strokeWidth={2.4} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-300">Franchise Enquiry</span>
                                </div>

                                <h2 className="max-w-3xl text-4xl font-black uppercase italic tracking-tight sm:text-5xl lg:text-6xl">
                                    Build the next IHO performance hub.
                                </h2>
                                <p className="mt-6 max-w-2xl text-sm font-medium leading-7 text-slate-300 sm:text-base">
                                    Partner with a premium activewear platform built for local fulfilment, curated inventory, and repeat community demand.
                                </p>

                                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                    <Link
                                        href="/franchise-enquiry"
                                        className="group inline-flex items-center justify-center gap-3 bg-white px-7 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-[#282c3f] transition-colors hover:bg-[#ff3f6c] hover:text-white"
                                    >
                                        Start Enquiry <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </div>
                            </motion.div>
                        </div>

                        <div className="lg:col-span-5 border-t border-white/10 lg:border-l lg:border-t-0">
                            <div className="grid h-full grid-cols-1">
                                <motion.div
                                    className="flex items-center justify-between gap-6 border-b border-white/10 px-6 py-8 sm:px-10 lg:px-12"
                                    initial={{ opacity: 0, x: 28 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.1 }}
                                >
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Network Signal</p>
                                        <h3 className="mt-3 text-3xl font-black uppercase italic tracking-tight">Own Your Zone</h3>
                                    </div>
                                    <TrendingUp className="text-[#ff3f6c]" size={34} strokeWidth={2.2} />
                                </motion.div>

                                {stats.map((item, index) => {
                                    const Icon = item.icon;
                                    return (
                                        <motion.div
                                            key={item.label}
                                            className="flex items-center justify-between gap-5 border-b border-white/10 px-6 py-7 last:border-b-0 sm:px-10 lg:px-12"
                                            initial={{ opacity: 0, x: 28 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.6, delay: 0.18 + index * 0.08 }}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="grid size-11 place-items-center border border-white/15 text-slate-300">
                                                    <Icon size={18} />
                                                </div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">{item.label}</p>
                                            </div>
                                            <strong className="text-xl font-black uppercase tracking-tight">{item.value}</strong>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
