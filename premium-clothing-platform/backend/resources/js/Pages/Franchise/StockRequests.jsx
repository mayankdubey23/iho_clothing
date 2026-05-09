import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function StockRequests({ requests = [] }) {
    return (
        <AdminLayout active="stock-requests">
            <Head title="My Stock Requests" />
            <h1 className="mb-8 text-3xl font-black text-slate-900">My Stock Requests</h1>
            <div className="grid gap-4">
                {requests.length > 0 ? requests.map((request) => (
                    <div key={request.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Request #{request.id}</p>
                        <h2 className="mt-1 font-black text-slate-900">{request.sku?.product?.name || 'SKU'} x {request.quantity}</h2>
                        <p className="mt-1 text-sm font-semibold capitalize text-slate-500">{request.status}</p>
                    </div>
                )) : <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center font-semibold text-slate-400">No stock requests yet.</div>}
            </div>
        </AdminLayout>
    );
}
