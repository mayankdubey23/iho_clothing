import { motion } from 'framer-motion';
import { Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Check, Store } from 'lucide-react';
import AppLayout, { Field, SectionHeading, money } from '../Layouts/AppLayout';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

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
      <main className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <Link
          href="/"
          className="mb-6 inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-stone-700 shadow-sm transition-colors hover:bg-stone-50"
        >
          <ArrowLeft size={16} />
          Back to storefront
        </Link>

        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <SectionHeading
            eyebrow="Franchise"
            title="Apply for partnership"
            aside={auth.user?.email}
          />
        </motion.div>

        <motion.div
          className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {/* Left: plan cards + form */}
          <div className="grid gap-6">
            {/* Plan selection */}
            <motion.div variants={fadeUp}>
              <p className="mb-4 text-sm font-bold uppercase tracking-wide text-stone-400">
                Select a plan
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {plans.map((plan) => {
                  const isSelected = Number(data.franchise_plan_id) === Number(plan.id);
                  return (
                    <button
                      type="button"
                      key={plan.id}
                      onClick={() => setData('franchise_plan_id', plan.id)}
                      className={`rounded-2xl border-2 bg-white p-6 text-left shadow-sm transition-all duration-200 hover:shadow-md ${
                        isSelected
                          ? 'border-teal-600 shadow-teal-100'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className={`grid size-10 place-items-center rounded-xl ${
                            isSelected ? 'bg-teal-50' : 'bg-stone-100'
                          }`}
                        >
                          <Store
                            size={20}
                            className={isSelected ? 'text-teal-700' : 'text-stone-400'}
                          />
                        </div>
                        {isSelected && (
                          <span className="flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700">
                            <Check size={12} />
                            Selected
                          </span>
                        )}
                      </div>
                      <h2 className="font-display mt-4 text-2xl font-black text-zinc-900">
                        {plan.name}
                      </h2>
                      <strong className="mt-2 block text-3xl font-black text-teal-700">
                        {money.format(Number(plan.price))}
                      </strong>
                      <p className="mt-1 text-sm font-semibold capitalize text-stone-400">
                        {plan.type} channel
                      </p>
                      <ul className="mt-4 grid gap-2">
                        {(plan.features_list || []).slice(0, 4).map((feature) => (
                          <li className="flex gap-2 text-sm text-stone-600" key={feature}>
                            <Check className="mt-0.5 shrink-0 text-teal-600" size={14} />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Application form */}
            <motion.form
              onSubmit={submit}
              className="grid gap-5 rounded-2xl border border-stone-200 bg-white p-7 shadow-sm"
              variants={fadeUp}
            >
              <h2 className="font-display text-xl font-black text-zinc-900">
                Application details
              </h2>
              <Field label="Business name (optional)" error={errors.business_name}>
                <input
                  className="input"
                  value={data.business_name}
                  onChange={(e) => setData('business_name', e.target.value)}
                  placeholder="IHO City Store"
                />
              </Field>
              <Field label="Selected plan" error={errors.franchise_plan_id}>
                <select
                  className="input"
                  value={data.franchise_plan_id}
                  onChange={(e) => setData('franchise_plan_id', e.target.value)}
                  required
                >
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name}
                    </option>
                  ))}
                </select>
              </Field>
              <button
                disabled={processing}
                className="button-glow inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-orange-700 px-6 font-bold text-white transition-colors hover:bg-orange-800 disabled:opacity-60"
              >
                <BriefcaseBusiness size={18} />
                {processing ? 'Submitting…' : 'Submit application'}
              </button>
            </motion.form>
          </div>

          {/* Right: Summary sidebar */}
          <motion.aside
            className="h-fit rounded-2xl border border-stone-200 bg-white p-6 shadow-sm lg:sticky lg:top-24"
            variants={fadeUp}
          >
            <h3 className="font-display mb-5 text-lg font-black text-zinc-900">
              Application summary
            </h3>
            {selectedPlan ? (
              <div className="grid gap-4">
                <div className="rounded-xl bg-stone-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-stone-400">Plan</p>
                  <p className="mt-1 text-lg font-black text-zinc-900">{selectedPlan.name}</p>
                </div>
                <div className="rounded-xl bg-teal-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-teal-600">
                    Investment
                  </p>
                  <p className="mt-1 text-3xl font-black text-teal-700">
                    {money.format(Number(selectedPlan.price))}
                  </p>
                </div>
                <div className="rounded-xl bg-stone-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-stone-400">
                    Applicant
                  </p>
                  <p className="mt-1 font-bold text-zinc-900">{auth.user?.name}</p>
                  <p className="text-sm text-stone-400">{auth.user?.email}</p>
                </div>
                <div className="rounded-xl bg-stone-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-stone-400">
                    Channel type
                  </p>
                  <p className="mt-1 font-bold capitalize text-zinc-900">{selectedPlan.type}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-stone-400">Select a plan to see summary.</p>
            )}

            <Link
              href="/"
              className="mt-5 flex items-center gap-2 text-sm font-semibold text-stone-400 hover:text-stone-600"
            >
              <ArrowRight size={14} className="rotate-180" />
              Browse products first
            </Link>
          </motion.aside>
        </motion.div>
      </main>
    </AppLayout>
  );
}
