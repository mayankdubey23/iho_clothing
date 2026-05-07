import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Lock, CreditCard, MapPin, Truck, ChevronRight, ShieldCheck } from 'lucide-react';

export default function Checkout({ cartItems = [] }) {
    // Premium placeholder data
    const displayItems = cartItems.length > 0 ? cartItems : [
        { id: 1, name: 'Essential Heavyweight Boxy Tee', size: 'L', color: 'Onyx Black', price: 2499, quantity: 1, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop' },
        { id: 2, name: 'Technical Cargo Trousers', size: 'M', color: 'Ash Grey', price: 4999, quantity: 1, image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop' }
    ];

    const subtotal = displayItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shipping = subtotal > 5000 ? 0 : 150;
    const taxes = Math.round(subtotal * 0.05); // Dummy 5% tax
    const total = subtotal + shipping + taxes;

    // Standard input styling for the premium theme
    const inputClass = "w-full bg-white border border-[#E8E4D9] px-4 py-3.5 text-sm font-bold text-[#1A1A1A] placeholder:text-[#A39E93] focus:ring-0 focus:border-[#1A1A1A] transition-colors rounded-sm outline-none";

    return (
        <AppLayout>
            <Head title="Secure Checkout | IHO Clothing" />

            {/* Distraction-free header for checkout */}
            <div className="bg-[#F9F8F6] border-b border-[#E8E4D9] py-6">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center">
                    <Link href="/" className="text-2xl font-black tracking-tighter uppercase text-[#1A1A1A]">
                        IHO<span className="font-light text-[#7A756B]">CLOTHING</span>
                    </Link>
                    <div className="flex items-center gap-2 text-[#7A756B]">
                        <Lock size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest">Secure SSL</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 md:py-16 min-h-screen">
                <div className="flex flex-col-reverse lg:flex-row gap-12 lg:gap-24">
                    
                    {/* LEFT SIDE: Forms */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
                        className="flex-1 max-w-2xl"
                    >
                        {/* Breadcrumbs */}
                        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#A39E93] mb-10">
                            <Link href="/cart" className="hover:text-[#1A1A1A] transition-colors">Cart</Link>
                            <ChevronRight size={14} />
                            <span className="text-[#1A1A1A]">Information</span>
                            <ChevronRight size={14} />
                            <span>Shipping</span>
                            <ChevronRight size={14} />
                            <span>Payment</span>
                        </nav>

                        {/* Contact Section */}
                        <div className="mb-10">
                            <h2 className="text-xl font-black tracking-tight text-[#1A1A1A] uppercase mb-6 flex items-center gap-3">
                                <User size={20} className="text-[#A39E93]" /> Contact Information
                            </h2>
                            <input type="email" placeholder="Email address" className={inputClass} />
                            <div className="mt-4 flex items-center gap-3">
                                <input type="checkbox" id="newsletter" className="w-4 h-4 text-[#1A1A1A] border-[#E8E4D9] rounded-sm focus:ring-[#1A1A1A]" />
                                <label htmlFor="newsletter" className="text-sm font-medium text-[#7A756B]">Email me with news and exclusive offers</label>
                            </div>
                        </div>

                        {/* Shipping Section */}
                        <div className="mb-10">
                            <h2 className="text-xl font-black tracking-tight text-[#1A1A1A] uppercase mb-6 flex items-center gap-3">
                                <MapPin size={20} className="text-[#A39E93]" /> Shipping Address
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input type="text" placeholder="First name" className={inputClass} />
                                <input type="text" placeholder="Last name" className={inputClass} />
                                <input type="text" placeholder="Company (optional)" className={`${inputClass} sm:col-span-2`} />
                                <input type="text" placeholder="Address" className={`${inputClass} sm:col-span-2`} />
                                <input type="text" placeholder="Apartment, suite, etc. (optional)" className={`${inputClass} sm:col-span-2`} />
                                <input type="text" placeholder="City" className={inputClass} />
                                <select className={`${inputClass} appearance-none cursor-pointer text-[#7A756B]`}>
                                    <option value="">State / Province</option>
                                    <option value="DL">Delhi</option>
                                    <option value="MH">Maharashtra</option>
                                    <option value="UP">Uttar Pradesh</option>
                                </select>
                                <input type="text" placeholder="PIN Code" className={inputClass} />
                                <input type="tel" placeholder="Phone" className={inputClass} />
                            </div>
                        </div>

                        {/* Shipping Method */}
                        <div className="mb-10">
                            <h2 className="text-xl font-black tracking-tight text-[#1A1A1A] uppercase mb-6 flex items-center gap-3">
                                <Truck size={20} className="text-[#A39E93]" /> Shipping Method
                            </h2>
                            <div className="border border-[#1A1A1A] rounded-sm bg-[#F9F8F6] p-4 flex justify-between items-center cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full border-4 border-[#1A1A1A] bg-white flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-[#1A1A1A]">Standard Delivery</p>
                                        <p className="text-xs text-[#7A756B] mt-0.5">3 to 5 business days</p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-[#1A1A1A]">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                            </div>
                        </div>

                        {/* Payment Section */}
                        <div className="mb-10">
                            <h2 className="text-xl font-black tracking-tight text-[#1A1A1A] uppercase mb-6 flex items-center gap-3">
                                <CreditCard size={20} className="text-[#A39E93]" /> Payment
                            </h2>
                            <p className="text-sm text-[#7A756B] mb-4">All transactions are secure and encrypted.</p>
                            
                            <div className="border border-[#E8E4D9] rounded-sm bg-white overflow-hidden">
                                <div className="p-4 border-b border-[#E8E4D9] bg-[#F9F8F6] flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded-full border-4 border-[#1A1A1A] bg-white flex-shrink-0" />
                                        <p className="text-sm font-bold text-[#1A1A1A]">Credit / Debit Card</p>
                                    </div>
                                    <div className="flex gap-1">
                                        {/* Mock credit card icons */}
                                        <div className="w-8 h-5 bg-blue-900 rounded-[2px]" />
                                        <div className="w-8 h-5 bg-red-500 rounded-[2px]" />
                                        <div className="w-8 h-5 bg-orange-400 rounded-[2px]" />
                                    </div>
                                </div>
                                <div className="p-4 bg-white grid grid-cols-2 gap-4">
                                    <input type="text" placeholder="Card number" className={`${inputClass} col-span-2`} />
                                    <input type="text" placeholder="Name on card" className={`${inputClass} col-span-2`} />
                                    <input type="text" placeholder="Expiration date (MM/YY)" className={inputClass} />
                                    <input type="text" placeholder="Security code (CVV)" className={inputClass} />
                                </div>
                            </div>
                        </div>

                        <button className="w-full bg-[#1A1A1A] text-[#F9F8F6] py-5 text-sm font-bold uppercase tracking-widest hover:bg-[#4A001F] transition-colors rounded-sm shadow-xl flex items-center justify-center gap-2">
                            <ShieldCheck size={18} /> Pay ₹{total.toLocaleString('en-IN')}
                        </button>
                    </motion.div>

                    {/* RIGHT SIDE: Order Summary */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                        className="w-full lg:w-[450px]"
                    >
                        <div className="bg-white border border-[#E8E4D9] rounded-sm p-6 lg:p-8 sticky top-32 shadow-sm">
                            <h2 className="text-lg font-black tracking-tight text-[#1A1A1A] uppercase mb-6 pb-4 border-b border-[#E8E4D9]">Order Summary</h2>
                            
                            {/* Items */}
                            <div className="flex flex-col gap-6 mb-6">
                                {displayItems.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="relative w-16 h-20 bg-[#F3F0EA] rounded-sm overflow-hidden flex-shrink-0 border border-[#E8E4D9]">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#7A756B] text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
                                                {item.quantity}
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-center flex-grow">
                                            <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide leading-tight line-clamp-2">{item.name}</h3>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#7A756B] mt-1">{item.color} / {item.size}</p>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-sm font-bold text-[#1A1A1A]">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Discount Code */}
                            <div className="flex gap-2 py-6 border-y border-[#E8E4D9] mb-6">
                                <input type="text" placeholder="Gift card or discount code" className={`${inputClass} py-3 bg-[#F9F8F6]`} />
                                <button className="bg-[#E8E4D9] text-[#1A1A1A] px-6 text-xs font-bold uppercase tracking-widest hover:bg-[#1A1A1A] hover:text-[#F9F8F6] transition-colors rounded-sm">
                                    Apply
                                </button>
                            </div>

                            {/* Totals */}
                            <div className="flex flex-col gap-3 text-sm font-bold text-[#7A756B] mb-6">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="text-[#1A1A1A]">₹{subtotal.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span className="text-[#1A1A1A]">{shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Estimated taxes</span>
                                    <span className="text-[#1A1A1A]">₹{taxes.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-end pt-6 border-t border-[#E8E4D9]">
                                <span className="text-base font-bold text-[#1A1A1A] uppercase tracking-widest">Total</span>
                                <div className="text-right">
                                    <span className="text-xs text-[#7A756B] font-bold mr-2">INR</span>
                                    <span className="text-2xl font-black text-[#1A1A1A]">₹{total.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </AppLayout>
    );
}