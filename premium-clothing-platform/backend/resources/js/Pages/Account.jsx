import { motion } from "framer-motion";
import { Link, router, usePage } from "@inertiajs/react";
import { Calendar, FileText, Mail, Shield, User, LogOut } from "lucide-react";
import AppLayout, { EmptyState, SectionHeading } from "../Layouts/AppLayout";

import { ACCOUNT_MENU } from "../Layouts/AppLayout";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const gridStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const cardAnim = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35 } },
};

const HERO_BADGE_STYLES = [
  "bg-teal-50 text-teal-800 border border-teal-200",
  "bg-orange-50 text-orange-800 border border-orange-200",
  "bg-stone-50 text-stone-700 border border-stone-200",
];

function getInitials(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "U";
  const second = parts[1]?.[0] || "";
  return (first + second).toUpperCase();
}

function formatRole(role) {
  return role?.replace("_", " ") || "customer";
}

export default function Account({ applications }) {
  const { auth } = usePage().props;
  const user = auth.user;

  function logout() {
    router.post("/logout");
  }

  const profileFields = [
    { icon: User, label: "Full name", value: user.name },
    { icon: Mail, label: "Email address", value: user.email },
    { icon: Shield, label: "Account role", value: formatRole(user.role) },
    {
      icon: Calendar,
      label: "Member since",
      value: new Date(user.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    },
  ];

  // Ensure we have all 9 items + logout button separately.
  const accountCards = [
    ACCOUNT_MENU.find((x) => x.key === "profile"),
    ACCOUNT_MENU.find((x) => x.key === "orders"),
    ACCOUNT_MENU.find((x) => x.key === "addresses"),
    ACCOUNT_MENU.find((x) => x.key === "wishlist"),
    ACCOUNT_MENU.find((x) => x.key === "cart"),
    ACCOUNT_MENU.find((x) => x.key === "coupons"),
    ACCOUNT_MENU.find((x) => x.key === "returns"),
    ACCOUNT_MENU.find((x) => x.key === "help"),
    ACCOUNT_MENU.find((x) => x.key === "settings"),
  ].filter(Boolean);

  return (
    <AppLayout active="account">
      <main className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        {/* Hero */}
        <motion.section initial="hidden" animate="visible" variants={fadeUp}>
          <div className="relative overflow-hidden rounded-3xl border border-stone-800 bg-zinc-950">
            {/* dark hero background accents */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-teal-500/15 blur-3xl" />
              <div className="absolute -right-24 -top-16 h-64 w-64 rounded-full bg-orange-500/12 blur-3xl" />
              <div className="absolute bottom-0 left-1/2 h-32 w-[900px] -translate-x-1/2 bg-white/5" />
            </div>

            <div className="relative grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:p-8 lg:p-10">
              <div className="flex items-center gap-4">
                <div className="grid size-16 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                  <span className="text-lg font-black tracking-wide text-white">{getInitials(user.name)}</span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/50">Account</p>
                  <h1 className="mt-1 font-display text-3xl font-black leading-tight text-white sm:text-4xl">
                    Welcome back, {user.name.split(" ")[0]}
                  </h1>
                  <p className="mt-2 text-sm font-semibold text-white/60">
                    {formatRole(user.role)} · Member since{" "}
                    {new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-start gap-3 sm:items-end">
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${HERO_BADGE_STYLES[0]}`}>Customer dashboard</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${HERO_BADGE_STYLES[2]}`}>Fast navigation</span>
                </div>

                <button
                  onClick={logout}
                  type="button"
                  className="group inline-flex min-h-11 items-center gap-2 rounded-xl bg-red-500/90 px-4 py-2.5 text-sm font-bold text-white ring-1 ring-white/10 transition hover:bg-red-600"
                >
                  <span className="grid size-9 place-items-center rounded-lg bg-white/10 ring-1 ring-white/10 transition group-hover:bg-white/15">
                    <LogOut size={16} />
                  </span>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Profile mini card (small, left-aligned) */}
        <motion.section className="mt-6" initial="hidden" animate="visible" variants={fadeUp}>
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Your details</p>
                <h2 className="mt-1 font-display text-2xl font-black text-zinc-900">Profile snapshot</h2>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-stone-500">
                <span className="inline-flex h-2 w-2 rounded-full bg-teal-600" />
                Up to date
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {profileFields.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 rounded-xl bg-stone-50 p-4">
                  <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-white shadow-sm">
                    <Icon size={15} className="text-stone-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">{label}</p>
                    <p className="mt-0.5 font-bold capitalize text-zinc-900">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Account cards grid */}
        <motion.section className="mt-8" initial="hidden" animate="visible" variants={gridStagger}>
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-orange-700">Quick menu</p>
              <h2 className="mt-1 font-display text-3xl font-black text-zinc-900">All account options</h2>
            </div>
            <p className="text-sm font-semibold text-stone-500">Tap a card to continue</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {accountCards.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.key} variants={cardAnim} className="group">
                  <Link
                    href={item.href}
                    className="flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="grid size-11 place-items-center rounded-xl bg-teal-50 transition-colors group-hover:bg-teal-100">
                        <Icon size={18} className="text-teal-700" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold uppercase tracking-widest text-stone-400">{String(idx + 1).padStart(2, "0")}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h3 className="font-display text-xl font-black text-zinc-900">{item.label}</h3>
                      <p className="mt-1 text-sm font-semibold text-stone-500">Manage in one place</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2">
                      <span className="rounded-lg bg-stone-50 px-3 py-1 text-xs font-bold text-stone-500">Open</span>
                      <span className="text-xs font-bold text-teal-700 transition group-hover:text-teal-800">→</span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Franchise Applications */}
        <motion.section
          className="mt-10 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
        >
          <div className="flex items-center gap-3 border-b border-stone-100 px-7 py-5">
            <FileText size={20} className="text-stone-400" />
            <h2 className="font-display text-xl font-black text-zinc-900">Franchise applications</h2>
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
                    <h3 className="font-black text-zinc-900">{application.franchise_plan?.name || "Franchise Plan"}</h3>
                    <p className="mt-0.5 text-sm text-stone-400">
                      Applied on{" "}
                      {new Date(application.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    {application.business_name && (
                      <p className="mt-1 text-sm font-semibold text-stone-600">{application.business_name}</p>
                    )}
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                      application.status === "approved"
                        ? "bg-teal-50 text-teal-700 border border-teal-200"
                        : application.status === "rejected"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
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
