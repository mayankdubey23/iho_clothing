import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import {
    PackagePlus, ShoppingCart, Clock,
    Package, Send, Trash2, Plus, AlertCircle
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function BuyStock({ requests, masterProducts = [] }) {
    const [cart, setCart] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [localError, setLocalError] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        items: []
    });

    // 🚀 Add item to local cart before submitting
    const addToCart = () => {
        setLocalError('');

        if (!selectedProduct) {
            setLocalError('Please select a product from the catalog.');
            return;
        }
        if (quantity < 1) {
            setLocalError('Quantity must be at least 1.');
            return;
        }

        const productDetails = masterProducts.find(p => p.id === parseInt(selectedProduct));

        if (!productDetails) {
            setLocalError('Product not found.');
            return;
        }

        const newItem = {
            product_id: parseInt(selectedProduct),
            name: productDetails.name,
            quantity: parseInt(quantity)
        };

        // Check if product already in cart, just update quantity
        const existingIndex = cart.findIndex(item => item.product_id === newItem.product_id);
        let newCart = [...cart];

        if (existingIndex >= 0) {
            newCart[existingIndex].quantity += newItem.quantity;
        } else {
            newCart.push(newItem);
        }

        setCart(newCart);
        setData('items', newCart);

        // Reset inputs
        setSelectedProduct('');
        setQuantity(1);
    };

    // 🚀 Remove item from Cart
    const removeFromCart = (index) => {
        const newCart = cart.filter((_, i) => i !== index);
        setCart(newCart);
        setData('items', newCart);
    };

    // 🚀 Submit Request to Laravel Backend
    const submitRequest = (e) => {
        e.preventDefault();

        if (cart.length === 0) {
            setLocalError('Your draft request is empty. Add items first.');
            return;
        }

        post('/franchise/stock-requests', {
            preserveScroll: true,
            onSuccess: () => {
                setCart([]);
                reset('items');
                setLocalError('');
                alert("Stock Request Sent to Master Warehouse Successfully! 📦");
            }
        });
    };

    // 🎨 Status Badge Colors
    const getStatusColor = (status) => {
        switch (String(status || '').toLowerCase()) {
            case 'pending': return 'bg-orange-50 text-orange-600 border-orange-200';
            case 'approved': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'delivered': return 'bg-green-50 text-green-600 border-green-200';
            case 'rejected': return 'bg-red-50 text-red-600 border-red-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    return (
        <AdminLayout active="inventory">
            <Head title="Buy Stock | IHO Franchise" />

            <div className="max-w-[1600px] mx-auto pb-20 pt-6 px-4 sm:px-6">

                {/* 🚀 HEADER */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter flex items-center gap-3">
                        <PackagePlus className="text-[#E94E3C]" size={32} /> Buy Stock
                    </h1>
                    <p className="text-gray-500 font-bold text-sm mt-1">Request fresh inventory from the Master Warehouse.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* 🚀 LEFT: CREATE NEW REQUEST FORM */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-black text-[#1A1A2E] uppercase tracking-widest mb-4 flex items-center gap-2">
                                <ShoppingCart size={18} /> Draft Request
                            </h3>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Product</label>
                                    <select
                                        value={selectedProduct}
                                        onChange={e => setSelectedProduct(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none cursor-pointer"
                                    >
                                        <option value="">-- Choose from Catalog --</option>
                                        {masterProducts && masterProducts.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={e => setQuantity(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none"
                                    />
                                </div>

                                {localError && (
                                    <div className="flex items-start gap-2 text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
                                        <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{localError}</span>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={addToCart}
                                    className="w-full bg-indigo-50 text-indigo-600 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-center gap-2 active:scale-95"
                                >
                                    <Plus size={16} /> Add to List
                                </button>
                            </div>

                            {/* CART PREVIEW */}
                            {cart.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selected Items ({cart.length})</p>
                                        <button onClick={() => { setCart([]); setData('items', []) }} className="text-[9px] font-bold text-red-400 hover:text-red-600 uppercase">Clear All</button>
                                    </div>

                                    <div className="space-y-2 mb-6 max-h-[250px] overflow-y-auto pr-1">
                                        {cart.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100 group hover:border-gray-300 transition-colors">
                                                <div>
                                                    <p className="font-bold text-[#1A1A2E] text-xs">{item.name}</p>
                                                    <p className="text-[10px] font-black text-gray-500 uppercase mt-0.5">Qty: {item.quantity}</p>
                                                </div>
                                                <button onClick={() => removeFromCart(idx)} className="text-gray-300 hover:text-red-500 transition-colors p-2">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Backend Validation Errors */}
                                    {errors.items && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-3 text-center">{errors.items}</p>}

                                    <button
                                        disabled={processing}
                                        onClick={submitRequest}
                                        className="w-full bg-[#1A1A2E] text-white py-3.5 rounded-xl font-black uppercase tracking-widest hover:bg-[#E94E3C] transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
                                    >
                                        <Send size={16} /> {processing ? 'Sending Request...' : 'Submit Request'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 🚀 RIGHT: REQUEST HISTORY */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="font-black text-[#1A1A2E] uppercase tracking-widest flex items-center gap-2">
                                    <Clock size={18} /> Request History
                                </h3>
                            </div>

                            <div className="overflow-x-auto flex-1">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-white text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-5 whitespace-nowrap">Request ID & Date</th>
                                            <th className="px-6 py-5">Requested Items</th>
                                            <th className="px-6 py-5 whitespace-nowrap">Admin Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {requests?.data?.map((req) => (
                                            <tr key={req.id} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <p className="font-black text-[#1A1A2E] text-sm">{req.request_number || `#REQ-${req.id}`}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                                                        {new Date(req.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {req.items?.map((item, i) => (
                                                            <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md font-bold border border-gray-200">
                                                                {item.product_name || item.product?.name} <span className="text-gray-400 px-1">×</span> {item.requested_qty || item.quantity}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`text-[10px] border px-3 py-1.5 rounded-md font-black tracking-wider uppercase inline-flex items-center gap-1.5 ${getStatusColor(req.status)}`}>
                                                        {req.status || 'Pending'}
                                                    </span>
                                                    {req.admin_notes && (
                                                        <p className="text-[9px] font-bold text-gray-500 mt-2 max-w-[200px] truncate" title={req.admin_notes}>
                                                            Note: {req.admin_notes}
                                                        </p>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}

                                        {/* Empty State */}
                                        {(!requests?.data || requests.data.length === 0) && (
                                            <tr>
                                                <td colSpan="3" className="px-6 py-24 text-center">
                                                    <Package size={48} className="mx-auto text-gray-200 mb-4" strokeWidth={1} />
                                                    <p className="text-[#1A1A2E] font-black text-lg">No Requests Made</p>
                                                    <p className="text-gray-400 text-sm font-bold mt-1">Your stock request history will appear here.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AdminLayout>
    );
}