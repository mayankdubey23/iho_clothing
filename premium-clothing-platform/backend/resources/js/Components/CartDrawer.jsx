import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';

export default function CartDrawer({ isOpen, onClose, cartItems = [] }) {
    
    // Premium placeholder data for the drawer
    const displayItems = cartItems.length > 0 ? cartItems : [
        { id: 1, name: 'Essential Heavyweight Boxy Tee', size: 'L', color: 'Onyx Black', price: 2499, quantity: 1, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop' },
        { id: 2, name: 'Technical Cargo Trousers', size: 'M', color: 'Ash Grey', price: 4999, quantity: 1, image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop' }
    ];

    const subtotal = displayItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingThreshold = 5000;
    const progressToFreeShipping = Math.min((subtotal / shippingThreshold) * 100, 100);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Dark Background Overlay */}
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                        onClick={onClose}
                    />
                    
                    {/* Sliding Drawer from the Right */}
                    <motion.div 
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-[#F9F8F6] z-[70] shadow-2xl flex flex-col"
                    >
                        {/* Drawer Header */}
                        <div className="p-6 border-b border-[#E8E4D9] flex justify-between items-center bg-white">
                            <h2 className="text-xl font-black tracking-tight text-[#1A1A1A] uppercase">Your Bag ({displayItems.length})</h2>
                            <button onClick={onClose} className="p-2 -mr-2 text-[#7A756B] hover:text-[#1A1A1A] transition-colors">
                                <X size={24} strokeWidth={1.5} />
                            </button>
                        </div>

                        {/* Free Shipping Progress Bar */}
                        <div className="p-6 bg-[#F3F0EA] border-b border-[#E8E4D9]">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] mb-3 text-center">
                                {subtotal >= shippingThreshold 
                                    ? "🎉 You have unlocked Free Shipping!" 
                                    : `Add ₹${(shippingThreshold - subtotal).toLocaleString('en-IN')} more for free shipping.`}
                            </p>
                            <div className="w-full h-1.5 bg-[#E8E4D9] rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }} animate={{ width: `${progressToFreeShipping}%` }} transition={{ duration: 0.8, delay: 0.2 }}
                                    className="h-full bg-[#4A001F]"
                                />
                            </div>
                        </div>

                        {/* Cart Items (Scrollable) */}
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 bg-white">
                            {displayItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <ShoppingBag size={48} className="text-[#E8E4D9] mb-4" strokeWidth={1} />
                                    <p className="text-[#1A1A1A] font-bold uppercase tracking-widest mb-2">Your bag is empty</p>
                                    <p className="text-[#7A756B] text-sm mb-6">Discover our latest arrivals.</p>
                                    <button onClick={onClose} className="text-sm font-bold uppercase tracking-widest text-[#F9F8F6] bg-[#1A1A1A] px-8 py-3 rounded-sm hover:bg-[#4A001F] transition-colors">
                                        Shop Now
                                    </button>
                                </div>
                            ) : (
                                displayItems.map((item, index) => (
                                    <motion.div 
                                        key={item.id}
                                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}
                                        className="flex gap-5"
                                    >
                                        <div className="w-24 h-32 bg-[#F3F0EA] flex-shrink-0 overflow-hidden rounded-sm border border-[#E8E4D9]">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex flex-col justify-between flex-grow py-0.5">
                                            <div>
                                                <div className="flex justify-between items-start gap-2">
                                                    <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wide leading-tight line-clamp-2">{item.name}</h3>
                                                    <button className="text-[#A39E93] hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                                                </div>
                                                <p className="text-xs text-[#7A756B] mt-1.5 font-medium">{item.color} / {item.size}</p>
                                                <p className="text-sm font-bold text-[#1A1A1A] mt-1.5">₹{item.price.toLocaleString('en-IN')}</p>
                                            </div>
                                            
                                            <div className="flex items-center border border-[#E8E4D9] rounded-sm w-fit mt-3">
                                                <button className="px-2.5 py-1 text-[#7A756B] hover:text-[#1A1A1A] transition-colors"><Minus size={14} /></button>
                                                <span className="px-2 py-1 text-xs font-bold text-[#1A1A1A] w-6 text-center">{item.quantity}</span>
                                                <button className="px-2.5 py-1 text-[#7A756B] hover:text-[#1A1A1A] transition-colors"><Plus size={14} /></button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Drawer Footer / Checkout */}
                        {displayItems.length > 0 && (
                            <div className="p-6 bg-white border-t border-[#E8E4D9]">
                                <div className="flex justify-between items-center mb-6 text-lg font-black text-[#1A1A1A] uppercase tracking-widest">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                                </div>
                                <p className="text-xs text-[#7A756B] mb-6 text-center">Taxes and shipping calculated at checkout.</p>
                                
                                <div className="flex flex-col gap-3">
                                    <button className="w-full bg-[#1A1A1A] text-[#F9F8F6] py-4 text-sm font-bold uppercase tracking-widest hover:bg-[#4A001F] transition-colors flex items-center justify-center gap-2 rounded-sm shadow-xl">
                                        Checkout <ArrowRight size={18} />
                                    </button>
                                    <Link href="/cart" onClick={onClose} className="w-full bg-white text-[#1A1A1A] border border-[#1A1A1A] py-3.5 text-sm font-bold uppercase tracking-widest hover:bg-[#F3F0EA] transition-colors text-center rounded-sm">
                                        View Full Bag
                                    </Link>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}