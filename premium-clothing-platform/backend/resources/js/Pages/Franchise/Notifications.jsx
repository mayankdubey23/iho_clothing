import React from 'react';
import { Head, router, Link } from '@inertiajs/react';
import {
    Bell, CheckCircle2, ShoppingBag, PackageSearch, AlertTriangle,
    RotateCcw, Megaphone, Banknote, LifeBuoy, Circle, CheckCheck
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Notifications({ notifications, unreadCount }) {

    const markAsRead = (mappingId) => {
        router.post(`/franchise/notifications/${mappingId}/read`, {}, { preserveScroll: true });
    };

    const markAllAsRead = () => {
        router.post('/franchise/notifications/read-all', {}, { preserveScroll: true });
    };

    // Helper to pick the right icon and color based on Notification Type
    const getNotificationStyle = (type) => {
        switch (type) {
            case 'Order': return { icon: ShoppingBag, color: 'text-indigo-500', bg: 'bg-indigo-50' };
            case 'Stock': return { icon: PackageSearch, color: 'text-blue-500', bg: 'bg-blue-50' };
            case 'Alert': return { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50' };
            case 'Return': return { icon: RotateCcw, color: 'text-pink-500', bg: 'bg-pink-50' };
            case 'Payment': return { icon: Banknote, color: 'text-green-500', bg: 'bg-green-50' };
            case 'Support': return { icon: LifeBuoy, color: 'text-teal-500', bg: 'bg-teal-50' };
            case 'Announcement': return { icon: Megaphone, color: 'text-purple-500', bg: 'bg-purple-50' };
            default: return { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-50' };
        }
    };

    return (
        <AdminLayout active="notifications">
            <Head title="Notifications | IHO Franchise" />

            <div className="max-w-[1200px] mx-auto pb-20 pt-6 px-4 sm:px-6">

                {/* 🚀 HEADER */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter flex items-center gap-3">
                            <Bell className="text-[#E94E3C]" size={32} /> Notifications
                            {unreadCount > 0 && (
                                <span className="bg-[#E94E3C] text-white text-xs px-3 py-1 rounded-full font-black ml-2 shadow-lg shadow-[#E94E3C]/20">
                                    {unreadCount} New
                                </span>
                            )}
                        </h1>
                        <p className="text-gray-500 font-bold text-sm mt-1">Stay updated with orders, stock alerts, and announcements.</p>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="bg-white border border-gray-200 text-[#1A1A2E] px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
                        >
                            <CheckCheck size={16} /> Mark all as read
                        </button>
                    )}
                </div>

                {/* 🚀 NOTIFICATIONS LIST */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {notifications?.data?.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                            {notifications.data.map((note) => {
                                const { icon: Icon, color, bg } = getNotificationStyle(note.type);

                                return (
                                    <div key={note.mapping_id} className={`p-6 transition-colors flex gap-4 ${note.is_read ? 'bg-white opacity-70' : 'bg-blue-50/30'}`}>

                                        {/* Icon Container */}
                                        <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 ${bg} ${color}`}>
                                            <Icon size={24} strokeWidth={2.5} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className={`text-sm md:text-base ${note.is_read ? 'font-bold text-gray-700' : 'font-black text-[#1A1A2E]'}`}>
                                                    {note.title}
                                                </h4>
                                                <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase ml-4 shrink-0">
                                                    {new Date(note.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className={`text-sm ${note.is_read ? 'text-gray-500 font-medium' : 'text-gray-700 font-bold'}`}>
                                                {note.message}
                                            </p>

                                            {/* Optional Reference Link */}
                                            {note.reference_id && (
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">
                                                    Ref: {note.reference_id}
                                                </p>
                                            )}
                                        </div>

                                        {/* Action: Mark as Read */}
                                        {!note.is_read && (
                                            <button
                                                onClick={() => markAsRead(note.mapping_id)}
                                                title="Mark as read"
                                                className="text-[#E94E3C] hover:text-[#c0392b] transition-colors p-2 shrink-0 self-center"
                                            >
                                                <Circle size={16} fill="currentColor" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-16 text-center">
                            <Bell size={48} className="mx-auto text-gray-300 mb-4" strokeWidth={1} />
                            <h3 className="text-[#1A1A2E] font-black text-lg uppercase">All Caught Up!</h3>
                            <p className="text-gray-500 text-sm font-bold mt-1">You have no notifications right now.</p>
                        </div>
                    )}

                    {/* Pagination Placeholder (if needed later) */}
                    {notifications?.links?.length > 3 && (
                        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-center">
                            {/* Render pagination links here if necessary */}
                            <p className="text-xs font-bold text-gray-400">Page {notifications.current_page} of {notifications.last_page}</p>
                        </div>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
}