import React from 'react';
import { Head } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Franchises({ applications }) {
    return (
        <AdminLayout active="franchises">
            <Head title="Franchise Applications | Admin" />
            
            <div className="mb-10">
                <h1 className="text-3xl font-black text-slate-900">Franchise Applications</h1>
                <p className="text-slate-500 mt-1">Review new partner requests.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-bold">Applicant / User</th>
                            <th className="px-6 py-4 font-bold">Business Name</th>
                            <th className="px-6 py-4 font-bold">Selected Plan</th>
                            <th className="px-6 py-4 font-bold text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {applications.map(app => (
                            <tr key={app.id} className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4 font-bold text-slate-900">{app.user?.name}</td>
                                <td className="px-6 py-4 font-semibold text-slate-600">{app.business_name || 'N/A'}</td>
                                <td className="px-6 py-4">
                                    <span className="font-black text-indigo-600">{app.franchise_plan?.name}</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${app.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                                        {app.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {applications.length === 0 && (
                            <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500 font-medium">No new applications.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}