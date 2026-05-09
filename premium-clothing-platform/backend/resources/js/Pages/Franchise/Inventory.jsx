import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Inventory({ inventory = [] }) {
    return (
        <AdminLayout active="inventory">
            <Head title="My Inventory" />
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900">My Inventory</h1>
                <p className="mt-1 text-sm font-medium text-slate-500">Your local stock only. Master product details are read-only.</p>
            </div>
            <div className="grid gap-4">
                {inventory.length > 0 ? inventory.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">{item.sku?.size || 'Default'} / {item.sku?.color || 'Default'}</p>
                        <h2 className="mt-2 font-black text-slate-900">{item.sku?.product?.name || 'Product'}</h2>
                        <p className="mt-2 text-sm font-bold text-slate-600">Local stock: {item.stock_quantity}</p>
                        {item.stock_quantity <= (item.low_stock_threshold || 10) && <p className="mt-2 text-xs font-black uppercase tracking-widest text-amber-600">Low stock warning</p>}
                    </div>
                )) : <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center font-semibold text-slate-400">No local inventory yet. Request stock from Buy Stock.</div>}
            </div>
        </AdminLayout>
    );
}
