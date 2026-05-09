import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function History({ history }) {
    const rows = history?.data || [];
    return (
        <AdminLayout active="inventory">
            <Head title="Inventory History" />
            <h1 className="mb-8 text-3xl font-black text-slate-900">Inventory History</h1>
            <div className="grid gap-3">
                {rows.map((entry) => (
                    <div key={entry.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="font-black text-slate-900">{entry.sku?.product?.name || 'SKU'} · {entry.transaction_type}</p>
                        <p className="mt-1 text-sm font-semibold text-slate-500">{entry.reason}</p>
                        <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">Qty {entry.quantity}</p>
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
}
