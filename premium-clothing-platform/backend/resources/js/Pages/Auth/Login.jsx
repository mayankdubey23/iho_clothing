import { motion } from 'framer-motion';
import { Link, useForm } from '@inertiajs/react';
import { ArrowRight, BadgeCheck, Dumbbell, ShieldCheck, Store } from 'lucide-react';
import { Field } from '../../Layouts/AppLayout';

const brandFeatures = [
  { icon: Store, text: 'Retail & franchise platform in one place' },
  { icon: Dumbbell, text: 'Premium sportswear collections' },
  { icon: BadgeCheck, text: 'Live SKU inventory & smart checkout' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

export default function Login() {
  const { data, setData, post, processing, errors } = useForm({ email: '', password: '' });

  function submit(event) {
    event.preventDefault();
    post('/login');
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_480px] xl:grid-cols-[1fr_540px]">
      {/* Brand Panel */}
      <div className="relative hidden overflow-hidden bg-zinc-950 lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(15,118,110,0.18),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(194,65,12,0.12),transparent_60%)]" />

        {/* Logo */}
        <motion.div
          className="relative flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="grid size-11 place-items-center bg-white text-sm font-black text-zinc-900">
            IHO
          </span>
          <div>
            <p className="font-black text-white">IHO Clothing</p>
            <p className="text-xs font-semibold text-zinc-500">Retail & Franchise Platform</p>
          </div>
        </motion.div>

        {/* Main content */}
        <motion.div
          className="relative"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.p
            className="mb-3 text-xs font-bold uppercase tracking-widest text-orange-400"
            variants={fadeUp}
          >
            Welcome back
          </motion.p>
          <motion.h1
            className="font-display text-5xl font-black leading-tight text-white xl:text-6xl"
            variants={fadeUp}
          >
            Sign in to
            <br />
            <span className="text-teal-400">your account</span>
          </motion.h1>
          <motion.p className="mt-5 max-w-sm text-base leading-7 text-zinc-400" variants={fadeUp}>
            Access your profile, manage orders, and apply for IHO franchise partnerships.
          </motion.p>

          <motion.ul className="mt-8 grid gap-3" variants={stagger}>
            {brandFeatures.map(({ icon: Icon, text }) => (
              <motion.li key={text} className="flex items-center gap-3" variants={fadeUp}>
                <div className="grid size-8 place-items-center rounded-lg bg-teal-900/60">
                  <Icon size={15} className="text-teal-400" />
                </div>
                <span className="text-sm font-semibold text-zinc-300">{text}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Bottom */}
        <motion.p
          className="relative text-xs font-medium text-zinc-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          © 2025 IHO Clothing. All rights reserved.
        </motion.p>
      </div>

      {/* Form Panel */}
      <div className="flex items-center justify-center bg-[#f9f7f4] p-6">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Mobile logo */}
          <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid size-10 place-items-center bg-zinc-900 text-xs font-black text-white">
              IHO
            </span>
            <span className="font-black text-zinc-900">IHO Clothing</span>
          </Link>

          <div className="mb-8">
            <h2 className="font-display text-3xl font-black text-zinc-900">
              Welcome back
            </h2>
            <p className="mt-2 text-sm font-medium text-stone-500">
              Sign in to shop, apply, or manage the platform.
            </p>
          </div>

          <form onSubmit={submit} className="grid gap-4">
            <Field label="Email address" error={errors.email}>
              <input
                className="input"
                type="email"
                value={data.email}
                autoComplete="email"
                onChange={(e) => setData('email', e.target.value)}
                required
              />
            </Field>
            <Field label="Password" error={errors.password}>
              <input
                className="input"
                type="password"
                value={data.password}
                autoComplete="current-password"
                onChange={(e) => setData('password', e.target.value)}
                required
              />
            </Field>
            <button
              disabled={processing}
              className="button-glow mt-1 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 text-sm font-bold text-white transition-colors hover:bg-teal-800 disabled:opacity-60"
              type="submit"
            >
              {processing ? 'Signing in…' : 'Sign in'}
              {!processing && <ArrowRight size={17} />}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-stone-200" />
            <span className="text-xs font-semibold text-stone-400">OR</span>
            <div className="h-px flex-1 bg-stone-200" />
          </div>

          <p className="mt-5 text-center text-sm text-stone-500">
            New customer?{' '}
            <Link href="/register" className="font-bold text-teal-700 hover:underline">
              Create account
            </Link>
          </p>

          <p className="mt-8 text-center text-xs text-stone-400">
            <Link href="/" className="hover:text-stone-600 hover:underline">
              ← Back to storefront
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
