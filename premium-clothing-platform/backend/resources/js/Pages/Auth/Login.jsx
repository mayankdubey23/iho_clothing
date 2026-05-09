import React from 'react';
import { motion } from 'framer-motion';
import { Link, useForm } from '@inertiajs/react';
import { ArrowRight, BadgeCheck, Dumbbell, Store, AlertCircle, ChevronLeft } from 'lucide-react';

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
    post('/login', { preserveScroll: true });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_480px] xl:grid-cols-[1fr_540px] bg-[#f9f8f6] font-sans">

      {/* 🚀 Premium Brand Panel (Left Side) */}
      <div className="relative hidden overflow-hidden bg-[#1A1A2E] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(233,78,60,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(26,26,46,0.8),transparent_60%)]" />

        {/* Logo */}
        <motion.div
          className="relative flex items-center gap-3 z-10"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="grid size-11 place-items-center bg-gradient-to-tr from-[#E94E3C] to-[#c0392b] text-[11px] font-black tracking-widest text-white shadow-lg shadow-[#E94E3C]/20 rounded-xl">
            IHO
          </span>
          <div>
            <p className="font-black text-white text-xl tracking-tighter uppercase leading-none">IHO<span className="font-light text-slate-400">CLOTHING</span></p>
            <p className="text-[9px] font-black tracking-[0.2em] text-[#E94E3C] uppercase mt-0.5">Retail & Franchise Platform</p>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div className="relative z-10" variants={stagger} initial="hidden" animate="visible">
          <motion.p className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#E94E3C]" variants={fadeUp}>
            Welcome back
          </motion.p>
          <motion.h1 className="text-5xl font-black leading-[1.1] text-white xl:text-6xl tracking-tighter uppercase" variants={fadeUp}>
            Sign in to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">your account</span>
          </motion.h1>
          <motion.p className="mt-6 max-w-sm text-sm font-medium leading-relaxed text-gray-400" variants={fadeUp}>
            Access your profile, shop premium sportswear, and manage your IHO partnerships securely.
          </motion.p>

          <motion.ul className="mt-10 grid gap-4" variants={stagger}>
            {brandFeatures.map(({ icon: Icon, text }) => (
              <motion.li key={text} className="flex items-center gap-4 group" variants={fadeUp}>
                <div className="grid size-10 place-items-center rounded-xl bg-white/5 border border-white/10 group-hover:bg-[#E94E3C]/20 group-hover:border-[#E94E3C]/30 transition-all">
                  <Icon size={18} className="text-gray-400 group-hover:text-[#E94E3C] transition-colors" />
                </div>
                <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{text}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Bottom */}
        <motion.p className="relative z-10 text-[10px] font-black tracking-widest uppercase text-gray-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          © {new Date().getFullYear()} IHO Clothing. All rights reserved.
        </motion.p>
      </div>

      {/* 🚀 Form Panel (Right Side) */}
      <div className="flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#E94E3C]/5 to-transparent rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"></div>

        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Mobile Logo */}
          <Link href="/" className="mb-10 flex items-center gap-3 lg:hidden">
            <span className="grid size-10 place-items-center bg-gradient-to-tr from-[#E94E3C] to-[#c0392b] text-[10px] font-black tracking-widest text-white shadow-lg shadow-[#E94E3C]/20 rounded-xl">
              IHO
            </span>
            <span className="font-black text-[#1A1A2E] text-xl tracking-tighter uppercase leading-none">IHO<span className="font-light text-gray-400">CLOTHING</span></span>
          </Link>

          <div className="mb-10">
            <h2 className="text-3xl font-black text-[#1A1A2E] tracking-tighter uppercase">
              Secure Login
            </h2>
            <p className="mt-2 text-sm font-bold text-gray-400">
              Enter your credentials to access the platform.
            </p>
          </div>

          <form onSubmit={submit} className="grid gap-5">
            <FormField label="Email Address" error={errors.email}>
              <input
                className={`w-full bg-white border ${errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'} rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-[#E94E3C] focus:border-transparent transition-all outline-none font-bold text-[#1A1A2E] shadow-sm`}
                type="email"
                name="email"
                value={data.email}
                autoComplete="username"
                placeholder="customer@example.com"
                onChange={(e) => setData('email', e.target.value)}
                required
              />
            </FormField>

            <FormField label="Password" error={errors.password}>
              <input
                className={`w-full bg-white border ${errors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'} rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-[#E94E3C] focus:border-transparent transition-all outline-none font-bold text-[#1A1A2E] shadow-sm tracking-widest`}
                type="password"
                name="password"
                value={data.password}
                autoComplete="current-password"
                placeholder="••••••••"
                onChange={(e) => setData('password', e.target.value)}
                required
              />
            </FormField>

            <button
              disabled={processing}
              className="button-glow mt-2 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#1A1A2E] px-5 text-xs font-black tracking-widest uppercase text-white transition-all hover:bg-[#E94E3C] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#E94E3C]/30 disabled:opacity-60 disabled:hover:transform-none"
              type="submit"
            >
              {processing ? 'Authenticating…' : 'Access Account'}
              {!processing && <ArrowRight size={16} strokeWidth={2.5} />}
            </button>
          </form>

          {/* 🟢 CUSTOMER REGISTRATION LINK */}
          <p className="mt-6 text-center text-sm font-bold text-gray-500">
            New customer?{' '}
            <Link href="/register" className="font-black text-[#1A1A2E] hover:text-[#E94E3C] transition-colors hover:underline">
              Create an account
            </Link>
          </p>

          <div className="mt-8 flex items-center gap-3 opacity-60">
            <div className="h-px flex-1 bg-gray-300" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">OR</span>
            <div className="h-px flex-1 bg-gray-300" />
          </div>

          {/* 🟢 FRANCHISE APPLICATION HIGHLIGHT BOX */}
          <div className="mt-8 rounded-2xl bg-[#E94E3C]/5 border border-[#E94E3C]/20 p-5 text-center group hover:bg-[#E94E3C]/10 transition-colors">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Business Opportunity</p>
            <p className="text-sm font-bold text-[#1A1A2E] mb-3">Want to start your own IHO store?</p>
            <Link href="/franchise/apply" className="inline-flex items-center gap-2 text-xs font-black tracking-widest text-white uppercase bg-[#E94E3C] px-6 py-2.5 rounded-full hover:bg-[#c0392b] hover:shadow-lg hover:shadow-[#E94E3C]/30 transition-all hover:-translate-y-0.5">
              Apply for Franchise <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
          </div>

          <p className="mt-8 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">
            <Link href="/" className="hover:text-[#1A1A2E] transition-colors flex items-center justify-center gap-1">
              <ChevronLeft size={12} /> Back to storefront
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function FormField({ label, error, children }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-widest text-gray-500">{label}</span>
      {children}
      {error && (
        <span className="text-[10px] font-bold tracking-wide text-red-500 flex items-center gap-1 uppercase mt-0.5">
          <AlertCircle size={12} strokeWidth={2.5} /> {error}
        </span>
      )}
    </label>
  );
}