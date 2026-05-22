import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    BellRing, Mail, MessageSquare, Send, CheckCircle2,
    Smartphone, History, Clock, Users, Store, AlertCircle
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Notifications({ tabData, activeTab, stats }) {

    const tabs = [
        { id: 'broadcast', label: 'Send Broadcast', icon: Send },
        { id: 'history', label: 'Notification History', icon: History },
        { id: 'email_logs', label: 'Email Logs', icon: Mail },
        { id: 'whatsapp_logs', label: 'WhatsApp & SMS Logs', icon: MessageSquare },
    ];

    const switchTab = (tabId) => {
        router.get('/franchise-superadmin/notifications', { tab: tabId }, { preserveState: true, preserveScroll: true });
    };

    const { data, setData, post, processing, reset, errors } = useForm({
        title: '', message: '', type: 'Offer Alert', target_audience: 'All Customers', channels: ['In-App']
    });

    const handleChannelToggle = (channel) => {
        let newChannels = [...data.channels];
        if (newChannels.includes(channel)) {
            newChannels = newChannels.filter(c => c !== channel);
        } else {
            newChannels.push(channel);
        }
        setData('channels', newChannels);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (confirm(`Ready to blast this to ${data.target_audience} via ${data.channels.join(', ')}?`)) {
            post('/franchise-superadmin/notifications/send', { onSuccess: () => reset() });
        }
    };

    return (
        <AdminLayout active="notifications">
            <Head title="Communication Hub | Super Admin" />

            <div className="max-w-[1600px] mx-auto pb-20 pt-6 px-4 sm:px-6">

                {/* 🚀 HEADER & STATS */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter flex items-center gap-3">
                        <BellRing className="text-[#E94E3C]" size={32} /> Communication Hub
                    </h1>
                    <p className="text-gray-500 font-bold text-sm mt-1">Omnichannel messaging for Franchises and Customers.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <StatCard title="Total Broadcasts Sent" value={stats.total_sent} icon={BellRing} color="text-purple-500" />
                    <StatCard title="WhatsApp Messages Delivered" value={stats.whatsapp_sent} icon={MessageSquare} color="text-green-500" />
                    <StatCard title="Emails Delivered" value={stats.emails_sent} icon={Mail} color="text-blue-500" />
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
                                    {isActive && <motion.div layoutId="activeNotifTab" className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#E94E3C] rounded-t-full" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 🚀 DYNAMIC CONTENT */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-visible min-h-[500px]">

                    {/* TAB: BROADCAST COMPOSER */}
                    {activeTab === 'broadcast' && (
                        <form onSubmit={handleSubmit} className="p-8 max-w-4xl mx-auto space-y-8">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Audience *</label>
                                    <select required value={data.target_audience} onChange={e => setData('target_audience', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none cursor-pointer">
                                        <option value="All Customers">All Customers (B2C)</option>
                                        <option value="All Franchises">All Franchises (B2B)</option>
                                        <option value="Specific User" disabled>Specific User (Coming Soon)</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Notification Type *</label>
                                    <select required value={data.type} onChange={e => setData('type', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none cursor-pointer">
                                        <option value="Offer Alert">Promotional / Offer Alert</option>
                                        <option value="Franchise Announcement">Franchise Announcement</option>
                                        <option value="Stock Alert">Stock / Restock Alert</option>
                                        <option value="Payment Reminder">Payment Reminder</option>
                                        <option value="Order Update">System / Order Update</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Message Title / Subject *</label>
                                <input required type="text" value={data.title} onChange={e => setData('title', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none" placeholder="e.g. FLASH SALE: 50% OFF on Gym Wear!" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Message Body *</label>
                                <textarea required rows="4" value={data.message} onChange={e => setData('message', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none resize-none" placeholder="Write your message here..."></textarea>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Delivery Channels *</label>
                                <div className="flex flex-wrap gap-4">
                                    <ChannelButton icon={BellRing} label="In-App Alert" active={data.channels.includes('In-App')} onClick={() => handleChannelToggle('In-App')} />
                                    <ChannelButton icon={Mail} label="Email Blast" active={data.channels.includes('Email')} onClick={() => handleChannelToggle('Email')} />
                                    <ChannelButton icon={MessageSquare} label="WhatsApp API" active={data.channels.includes('WhatsApp')} onClick={() => handleChannelToggle('WhatsApp')} color="bg-green-100 text-green-700 border-green-300" activeColor="bg-green-600 text-white border-green-600" />
                                    <ChannelButton icon={Smartphone} label="SMS" active={data.channels.includes('SMS')} onClick={() => handleChannelToggle('SMS')} />
                                </div>
                                {errors.channels && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.channels}</p>}
                            </div>

                            <div className="pt-4 border-t border-gray-100 text-right">
                                <button disabled={processing || data.channels.length === 0} type="submit" className="bg-[#1A1A2E] text-white px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#E94E3C] transition-all disabled:opacity-50 flex items-center gap-2 ml-auto shadow-xl shadow-black/10">
                                    <Send size={16} /> {processing ? 'Broadcasting...' : 'Blast Notification'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* TAB: LOGS & HISTORY */}
                    {activeTab !== 'broadcast' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50 text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-5">Date & Time</th>
                                        <th className="px-6 py-5">Detail / Subject</th>
                                        <th className="px-6 py-5">Target / To</th>
                                        <th className="px-6 py-5">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {tabData?.data?.map((log, i) => (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-black text-[#1A1A2E] text-sm">{new Date(log.created_at).toLocaleDateString()}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(log.created_at).toLocaleTimeString()}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-black text-[#1A1A2E] text-sm truncate max-w-sm">{log.title || log.subject || log.message}</p>
                                                {log.type && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{log.type}</p>}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold text-gray-600">
                                                {log.target_audience || log.to_email || log.phone_number}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-md font-black tracking-wider uppercase inline-flex items-center gap-1 shadow-sm">
                                                    <CheckCircle2 size={12} /> {log.status || 'Sent'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {tabData?.data?.length === 0 && (
                                        <tr><td colSpan="4" className="px-6 py-16 text-center"><History size={48} className="mx-auto text-gray-300 mb-4" strokeWidth={1} /><p className="text-[#1A1A2E] font-black text-lg">No Logs Found</p></td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
}

// 💎 Helper Components
function StatCard({ title, value, icon: Icon, color }) {
    return (
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{title}</p>
                <h4 className="text-2xl font-black text-[#1A1A2E]">{value?.toLocaleString() || 0}</h4>
            </div>
            <div className={`size-12 rounded-2xl flex items-center justify-center bg-gray-50 ${color}`}><Icon size={20} strokeWidth={2.5} /></div>
        </div>
    );
}

function ChannelButton({ icon: Icon, label, active, onClick, color = "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100", activeColor = "bg-[#1A1A2E] text-white border-[#1A1A2E]" }) {
    return (
        <button type="button" onClick={onClick} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-2 ${active ? activeColor + ' shadow-md scale-105' : color}`}>
            <Icon size={16} /> {label} {active && <CheckCircle2 size={14} className="ml-1" />}
        </button>
    );
}