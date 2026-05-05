import AppLayout, { SectionHeading, money } from '../../Layouts/AppLayout';

export default function Franchises({ applications, plans }) {
  return (
    <AppLayout active="franchises" admin>
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <SectionHeading eyebrow="Franchise" title="Applications" aside={`${applications.length} submissions`} />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="divide-y divide-stone-200 border border-stone-300 bg-white shadow-sm">
            {applications.map((application) => (
              <article className="grid gap-3 p-5 sm:grid-cols-[1fr_auto]" key={application.id}>
                <div>
                  <h3 className="text-xl font-black">{application.business_name || 'New franchise applicant'}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{application.user?.name} - {application.user?.email}</p>
                  <p className="mt-2 font-bold text-teal-700">{application.franchise_plan?.name}</p>
                </div>
                <span className="h-fit bg-yellow-100 px-3 py-1 text-xs font-black uppercase text-yellow-800">{application.status}</span>
              </article>
            ))}
          </section>
          <aside className="h-fit border border-stone-300 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">Plans</h2>
            <div className="mt-4 grid gap-3">
              {plans.map((plan) => (
                <div key={plan.id} className="border-b border-stone-200 pb-3 last:border-b-0">
                  <p className="font-black">{plan.name}</p>
                  <p className="text-sm font-bold text-teal-700">{money.format(Number(plan.price))}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </AppLayout>
  );
}
