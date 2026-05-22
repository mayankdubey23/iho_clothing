import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { CheckCircle2, CreditCard, MapPin, ShieldCheck, User, ChevronRight, Loader2, Trash2, ShoppingBag } from 'lucide-react';
import { clearCart, getCartItems, removeCartItem } from '@/lib/cart';

const inputClass = 'w-full bg-white border border-[#E8E4D9] px-4 py-3.5 text-sm font-bold text-[#1A1A1A] placeholder:text-[#A39E93] focus:ring-0 focus:border-[#1A1A1A] transition-colors rounded-sm outline-none';

export default function Checkout() {
    const { auth } = usePage().props;
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [detectingLocation, setDetectingLocation] = useState(false); // New: Pincode loader
    const [pincodeStatus, setPincodeStatus] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [success, setSuccess] = useState(null);
    
    const [form, setForm] = useState({
        full_name: auth?.user?.name || '',
        mobile_number: '',
        email: auth?.user?.email || '',
        alternate_mobile_number: '',
        house_flat_building: '',
        street_area_locality: '',
        landmark: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        coupon_code: '',
        payment_method: 'cod',
    });

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

    const emptyCart = () => {
        clearCart();
        setItems([]);
    };

    const removeItem = (skuId) => {
        setItems(removeCartItem(skuId));
    };

    // 🚀 Logic 1: Auto-Detect City/State from Pincode
    useEffect(() => {
        const pin = form.pincode.replace(/\D/g, '');

        if (pin.length !== 6) {
            setDetectingLocation(false);
            setPincodeStatus('');
            if (pin.length > 0) {
                setFieldErrors(prev => ({ ...prev, pincode: ['Enter a valid 6-digit Indian PIN code.'] }));
            }
            return;
        }

        const controller = new AbortController();
        const fetchLocation = async () => {
            setDetectingLocation(true);
            setPincodeStatus('Checking India Post PIN directory...');
            try {
                const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, { signal: controller.signal });
                const data = await res.json();
                const result = Array.isArray(data) ? data[0] : null;
                const postOffice = result?.PostOffice?.[0];

                if (result?.Status === 'Success' && postOffice) {
                    setForm(prev => ({
                        ...prev,
                        pincode: pin,
                        city: postOffice.District || postOffice.Name || '',
                        state: postOffice.State || '',
                    }));
                    setFieldErrors(prev => ({ ...prev, pincode: null, city: null, state: null }));
                    setPincodeStatus(`Verified by India Post: ${postOffice.District}, ${postOffice.State}`);
                } else {
                    setForm(prev => ({ ...prev, city: '', state: '' }));
                    setFieldErrors(prev => ({ ...prev, pincode: ['Invalid or unserviceable PIN code.'] }));
                    setPincodeStatus('');
                }
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setFieldErrors(prev => ({ ...prev, pincode: ['Could not verify PIN code. Please try again.'] }));
                    setPincodeStatus('');
                }
            } finally {
                setDetectingLocation(false);
            }
        };

        const timer = window.setTimeout(fetchLocation, 350);
        return () => {
            controller.abort();
            window.clearTimeout(timer);
        };
    }, [form.pincode]);

    const itemsPayload = useMemo(() => (
        items.map((item) => ({
            product_id: Number(item.product_id),
            sku_id: Number(item.sku_id),
            quantity: Number(item.quantity || 1),
        }))
        .filter((item) => item.product_id > 0 && item.sku_id > 0 && item.quantity > 0)
    ), [items]);

    const subtotal = useMemo(() => items.reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.quantity || 1)), 0), [items]);
    const shipping = subtotal > 5000 || subtotal === 0 ? 0 : 150;
    const taxes = Math.round(subtotal * 0.05);
    const total = subtotal + shipping + taxes;

    const handleChange = (e) => {
        const { name, value } = e.target;
        const nextValue = ['pincode', 'mobile_number', 'alternate_mobile_number'].includes(name)
            ? value.replace(/\D/g, '').slice(0, name === 'pincode' ? 6 : 10)
            : value;

        setForm((prev) => ({
            ...prev,
            [name]: nextValue,
            ...(name === 'pincode' ? { city: '', state: '' } : {}),
        }));
    };

    const handlePay = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});

        if (!itemsPayload.length) {
            setError('Your cart is empty.');
            return;
        }

        if (detectingLocation || form.pincode.length !== 6 || !form.city || !form.state) {
            setError('Please enter a valid Indian PIN code and wait for city/state verification.');
            return;
        }

        setLoading(true);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
                body: JSON.stringify({ 
                    ...form, 
                    items: itemsPayload 
                }),
                credentials: 'same-origin',
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data?.message || 'Checkout failed.');
                setFieldErrors(data?.errors || {});
                return;
            }

            // Success Handle
            clearCart();
            if (data?.payment_method === 'online') {
                window.location.href = data.redirect_url || `/payment?order_id=${encodeURIComponent(data.order_id)}`;
            } else {
                setSuccess({
                    orderId: data?.order_id,
                    message: data?.message || 'Your order has been placed.',
                    redirectUrl: data?.redirect_url || '/account?tab=orders&placed=1',
                });
                setTimeout(() => {
                    window.location.href = data?.redirect_url || '/account?tab=orders&placed=1';
                }, 2600);
            }

        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fieldError = (name) => fieldErrors?.[name]?.[0];

    return (
        <AppLayout>
            <Head title="Secure Checkout | IHO Clothing" />
            {success && (
                <div className="fixed inset-0 z-[100] grid place-items-center bg-[#1A1A1A]/70 px-6 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="w-full max-w-md border border-[#E8E4D9] bg-white p-8 text-center shadow-2xl"
                    >
                        <div className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                            <CheckCircle2 size={34} />
                        </div>
                        <p className="text-xs font-black uppercase tracking-[0.35em] text-[#7A756B]">Order confirmed</p>
                        <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#1A1A1A]">You are all set</h2>
                        <p className="mt-3 text-sm font-semibold text-[#7A756B]">{success.message}</p>
                        {success.orderId && <p className="mt-4 text-sm font-black text-[#1A1A1A]">Order #{success.orderId}</p>}
                        <p className="mt-6 text-xs font-bold uppercase tracking-widest text-[#A39E93]">Taking you to My Orders...</p>
                    </motion.div>
                </div>
            )}
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 md:py-16 min-h-screen">
                <div className="flex flex-col-reverse lg:flex-row gap-12 lg:gap-24">
                    <motion.form 
                        onSubmit={handlePay}
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        className="flex-1 max-w-2xl"
                    >
                        {/* Breadcrumbs */}
                        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#A39E93] mb-10">
                            <Link href="/cart" className="hover:text-[#1A1A1A]">Cart</Link>
                            <ChevronRight size={14} />
                            <span className="text-[#1A1A1A]">Information</span>
                        </nav>

                        {error && (
                            <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 rounded-sm">
                                {error}
                            </div>
                        )}

                        {/* Contact Info */}
                        <div className="mb-10">
                            <h2 className="text-xl font-black tracking-tight text-[#1A1A1A] uppercase mb-6 flex items-center gap-3">
                                <User size={20} className="text-[#A39E93]" /> Contact Details
                            </h2>
                            <div className="grid gap-4">
                                <input name="email" placeholder="Email address" value={form.email} onChange={handleChange} className={inputClass} required />
                                {fieldError('email') && <p className="text-xs text-red-600 font-bold">{fieldError('email')}</p>}
                                <input name="mobile_number" value={form.mobile_number} onChange={handleChange} type="tel" placeholder="Mobile Number (10 digits)" className={inputClass} required />
                                {fieldError('mobile_number') && <p className="text-xs text-red-600 font-bold">{fieldError('mobile_number')}</p>}
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="mb-10">
                            <h2 className="text-xl font-black tracking-tight text-[#1A1A1A] uppercase mb-6 flex items-center gap-3">
                                <MapPin size={20} className="text-[#A39E93]" /> Shipping Address
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input name="full_name" value={form.full_name} onChange={handleChange} type="text" placeholder="Recipient Name" className={`${inputClass} sm:col-span-2`} required />
                                <input name="house_flat_building" value={form.house_flat_building} onChange={handleChange} type="text" placeholder="Flat, House no., Building" className={`${inputClass} sm:col-span-2`} required />
                                <input name="street_area_locality" value={form.street_area_locality} onChange={handleChange} type="text" placeholder="Area, Colony, Street" className={`${inputClass} sm:col-span-2`} required />
                                
                                <div className="relative sm:col-span-1">
                                    <input name="pincode" value={form.pincode} onChange={handleChange} inputMode="numeric" type="text" placeholder="6-digit PIN code" className={inputClass} required maxLength="6" />
                                    {detectingLocation && <Loader2 className="absolute right-3 top-4 animate-spin text-[#A39E93]" size={18} />}
                                </div>
                                {fieldError('pincode') && <p className="text-xs text-red-600 font-bold sm:col-span-2">{fieldError('pincode')}</p>}
                                {pincodeStatus && !fieldError('pincode') && <p className="text-xs text-emerald-700 font-bold sm:col-span-2">{pincodeStatus}</p>}
                                
                                <input name="city" value={form.city} onChange={handleChange} type="text" placeholder="City / District" className={`${inputClass} bg-slate-50`} required readOnly />
                                <input name="state" value={form.state} onChange={handleChange} type="text" placeholder="State" className={`${inputClass} bg-slate-50`} required readOnly />
                                <input name="country" value={form.country} onChange={handleChange} type="text" className={inputClass} readOnly />
                            </div>
                        </div>

                        {/* Payment Selection */}
                        <div className="mb-10">
                            <h2 className="text-xl font-black tracking-tight text-[#1A1A1A] uppercase mb-6 flex items-center gap-3">
                                <CreditCard size={20} className="text-[#A39E93]" /> Payment Mode
                            </h2>
                            <div className="grid gap-3">
                                <label className={`border ${form.payment_method === 'cod' ? 'border-[#1A1A1A] bg-[#F9F8F6]' : 'border-[#E8E4D9]'} rounded-sm p-4 flex items-center gap-3 cursor-pointer transition-all`}>
                                    <input type="radio" name="payment_method" value="cod" checked={form.payment_method === 'cod'} onChange={handleChange} className="accent-[#1A1A1A]" />
                                    <div>
                                        <span className="text-sm font-bold text-[#1A1A1A]">Cash on Delivery (COD)</span>
                                        <p className="text-[10px] text-[#7A756B]">Pay when you receive the package</p>
                                    </div>
                                </label>
                                <label className={`border ${form.payment_method === 'online' ? 'border-[#1A1A1A] bg-[#F9F8F6]' : 'border-[#E8E4D9]'} rounded-sm p-4 flex items-center gap-3 cursor-pointer transition-all`}>
                                    <input type="radio" name="payment_method" value="online" checked={form.payment_method === 'online'} onChange={handleChange} className="accent-[#1A1A1A]" />
                                    <div>
                                        <span className="text-sm font-bold text-[#1A1A1A]">Online Payment</span>
                                        <p className="text-[10px] text-[#7A756B]">UPI, Cards, NetBanking via Razorpay</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <button 
                            disabled={loading || items.length === 0} 
                            type="submit" 
                            className="w-full bg-[#1A1A1A] text-[#F9F8F6] py-5 text-sm font-bold uppercase tracking-widest hover:bg-[#333] transition-all rounded-sm shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                            {loading ? 'Processing...' : `Confirm Order - Rs ${total.toLocaleString('en-IN')}`}
                        </button>
                    </motion.form>

                    {/* Order Summary Sidebar */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        className="w-full lg:w-[450px]"
                    >
                        <div className="bg-white border border-[#E8E4D9] rounded-sm p-6 lg:p-8 sticky top-32">
                            <div className="mb-6 flex items-center justify-between gap-4 border-b border-[#E8E4D9] pb-4">
                                <h2 className="text-lg font-black tracking-tight text-[#1A1A1A] uppercase">Bag Summary</h2>
                                {items.length > 0 && (
                                    <button type="button" onClick={emptyCart} className="text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-700">
                                        Clear All
                                    </button>
                                )}
                            </div>
                            
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-14 text-center">
                                    <div className="mb-5 grid size-16 place-items-center rounded-full bg-[#F3F0EA] text-[#A39E93]">
                                        <ShoppingBag size={28} strokeWidth={1.5} />
                                    </div>
                                    <p className="text-sm font-black uppercase tracking-widest text-[#1A1A1A]">Your bag is empty</p>
                                    <p className="mt-2 text-xs font-bold text-[#7A756B]">Add one product to checkout.</p>
                                    <Link href="/shop" className="mt-6 border border-[#1A1A1A] px-6 py-3 text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors">
                                        Browse Collection
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-col gap-6 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                        {items.map((item) => (
                                            <div key={item.sku_id} className="group flex gap-4">
                                                <div className="relative w-16 h-20 bg-[#F3F0EA] rounded-sm overflow-hidden flex-shrink-0 border border-[#E8E4D9]">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex flex-col justify-center flex-grow">
                                                    <h3 className="text-[11px] font-bold text-[#1A1A1A] uppercase leading-tight line-clamp-2">{item.name}</h3>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#7A756B] mt-1">
                                                        {item.size} / {item.color} x {item.quantity}
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(item.sku_id)}
                                                        className="mt-2 flex w-fit items-center gap-1 text-[9px] font-black uppercase tracking-widest text-[#A39E93] hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 size={12} /> Remove
                                                    </button>
                                                </div>
                                                <div className="flex items-center text-sm font-bold text-[#1A1A1A]">
                                                    Rs {(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString('en-IN')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-col gap-3 text-sm font-bold text-[#7A756B] mb-6 pt-6 border-t border-[#E8E4D9]">
                                        <div className="flex justify-between"><span>Subtotal</span><span className="text-[#1A1A1A]">Rs {subtotal.toLocaleString('en-IN')}</span></div>
                                        <div className="flex justify-between"><span>Delivery</span><span className="text-[#1A1A1A]">{shipping === 0 ? 'FREE' : `Rs ${shipping}`}</span></div>
                                        <div className="flex justify-between font-black text-[#1A1A1A] pt-4 mt-2 border-t border-dashed border-[#E8E4D9]">
                                            <span className="uppercase tracking-widest">Total to Pay</span>
                                            <span className="text-xl text-[#4A001F]">Rs {total.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </AppLayout>
    );
}
