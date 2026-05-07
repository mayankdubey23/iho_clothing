import { motion } from 'framer-motion';
import { Head, router } from '@inertiajs/react';
import { Store, Check, X } from 'lucide-react';
import AdminLayout from '../../Layouts/AdminLayout';

const STATUS_BADGE = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

function getInitials(name) {
  return (name || '')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function Franchises({ applications }) {
  function updateStatus(applicationId, status) {
    if (!confirm(`Are you sure you want to ${status} this application?`)) return;

    router.patch(`/admin/franchise-applications/${applicationId}`, { status }, {
      preserveScroll: true,
      onSuccess: () => console.log('Status updated!'),
      onError: (errors) => console.error('Failed to update status:', errors),
    });
  }

  return (
    <AdminLayout active="franchises">
      <Head title="Franchise Applications | Admin" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-slate-900">
          Franchise Applications
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-400">Review new partner requests.</p>
      </div>

      {/* Stats strip */}
      <div className="mb-6 flex gap-4">
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Total</p>
          <p className="text-2xl font-black text-slate-900">{applications.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-500">Pending</p>
          <p className="text-2xl font-black text-slate-900">
            {applications.filter((a) => a.status === 'pending').length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-500">Approved</p>
          <p className="text-2xl font-black text-slate-900">
            {applications.filter((a) => a.status === 'approved').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <motion.div
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        {applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="grid size-14 place-items-center rounded-2xl bg-slate-100">
              <Store size={28} className="text-slate-400" />
            </div>
            <p className="font-semibold text-slate-500">No new applications.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  {['Applicant', 'Business Name', 'Selected Plan', 'Applied', 'Status', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {applications.map((app) => (
                  <tr key={app.id} className="transition-colors hover:bg-slate-50/60">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-100 text-xs font-black text-blue-700">
                          {getInitials(app.user?.name)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{app.user?.name}</p>
                          <p className="text-xs text-slate-400">{app.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-600">
                      {app.business_name || (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-700">
                        {app.franchise_plan?.name || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {app.created_at
                        ? new Date(app.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                          STATUS_BADGE[app.status] || STATUS_BADGE.pending
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {app.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateStatus(app.id, 'approved')}
                            className="flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-200"
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button
                            onClick={() => updateStatus(app.id, 'rejected')}
                            className="flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700 transition-colors hover:bg-red-200"
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
}
