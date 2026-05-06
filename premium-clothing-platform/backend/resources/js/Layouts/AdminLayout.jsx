import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutDashboard, Package, Tags, Store, Users, LogOut, 
    Globe, ShieldCheck, ChevronRight 
} from 'lucide-react';

export default function AdminLayout({ children, active }) {
    const { auth } = usePage().props;
    const isSuperAdmin = auth.user.role === 'super_admin';

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            {/* Premium Sidebar */}
            <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-20">
                <div className="h-20 flex items-center px-8 border-b border-slate-800">
                    <ShieldCheck className="text-blue-500 mr-3" size={28} />
                    <h1 className="text-xl font-black tracking-wider text-white">IHO <span className="text-blue-500">ADMIN</span></h1>
                </div>

                <div className="p-6">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Management</p>
                    <nav className="space-y-2">
                        <SidebarLink href="/admin" icon={<LayoutDashboard size={20}/>} label="Dashboard" isActive={active === 'dashboard'} />
                        
                        {isSuperAdmin && (
                            <>
                                <SidebarLink href="/admin/products" icon={<Package size={20}/>} label="Products" isActive={active === 'products'} />
                                <SidebarLink href="/admin/categories" icon={<Tags size={20}/>} label="Categories" isActive={active === 'categories'} />
                                <SidebarLink href="/admin/franchises" icon={<Store size={20}/>} label="Franchises" isActive={active === 'franchises'} />
                            </>
                        )}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg shadow-lg">
                            {auth.user.name.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white leading-tight">{auth.user.name}</p>
                            <p className="text-xs text-blue-400 capitalize">{auth.user.role.replace('_', ' ')}</p>
                        </div>
                    </div>
                    
                    <Link method="post" href="/logout" as="button" className="w-full flex items-center gap-3 text-slate-400 hover:text-red-400 transition font-semibold text-sm">
                        <LogOut size={18} /> Logout
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Top Header */}
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 shadow-sm z-10">
                    <div className="flex items-center text-slate-500 text-sm font-medium">
                        Admin <ChevronRight size={16} className="mx-2 text-slate-300" /> <span className="text-blue-600 capitalize">{active}</span>
                    </div>
                    
                    {/* 🌐 THE "VIEW WEBSITE" BUTTON */}
                    <Link href="/" className="flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 px-5 py-2.5 rounded-lg font-bold transition duration-200 border border-blue-200 shadow-sm">
                        <Globe size={18} /> View Live Website
                    </Link>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto p-10 bg-slate-50/50">
                    {children}
                </div>
            </main>
        </div>
    );
}

function SidebarLink({ href, icon, label, isActive }) {
    return (
        <Link 
            href={href} 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                isActive 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
        >
            {icon} {label}
        </Link>
    );
}