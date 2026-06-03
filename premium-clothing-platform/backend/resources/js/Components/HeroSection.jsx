'use client';

import React, { useMemo } from 'react';

const fallbackOffers = [
    'Free shipping on prepaid orders',
    'New season essentials live',
    'Fresh gym wear and running wear',
    'Franchise partner enquiries open',
];

export default function HeroSection({ offers = [] }) {

    // Optimized: Memoize the array processing so it only recalculates if 'offers' prop changes
    const offerRail = useMemo(() => {
        const offerTexts = (offers || [])
            .map((offer) => offer?.title || offer?.subtitle || offer?.code)
            .filter(Boolean);

        return [...(offerTexts.length ? offerTexts : fallbackOffers), ...(offerTexts.length ? offerTexts : fallbackOffers)];
    }, [offers]);

    return (
        <section className="overflow-hidden bg-white">
            <div className="h-8 overflow-hidden border-b border-slate-200 bg-[#282c3f] text-white">
                <div className="flex h-full w-max animate-thin-offer-marquee items-center gap-10">
                    {offerRail.map((item, index) => (
                        <span key={`${item}-${index}`} className="text-[9px] font-black uppercase tracking-[0.28em] text-white/85">
                            {item}
                        </span>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes thin-offer-marquee {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
                .animate-thin-offer-marquee {
                    animation: thin-offer-marquee 22s linear infinite;
                }
            `}</style>
        </section>
    );
}