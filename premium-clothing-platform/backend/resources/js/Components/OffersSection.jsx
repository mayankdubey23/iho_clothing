import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { Tag, ArrowRight, Copy, CheckCircle2 } from 'lucide-react';

export default function OffersSection({ offers = [] }) {
    const [copiedCode, setCopiedCode] = React.useState(null);

    // Filter offers based on display_type
    const heroOffer = offers.find(o => o.display_type === 'hero_banner') || {
        title: 'Limited Time Deal', subtitle: 'Up to 40% Off on Performance Gear', bg_image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200&auto=format&fit=crop'
    };

    const sideOffers = offers.filter(o => o.display_type === 'side_banner');
    const tickerOffers = offers.filter(o => o.display_type === 'ticker');

    // Default side offers agar DB khali ho
    const displaySideOffers = sideOffers.length > 0 ? sideOffers.slice(0, 3) : [
        { id: 1, title: 'Buy 2 Get 1 Free', subtitle: 'On all Training Bottoms', offer_code: 'B2G1FREE' },
        { id: 2, title: 'Flat 30% Off', subtitle: 'Clearance Sale', offer_code: 'FLAT30' },
        { id: 3, title: 'New User Discount', subtitle: '15% off your first order', offer_code: 'STUDIO15' },
    ];

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <section className="bg-white py-16 border-t border-slate-100 overflow-hidden">

            {/* ❄️ Scrolling Ticker (For Free Delivery etc.) */}
            {tickerOffers.length > 0 && (
                <div className="bg-[#1E293B] text-white py-3 mb-10 overflow-hidden flex whitespace-nowrap">
                    <motion.div
                        initial={{ x: 0 }}
                        animate={{ x: "-50%" }}
                        transition={{ ease: "linear", duration: 15, repeat: Infinity }}
                        className="flex gap-16 px-8 items-center"
                    >
                        {[...tickerOffers, ...tickerOffers, ...tickerOffers, ...tickerOffers].map((offer, i) => (
                            <span key={i} className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                <span className="size-1.5 bg-red-500 rounded-full animate-pulse" />
                                {offer.title}: <span className="font-medium text-slate-300">{offer.subtitle}</span>
                            </span>
                        ))}
                    </motion.div>
                </div>
            )}

            <div className="max-w-[1400px] mx-auto px-6">
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-[1px] w-8 bg-[#1E293B]" />
                    <span className="text-[10px] font-black tracking-[0.4em] uppercase text-[#1E293B] flex items-center gap-2">
                        <Tag size={12} /> Studio Privileges
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">

                    {/* ❄️ Main Hero Offer (Left Side - Big Block) */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                        className="lg:col-span-7 relative bg-slate-900 aspect-square md:aspect-[16/9] lg:aspect-auto min-h-[400px] flex flex-col justify-end p-8 md:p-12 overflow-hidden group rounded-none"
                    >
                        <div className="absolute inset-0">
                            <img src={heroOffer.bg_image || 'https://images.unsplash.com/photo-1571019614242-c3c032cd4464?q=80&w=1200&auto=format&fit=crop'} alt="Offer" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[2s] ease-out" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                        </div>
                        <div className="relative z-10">
                            <span className="bg-white text-black text-[9px] font-black uppercase tracking-widest px-3 py-1.5 mb-4 inline-block">Exclusive</span>
                            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic leading-none mb-3">
                                {heroOffer.title}
                            </h2>
                            <p className="text-slate-300 text-sm font-bold uppercase tracking-widest max-w-md mb-8">
                                {heroOffer.subtitle}
                            </p>
                            <Link href="/shop?sale=true" className="inline-flex items-center gap-3 bg-[#E94E3C] text-white px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all">
                                Access Sale <ArrowRight size={14} strokeWidth={3} />
                            </Link>
                        </div>
                    </motion.div>

                    {/* ❄️ Stacked Side Offers (Right Side) */}
                    <div className="lg:col-span-5 flex flex-col gap-4 md:gap-6">
                        {displaySideOffers.map((offer, index) => (
                            <motion.div
                                key={offer.id || index}
                                initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}
                                className="flex-1 bg-slate-50 border border-slate-100 p-6 md:p-8 flex flex-col justify-center relative group hover:border-[#1E293B] transition-colors"
                            >
                                <h3 className="text-2xl font-black text-[#1E293B] uppercase tracking-tight italic mb-2">
                                    {offer.title}
                                </h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">
                                    {offer.subtitle}
                                </p>

                                {offer.offer_code ? (
                                    <div className="flex items-center justify-between bg-white border border-slate-200 p-1">
                                        <span className="pl-4 text-xs font-black tracking-[0.3em] text-[#1E293B]">{offer.offer_code}</span>
                                        <button
                                            onClick={() => copyCode(offer.offer_code)}
                                            className="bg-[#1E293B] text-white px-4 py-3 hover:bg-[#E94E3C] transition-colors flex items-center gap-2"
                                        >
                                            {copiedCode === offer.offer_code ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                ) : (
                                    <Link href="/shop" className="text-[10px] font-black uppercase tracking-widest text-[#1E293B] hover:text-[#E94E3C] inline-flex items-center gap-1 border-b border-[#1E293B] hover:border-[#E94E3C] w-fit pb-0.5">
                                        Shop Now <ArrowRight size={12} />
                                    </Link>
                                )}
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}