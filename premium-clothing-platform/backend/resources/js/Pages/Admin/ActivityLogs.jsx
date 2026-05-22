import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Search, ShieldAlert, Monitor, Globe,
    Clock, Database, Eye, X, ChevronRight
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function ActivityLogs({ logs, modules, stats, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [moduleFilter, setModuleFilter] = useState(filters.module || '');
    const [selectedLog, setSelectedLog] = useState(null);

    const applyFilters = () => {
        router.get('/franchise-superadmin/activity-logs', { search, module: moduleFilter }, { preserveState: true });
    };

    const handleKeyPress = (e) => { if (e.key === 'Enter') applyFilters(); };

    return (
        <AdminLayout active="logs">
            <Head title="System Audit Logs | Super Admin" />

            <div className="max-w-[1600px] mx-auto pb-20 pt-6 px-4 sm:px-6">

                {/* 🚀 HEADER & STATS */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter flex items-center gap-3">
                        <ShieldAlert className="text-[#E94E3C]" size={32} /> Master Audit Trail
                    </h1>
                    <p className="text-gray-500 font-bold text-sm mt-1">Immutable record of all staff, order, and system configuration changes.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <StatCard title="Total Actions Recorded" value={stats.total_logs} icon={Database} color="text-blue-500" />
                    <StatCard title="Activity Today" value={stats.logs_today} icon={Activity} color="text-green-500" />
                </div>

                {/* 🚀 FILTERS BAR */}
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-1 w-full relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search Staff Name, Action, or IP Address..." value={search} onChange={e => setSearch(e.target.value)} onKeyPress={handleKeyPress} className="w-full bg-gray-50 border-none rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none" />
                    </div>
                    <select value={moduleFilter} onChange={e => { setModuleFilter(e.target.value); setTimeout(applyFilters, 100); }} className="bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-600 focus:ring-2 focus:ring-[#E94E3C] outline-none cursor-pointer">
                        <option value="">All System Modules</option>
                        {modules.map(mod => <option key={mod} value={mod}>{mod}</option>)}
                    </select>
                </div>

                {/* 🚀 DATA TABLE */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-visible min-h-[400px]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#1A1A2E] text-[10px] uppercase font-black tracking-[0.2em] text-white/70 border-b border-[#1A1A2E]">
                                <tr>
                                    <th className="px-6 py-5">Timestamp & IP</th>
                                    <th className="px-6 py-5">Staff Identity</th>
                                    <th className="px-6 py-5">Module & Action</th>
                                    <th className="px-6 py-5 text-right">Payload</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {logs?.data?.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-black text-[#1A1A2E] text-xs flex items-center gap-1.5"><Clock size={12} className="text-[#E94E3C]" /> {new Date(log.created_at).toLocaleString()}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 flex items-center gap-1"><Globe size={10} /> {log.ip_address || 'Unknown IP'}</p>
                                        </td>

                                        <td className="px-6 py-4">
                                            <p className="font-bold text-[#1A1A2E] text-sm">{log.user_name}</p>
                                            <p className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block mt-1">{log.role || 'Admin'}</p>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1 block">{log.module}</span>
                                            <p className="text-xs font-bold text-gray-700">{log.action}</p>
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            {(log.old_value || log.new_value || log.device_info) ? (
                                                <button onClick={() => setSelectedLog(log)} className="p-2 text-indigo-500 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-1 ml-auto">
                                                    <Eye size={14} /> Inspect Data
                                                </button>
                                            ) : (
                                                <span className="text-[10px] font-bold text-gray-400">No Payload</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {logs?.data?.length === 0 && (
                                    <tr><td colSpan="4" className="px-6 py-16 text-center"><ShieldAlert size={48} className="mx-auto text-gray-300 mb-4" strokeWidth={1} /><p className="text-[#1A1A2E] font-black text-lg">No Audit Logs Found</p></td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* 🚀 MODAL: INSPECT JSON DATA */}
            <AnimatePresence>
                {selectedLog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A2E]/80 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#1A1A2E]">
                                <div>
                                    <h3 className="font-black text-white uppercase tracking-wider flex items-center gap-2"><Database size={18} className="text-[#E94E3C]" /> Data Inspector</h3>
                                    <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">Log ID: {selectedLog.id} • {selectedLog.module}</p>
                                </div>
                                <button onClick={() => setSelectedLog(null)} className="text-white/50 hover:text-white transition-colors"><X size={24} /></button>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1">

                                {/* Device Info */}
                                {selectedLog.device_info && (
                                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-start gap-3">
                                        <Monitor size={18} className="text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Device User-Agent</p>
                                            <p className="text-xs font-bold text-[#1A1A2E] mt-1 break-all">{selectedLog.device_info}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Old vs New Value Comparison */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-red-50/50 rounded-2xl border border-red-100 p-4">
                                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-3 flex items-center gap-1">Previous Data</p>
                                        <pre className="text-[10px] font-mono text-gray-700 whitespace-pre-wrap break-all">
                                            {selectedLog.old_value ? JSON.stringify(JSON.parse(selectedLog.old_value), null, 2) : 'Null / Initial State'}
                                        </pre>
                                    </div>
                                    <div className="bg-green-50/50 rounded-2xl border border-green-100 p-4">
                                        <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-3 flex items-center gap-1">Updated Data</p>
                                        <pre className="text-[10px] font-mono text-gray-700 whitespace-pre-wrap break-all">
                                            {selectedLog.new_value ? JSON.stringify(JSON.parse(selectedLog.new_value), null, 2) : 'Null / Deleted'}
                                        </pre>
                                    </div>
                                </div>

                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </AdminLayout>
    );
}

// 💎 Helper Component
function StatCard({ title, value, icon: Icon, color }) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{title}</p>
                <h4 className="text-3xl font-black text-[#1A1A2E]">{value?.toLocaleString() || 0}</h4>
            </div>
            <div className={`size-14 rounded-2xl flex items-center justify-center bg-gray-50 ${color}`}><Icon size={24} strokeWidth={2.5} /></div>
        </div>
    );
}