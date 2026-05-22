import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { clearCart, getCartItems, removeCartItem, updateCartItemQuantity } from '@/lib/cart';

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

    const emptyCart = () => {
        clearCart();
        setItems([]);
    };

    return (
        <>
            <AnimatePresence>
            {isOpen && (
                <React.Fragment key="cart-drawer-presence">
                    {/* ❄️ Titanium Overlay */}
                    <motion.div
                        key="cart-drawer-overlay"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[#1E293B]/20 backdrop-blur-md z-[60]"
                        onClick={onClose}
                    />

                    {/* ❄️ Boutique Drawer Container */}
                    <motion.div
                        key="cart-drawer-panel"
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 250 }}
                        className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white z-[70] shadow-[0_0_100px_rgba(30,41,59,0.1)] flex flex-col border-l border-slate-100"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black tracking-tighter text-[#1E293B] uppercase italic">
                                    Your Bag
                                </h2>
                                <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] mt-1">
                                    {items.length} ITEM{items.length !== 1 ? 'S' : ''} SELECTED
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                {items.length > 0 && (
                                    <button onClick={emptyCart} className="text-[9px] font-black uppercase tracking-[0.2em] text-red-500 hover:text-red-700">
                                        Clear All
                                    </button>
                                )}
                                <button onClick={onClose} className="p-2 text-[#94A3B8] hover:text-[#1E293B] transition-colors bg-slate-50 rounded-full">
                                    <X size={20} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>

                        {/* ❄️ Free Shipping Progress (Minimalist) */}
                        {items.length > 0 && (
                            <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100">
                                <div className="flex justify-between items-center mb-3">
                                    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#1E293B]">
                                        {subtotal >= shippingThreshold
                                            ? 'Complimentary Shipping Unlocked'
                                            : `Spend Rs ${(shippingThreshold - subtotal).toLocaleString('en-IN')} more for Free Shipping`}
                                    </p>
                                    <span className="text-[10px] font-black text-[#94A3B8]">{Math.round(progressToFreeShipping)}%</span>
                                </div>
                                <div className="w-full h-[3px] bg-slate-200 rounded-none overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }} animate={{ width: `${progressToFreeShipping}%` }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                        className="h-full bg-[#1E293B]"
                                    />
                                </div>
                            </div>
                        )}

                        {/* ❄️ Cart Items List */}
                        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-10 custom-scrollbar">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                        <ShoppingBag size={32} className="text-slate-200" strokeWidth={1.5} />
                                    </div>
                                    <p className="text-[#1E293B] font-black uppercase tracking-[0.2em] text-sm mb-2">Empty Selection</p>
                                    <p className="text-[#94A3B8] text-xs font-bold uppercase tracking-widest mb-8">Curate your premium collection.</p>
                                    <button onClick={onClose} className="px-10 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-800 transition-all">
                                        Browse Studio
                                    </button>
                                </div>
                            ) : (
                                items.map((item, index) => (
                                    <motion.div
                                        key={`cart-item-${item.id || item.sku_id || 'new'}-${item.size || 'na'}-${item.color || 'na'}-${index}`}
                                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                                        className="flex gap-6 group"
                                    >
                                        {/* Image Container */}
                                        <div className="w-28 h-36 bg-[#F8FAFC] flex-shrink-0 overflow-hidden border border-slate-100">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700" />
                                        </div>

                                        {/* Item Details */}
                                        <div className="flex flex-col justify-between flex-grow py-1">
                                            <div className="space-y-1">
                                                <div className="flex justify-between items-start gap-4">
                                                    <h3 className="text-xs font-black text-[#1E293B] uppercase tracking-tight leading-tight group-hover:text-black transition-colors">{item.name}</h3>
                                                    <button onClick={() => removeItem(item.sku_id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-black text-[#94A3B8] uppercase tracking-widest">
                                                        {item.color} / {item.size}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-black text-[#1E293B] pt-2">₹{Number(item.price || 0).toLocaleString('en-IN')}</p>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center border border-slate-100 w-fit mt-4">
                                                <button onClick={() => updateQuantity(item.sku_id, Number(item.quantity || 1) - 1)} className="px-3 py-1.5 text-slate-400 hover:text-black transition-colors">
                                                    <Minus size={12} strokeWidth={3} />
                                                </button>
                                                <span className="px-2 text-xs font-black text-[#1E293B] min-w-[24px] text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.sku_id, Number(item.quantity || 1) + 1)} className="px-3 py-1.5 text-slate-400 hover:text-black transition-colors">
                                                    <Plus size={12} strokeWidth={3} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* ❄️ Footer Summary */}
                        {items.length > 0 && (
                            <div className="p-8 bg-white border-t border-slate-100 shadow-[0_-20px_40px_rgba(30,41,59,0.02)]">
                                <div className="flex justify-between items-center mb-8">
                                    <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.3em]">Estimated Total</span>
                                    <span className="text-2xl font-black text-[#1E293B]">₹{subtotal.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Link href="/checkout" onClick={onClose} className="w-full bg-black text-white py-5 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-black/10">
                                        Secure Checkout <ArrowRight size={14} />
                                    </Link>
                                    <Link href="/cart" onClick={onClose} className="w-full bg-white text-[#1E293B] border border-slate-200 py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:border-black transition-all text-center">
                                        View Full Selection
                                    </Link>
                                </div>
                                <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest mt-6">
                                    Taxes and shipping calculated at checkout
                                </p>
                            </div>
                        )}
                    </motion.div>
                </React.Fragment>
            )}

            </AnimatePresence>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
            `}} />
        </>
    );
}
