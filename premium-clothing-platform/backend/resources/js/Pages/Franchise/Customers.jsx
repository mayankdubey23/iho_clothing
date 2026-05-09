import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Customers({ customers = [] }) {
    return (
        <AdminLayout active="customers">
            <Head title="Franchise Customers" />
            <h1 className="mb-8 text-3xl font-black text-slate-900">My Customers</h1>
            <div className="grid gap-4">
                {customers.length > 0 ? customers.map((customer, index) => (
                    <div key={`${customer.customer_email}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="font-black text-slate-900">{customer.customer_name}</p>
                        <p className="mt-1 text-sm font-semibold text-slate-500">{customer.customer_email}</p>
                        <p className="text-sm text-slate-400">{customer.customer_phone}</p>
                    </div>
                )) : <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center font-semibold text-slate-400">No customers yet.</div>}
            </div>
        </AdminLayout>
    );
}
