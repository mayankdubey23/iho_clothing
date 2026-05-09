import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function FranchiseStock({ franchise, stock }) {
    const rows = stock?.data || [];
    return (
        <AdminLayout active="inventory">
            <Head title="Franchise Stock" />
            <h1 className="mb-2 text-3xl font-black text-slate-900">{franchise?.name} Stock</h1>
            <p className="mb-8 text-sm font-semibold text-slate-500">{franchise?.email}</p>
            <div className="grid gap-4">
                {rows.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="font-black text-slate-900">{item.sku?.product?.name || 'Product'}</p>
                        <p className="mt-1 text-sm font-bold text-slate-600">Stock: {item.stock_quantity}</p>
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
}
