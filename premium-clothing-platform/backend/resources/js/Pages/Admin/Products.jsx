import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Plus, X, Image as ImageIcon } from 'lucide-react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Products({ products, categories }) {
    const [showModal, setShowModal] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        name: '', slug: '', category_id: categories[0]?.id || '',
        base_price: '', franchise_price: '', description: '', is_active: true
    });

    const submitProduct = (e) => {
        e.preventDefault();
        post('/admin/products', {
            onSuccess: () => { setShowModal(false); reset(); alert("Product Added Successfully!"); }
        });
    };

    return (
        <AdminLayout active="products">
            <Head title="Products | Admin" />
            
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">Product Catalog</h1>
                    <p className="text-slate-500 mt-1">Manage all retail and franchise inventory.</p>
                </div>
                <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-md shadow-blue-500/30 flex items-center gap-2 transition">
                    <Plus size={20} /> Add Product
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-bold">Product Name</th>
                            <th className="px-6 py-4 font-bold">Category</th>
                            <th className="px-6 py-4 font-bold">Retail Price</th>
                            <th className="px-6 py-4 font-bold">Franchise Price</th>
                            <th className="px-6 py-4 font-bold text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {products.data.map(product => (
                            <tr key={product.id} className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                        <ImageIcon size={20} />
                                    </div>
                                    <span className="font-bold text-slate-900">{product.name}</span>
                                </td>
                                <td className="px-6 py-4 font-semibold text-slate-600">{product.category?.name}</td>
                                <td className="px-6 py-4 font-black text-slate-900">₹{product.base_price}</td>
                                <td className="px-6 py-4 font-black text-orange-600">₹{product.franchise_price}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-bold">Active</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                        <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
                            <h3 className="font-bold text-lg">Create New Product</h3>
                            <button onClick={() => setShowModal(false)} className="hover:text-slate-300"><X size={24} /></button>
                        </div>
                        <form onSubmit={submitProduct} className="p-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Product Name</label>
                                    <input required className="w-full border-slate-300 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={data.name} onChange={e => setData('name', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">URL Slug</label>
                                    <input required className="w-full border-slate-300 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={data.slug} onChange={e => setData('slug', e.target.value)} placeholder="tshirt-black" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                                    <select className="w-full border-slate-300 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={data.category_id} onChange={e => setData('category_id', e.target.value)}>
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Retail Price (₹)</label>
                                    <input required type="number" className="w-full border-slate-300 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={data.base_price} onChange={e => setData('base_price', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Franchise Price (₹)</label>
                                    <input required type="number" className="w-full border-slate-300 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={data.franchise_price} onChange={e => setData('franchise_price', e.target.value)} />
                                </div>
                            </div>
                            <div className="mt-6">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                                <textarea required className="w-full border-slate-300 border p-3 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 outline-none" value={data.description} onChange={e => setData('description', e.target.value)}></textarea>
                            </div>
                            <div className="mt-8 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-lg font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition">Cancel</button>
                                <button type="submit" disabled={processing} className="px-6 py-3 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition disabled:opacity-50">Save Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}