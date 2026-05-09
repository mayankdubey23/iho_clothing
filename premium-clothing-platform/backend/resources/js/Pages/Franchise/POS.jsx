import React, { useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Minus, Plus, ShoppingBag } from 'lucide-react';

export default function POS({ skus = [] }) {
    const [customer, setCustomer] = useState({ customer_name: '', customer_phone: '' });
    const [cart, setCart] = useState({});

    const items = useMemo(() => Object.values(cart), [cart]);
    const total = items.reduce((sum, item) => sum + Number(item.product?.base_price || 0) * item.quantity, 0);

    const addSku = (sku) => {
        setCart((prev) => ({
            ...prev,
            [sku.id]: {
                ...sku,
                quantity: Math.min((prev[sku.id]?.quantity || 0) + 1, Number(sku.inventory?.stock_quantity || 0)),
            },
        }));
    };

    const updateQty = (sku, delta) => {
        setCart((prev) => {
            const nextQty = Math.max(0, Math.min((prev[sku.id]?.quantity || 0) + delta, Number(sku.inventory?.stock_quantity || 0)));
            const next = { ...prev };
            if (nextQty === 0) delete next[sku.id];
            else next[sku.id] = { ...sku, quantity: nextQty };
            return next;
        });
    };

    const submit = (event) => {
        event.preventDefault();
        router.post('/franchise-admin/pos/orders', {
            ...customer,
            items: items.map((item) => ({ sku_id: item.id, quantity: item.quantity })),
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setCart({});
                setCustomer({ customer_name: '', customer_phone: '' });
            },
        });
    };

    return (
        <AdminLayout active="pos">
            <Head title="Offline POS | Franchise" />
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900">Offline POS</h1>
                <p className="mt-1 text-sm font-medium text-slate-500">Create walk-in invoices and deduct only your local stock.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {skus.map((sku) => (
                        <button key={sku.id} onClick={() => addSku(sku)} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">{sku.size || 'Default'} / {sku.color || 'Default'}</p>
                            <h2 className="mt-2 font-black text-slate-900">{sku.product?.name}</h2>
                            <p className="mt-2 text-sm font-bold text-slate-500">Stock: {sku.inventory?.stock_quantity || 0}</p>
                            <p className="mt-3 text-lg font-black text-slate-900">Rs {Number(sku.product?.base_price || 0).toLocaleString('en-IN')}</p>
                        </button>
                    ))}
                    {skus.length === 0 && <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center font-semibold text-slate-400 md:col-span-2 xl:col-span-3">No local stock available for POS.</div>}
                </div>

                <form onSubmit={submit} className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center gap-2">
                        <ShoppingBag className="text-blue-600" size={20} />
                        <h2 className="text-lg font-black text-slate-900">Invoice</h2>
                    </div>
                    <div className="mb-5 grid gap-3">
                        <input required placeholder="Customer name" value={customer.customer_name} onChange={(e) => setCustomer({ ...customer, customer_name: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500" />
                        <input placeholder="Phone optional" value={customer.customer_phone} onChange={(e) => setCustomer({ ...customer, customer_phone: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500" />
                    </div>
                    <div className="grid gap-3">
                        {items.map((item) => (
                            <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                <p className="font-bold text-slate-900">{item.product?.name}</p>
                                <div className="mt-2 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <button type="button" onClick={() => updateQty(item, -1)} className="grid size-7 place-items-center rounded-lg bg-white text-slate-600"><Minus size={14} /></button>
                                        <span className="w-6 text-center text-sm font-black">{item.quantity}</span>
                                        <button type="button" onClick={() => updateQty(item, 1)} className="grid size-7 place-items-center rounded-lg bg-white text-slate-600"><Plus size={14} /></button>
                                    </div>
                                    <span className="font-black text-slate-900">Rs {(Number(item.product?.base_price || 0) * item.quantity).toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                        <span className="text-sm font-black uppercase tracking-widest text-slate-400">Total</span>
                        <span className="text-2xl font-black text-slate-900">Rs {total.toLocaleString('en-IN')}</span>
                    </div>
                    <button disabled={items.length === 0} className="mt-5 w-full rounded-xl bg-blue-600 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-700 disabled:opacity-60">
                        Complete Offline Sale
                    </button>
                </form>
            </div>
        </AdminLayout>
    );
}
