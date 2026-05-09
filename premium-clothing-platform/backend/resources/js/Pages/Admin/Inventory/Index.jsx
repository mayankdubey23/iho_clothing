import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Index({ skus }) {
    const rows = skus?.data || [];
    return (
        <AdminLayout active="inventory">
            <Head title="Inventory | Admin" />
            <h1 className="mb-8 text-3xl font-black text-slate-900">Inventory</h1>
            <div className="grid gap-4">
                {rows.map((sku) => (
                    <div key={sku.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="font-black text-slate-900">{sku.product?.name || `SKU #${sku.id}`}</p>
                        <p className="mt-1 text-sm font-semibold text-slate-500">{sku.name || [sku.size, sku.color].filter(Boolean).join(' / ') || 'Default SKU'}</p>
                        <p className="mt-2 text-sm font-bold text-slate-700">Master stock: {sku.inventory?.stock_quantity || 0}</p>
                    </div>
                ))}
                {rows.length === 0 && <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center font-semibold text-slate-400">No inventory records.</div>}
            </div>
        </AdminLayout>
    );
}
