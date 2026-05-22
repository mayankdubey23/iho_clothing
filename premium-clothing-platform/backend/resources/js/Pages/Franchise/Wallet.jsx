import React from 'react';
import { Head } from '@inertiajs/react';
import {
    Wallet as WalletIcon, IndianRupee, TrendingUp, TrendingDown,
    Receipt, Clock, ShieldCheck, ArrowUpRight, ArrowDownRight,
    FileText, CheckCircle2, History
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Wallet({ wallet, metrics, transactions, payments, invoices }) {

    return (
        <AdminLayout active="wallet">
            <Head title="Payments & Wallet | IHO Franchise" />

            <div className="max-w-[1600px] mx-auto pb-20 pt-6 px-4 sm:px-6">

                {/* 🚀 HEADER & SECURITY NOTICE */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter flex items-center gap-3">
                            <WalletIcon className="text-[#E94E3C]" size={32} /> Financial Ledger
                        </h1>
                        <p className="text-gray-500 font-bold text-sm mt-1">Track your wallet balance, profit margins, and B2B settlements securely.</p>
                    </div>
                    <div className="bg-green-50 border border-green-100 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
                        <ShieldCheck size={18} className="text-green-600" />
                        <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">End-to-End Encrypted Ledger</p>
                    </div>
                </div>

                {/* 🚀 FINANCIAL METRICS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Wallet Balance Card (Prominent) */}
                    <div className="bg-[#1A1A2E] text-white p-6 rounded-3xl shadow-xl shadow-black/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Available Wallet Balance</p>
                        <h4 className="text-4xl font-black text-white flex items-center gap-1">
                            ₹{Number(wallet.balance).toLocaleString()}
                        </h4>
                        <div className="mt-4 flex gap-4 border-t border-white/10 pt-4">
                            <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase">Total Earned</p>
                                <p className="text-sm font-black text-green-400">₹{Number(wallet.total_earned).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase">Total Spent</p>
                                <p className="text-sm font-black text-red-400">₹{Number(wallet.total_spent).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <MetricCard title="Gross Sales (B2C)" value={`₹${Number(metrics.totalSales).toLocaleString()}`} icon={TrendingUp} color="text-green-500" />
                    <MetricCard title="Est. Profit Margin" value={`₹${Number(metrics.totalProfit).toLocaleString()}`} icon={IndianRupee} color="text-indigo-500" />
                    <MetricCard title="Pending Dues to Admin" value={`₹${Number(metrics.pendingDues).toLocaleString()}`} icon={Clock} color="text-orange-500" alert={metrics.pendingDues > 0} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* 🚀 LEFT: PASSBOOK (TRANSACTION LEDGER) */}
                    <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="font-black text-[#1A1A2E] uppercase tracking-widest flex items-center gap-2">
                                <History size={18} /> Wallet Passbook
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-white text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-5">Date & Ref</th>
                                        <th className="px-6 py-5">Description</th>
                                        <th className="px-6 py-5 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {transactions?.data?.map((txn) => (
                                        <tr key={txn.id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">{new Date(txn.created_at).toLocaleDateString()}</p>
                                                <p className="font-black text-[#1A1A2E] text-xs">{txn.reference_type}: {txn.reference_id}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-[#1A1A2E] text-sm">{txn.description}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`text-sm font-black flex items-center justify-end gap-1 ${txn.type === 'Credit' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {txn.type === 'Credit' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                                                    {txn.type === 'Credit' ? '+' : '-'}₹{Number(txn.amount).toLocaleString()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!transactions?.data || transactions.data.length === 0) && (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-16 text-center">
                                                <Receipt size={48} className="mx-auto text-gray-300 mb-4" strokeWidth={1} />
                                                <p className="text-[#1A1A2E] font-black text-lg">No Transactions Yet</p>
                                                <p className="text-gray-500 text-sm font-bold mt-1">Your wallet activity will appear here.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 🚀 RIGHT: PAYMENTS TO ADMIN & INVOICES */}
                    <div className="space-y-8">

                        {/* Payments to Admin */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="font-black text-[#1A1A2E] uppercase tracking-widest text-xs flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-green-500" /> Recent Settlements
                                </h3>
                            </div>
                            <div className="p-2">
                                {payments?.length > 0 ? payments.map((pay) => (
                                    <div key={pay.id} className="p-4 flex justify-between items-center border-b border-gray-50 last:border-0">
                                        <div>
                                            <p className="font-bold text-[#1A1A2E] text-sm">{pay.type}</p>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(pay.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <p className="font-black text-[#1A1A2E]">₹{Number(pay.amount).toLocaleString()}</p>
                                    </div>
                                )) : (
                                    <div className="p-6 text-center text-gray-400 font-bold text-xs">No settlements recorded yet.</div>
                                )}
                            </div>
                        </div>

                        {/* Invoices Download */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="font-black text-[#1A1A2E] uppercase tracking-widest text-xs flex items-center gap-2">
                                    <FileText size={16} className="text-[#E94E3C]" /> Tax Invoices
                                </h3>
                            </div>
                            <div className="p-2">
                                {invoices?.length > 0 ? invoices.map((inv) => (
                                    <div key={inv.id} className="p-4 flex justify-between items-center border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                                        <div>
                                            <p className="font-bold text-[#1A1A2E] text-sm">{inv.invoice_number}</p>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{inv.reference_type}</p>
                                        </div>
                                        <button className="text-[10px] font-black uppercase tracking-widest bg-gray-100 text-[#1A1A2E] px-3 py-1.5 rounded hover:bg-[#1A1A2E] hover:text-white transition-colors">
                                            Download
                                        </button>
                                    </div>
                                )) : (
                                    <div className="p-6 text-center text-gray-400 font-bold text-xs">No invoices generated yet.</div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}

// 💎 Reusable Components
function MetricCard({ title, value, icon: Icon, color, alert }) {
    return (
        <div className={`bg-white p-6 rounded-3xl border ${alert ? 'border-orange-200 shadow-orange-500/10' : 'border-gray-100 shadow-black/5'} shadow-sm flex items-center justify-between`}>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{title}</p>
                <h4 className="text-3xl font-black text-[#1A1A2E] truncate">{value}</h4>
            </div>
            <div className={`size-14 rounded-2xl flex items-center justify-center ${alert ? 'bg-orange-50' : 'bg-gray-50'} ${color}`}>
                <Icon size={24} strokeWidth={2.5} />
            </div>
        </div>
    );
}