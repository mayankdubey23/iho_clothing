import { Head, router } from '@inertiajs/react';
import { Check, Store, X } from 'lucide-react';
import AdminLayout from '../../Layouts/AdminLayout';

const statusBadge = {
  pending: 'bg-amber-100 text-amber-800',
  reviewed: 'bg-blue-100 text-blue-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
};

function initials(name) {
  return (name || '')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function Franchises({ applications = [] }) {
  function updateStatus(applicationId, status) {
    if (!confirm(`Are you sure you want to ${status} this application?`)) return;
    router.patch(`/franchise-superadmin/franchise-applications/${applicationId}`, { status }, { preserveScroll: true });
  }

  return (
    <AdminLayout active="franchises">
      <Head title="Franchise Applications | Admin" />

      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Franchise Applications</h1>
        <p className="mt-1 text-sm font-medium text-slate-400">Review new partner requests and approve franchise admin access.</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <Stat label="Total" value={applications.length} />
        <Stat label="Pending" value={applications.filter((app) => app.status === 'pending').length} tone="text-amber-500" />
        <Stat label="Approved" value={applications.filter((app) => app.status === 'approved').length} tone="text-emerald-500" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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
                  {['Applicant', 'Location', 'Business', 'Login Credentials', 'Applied', 'Status', 'Actions'].map((heading) => (
                    <th key={heading} className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                      {heading}
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
                          {initials(app.user?.name || app.full_name)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{app.user?.name || app.full_name}</p>
                          <p className="text-xs text-slate-400">{app.user?.email || app.email}</p>
                          <p className="text-xs text-slate-400">{app.mobile_number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-700">{app.preferred_city || app.current_city || app.city || '-'}</p>
                      <p className="text-xs text-slate-400">{app.preferred_state || app.current_state || app.state || '-'}</p>
                      <p className="text-xs text-slate-400">{app.preferred_pincode || app.pincode || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-700">{app.business_name || '-'}</p>
                      <p className="mt-1 text-xs font-bold uppercase text-slate-400">{app.franchise_type || '-'}</p>
                      <p className="text-xs text-slate-400">{app.investment_budget || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      {app.login_email ? (
                        <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2">
                          <p className="text-xs font-black text-emerald-800">{app.login_email}</p>
                          <p className="mt-1 font-mono text-xs font-bold text-emerald-700">{app.temporary_password}</p>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-300">Generated after approval</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {app.created_at ? new Date(app.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${statusBadge[app.status] || statusBadge.pending}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {app.status !== 'approved' && (
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateStatus(app.id, 'approved')} className="flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-200">
                            <Check size={14} /> Approve
                          </button>
                          <button onClick={() => updateStatus(app.id, 'rejected')} className="flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-200">
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
      </div>
    </AdminLayout>
  );
}

function Stat({ label, value, tone = 'text-slate-900' }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
      <p className={`text-xs font-bold uppercase tracking-wide ${tone}`}>{label}</p>
      <p className="text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}
