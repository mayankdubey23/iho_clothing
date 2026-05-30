import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, Copy, Tag } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';

export default function Offers({ offers = [], cms = {} }) {
    const [copiedCode, setCopiedCode] = useState(null);
    const activeOffers = Array.isArray(offers) ? offers : [];

    const copyCode = async (code) => {
        if (!code) return;

        await navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 1800);
    };

    return (
        <AppLayout>
            <Head title="Offers | IHO STUDIO" />

            <section className="border-b border-slate-100 bg-[#1E293B] text-white">
                <div className="mx-auto grid min-h-[360px] max-w-[1400px] items-end gap-8 px-4 pb-12 pt-24 md:px-8 lg:grid-cols-[1fr_360px]">
                    <div>
                        <div className="mb-5 inline-flex items-center gap-2 border border-white/15 px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-white/70">
                            <Tag size={14} /> Live Store Deals
                        </div>
                        <h1 className="max-w-4xl text-4xl font-black uppercase italic leading-none tracking-tight md:text-6xl">
                            {cms.home_offers_title || 'Current Offers'}
                        </h1>
                        <p className="mt-5 max-w-2xl text-sm font-bold uppercase tracking-widest text-slate-300">
                            {cms.home_offers_subtitle || 'Active coupons and storefront offers from Super Admin.'}
                        </p>
                    </div>

                    <div className="border border-white/10 bg-white/10 p-5 text-xs font-black uppercase tracking-[0.22em] text-white/80">
                        {cms.home_coupon_text || 'Apply eligible codes at checkout before payment.'}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-[1400px] px-4 py-12 md:px-8 md:py-16">
                {activeOffers.length > 0 ? (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {activeOffers.map((offer) => {
                            const code = offer.offer_code || offer.code;

                            return (
                                <article key={offer.id || offer.title} className="border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#1E293B]">
                                    <div className="mb-8 flex items-center justify-between">
                                        <span className="bg-[#E94E3C] px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-white">
                                            Offer
                                        </span>
                                        <Tag size={18} className="text-slate-300" />
                                    </div>

                                    <h2 className="min-h-16 text-xl font-black uppercase leading-tight tracking-tight text-[#1E293B]">
                                        {offer.title}
                                    </h2>

                                    {offer.subtitle && (
                                        <p className="mt-3 min-h-10 text-xs font-bold uppercase tracking-widest text-slate-500">
                                            {offer.subtitle}
                                        </p>
                                    )}

                                    {code ? (
                                        <div className="mt-8 flex items-stretch border border-dashed border-[#E94E3C]">
                                            <span className="flex min-w-0 flex-1 items-center px-4 text-xs font-black uppercase tracking-[0.24em] text-[#E94E3C]">
                                                {code}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => copyCode(code)}
                                                className="grid size-12 place-items-center bg-[#1E293B] text-white transition hover:bg-[#E94E3C]"
                                                title="Copy code"
                                            >
                                                {copiedCode === code ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                            </button>
                                        </div>
                                    ) : (
                                        <Link href="/shop" className="mt-8 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#E94E3C] hover:text-[#1E293B]">
                                            Shop offer <ArrowRight size={14} />
                                        </Link>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="border border-dashed border-slate-300 py-24 text-center">
                        <p className="text-sm font-black uppercase tracking-widest text-[#1E293B]">No active offers are published right now.</p>
                        <Link href="/shop" className="mt-5 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#E94E3C]">
                            Continue Shopping <ArrowRight size={14} />
                        </Link>
                    </div>
                )}
            </section>
        </AppLayout>
    );
}
