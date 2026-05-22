import React, { useEffect, useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus } from 'lucide-react';
import { clearCart, getCartItems, removeCartItem, updateCartItemQuantity } from '@/lib/cart';

export default function Cart() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        setItems(getCartItems());
        const syncCart = () => setItems(getCartItems());
        window.addEventListener('cart-updated', syncCart);
        window.addEventListener('storage', syncCart);
        return () => {
            window.removeEventListener('cart-updated', syncCart);
            window.removeEventListener('storage', syncCart);
        };
    }, []);

    const subtotal = items.reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
    const shipping = subtotal > 5000 || subtotal === 0 ? 0 : 150;

    const updateQuantity = (skuId, quantity) => {
        setItems(updateCartItemQuantity(skuId, quantity));
    };

    const removeItem = (skuId) => {
        setItems(removeCartItem(skuId));
    };

    const emptyCart = () => {
        clearCart();
        setItems([]);
    };

    return (
        <AppLayout>
            <Head title="Shopping Cart | IHO Clothing" />

            <div className="max-w-6xl mx-auto px-6 lg:px-8 py-24 md:py-32">
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                    className="mb-12 flex flex-col gap-4 border-b border-[#E8E4D9] pb-6 sm:flex-row sm:items-end sm:justify-between"
                >
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-[#1A1A1A] uppercase">Your Bag</h1>
                        <p className="mt-2 text-[#7A756B] text-sm font-bold uppercase tracking-widest">{items.length} Items</p>
                    </div>
                    {items.length > 0 && (
                        <button type="button" onClick={emptyCart} className="w-fit border border-red-200 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-red-600 transition-colors hover:bg-red-50">
                            Clear All
                        </button>
                    )}
                </motion.div>

                {items.length === 0 ? (
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
                        <div className="lg:col-span-8 flex flex-col gap-8">
                            {items.map((item, index) => (
                                <motion.div
                                    key={item.sku_id}
                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}
                                    className="flex gap-6 pb-8 border-b border-[#E8E4D9]"
                                >
                                    <div className="w-32 h-40 bg-[#F3F0EA] flex-shrink-0 overflow-hidden rounded-sm">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex flex-col justify-between flex-grow py-1">
                                        <div>
                                            <div className="flex justify-between items-start gap-4">
                                                <h3 className="text-base font-bold text-[#1A1A1A] uppercase tracking-wide">{item.name}</h3>
                                                <span className="text-base font-bold text-[#1A1A1A]">Rs {Number(item.price || 0).toLocaleString('en-IN')}</span>
                                            </div>
                                            <p className="text-sm text-[#7A756B] mt-1">{item.color} / {item.size}</p>
                                        </div>

                                        <div className="flex justify-between items-center mt-4">
                                            <div className="flex items-center border border-[#E8E4D9] rounded-sm">
                                                <button type="button" onClick={() => updateQuantity(item.sku_id, Number(item.quantity || 1) - 1)} className="px-3 py-1.5 text-[#7A756B] hover:text-[#1A1A1A] transition-colors"><Minus size={16} /></button>
                                                <span className="px-3 py-1.5 text-sm font-bold text-[#1A1A1A] w-8 text-center">{item.quantity}</span>
                                                <button type="button" onClick={() => updateQuantity(item.sku_id, Number(item.quantity || 1) + 1)} className="px-3 py-1.5 text-[#7A756B] hover:text-[#1A1A1A] transition-colors"><Plus size={16} /></button>
                                            </div>
                                            <button type="button" onClick={() => removeItem(item.sku_id)} className="text-sm font-bold text-[#A39E93] hover:text-red-600 uppercase tracking-widest transition-colors flex items-center gap-2">
                                                <Trash2 size={16} /> Remove
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                            className="lg:col-span-4"
                        >
                            <div className="bg-[#F3F0EA] p-8 rounded-sm sticky top-32">
                                <h3 className="text-lg font-black text-[#1A1A1A] uppercase tracking-widest mb-6 border-b border-[#E8E4D9] pb-4">Order Summary</h3>
                                <div className="flex flex-col gap-4 text-sm font-bold text-[#7A756B]">
                                    <div className="flex justify-between"><span>Subtotal</span><span className="text-[#1A1A1A]">Rs {subtotal.toLocaleString('en-IN')}</span></div>
                                    <div className="flex justify-between"><span>Shipping</span><span className="text-[#1A1A1A]">{shipping === 0 ? 'FREE' : `Rs ${shipping}`}</span></div>
                                    <div className="flex justify-between"><span>Taxes</span><span className="text-[#1A1A1A]">Calculated at checkout</span></div>
                                </div>
                                <div className="flex justify-between items-center mt-6 pt-6 border-t border-[#E8E4D9] text-xl font-black text-[#1A1A1A]">
                                    <span>Total</span>
                                    <span>Rs {(subtotal + shipping).toLocaleString('en-IN')}</span>
                                </div>
                                <Link href="/checkout" className="w-full mt-8 bg-[#1A1A1A] text-[#F9F8F6] py-4 text-sm font-bold uppercase tracking-widest hover:bg-[#4A001F] transition-colors flex items-center justify-center gap-2 rounded-sm shadow-xl">
                                    Proceed to Checkout <ArrowRight size={18} />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
