// resources/js/Components/HeroSection.jsx
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Link } from '@inertiajs/react';

const fallbackOffers = [
    'Free shipping on prepaid orders',
    'New season essentials live',
    'Fresh gym wear and running wear',
    'Franchise partner enquiries open',
];

export default function HeroSection({ offers = [], site = {} }) {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHoveringText, setIsHoveringText] = useState(false);

    // Track mouse movement for the custom cursor
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const offerRail = useMemo(() => {
        const offerTexts = (offers || [])
            .map((offer) => offer?.title || offer?.subtitle || offer?.code)
            .filter(Boolean);
        return [...(offerTexts.length ? offerTexts : fallbackOffers), ...(offerTexts.length ? offerTexts : fallbackOffers)];
    }, [offers]);

    // Admin Dynamic Data: Now looks for a video file, falls back to a high-end activewear video
    const bgVideo = site.hero_bg_video 
        ? `/storage/${site.hero_bg_video}` 
        : 'https://videos.pexels.com/video-files/3195394/3195394-uhd_3840_2160_25fps.mp4'; 
    const title1 = site.hero_title_1 || 'Defy';
    const title2 = site.hero_title_2 || 'Gravity';
    const ctaLink = site.hero_cta_link || '/shop?sort=newest';

    return (
        <section className="relative h-[100dvh] w-full overflow-hidden bg-black cursor-none">
            
            {/* 1. Cinematic Looping Video Background */}
            <div className="absolute inset-0 z-0 scale-105">
                <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="h-full w-full object-cover opacity-70"
                >
                    <source src={bgVideo} type="video/mp4" />
                </video>
                {/* CSS Film Grain Overlay for that raw, premium studio look */}
                <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
            </div>

            {/* 2. Custom Interactive Cursor (Desktop Only) */}
            <motion.div 
                className="pointer-events-none fixed top-0 left-0 z-50 flex items-center justify-center rounded-full mix-blend-difference hidden lg:flex"
                animate={{
                    x: mousePos.x - (isHoveringText ? 60 : 16),
                    y: mousePos.y - (isHoveringText ? 60 : 16),
                    height: isHoveringText ? 120 : 32,
                    width: isHoveringText ? 120 : 32,
                    backgroundColor: 'white',
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 28, mass: 0.5 }}
            >
                <motion.span 
                    animate={{ opacity: isHoveringText ? 1 : 0, scale: isHoveringText ? 1 : 0 }}
                    className="text-[10px] font-black uppercase tracking-widest text-black"
                >
                    Explore
                </motion.span>
            </motion.div>

            {/* 3. Blend-Mode Typography (Inverts the video colors behind it) */}
            <div className="relative z-10 flex h-full w-full flex-col items-center justify-center mix-blend-difference">
                <Link 
                    href={ctaLink}
                    onMouseEnter={() => setIsHoveringText(true)}
                    onMouseLeave={() => setIsHoveringText(false)}
                    className="group relative flex flex-col items-center text-center"
                >
                    <h1 className="text-[18vw] md:text-[15rem] font-black uppercase italic leading-[0.8] tracking-tighter text-white">
                        <motion.div 
                            initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {title1}
                        </motion.div>
                        <motion.div 
                            initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className="ml-12 md:ml-32"
                        >
                            {title2}
                        </motion.div>
                    </h1>
                </Link>
            </div>

            {/* 4. Marquee anchored to bottom */}
            <div className="absolute bottom-0 left-0 w-full h-12 border-t border-gray-800 bg-[#111] z-30 flex items-center">
                <div className="flex h-full w-max animate-thin-offer-marquee items-center gap-16">
                    {offerRail.map((item, index) => (
                        <div key={`${item}-${index}`} className="flex items-center gap-16">
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-300">
                                {item}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-gray-500" />
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes thin-offer-marquee {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
                .animate-thin-offer-marquee {
                    animation: thin-offer-marquee 30s linear infinite;
                }
            `}</style>
        </section>
    );
}