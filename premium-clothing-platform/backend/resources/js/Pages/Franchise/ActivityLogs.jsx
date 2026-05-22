import React from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Activity, ShoppingBag, PackageSearch, User,
    ShieldCheck, LifeBuoy, Download, LogIn, Filter
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function ActivityLogs({ logs, filters }) {

    const updateFilter = (e) => {
        router.get('/franchise/activity-logs', { module: e.target.value }, { preserveState: true });
    };

    // Helper to pick the right icon based on the Module
    const getLogStyle = (module) => {
        switch (module) {
            case 'Orders': return { icon: ShoppingBag, color: 'text-indigo-500', bg: 'bg-indigo-50' };
            case 'Inventory': return { icon: PackageSearch, color: 'text-orange-500', bg: 'bg-orange-50' };
            case 'Profile': return { icon: User, color: 'text-blue-500', bg: 'bg-blue-50' };
            case 'Support': return { icon: LifeBuoy, color: 'text-pink-500', bg: 'bg-pink-50' };
            case 'Reports': return { icon: Download, color: 'text-purple-500', bg: 'bg-purple-50' };
            case 'Auth': return { icon: LogIn, color: 'text-green-500', bg: 'bg-green-50' };
            default: return { icon: ShieldCheck, color: 'text-gray-500', bg: 'bg-gray-100' };
        }
    };

    return (
        <AdminLayout active="logs">
            <Head title="Activity Logs | IHO Franchise" />

            <div className="max-w-[1200px] mx-auto pb-20 pt-6 px-4 sm:px-6">

                {/* 🚀 HEADER & FILTER */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter flex items-center gap-3">
                            <Activity className="text-[#E94E3C]" size={32} /> Audit Trail
                        </h1>
                        <p className="text-gray-500 font-bold text-sm mt-1">Track your account activity, actions, and system logs.</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-2 flex items-center gap-2 shadow-sm w-full md:w-auto">
                        <Filter size={18} className="text-gray-400 ml-2" />
                        <select
                            value={filters.module}
                            onChange={updateFilter}
                            className="bg-transparent border-none text-sm font-bold text-[#1A1A2E] focus:ring-0 outline-none cursor-pointer py-2 pr-8"
                        >
                            <option value="All">All Activities</option>
                            <option value="Orders">Orders</option>
                            <option value="Inventory">Inventory & Stock</option>
                            <option value="Support">Support Tickets</option>
                            <option value="Profile">Profile & Settings</option>
                            <option value="Auth">Login & Security</option>
                        </select>
                    </div>
                </div>

                {/* 🚀 TIMELINE VIEW */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
                    {logs?.data?.length > 0 ? (
                        <div className="relative border-l-2 border-gray-100 ml-4 space-y-8 pb-4">
                            {logs.data.map((log) => {
                                const { icon: Icon, color, bg } = getLogStyle(log.module);
                                return (
                                    <div key={log.id} className="relative pl-8">
                                        {/* Timeline Dot/Icon */}
                                        <div className={`absolute -left-[21px] top-0 size-10 rounded-full border-4 border-white flex items-center justify-center ${bg} ${color} shadow-sm`}>
                                            <Icon size={16} strokeWidth={2.5} />
                                        </div>

                                        {/* Log Content */}
                                        <div className="bg-gray-50/50 border border-gray-100 p-4 rounded-2xl hover:bg-white hover:shadow-md transition-all">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                                                <div>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${bg} ${color}`}>
                                                        {log.module}
                                                    </span>
                                                    <h4 className="font-black text-[#1A1A2E] text-sm mt-2">{log.action}</h4>
                                                </div>
                                                <div className="text-left sm:text-right">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                        {new Date(log.created_at).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                                                        {new Date(log.created_at).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-sm font-medium text-gray-600">{log.description}</p>

                                            {/* IP Address (Optional Security Data) */}
                                            {log.ip_address && (
                                                <p className="text-[9px] font-black text-gray-300 mt-3 flex items-center gap-1 uppercase tracking-widest">
                                                    <ShieldCheck size={10} /> IP: {log.ip_address}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-16 text-center">
                            <Activity size={48} className="mx-auto text-gray-300 mb-4" strokeWidth={1} />
                            <h3 className="text-[#1A1A2E] font-black text-lg uppercase">No Activity Found</h3>
                            <p className="text-gray-500 text-sm font-bold mt-1">Actions performed by your account will appear here.</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {logs?.links?.length > 3 && (
                        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
                            <p className="text-xs font-bold text-gray-400">Page {logs.current_page} of {logs.last_page}</p>
                        </div>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
}