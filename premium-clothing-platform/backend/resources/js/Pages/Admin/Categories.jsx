import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Plus, X } from 'lucide-react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Categories({ categories }) {
    const [showModal, setShowModal] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        name: '', slug: '', is_active: true
    });

    const submitCategory = (e) => {
        e.preventDefault();
        post('/admin/categories', {
            onSuccess: () => { setShowModal(false); reset(); }
        });
    };

    return (
        <AdminLayout active="categories">
            <Head title="Categories | Admin" />
            
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">Categories</h1>
                    <p className="text-slate-500 mt-1">Manage clothing categories.</p>
                </div>
                <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-md shadow-blue-500/30 flex items-center gap-2 transition">
                    <Plus size={20} /> Add Category
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-4xl">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-bold">Category Name</th>
                            <th className="px-6 py-4 font-bold">Slug</th>
                            <th className="px-6 py-4 font-bold text-center">Total Products</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {categories.map(category => (
                            <tr key={category.id} className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4 font-bold text-slate-900">{category.name}</td>
                                <td className="px-6 py-4 text-slate-500">{category.slug}</td>
                                <td className="px-6 py-4 font-black text-blue-600 text-center">{category.products_count || 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
                            <h3 className="font-bold text-lg">Add Category</h3>
                            <button onClick={() => setShowModal(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={submitCategory} className="p-6">
                            <div className="grid gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Name</label>
                                    <input required className="w-full border-slate-300 border p-3 rounded-lg" value={data.name} onChange={e => setData('name', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Slug</label>
                                    <input required className="w-full border-slate-300 border p-3 rounded-lg" value={data.slug} onChange={e => setData('slug', e.target.value)} />
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end gap-3">
                                <button type="submit" disabled={processing} className="w-full py-3 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700">Save Category</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}