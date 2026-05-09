import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Settings() {
    const { auth } = usePage().props;
    const user = auth?.user || {};
    const { data, setData, patch, processing, errors } = useForm({
        store_name: user.store_name || '',
        store_address: user.store_address || '',
        store_contact: user.store_contact || '',
        business_hours: user.business_hours || '',
        serviceable_pincodes: Array.isArray(user.serviceable_pincodes) ? user.serviceable_pincodes.join(', ') : '',
    });

    const submit = (event) => {
        event.preventDefault();
        patch('/franchise-admin/settings', { preserveScroll: true });
    };

    return (
        <AdminLayout active="settings">
            <Head title="Store Settings | Franchise" />
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900">Store Settings</h1>
                <p className="mt-1 text-sm font-medium text-slate-500">Manage your physical store, local contact, hours, and online order pincodes.</p>
            </div>
            <form onSubmit={submit} className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid gap-4">
                    <Field label="Store Name" error={errors.store_name}><input value={data.store_name} onChange={(e) => setData('store_name', e.target.value)} className="input" /></Field>
                    <Field label="Store Address" error={errors.store_address}><input value={data.store_address} onChange={(e) => setData('store_address', e.target.value)} className="input" /></Field>
                    <Field label="Store Contact" error={errors.store_contact}><input value={data.store_contact} onChange={(e) => setData('store_contact', e.target.value)} className="input" /></Field>
                    <Field label="Business Hours" error={errors.business_hours}><input value={data.business_hours} onChange={(e) => setData('business_hours', e.target.value)} placeholder="Mon-Sat, 10 AM - 8 PM" className="input" /></Field>
                    <Field label="Serviceable Pincodes" error={errors.serviceable_pincodes}><input value={data.serviceable_pincodes} onChange={(e) => setData('serviceable_pincodes', e.target.value)} placeholder="110001, 201309" className="input" /></Field>
                </div>
                <button disabled={processing} className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-700 disabled:opacity-60">
                    {processing ? 'Saving...' : 'Save Settings'}
                </button>
            </form>
        </AdminLayout>
    );
}

function Field({ label, error, children }) {
    return <label className="grid gap-1.5 text-sm font-bold text-slate-700">{label}{children}{error && <span className="text-xs text-red-600">{error}</span>}</label>;
}
