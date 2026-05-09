import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function BuyStock({ products = [] }) {
    const [quantities, setQuantities] = useState({});

    const requestStock = (skuId) => {
        router.post('/franchise-admin/stock-requests', {
            sku_id: skuId,
            quantity: Number(quantities[skuId] || 1),
        }, { preserveScroll: true });
    };

    return (
        <AdminLayout active="stock-requests">
            <Head title="Buy Stock" />
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900">Buy Stock</h1>
                <p className="mt-1 text-sm font-medium text-slate-500">View global catalog and request stock approval from Super Admin.</p>
            </div>
            <div className="grid gap-5">
                {products.map((product) => (
                    <div key={product.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">{product.category?.name || 'Collection'}</p>
                                <h2 className="mt-1 text-lg font-black text-slate-900">{product.name}</h2>
                                <p className="mt-1 text-sm font-bold text-orange-600">Franchise price: Rs {Number(product.franchise_price || 0).toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                        <div className="mt-4 grid gap-3">
                            {product.skus?.map((sku) => (
                                <div key={sku.id} className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                                    <span className="font-bold text-slate-700">{sku.size || 'Default'} / {sku.color || 'Default'}</span>
                                    <div className="flex items-center gap-2">
                                        <input type="number" min="1" value={quantities[sku.id] || 1} onChange={(e) => setQuantities({ ...quantities, [sku.id]: e.target.value })} className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold" />
                                        <button onClick={() => requestStock(sku.id)} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-700">Request</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
}
