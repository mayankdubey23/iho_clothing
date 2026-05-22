import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard, Banknote, Store, Wallet, RefreshCcw, Search,
    MoreVertical, CheckCircle2, AlertCircle, Clock
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Payments({ tabData, activeTab, stats, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [openActionMenu, setOpenActionMenu] = useState(null);

    const tabs = [
        { id: 'customer', label: 'D2C Payments', icon: CreditCard },
        { id: 'franchise', label: 'B2B Franchise Payments', icon: Store },
        { id: 'pending', label: 'Pending / COD', icon: Clock },
        { id: 'wallets', label: 'Wallet Ledger', icon: Wallet },
        { id: 'refunds', label: 'Refunds', icon: RefreshCcw },
    ];

    const switchTab = (tabId) => {
        setSearch('');
        router.get('/franchise-superadmin/payments', { tab: tabId }, { preserveState: true, preserveScroll: true });
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') router.get('/franchise-superadmin/payments', { tab: activeTab, search }, { preserveState: true });
    };

    const updateStatus = (id, newStatus, type) => {
        if (confirm(`Mark this payment as ${newStatus}?`)) {
            router.post(`/franchise-superadmin/payments/${id}/status`, { status: newStatus, type }, { preserveScroll: true, onSuccess: () => setOpenActionMenu(null) });
        }
    };

    // Styling configurations
    const statusColors = {
        'Paid': 'bg-green-50 text-green-700 border-green-200',
        'Pending': 'bg-orange-50 text-orange-600 border-orange-200',
        'COD Pending': 'bg-yellow-50 text-yellow-700 border-yellow-200',
        'Failed': 'bg-red-50 text-red-600 border-red-200',
        'Refunded': 'bg-gray-100 text-gray-600 border-gray-300',
    };

    return (
        <AdminLayout active="payments"> {/* Ensure 'payments' is added to your AdminLayout navItems */}
            <Head title="Financial Ledger | Super Admin" />

            <div className="max-w-[1600px] mx-auto pb-20 pt-6 px-4 sm:px-6">

                {/* 🚀 HEADER */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter flex items-center gap-3">
                        <Banknote className="text-[#E94E3C]" /> Global Financial Ledger
                    </h1>
                    <p className="text-gray-500 font-bold text-sm mt-1">Track D2C sales, B2B settlements, and COD collections.</p>
                </div>

                {/* 🚀 FINANCIAL STATS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <StatCard title="Total Online Sales (Paid)" value={`₹${Number(stats.total_online).toLocaleString()}`} icon={CreditCard} color="text-green-500" />
                    <StatCard title="B2B Franchise Revenue" value={`₹${Number(stats.franchise_revenue).toLocaleString()}`} icon={Store} color="text-blue-500" />
                    <StatCard title="Awaiting COD Collection" value={`₹${Number(stats.pending_cod).toLocaleString()}`} icon={Banknote} color="text-orange-500" alert={stats.pending_cod > 0} />
                </div>

                {/* 🚀 TAB NAVIGATION */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-6 overflow-x-auto custom-scrollbar">
                    <div className="flex items-center gap-2 min-w-max">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button key={tab.id} onClick={() => switchTab(tab.id)} className={`relative flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isActive ? 'text-[#1A1A2E] bg-gray-50' : 'text-gray-400 hover:bg-gray-50'}`}>
                                    <Icon size={16} className={isActive ? 'text-[#E94E3C]' : ''} />
                                    {tab.label}
                                    {isActive && <motion.div layoutId="activePayTab" className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#E94E3C] rounded-t-full" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 🚀 SEARCH BAR */}
                <div className="relative mb-6">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search Transaction ID or Name..." value={search} onChange={e => setSearch(e.target.value)} onKeyPress={handleSearch} className="w-full bg-white shadow-sm border border-gray-100 rounded-2xl pl-12 pr-4 py-4 font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none" />
                </div>

                {/* 🚀 DYNAMIC DATA TABLE */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-visible min-h-[400px]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50 text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-5 whitespace-nowrap">Transaction ID</th>
                                    <th className="px-6 py-5 whitespace-nowrap">Source / Payer</th>
                                    <th className="px-6 py-5 whitespace-nowrap">Amount & Method</th>
                                    <th className="px-6 py-5 whitespace-nowrap">Status</th>
                                    <th className="px-6 py-5 whitespace-nowrap text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">

                                {/* RENDER CUSTOMER OR PENDING PAYMENTS */}
                                {(activeTab === 'customer' || activeTab === 'pending') && tabData?.data?.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="font-black text-[#1A1A2E] text-sm">{payment.transaction_id || `ORD-${payment.order_id}`}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{new Date(payment.created_at).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-[#1A1A2E] text-sm">{payment.customer_name || 'Guest User'}</p>
                                            <p className="text-[10px] font-bold text-gray-400">D2C Order</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-black text-[#1A1A2E]">₹{Number(payment.amount).toLocaleString()}</p>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1 mt-1">
                                                {payment.method === 'Online' ? <CreditCard size={10} /> : <Banknote size={10} />} {payment.method}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] border px-3 py-1.5 rounded-md font-black tracking-wider uppercase inline-flex items-center gap-1 shadow-sm ${statusColors[payment.status] || 'bg-gray-100'}`}>
                                                {payment.status === 'Paid' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />} {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right relative">
                                            <button onClick={() => setOpenActionMenu(openActionMenu === payment.id ? null : payment.id)} className="p-2 text-gray-400 hover:text-[#1A1A2E] hover:bg-gray-100 rounded-xl transition-colors">
                                                <MoreVertical size={20} />
                                            </button>
                                            <AnimatePresence>
                                                {openActionMenu === payment.id && (
                                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-12 top-2 w-48 bg-white border border-gray-100 shadow-xl rounded-2xl z-50 overflow-hidden text-left">
                                                        <div className="p-2 space-y-1">
                                                            {(payment.status === 'Pending' || payment.status === 'COD Pending') && (
                                                                <button onClick={() => updateStatus(payment.id, 'Paid', 'customer')} className="block w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-widest text-green-600 hover:bg-green-50 rounded-xl transition-colors">Mark as Paid</button>
                                                            )}
                                                            <button onClick={() => alert('Refund logic pending')} className="block w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl transition-colors">Issue Refund</button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </td>
                                    </tr>
                                ))}

                                {/* RENDER FRANCHISE PAYMENTS */}
                                {activeTab === 'franchise' && tabData?.data?.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-black text-[#1A1A2E] text-sm">{payment.reference_number || `B2B-${payment.id}`}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{new Date(payment.created_at).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-[#1A1A2E] text-sm flex items-center gap-1"><Store size={14} className="text-[#E94E3C]" /> {payment.franchise_name}</p>
                                            <p className="text-[10px] font-bold text-gray-400">{payment.type}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-black text-[#1A1A2E]">₹{Number(payment.amount).toLocaleString()}</p>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">{payment.method}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] border px-3 py-1.5 rounded-md font-black tracking-wider uppercase shadow-sm ${statusColors[payment.status] || 'bg-gray-100'}`}>{payment.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {payment.status === 'Pending' && (
                                                <button onClick={() => updateStatus(payment.id, 'Paid', 'franchise')} className="px-3 py-2 bg-[#1A1A2E] text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#E94E3C] transition-colors">Verify Receipt</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                {/* RENDER WALLET TRANSACTIONS */}
                                {activeTab === 'wallets' && tabData?.data?.map((txn) => (
                                    <tr key={txn.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-black text-[#1A1A2E] text-sm">WTXN-{txn.id}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{new Date(txn.created_at).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-[#1A1A2E] text-sm">{txn.user_name}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">{txn.role}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className={`font-black ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                                {txn.type === 'credit' ? '+' : '-'} ₹{Number(txn.amount).toLocaleString()}
                                            </p>
                                        </td>
                                        <td colSpan="2" className="px-6 py-4">
                                            <p className="text-xs font-bold text-gray-600">{txn.description}</p>
                                        </td>
                                    </tr>
                                ))}

                                {/* EMPTY STATE */}
                                {tabData?.data?.length === 0 && (
                                    <tr><td colSpan="5" className="px-6 py-16 text-center"><Banknote size={48} className="mx-auto text-gray-300 mb-4" strokeWidth={1} /><p className="text-[#1A1A2E] font-black text-lg">No Financial Records</p></td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}

// 💎 Helper Component
function StatCard({ title, value, icon: Icon, color, alert }) {
    return (
        <div className={`bg-white p-6 rounded-3xl border ${alert ? 'border-orange-200 shadow-orange-500/10' : 'border-gray-100 shadow-black/5'} shadow-sm flex items-center justify-between`}>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{title}</p>
                <h4 className="text-3xl font-black text-[#1A1A2E]">{value}</h4>
            </div>
            <div className={`size-14 rounded-2xl flex items-center justify-center ${alert ? 'bg-orange-50' : 'bg-gray-50'} ${color}`}><Icon size={24} strokeWidth={2.5} /></div>
        </div>
    );
}