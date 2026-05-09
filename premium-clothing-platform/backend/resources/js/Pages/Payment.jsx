import React, { useEffect, useRef, useState } from 'react';
import { Head } from '@inertiajs/react';

export default function Payment({ order, razorpay_key }) {
    const openedRef = useRef(false);
    const [status, setStatus] = useState('Initializing secure payment...');
    const [error, setError] = useState('');

    const verifyPayment = async (response) => {
        setStatus('Verifying payment...');
        setError('');

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/payment/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data?.status) {
                throw new Error(data?.message || 'Payment verification failed.');
            }

            window.location.href = data.redirect_url || '/account?tab=orders&paid=1';
        } catch (err) {
            setError(err.message || 'Payment verification failed.');
            setStatus('Payment needs attention');
        }
    };

    const openRazorpay = () => {
        if (!razorpay_key) {
            setError('Razorpay key is missing. Please add RAZORPAY_KEY_ID in your .env file.');
            return;
        }

        if (!window.Razorpay) {
            setError('Razorpay checkout did not load. Please check your internet connection and try again.');
            return;
        }

        const options = {
            key: razorpay_key,
            amount: Math.round(Number(order.total_amount || 0) * 100),
            currency: 'INR',
            name: 'IHO Clothing',
            description: `Order #${order.id}`,
            order_id: order.razorpay_order_id,
            handler: verifyPayment,
            modal: {
                ondismiss: () => {
                    setStatus('Payment was not completed.');
                },
            },
            prefill: {
                name: order.full_name || order.customer_name,
                email: order.email || order.customer_email,
                contact: order.mobile_number || order.customer_phone,
            },
            theme: { color: '#1A1A1A' },
        };

        openedRef.current = true;
        setStatus('Razorpay checkout is open...');
        new window.Razorpay(options).open();
    };

    useEffect(() => {
        if (openedRef.current) return;

        if (window.Razorpay) {
            openRazorpay();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = openRazorpay;
        script.onerror = () => setError('Unable to load Razorpay checkout.');
        document.body.appendChild(script);
    }, []);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9F8F6] px-6 text-center">
            <Head title="Secure Payment" />
            <div className="w-full max-w-md border border-[#E8E4D9] bg-white p-8 shadow-sm">
                <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-[#1A1A1A] border-t-transparent" />
                <h1 className="text-2xl font-black uppercase tracking-tight text-[#1A1A1A]">Secure Payment</h1>
                <p className="mt-3 text-sm font-bold text-[#7A756B]">{status}</p>
                <p className="mt-2 text-sm text-[#7A756B]">Order #{order.id} · Rs {Number(order.total_amount || 0).toLocaleString('en-IN')}</p>

                {error && (
                    <div className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                        {error}
                    </div>
                )}

                <button
                    type="button"
                    onClick={openRazorpay}
                    className="mt-6 w-full bg-[#1A1A1A] px-6 py-4 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#4A001F]"
                >
                    Pay Now
                </button>
                <a href="/account?tab=orders" className="mt-4 block text-xs font-bold uppercase tracking-widest text-[#7A756B] hover:text-[#1A1A1A]">
                    View My Orders
                </a>
            </div>
        </div>
    );
}
