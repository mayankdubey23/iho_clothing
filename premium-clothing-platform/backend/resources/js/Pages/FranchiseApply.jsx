import { Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, BriefcaseBusiness, Check, Store } from 'lucide-react';
import AppLayout, { Field, SectionHeading, money } from '../Layouts/AppLayout';

export default function FranchiseApply({ plans }) {
  const { auth } = usePage().props;
  const { data, setData, post, processing, errors } = useForm({
    franchise_plan_id: plans[0]?.id || '',
    business_name: '',
  });
  const selectedPlan = plans.find((plan) => Number(plan.id) === Number(data.franchise_plan_id));

  function submit(event) {
    event.preventDefault();
    post('/franchise-applications');
  }

  return (
    <AppLayout active="franchise">
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <Link href="/" className="mb-5 inline-flex min-h-11 items-center gap-2 bg-white px-4 font-black">
          <ArrowLeft size={18} />
          Storefront
        </Link>

        <SectionHeading eyebrow="Franchise" title="Apply for partnership" aside={auth.user?.email} />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              {plans.map((plan) => (
                <button
                  type="button"
                  key={plan.id}
                  onClick={() => setData('franchise_plan_id', plan.id)}
                  className={`border-2 bg-white p-6 text-left shadow-sm ${
                    Number(data.franchise_plan_id) === Number(plan.id) ? 'border-teal-700' : 'border-stone-300'
                  }`}
                >
                  <Store className="text-orange-700" size={24} />
                  <h2 className="mt-4 text-2xl font-black">{plan.name}</h2>
                  <strong className="mt-3 block text-3xl">{money.format(Number(plan.price))}</strong>
                  <p className="mt-1 font-bold capitalize text-teal-700">{plan.type} channel</p>
                  <ul className="mt-4 grid gap-2">
                    {(plan.features_list || []).slice(0, 4).map((feature) => (
                      <li className="flex gap-2 text-sm text-zinc-600" key={feature}>
                        <Check className="mt-0.5 shrink-0 text-teal-700" size={15} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="grid gap-4 border border-stone-300 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black">Application details</h2>
              <Field label="Business name" error={errors.business_name}>
                <input className="input" value={data.business_name} onChange={(event) => setData('business_name', event.target.value)} placeholder="IHO City Store" />
              </Field>
              <Field label="Selected plan" error={errors.franchise_plan_id}>
                <select className="input" value={data.franchise_plan_id} onChange={(event) => setData('franchise_plan_id', event.target.value)} required>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>{plan.name}</option>
                  ))}
                </select>
              </Field>
              <button disabled={processing} className="inline-flex min-h-12 items-center justify-center gap-2 bg-orange-700 px-5 font-black text-white disabled:bg-stone-400">
                <BriefcaseBusiness size={18} />
                {processing ? 'Submitting...' : 'Submit application'}
              </button>
            </form>
          </div>

          <aside className="h-fit border border-stone-300 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <h3 className="text-xl font-black">Summary</h3>
            {selectedPlan && (
              <div className="mt-5 grid gap-4">
                <div>
                  <p className="text-sm font-bold text-zinc-500">Plan</p>
                  <p className="text-lg font-black">{selectedPlan.name}</p>
                </div>
                <div className="border-t border-stone-200 pt-4">
                  <p className="text-sm font-bold text-zinc-500">Price</p>
                  <p className="text-3xl font-black text-teal-700">{money.format(Number(selectedPlan.price))}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-500">Applicant</p>
                  <p className="font-black">{auth.user?.name}</p>
                  <p className="text-sm text-zinc-500">{auth.user?.email}</p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </AppLayout>
  );
}
