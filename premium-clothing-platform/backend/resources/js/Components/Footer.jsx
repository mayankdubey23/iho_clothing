import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, MapPin, Mail } from 'lucide-react';

// --- CUSTOM SOCIAL ICONS ---
const Facebook = ({ size = 18, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
);

const Instagram = ({ size = 18, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
);

const Twitter = ({ size = 18, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
);

const Youtube = ({ size = 18, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
);

export default function Footer() {
    const { site = {} } = usePage().props;
    const brandName = site.site_brand_name || 'IHO STUDIO';
    const supportEmail = site.support_email || 'support@ihostudio.com';

    const footerNav = [
        {
            title: 'Directory',
            links: [
                { name: 'Latest Drops', href: '/shop?sort=newest' },
                { name: 'Men\'s Performance', href: '/shop?gender=men' },
                { name: 'Women\'s Active', href: '/shop?gender=women' },
                { name: 'Gym Wear Core', href: '/shop?category=gym-wear' },
            ]
        },
        {
            title: 'Support',
            links: [
                { name: 'Track Order', href: '/account?tab=orders' },
                { name: 'Returns & Exchanges', href: '/returns' },
                { name: 'Shipping Information', href: '/shipping' },
                { name: 'Contact Concierge', href: '/support' },
            ]
        },
        {
            title: 'The Studio',
            links: [
                { name: 'Our Story', href: '/about' },
                { name: 'Franchise Partner', href: '/franchise-enquiry' },
                { name: 'Privacy Policy', href: '/privacy-policy' },
                { name: 'Terms of Service', href: '/terms' },
            ]
        }
    ];

    return (
        <footer className="bg-[#0a0a0a] text-white pt-16 pb-8 px-4 sm:px-8 lg:px-16 overflow-hidden relative border-t border-white/10">
            {/* Subtle background glow */}
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[#ff3f6c] rounded-full blur-[150px] opacity-10 pointer-events-none" />

            <div className="max-w-screen-2xl mx-auto relative z-10">
                
                {/* 1. Top Section: Newsletter & Contact */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 mb-10 border-b border-white/10 pb-12">
                    
                    {/* Newsletter (Spans 5 columns) */}
                    <div className="lg:col-span-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-[2px] w-6 bg-[#ff3f6c]" />
                            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-[#ff3f6c]">Join The Movement</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter mb-4 leading-none">
                            Unlock <br /> Exclusive Access
                        </h3>
                        <p className="text-[11px] md:text-xs font-semibold text-white/60 mb-6 max-w-sm leading-relaxed">
                            Sign up to receive early access to new drops, limited editions, and VIP events.
                        </p>
                        
                        <form className="relative group max-w-sm" onSubmit={(e) => e.preventDefault()}>
                            <input 
                                type="email" 
                                placeholder="ENTER YOUR EMAIL" 
                                className="w-full bg-white/5 border border-white/20 text-white px-5 py-3.5 text-[10px] md:text-xs font-black uppercase tracking-widest outline-none transition-all focus:border-[#ff3f6c] focus:bg-white/10 placeholder:text-white/30"
                            />
                            <button type="submit" className="absolute right-1.5 top-1.5 bottom-1.5 bg-white text-black px-4 flex items-center justify-center hover:bg-[#ff3f6c] hover:text-white transition-colors">
                                <ArrowRight size={16} strokeWidth={2.5} />
                            </button>
                        </form>
                    </div>

                    {/* Navigation Columns (Spans 7 columns) */}
                    <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
                        {footerNav.map((section, idx) => (
                            <div key={idx}>
                                <h4 className="text-[11px] md:text-xs font-black uppercase tracking-[0.2em] text-white mb-6">{section.title}</h4>
                                <ul className="space-y-3.5">
                                    {section.links.map((link, linkIdx) => (
                                        <li key={linkIdx}>
                                            <Link 
                                                href={link.href} 
                                                className="group flex items-center font-semibold text-white/60 hover:text-white transition-colors"
                                            >
                                                <span className="h-[1px] w-0 bg-[#ff3f6c] transition-all duration-300 group-hover:w-3 group-hover:mr-2" />
                                                <span className="uppercase tracking-widest text-[10px] md:text-[11px]">{link.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Middle Section: Socials & Contact */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                    <div className="flex items-center gap-3">
                        <a href="#" aria-label="Instagram" className="size-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-[#ff3f6c] hover:border-[#ff3f6c] transition-all duration-300">
                            <Instagram />
                        </a>
                        <a href="#" aria-label="Twitter" className="size-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-[#ff3f6c] hover:border-[#ff3f6c] transition-all duration-300">
                            <Twitter />
                        </a>
                        <a href="#" aria-label="YouTube" className="size-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-[#ff3f6c] hover:border-[#ff3f6c] transition-all duration-300">
                            <Youtube />
                        </a>
                        <a href="#" aria-label="Facebook" className="size-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-[#ff3f6c] hover:border-[#ff3f6c] transition-all duration-300">
                            <Facebook />
                        </a>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-center md:text-right">
                        <div className="flex items-center gap-2 justify-center md:justify-end text-white/60">
                            <Mail size={14} />
                            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest">{supportEmail}</span>
                        </div>
                        <div className="flex items-center gap-2 justify-center md:justify-end text-white/60">
                            <MapPin size={14} />
                            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest">Global Shipping Available</span>
                        </div>
                    </div>
                </div>

                {/* 3. Massive Brand Typography */}
                <div className="w-full overflow-hidden flex justify-center items-center py-2 select-none pointer-events-none">
                    <h2 
                        className="text-[11vw] font-black uppercase italic leading-[0.8] tracking-tighter text-transparent w-full text-center"
                        style={{ WebkitTextStroke: '1px rgba(255,255,255,0.1)' }}
                    >
                        {brandName}
                    </h2>
                </div>

                {/* 4. Copyright & Legal */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-white/10 text-white/40">
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                        &copy; {new Date().getFullYear()} {brandName}. All Rights Reserved.
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                        <span>Secure Checkout</span>
                        <div className="h-1 w-1 bg-white/20 rounded-full" />
                        <span>Fast Delivery</span>
                        <div className="h-1 w-1 bg-white/20 rounded-full" />
                        <span>Premium Quality</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}