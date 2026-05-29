import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, CreditCard, Headphones, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { FaInstagram, FaTwitter, FaFacebookF, FaYoutube } from 'react-icons/fa';

const defaultLinkGroups = [
    { title: 'Shop', links: [
        { label: 'All Products', href: '/shop' },
        { label: 'Men', href: '/shop?gender=men' },
        { label: 'Women', href: '/shop?gender=women' },
        { label: 'Gym Wear', href: '/shop?category=gym-wear' },
        { label: 'New Drops', href: '/shop?sort=newest', highlight: true },
    ] },
    { title: 'Support', links: [
        { label: 'Order Tracking', href: '/account?tab=orders' },
        { label: 'Shipping Policy', href: '/shipping' },
        { label: 'Returns & Refunds', href: '/returns' },
        { label: 'Help Center', href: '/support' },
        { label: 'Contact Support', href: '/support' },
    ] },
    { title: 'Company', links: [
        { label: 'Our Story', href: '/about' },
        { label: 'Franchise Program', href: '/franchise-apply' },
        { label: 'Privacy Policy', href: '/privacy-policy' },
        { label: 'Terms & Conditions', href: '/terms' },
        { label: 'Cancellation', href: '/cancellation' },
    ] },
];

const defaultTrustBadges = [
    { icon: 'truck', title: 'Fast Shipping', desc: 'Quick dispatch network' },
    { icon: 'shield', title: 'Secure Payments', desc: 'UPI, cards and wallets' },
    { icon: 'returns', title: 'Easy Returns', desc: 'Simple exchange support' },
    { icon: 'support', title: 'Customer Support', desc: 'Help for every order' },
];

const defaultSocialLinks = [
    { icon: 'instagram', label: 'Instagram', href: '#' },
    { icon: 'twitter', label: 'Twitter', href: '#' },
    { icon: 'youtube', label: 'YouTube', href: '#' },
    { icon: 'facebook', label: 'Facebook', href: '#' },
];

const defaultBottomLinks = [
    { label: 'About', href: '/about' },
    { label: 'Shipping', href: '/shipping' },
    { label: 'Returns', href: '/returns' },
    { label: 'Privacy', href: '/privacy-policy' },
    { label: 'Terms', href: '/terms' },
];

const badgeIconMap = {
    truck: Truck,
    shield: ShieldCheck,
    returns: RotateCcw,
    support: Headphones,
};

const socialIconMap = {
    instagram: FaInstagram,
    twitter: FaTwitter,
    youtube: FaYoutube,
    facebook: FaFacebookF,
};

export default function Footer() {
    const { site = {} } = usePage().props;
    const logoUrl = site.site_logo ? `/storage/${site.site_logo}` : null;
    const logoMark = site.site_logo_mark || 'IHO';
    const brandName = site.site_brand_name || 'IHO STUDIO';
    const aboutText = site.footer_about_text || 'IHO Studio brings activewear, streetwear, and daily essentials into one clean fashion storefront with fresh drops, secure checkout, and quick dispatch.';
    const linkGroups = parseJsonList(site.footer_link_groups_json, defaultLinkGroups);
    const trustBadges = parseJsonList(site.footer_trust_badges_json, defaultTrustBadges);
    const socialLinks = parseJsonList(site.footer_social_links_json, defaultSocialLinks);
    const paymentMethods = parseJsonList(site.footer_payment_methods_json, ['VISA', 'MASTER', 'UPI', 'COD']);
    const bottomLinks = parseJsonList(site.footer_bottom_links_json, defaultBottomLinks);
    const copyright = site.footer_copyright || `Copyright ${new Date().getFullYear()} ${brandName}. ALL RIGHTS RESERVED.`;

    return (
        <footer className="relative overflow-hidden bg-[#282c3f] pb-10 pt-20 text-white">
            <div className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/2 rounded-full bg-slate-800/20 blur-[120px]" />

            <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mb-20 grid grid-cols-1 gap-16 lg:grid-cols-12">
                    <div className="space-y-8 lg:col-span-5">
                        <Link href="/" className="group flex items-center gap-3">
                            <div className="grid size-10 place-items-center overflow-hidden bg-white text-xs font-black tracking-widest text-[#0F172A]">
                                {logoUrl ? <img src={logoUrl} alt={brandName} className="h-full w-full object-contain p-1" /> : logoMark}
                            </div>
                            <span className="text-2xl font-black uppercase italic tracking-tighter">{brandName}</span>
                        </Link>
                        <p className="max-w-sm text-sm font-medium leading-relaxed text-[#c9ccd8]">{aboutText}</p>

                        <div className="pt-4">
                            <h3 className="mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-white">
                                {site.footer_newsletter_title || 'Get Style Updates'}
                            </h3>
                            <div className="group flex max-w-md items-center border-b border-slate-700 pb-3 transition-all focus-within:border-white">
                                <input
                                    type="email"
                                    placeholder={site.footer_newsletter_placeholder || 'Enter your email for early access'}
                                    className="w-full border-none bg-transparent px-0 text-xs font-bold uppercase tracking-widest outline-none placeholder:text-slate-600 focus:ring-0"
                                />
                                <button className="ml-4 text-slate-500 transition-colors hover:text-white" type="button">
                                    <ArrowRight size={20} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-12 sm:grid-cols-3 lg:col-span-7">
                        {linkGroups.map((group, index) => (
                            <div key={`${group.title}-${index}`} className={index === 2 ? 'col-span-2 sm:col-span-1' : ''}>
                                <h4 className="mb-8 text-[10px] font-black uppercase tracking-[0.3em] text-[#94A3B8]">{group.title}</h4>
                                <ul className="flex flex-col gap-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                    {(group.links || []).map((link) => (
                                        <li key={`${group.title}-${link.href}-${link.label}`}>
                                            <Link href={link.href || '/'} className={`transition-colors hover:text-white ${link.highlight ? 'italic text-white' : ''}`}>
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-12 grid grid-cols-2 gap-8 border-y border-slate-800/50 py-12 md:grid-cols-4">
                    {trustBadges.map((badge, index) => (
                        <FooterBadge
                            key={`${badge.title}-${index}`}
                            icon={badgeIconMap[badge.icon] || Truck}
                            title={badge.title}
                            desc={badge.desc}
                        />
                    ))}
                </div>

                <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
                    <div className="flex flex-col items-center gap-4 md:items-start">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">{copyright}</p>
                        <div className="flex flex-wrap justify-center gap-6 text-slate-500">
                            {bottomLinks.map((link) => (
                                <Link key={`${link.href}-${link.label}`} href={link.href || '/'} className="text-[9px] font-bold uppercase tracking-widest transition-colors hover:text-white">
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-6 md:items-end">
                        <div className="flex gap-8">
                            {socialLinks.map((social) => {
                                const Icon = socialIconMap[social.icon] || FaInstagram;

                                return (
                                    <a key={`${social.icon}-${social.href}`} href={social.href || '#'} className="text-slate-400 transition-all hover:-translate-y-1 hover:text-white" aria-label={social.label || social.icon}>
                                        <Icon size={18} />
                                    </a>
                                );
                            })}
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 md:justify-end">
                            {paymentMethods.map((method) => (
                                <span key={method} className="inline-flex items-center gap-1 border border-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                    <CreditCard size={12} />
                                    {method}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterBadge({ icon: Icon, title, desc }) {
    return (
        <div className="group flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-full border border-slate-800 text-slate-500 transition-all duration-500 group-hover:border-white group-hover:text-white">
                <Icon size={18} strokeWidth={1.5} />
            </div>
            <div>
                <h5 className="text-[10px] font-black uppercase tracking-widest text-white">{title}</h5>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{desc}</p>
            </div>
        </div>
    );
}

function parseJsonList(value, fallback = []) {
    if (!value) return fallback;

    try {
        const decoded = typeof value === 'string' ? JSON.parse(value) : value;
        return Array.isArray(decoded) && decoded.length ? decoded : fallback;
    } catch {
        return fallback;
    }
}
