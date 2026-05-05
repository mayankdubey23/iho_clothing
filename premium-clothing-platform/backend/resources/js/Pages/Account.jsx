import { Link, usePage } from '@inertiajs/react';
import { BriefcaseBusiness, FileText, Package, User } from 'lucide-react';
import AppLayout, { EmptyState, SectionHeading } from '../Layouts/AppLayout';

export default function Account({ applications }) {
  const { auth } = usePage().props;
  const user = auth.user;

  return (
    <AppLayout active="account">
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <SectionHeading eyebrow="Account" title="Customer dashboard" aside={user.email} />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="border border-stone-300 bg-white p-6 shadow-sm">
            <User className="text-teal-700" size={28} />
            <h2 className="mt-4 text-2xl font-black">Profile</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Info label="Full name" value={user.name} />
              <Info label="Email" value={user.email} />
              <Info label="Role" value={user.role} />
              <Info label="Member since" value={new Date(user.created_at).toLocaleDateString('en-IN')} />
            </div>
          </section>

          <aside className="grid gap-3 border border-stone-300 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">Quick actions</h2>
            <Link href="/franchise-apply" className="inline-flex min-h-11 items-center justify-center gap-2 bg-teal-700 px-4 font-black text-white">
              <BriefcaseBusiness size={18} />
              Apply franchise
            </Link>
            <Link href="/" className="inline-flex min-h-11 items-center justify-center gap-2 bg-stone-200 px-4 font-black">
              <Package size={18} />
              Continue shopping
            </Link>
          </aside>
        </div>

        <section className="mt-8 border border-stone-300 bg-white shadow-sm">
          <div className="border-b border-stone-300 p-6">
            <h2 className="text-2xl font-black">Franchise applications</h2>
          </div>
          {applications.length === 0 ? (
            <EmptyState icon={FileText} text="No franchise applications yet." action={<Link className="mt-4 inline-block bg-orange-700 px-4 py-2 font-black text-white" href="/franchise-apply">Apply now</Link>} />
          ) : (
            <div className="divide-y divide-stone-200">
              {applications.map((application) => (
                <div className="grid gap-3 p-6 sm:grid-cols-[1fr_auto]" key={application.id}>
                  <div>
                    <h3 className="text-lg font-black">{application.franchise_plan?.name || 'Franchise Plan'}</h3>
                    <p className="text-sm text-zinc-500">Applied on {new Date(application.created_at).toLocaleDateString('en-IN')}</p>
                    {application.business_name && <p className="mt-2 text-zinc-600">{application.business_name}</p>}
                  </div>
                  <span className="h-fit bg-yellow-100 px-3 py-1 text-xs font-black uppercase text-yellow-800">{application.status}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </AppLayout>
  );
}

function Info({ label, value }) {
  return (
    <div className="border-b border-stone-200 pb-3">
      <p className="text-sm font-bold text-zinc-500">{label}</p>
      <p className="mt-1 text-lg font-black capitalize">{value}</p>
    </div>
  );
}
