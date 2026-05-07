import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus } from 'lucide-react';

export default function Cart({ cartItems = [] }) {
    
    // We will use dummy data if your cart is empty so you can see the premium design
    const displayItems = cartItems.length > 0 ? cartItems : [
        { id: 1, name: 'Essential Heavyweight Boxy Tee', size: 'L', color: 'Onyx Black', price: 2499, quantity: 1, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop' },
        { id: 2, name: 'Technical Cargo Trousers', size: 'M', color: 'Ash Grey', price: 4999, quantity: 1, image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop' }
    ];

    const subtotal = displayItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shipping = subtotal > 5000 ? 0 : 150;

    return (
        <AppLayout>
            <Head title="Shopping Cart | IHO Clothing" />

            <div className="max-w-6xl mx-auto px-6 lg:px-8 py-24 md:py-32">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                    className="mb-12 border-b border-[#E8E4D9] pb-6"
                >
                    <h1 className="text-4xl font-black tracking-tight text-[#1A1A1A] uppercase">Your Bag</h1>
                    <p className="mt-2 text-[#7A756B] text-sm font-bold uppercase tracking-widest">{displayItems.length} Items</p>
                </motion.div>

                {displayItems.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                        className="flex flex-col items-center justify-center py-24 bg-[#F3F0EA] rounded-sm"
                    >
                        <ShoppingBag size={48} className="text-[#A39E93] mb-6" strokeWidth={1} />
                        <h2 className="text-xl font-bold text-[#1A1A1A] mb-2 uppercase tracking-widest">Your bag is empty</h2>
                        <p className="text-[#7A756B] text-sm mb-8">Looks like you haven't added anything yet.</p>
                        <Link href="/" className="bg-[#1A1A1A] text-[#F9F8F6] px-8 py-3.5 text-sm font-bold uppercase tracking-widest hover:bg-[#4A001F] transition-colors rounded-sm">
                            Continue Shopping
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        
                        {/* Cart Items List */}
                        <div className="lg:col-span-8 flex flex-col gap-8">
                            {displayItems.map((item, index) => (
                                <motion.div 
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}
                                    className="flex gap-6 pb-8 border-b border-[#E8E4D9]"
                                >
                                    <div className="w-32 h-40 bg-[#F3F0EA] flex-shrink-0 overflow-hidden rounded-sm">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex flex-col justify-between flex-grow py-1">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-base font-bold text-[#1A1A1A] uppercase tracking-wide">{item.name}</h3>
                                                <span className="text-base font-bold text-[#1A1A1A]">₹{item.price.toLocaleString('en-IN')}</span>
                                            </div>
                                            <p className="text-sm text-[#7A756B] mt-1">{item.color} / {item.size}</p>
                                        </div>
                                        
                                        <div className="flex justify-between items-center mt-4">
                                            {/* Quantity Selector */}
                                            <div className="flex items-center border border-[#E8E4D9] rounded-sm">
                                                <button className="px-3 py-1.5 text-[#7A756B] hover:text-[#1A1A1A] transition-colors"><Minus size={16} /></button>
                                                <span className="px-3 py-1.5 text-sm font-bold text-[#1A1A1A] w-8 text-center">{item.quantity}</span>
                                                <button className="px-3 py-1.5 text-[#7A756B] hover:text-[#1A1A1A] transition-colors"><Plus size={16} /></button>
                                            </div>
                                            <button className="text-sm font-bold text-[#A39E93] hover:text-red-600 uppercase tracking-widest transition-colors flex items-center gap-2">
                                                <Trash2 size={16} /> Remove
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Order Summary Sticky Sidebar */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                            className="lg:col-span-4"
                        >
                            <div className="bg-[#F3F0EA] p-8 rounded-sm sticky top-32">
                                <h3 className="text-lg font-black text-[#1A1A1A] uppercase tracking-widest mb-6 border-b border-[#E8E4D9] pb-4">Order Summary</h3>
                                
                                <div className="flex flex-col gap-4 text-sm font-bold text-[#7A756B]">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span className="text-[#1A1A1A]">₹{subtotal.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Shipping</span>
                                        <span className="text-[#1A1A1A]">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Taxes</span>
                                        <span className="text-[#1A1A1A]">Calculated at checkout</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-6 pt-6 border-t border-[#E8E4D9] text-xl font-black text-[#1A1A1A]">
                                    <span>Total</span>
                                    <span>₹{(subtotal + shipping).toLocaleString('en-IN')}</span>
                                </div>

                                <button className="w-full mt-8 bg-[#1A1A1A] text-[#F9F8F6] py-4 text-sm font-bold uppercase tracking-widest hover:bg-[#4A001F] transition-colors flex items-center justify-center gap-2 rounded-sm shadow-xl">
                                    Proceed to Checkout <ArrowRight size={18} />
                                </button>
                                
                                <p className="text-xs text-center text-[#A39E93] mt-4 font-medium uppercase tracking-wider">
                                    Secure SSL Encrypted Checkout
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}