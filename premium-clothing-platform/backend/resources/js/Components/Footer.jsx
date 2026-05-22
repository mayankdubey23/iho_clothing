// resources/js/Components/Footer.jsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight, Globe, ShieldCheck, Truck, Zap } from 'lucide-react';
import { FaInstagram, FaTwitter, FaFacebookF, FaYoutube } from 'react-icons/fa';

export default function Footer() {
    return (
        <footer className="bg-[#0F172A] text-white pt-24 pb-12 overflow-hidden relative">
            {/* ❄️ Subtle Background Titanium Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-slate-800/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">

                {/* 🚀 TOP SECTION: BRAND & NEWSLETTER */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
                    <div className="lg:col-span-5 space-y-8">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="size-10 bg-white text-[#0F172A] grid place-items-center font-black text-xs tracking-widest">IHO</div>
                            <span className="text-2xl font-black tracking-tighter uppercase italic">
                                IHO<span className="text-[#94A3B8] font-light">STUDIO</span>
                            </span>
                        </Link>
                        <p className="text-[#94A3B8] text-sm font-medium leading-relaxed max-w-sm">
                            Redefining performance through minimalist design. The Titanium Frost collection is engineered for the elite athlete who moves in silence.
                        </p>

                        <div className="pt-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-6">Join the Inner Circle</h3>
                            <div className="flex items-center border-b border-slate-700 pb-3 group focus-within:border-white transition-all max-w-md">
                                <input
                                    type="email"
                                    placeholder="Enter your email for early access"
                                    className="bg-transparent border-none outline-none text-xs w-full px-0 focus:ring-0 placeholder:text-slate-600 font-bold uppercase tracking-widest"
                                />
                                <button className="ml-4 text-slate-500 hover:text-white transition-colors">
                                    <ArrowRight size={20} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 🚀 QUICK LINKS GRID */}
                    <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-12">
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#94A3B8] mb-8">Shop</h4>
                            <ul className="flex flex-col gap-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                <li><Link href="/shop" className="hover:text-white transition-colors">All Products</Link></li>
                                <li><Link href="/sports-wear" className="hover:text-white transition-colors">Sports Wear</Link></li>
                                <li><Link href="/sports-wear" className="hover:text-white transition-colors">Lifestyle</Link></li>
                                <li><Link href="/shop?sort=newest" className="hover:text-white transition-colors italic text-white">New Drops</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#94A3B8] mb-8">Support</h4>
                            <ul className="flex flex-col gap-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                <li><Link href="/account" className="hover:text-white transition-colors">Order Tracking</Link></li>
                                <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping Policy</Link></li>
                                <li><Link href="/faq" className="hover:text-white transition-colors">Help Center</Link></li>
                                <li><Link href="/cart" className="hover:text-white transition-colors">Cart</Link></li>
                            </ul>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#94A3B8] mb-8">Company</h4>
                            <ul className="flex flex-col gap-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                <li><Link href="/about" className="hover:text-white transition-colors">Our Story</Link></li>
                                <li><Link href="/franchise-apply" className="hover:text-white transition-colors">Franchise Program</Link></li>
                                <li><Link href="/shop" className="hover:text-white transition-colors">Shop Collection</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 🚀 TRUST BADGES SECTION */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-t border-b border-slate-800/50 mb-12">
                    <FooterBadge icon={Truck} title="Global Shipping" desc="Elite delivery network" />
                    <FooterBadge icon={ShieldCheck} title="Secure Payments" desc="SSL Encrypted transactions" />
                    <FooterBadge icon={Zap} title="Quick Dispatch" desc="Ships within 24 hours" />
                    <FooterBadge icon={Globe} title="Boutique Quality" desc="Curated premium fabrics" />
                </div>

                {/* 🚀 BOTTOM BAR: SOCIALS & LEGAL */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                            &copy; {new Date().getFullYear()} IHO STUDIO. ALL RIGHTS RESERVED.
                        </p>
                        <div className="flex gap-6 text-slate-500">
                            <Link href="/about" className="text-[9px] font-bold uppercase tracking-widest hover:text-white transition-colors">About</Link>
                            <Link href="/shipping" className="text-[9px] font-bold uppercase tracking-widest hover:text-white transition-colors">Shipping</Link>
                            <Link href="/faq" className="text-[9px] font-bold uppercase tracking-widest hover:text-white transition-colors">FAQ</Link>
                        </div>
                    </div>

                    {/* Socials & Payments */}
                    <div className="flex flex-col items-center md:items-end gap-6">
                        <div className="flex gap-8">
                            <a href="#" className="text-slate-400 hover:text-white transition-all hover:-translate-y-1"><FaInstagram size={18} /></a>
                            <a href="#" className="text-slate-400 hover:text-white transition-all hover:-translate-y-1"><FaTwitter size={18} /></a>
                            <a href="#" className="text-slate-400 hover:text-white transition-all hover:-translate-y-1"><FaYoutube size={18} /></a>
                            <a href="#" className="text-slate-400 hover:text-white transition-all hover:-translate-y-1"><FaFacebookF size={18} /></a>
                        </div>
                        {/* Payment Icons Placeholder */}
                        <div className="flex gap-3 opacity-30 grayscale hover:grayscale-0 transition-all cursor-default">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-3" alt="Visa" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-5" alt="Mastercard" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" className="h-3" alt="UPI" />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

// 💎 Reusable Badge Component
function FooterBadge({ icon: Icon, title, desc }) {
    return (
        <div className="flex items-center gap-4 group">
            <div className="size-10 rounded-full border border-slate-800 flex items-center justify-center text-slate-500 group-hover:border-white group-hover:text-white transition-all duration-500">
                <Icon size={18} strokeWidth={1.5} />
            </div>
            <div>
                <h5 className="text-[10px] font-black uppercase tracking-widest text-white">{title}</h5>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{desc}</p>
            </div>
        </div>
    );
}
