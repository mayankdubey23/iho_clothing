import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Ticket, Trash2, Plus } from 'lucide-react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Coupons({ coupons }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        type: 'percent',
        value: '',
        min_cart_amount: '0',
        expires_at: '',
        is_active: true
    });

    const submit = (e) => {
        e.preventDefault();
        post('/franchise-superadmin/coupons', {
            onSuccess: () => reset()
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this coupon?')) {
            router.delete(`/franchise-superadmin/coupons/${id}`);
        }
    };

    return (
        <AdminLayout active="coupons">
            <Head title="Coupons | Admin" />
            
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                    <Ticket className="text-blue-600" size={32} />
                    Discount Coupons
                </h1>
                <p className="text-slate-500 mt-1">Create and manage promo codes for your customers.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Coupon Form */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-max">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Plus size={20} className="text-blue-600" /> Add New Coupon
                    </h2>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Coupon Code</label>
                            <input type="text" placeholder="e.g. FESTIVAL20" className="w-full border border-slate-300 rounded-lg px-3 py-2 uppercase" value={data.code} onChange={e => setData('code', e.target.value)} required />
                            {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Type</label>
                                <select className="w-full border border-slate-300 rounded-lg px-3 py-2" value={data.type} onChange={e => setData('type', e.target.value)}>
                                    <option value="percent">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount (₹)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Value</label>
                                <input type="number" className="w-full border border-slate-300 rounded-lg px-3 py-2" value={data.value} onChange={e => setData('value', e.target.value)} required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Min Cart Amount (₹)</label>
                            <input type="number" className="w-full border border-slate-300 rounded-lg px-3 py-2" value={data.min_cart_amount} onChange={e => setData('min_cart_amount', e.target.value)} required />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Expiry Date (Optional)</label>
                            <input type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2" value={data.expires_at} onChange={e => setData('expires_at', e.target.value)} />
                        </div>

                        <button disabled={processing} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50">
                            Generate Coupon
                        </button>
                    </form>
                </div>

                {/* Coupons List Table */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Code</th>
                                    <th className="px-6 py-4 font-bold">Discount</th>
                                    <th className="px-6 py-4 font-bold">Min Cart</th>
                                    <th className="px-6 py-4 font-bold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {coupons.length > 0 ? (
                                    coupons.map(coupon => (
                                        <tr key={coupon.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 font-black text-blue-600 text-lg tracking-wider">
                                                {coupon.code}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-800">
                                                {coupon.type === 'percent' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-sm">
                                                ₹{coupon.min_cart_amount}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button onClick={() => handleDelete(coupon.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No coupons active right now.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
