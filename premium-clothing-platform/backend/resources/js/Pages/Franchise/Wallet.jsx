import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Wallet({ stats = {} }) {
    return (
        <AdminLayout active="wallet">
            <Head title="Wallet | Franchise" />
            <h1 className="mb-8 text-3xl font-black text-slate-900">Wallet</h1>
            <div className="grid gap-4 md:grid-cols-3">
                <Tile label="Balance" value={stats.balance} />
                <Tile label="Total Earned" value={stats.total_earned} />
                <Tile label="Pending Dues" value={stats.pending_dues} />
            </div>
        </AdminLayout>
    );
}

function Tile({ label, value }) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</p><p className="mt-3 text-3xl font-black text-slate-900">Rs {Number(value || 0).toLocaleString('en-IN')}</p></div>;
}
