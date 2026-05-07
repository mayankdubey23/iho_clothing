// resources/js/Components/Footer.jsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { FaInstagram, FaXTwitter, FaFacebookF } from 'react-icons/fa6';

export default function Footer() {
    return (
        <footer className="bg-[#1A1A2E] text-white pt-20 pb-10">
            <div className="max-w-6xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="md:col-span-2">
                        <h3 className="text-xl font-light uppercase tracking-widest mb-4">Join the Club</h3>
                        <p className="text-gray-400 text-sm mb-6 max-w-sm">Subscribe to receive updates and exclusive deals.</p>
                        <div className="flex items-center border-b border-gray-600 pb-2 max-w-sm">
                            <input type="email" placeholder="Email address" className="bg-transparent border-none outline-none text-sm w-full px-0 focus:ring-0" />
                            <button className="ml-4 text-gray-400 hover:text-[#E94E3C]"><ArrowRight size={20} strokeWidth={1.5} /></button>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs uppercase tracking-widest font-bold mb-6 text-gray-500">Support</h4>
                        <ul className="flex flex-col gap-4 text-sm font-light">
                            <li><Link href="/faq" className="hover:text-[#E94E3C]">FAQ</Link></li>
                            <li><Link href="/shipping" className="hover:text-[#E94E3C]">Shipping & Returns</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs uppercase tracking-widest font-bold mb-6 text-gray-500">Company</h4>
                        <ul className="flex flex-col gap-4 text-sm font-light">
                            <li><Link href="/about" className="hover:text-[#E94E3C]">About Us</Link></li>
                            <li><Link href="/franchise" className="hover:text-[#E94E3C]">Franchise Program</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="pt-8 border-t border-[#2A2A3E] flex justify-between items-center text-xs text-gray-500 uppercase tracking-widest">
                    <p>&copy; {new Date().getFullYear()} IHO Clothing. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-[#E94E3C]"><FaInstagram size={18} /></a>
                        <a href="#" className="hover:text-[#E94E3C]"><FaXTwitter size={18} /></a>
                        <a href="#" className="hover:text-[#E94E3C]"><FaFacebookF size={18} /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
}