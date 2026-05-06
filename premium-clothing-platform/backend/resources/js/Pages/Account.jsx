import { motion } from 'framer-motion';
import { Link, usePage } from '@inertiajs/react';
import { BriefcaseBusiness, Calendar, FileText, Mail, Package, Shield, User } from 'lucide-react';
import AppLayout, { EmptyState, SectionHeading } from '../Layouts/AppLayout';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
};

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  approved: 'bg-teal-50 text-teal-700 border border-teal-200',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
};

export default function Account({ applications }) {
  const { auth } = usePage().props;
  const user = auth.user;

  const profileFields = [
    { icon: User, label: 'Full name', value: user.name },
    { icon: Mail, label: 'Email address', value: user.email },
    { icon: Shield, label: 'Account role', value: user.role?.replace('_', ' ') || 'customer' },
    {
      icon: Calendar,
      label: 'Member since',
      value: new Date(user.created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    },
  ];

  return (
    <AppLayout active="account">
      <main className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <SectionHeading eyebrow="Account" title="Customer dashboard" aside={user.email} />
        </motion.div>

        <motion.div
          className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {/* Profile card */}
          <motion.section
            className="rounded-2xl border border-stone-200 bg-white p-7 shadow-sm"
            variants={fadeUp}
          >
            <div className="mb-6 flex items-center gap-4">
              <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-teal-50">
                <User className="text-teal-700" size={28} />
              </div>
              <div>
                <h2
                  className="font-display text-2xl font-black text-zinc-900"
                >
                  Profile
                </h2>
                <p className="text-sm font-medium capitalize text-stone-400">
                  {user.role?.replace('_', ' ') || 'customer'} account
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {profileFields.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 rounded-xl bg-stone-50 p-4"
                >
                  <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-white shadow-sm">
                    <Icon size={15} className="text-stone-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                      {label}
                    </p>
                    <p className="mt-0.5 font-bold capitalize text-zinc-900">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Quick actions */}
          <motion.aside className="grid gap-4 h-fit" variants={fadeUp}>
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h3 className="font-display mb-4 text-lg font-black text-zinc-900">
                Quick actions
              </h3>
              <div className="grid gap-2.5">
                <Link
                  href="/franchise-apply"
                  className="button-glow inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-bold text-white transition-colors hover:bg-teal-800"
                >
                  <BriefcaseBusiness size={16} />
                  Apply for franchise
                </Link>
                <Link
                  href="/"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-stone-100 px-4 text-sm font-bold text-stone-700 transition-colors hover:bg-stone-200"
                >
                  <Package size={16} />
                  Continue shopping
                </Link>
              </div>
            </div>

            {/* Franchise count summary */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-stone-400">
                Applications
              </p>
              <p className="mt-1 text-4xl font-black text-zinc-900">{applications.length}</p>
              <p className="mt-1 text-sm font-medium text-stone-500">
                franchise{applications.length !== 1 ? 's' : ''} applied
              </p>
            </div>
          </motion.aside>
        </motion.div>

        {/* Franchise Applications */}
        <motion.section
          className="mt-8 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
        >
          <div className="flex items-center gap-3 border-b border-stone-100 px-7 py-5">
            <FileText size={20} className="text-stone-400" />
            <h2
              className="font-display text-xl font-black text-zinc-900"
            >
              Franchise applications
            </h2>
          </div>

          {applications.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={FileText}
                text="No franchise applications yet."
                action={
                  <Link
                    className="inline-flex items-center gap-2 rounded-xl bg-orange-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-800"
                    href="/franchise-apply"
                  >
                    Apply now
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {applications.map((application) => (
                <div
                  key={application.id}
                  className="flex flex-col gap-3 px-7 py-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="font-black text-zinc-900">
                      {application.franchise_plan?.name || 'Franchise Plan'}
                    </h3>
                    <p className="mt-0.5 text-sm text-stone-400">
                      Applied on{' '}
                      {new Date(application.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                    {application.business_name && (
                      <p className="mt-1 text-sm font-semibold text-stone-600">
                        {application.business_name}
                      </p>
                    )}
                  </div>
                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                      STATUS_STYLES[application.status] || STATUS_STYLES.pending
                    }`}
                  >
                    {application.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.section>
      </main>
    </AppLayout>
  );
}
