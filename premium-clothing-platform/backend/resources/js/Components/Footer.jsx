import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, CreditCard } from 'lucide-react';
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
    const socialLinks = parseJsonList(site.footer_social_links_json, defaultSocialLinks);
    const paymentMethods = parseJsonList(site.footer_payment_methods_json, ['VISA', 'MASTER', 'UPI', 'COD']);
    const bottomLinks = parseJsonList(site.footer_bottom_links_json, defaultBottomLinks).slice(0, 5);
    const copyright = site.footer_copyright || `Copyright ${new Date().getFullYear()} ${brandName}. ALL RIGHTS RESERVED.`;
    const adText = site.footer_ad_text || '';
    const adCta = site.footer_ad_cta || 'Shop Deals';
    const adHref = site.footer_ad_href || '/shop?discount=40';

    return (
        <footer className="bg-[#282c3f] text-white">
            {adText && (
                <Link href={adHref} className="block border-y border-white/10 bg-[#ff3f6c] px-4 py-3 text-white transition hover:bg-[#282c3f]">
                    <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 sm:flex-row sm:items-center">
                        <span className="text-[11px] font-black uppercase tracking-[0.22em]">{adText}</span>
                        <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em]">
                            {adCta} <ArrowRight size={14} />
                        </span>
                    </div>
                </Link>
            )}

            <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
                <div className="grid gap-6 lg:grid-cols-[1.2fr_2fr_0.9fr] lg:items-start">
                    <div>
                        <Link href="/" className="group flex items-center gap-3">
                            <div className="grid size-9 place-items-center overflow-hidden bg-white text-[10px] font-black tracking-widest text-[#282c3f]">
                                {logoUrl ? <img src={logoUrl} alt={brandName} className="h-full w-full object-contain p-1" /> : logoMark}
                            </div>
                            <span className="text-xl font-black uppercase italic tracking-tighter">{brandName}</span>
                        </Link>
                        <p className="mt-3 max-w-sm text-xs font-semibold leading-5 text-slate-400">{aboutText}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
                        {linkGroups.map((group, index) => (
                            <div key={`${group.title}-${index}`} className={index === 2 ? 'col-span-2 sm:col-span-1' : ''}>
                                <h4 className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-[#ff905a]">{group.title}</h4>
                                <ul className="flex flex-col gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    {(group.links || []).slice(0, 4).map((link) => (
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

                    <div className="flex flex-col gap-4 lg:items-end">
                        <div className="flex gap-5">
                            {socialLinks.slice(0, 4).map((social) => {
                                const Icon = socialIconMap[social.icon] || FaInstagram;

                                return (
                                    <a key={`${social.icon}-${social.href}`} href={social.href || '#'} className="text-slate-400 transition hover:text-white" aria-label={social.label || social.icon}>
                                        <Icon size={16} />
                                    </a>
                                );
                            })}
                        </div>

                        <div className="flex flex-wrap gap-2 lg:justify-end">
                            {paymentMethods.slice(0, 4).map((method) => (
                                <span key={method} className="inline-flex items-center gap-1 border border-white/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-slate-400">
                                    <CreditCard size={12} />
                                    {method}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-5 flex flex-col justify-between gap-3 border-t border-white/10 pt-4 text-slate-500 sm:flex-row sm:items-center">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em]">{copyright}</p>
                    <div className="flex flex-wrap gap-4">
                        {bottomLinks.map((link) => (
                            <Link key={`${link.href}-${link.label}`} href={link.href || '/'} className="text-[8px] font-bold uppercase tracking-widest transition-colors hover:text-white">
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
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
