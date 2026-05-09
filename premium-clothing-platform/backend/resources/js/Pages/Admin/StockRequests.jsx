import React from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function StockRequests({ requests = [] }) {
    return (
        <AdminLayout active="stock-requests">
            <Head title="Stock Requests | Admin" />
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900">Stock Requests</h1>
                <p className="mt-1 text-sm font-medium text-slate-500">Approve franchise inventory requests.</p>
            </div>
            <div className="grid gap-4">
                {requests.length > 0 ? requests.map((request) => (
                    <div key={request.id} className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Request #{request.id}</p>
                            <h2 className="mt-1 font-black text-slate-900">{request.sku?.product?.name || 'SKU'} x {request.quantity}</h2>
                            <p className="mt-1 text-sm font-semibold text-slate-500">{request.franchise?.name || 'Franchise'} · {request.status}</p>
                        </div>
                        {request.status === 'pending' && (
                            <button onClick={() => router.patch(`/franchise-superadmin/stock-requests/${request.id}/approve`)} className="rounded-xl bg-blue-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-700">
                                Approve
                            </button>
                        )}
                    </div>
                )) : <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center font-semibold text-slate-400">No stock requests.</div>}
            </div>
        </AdminLayout>
    );
}
