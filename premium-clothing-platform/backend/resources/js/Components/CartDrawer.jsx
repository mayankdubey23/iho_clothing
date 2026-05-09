import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { getCartItems, removeCartItem, updateCartItemQuantity } from '@/lib/cart';

export default function CartDrawer({ isOpen, onClose }) {
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
    const shippingThreshold = 5000;
    const progressToFreeShipping = subtotal > 0 ? Math.min((subtotal / shippingThreshold) * 100, 100) : 0;

    const updateQuantity = (skuId, quantity) => {
        setItems(updateCartItemQuantity(skuId, quantity));
    };

    const removeItem = (skuId) => {
        setItems(removeCartItem(skuId));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-[#F9F8F6] z-[70] shadow-2xl flex flex-col"
                    >
                        <div className="p-6 border-b border-[#E8E4D9] flex justify-between items-center bg-white">
                            <h2 className="text-xl font-black tracking-tight text-[#1A1A1A] uppercase">Your Bag ({items.length})</h2>
                            <button onClick={onClose} className="p-2 -mr-2 text-[#7A756B] hover:text-[#1A1A1A] transition-colors">
                                <X size={24} strokeWidth={1.5} />
                            </button>
                        </div>

                        {items.length > 0 && (
                            <div className="p-6 bg-[#F3F0EA] border-b border-[#E8E4D9]">
                                <p className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] mb-3 text-center">
                                    {subtotal >= shippingThreshold
                                        ? 'You have unlocked Free Shipping!'
                                        : `Add Rs ${(shippingThreshold - subtotal).toLocaleString('en-IN')} more for free shipping.`}
                                </p>
                                <div className="w-full h-1.5 bg-[#E8E4D9] rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }} animate={{ width: `${progressToFreeShipping}%` }} transition={{ duration: 0.8, delay: 0.2 }}
                                        className="h-full bg-[#4A001F]"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 bg-white">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <ShoppingBag size={48} className="text-[#E8E4D9] mb-4" strokeWidth={1} />
                                    <p className="text-[#1A1A1A] font-bold uppercase tracking-widest mb-2">Your bag is empty</p>
                                    <p className="text-[#7A756B] text-sm mb-6">Discover our latest arrivals.</p>
                                    <button onClick={onClose} className="text-sm font-bold uppercase tracking-widest text-[#F9F8F6] bg-[#1A1A1A] px-8 py-3 rounded-sm hover:bg-[#4A001F] transition-colors">
                                        Shop Now
                                    </button>
                                </div>
                            ) : (
                                items.map((item, index) => (
                                    <motion.div
                                        key={item.sku_id}
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
                                                    <button onClick={() => removeItem(item.sku_id)} className="text-[#A39E93] hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                                                </div>
                                                <p className="text-xs text-[#7A756B] mt-1.5 font-medium">{item.color} / {item.size}</p>
                                                <p className="text-sm font-bold text-[#1A1A1A] mt-1.5">Rs {Number(item.price || 0).toLocaleString('en-IN')}</p>
                                            </div>

                                            <div className="flex items-center border border-[#E8E4D9] rounded-sm w-fit mt-3">
                                                <button onClick={() => updateQuantity(item.sku_id, Number(item.quantity || 1) - 1)} className="px-2.5 py-1 text-[#7A756B] hover:text-[#1A1A1A] transition-colors"><Minus size={14} /></button>
                                                <span className="px-2 py-1 text-xs font-bold text-[#1A1A1A] w-6 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.sku_id, Number(item.quantity || 1) + 1)} className="px-2.5 py-1 text-[#7A756B] hover:text-[#1A1A1A] transition-colors"><Plus size={14} /></button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {items.length > 0 && (
                            <div className="p-6 bg-white border-t border-[#E8E4D9]">
                                <div className="flex justify-between items-center mb-6 text-lg font-black text-[#1A1A1A] uppercase tracking-widest">
                                    <span>Subtotal</span>
                                    <span>Rs {subtotal.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Link href="/checkout" onClick={onClose} className="w-full bg-[#1A1A1A] text-[#F9F8F6] py-4 text-sm font-bold uppercase tracking-widest hover:bg-[#4A001F] transition-colors flex items-center justify-center gap-2 rounded-sm shadow-xl">
                                        Checkout <ArrowRight size={18} />
                                    </Link>
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
