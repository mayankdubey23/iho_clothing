import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useForm } from '@inertiajs/react';
import { ArrowRight, AlertCircle, ChevronLeft } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.36, 1] } },
};

export default function Register() {
  const [localErrors, setLocalErrors] = useState({});
  const { data, setData, post, processing, errors: backendErrors } = useForm({
    name: '',
    email: '',
    mobile_number: '',
    password: '',
    password_confirmation: '',
  });

  // Combine Local (Frontend) and Backend (Laravel) Errors
  const errors = { ...localErrors, ...backendErrors };

  const validate = () => {
    let errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!data.name.trim() || data.name.length < 3) errs.name = "Valid full name required.";
    if (!data.email || !emailRegex.test(data.email)) errs.email = "Valid email address required.";
    if (!data.mobile_number || !phoneRegex.test(data.mobile_number)) errs.mobile_number = "Valid 10-digit mobile required.";
    if (data.password.length < 8) errs.password = "Minimum 8 characters required.";
    if (data.password !== data.password_confirmation) errs.password_confirmation = "Passwords do not match.";

    setLocalErrors(errs);
    return Object.keys(errs).length === 0;
  };

  function submit(event) {
    event.preventDefault();
    if (validate()) {
      post('/register', { preserveScroll: true });
    }
  }

  // 🚀 Strict Handlers with Real-time Error Clearing
  const handleNameChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    setData('name', value);
    if (localErrors.name) setLocalErrors({ ...localErrors, name: null });
  };

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setData('mobile_number', value);
    if (localErrors.mobile_number) setLocalErrors({ ...localErrors, mobile_number: null });
  };

  const handleGeneralChange = (field, value) => {
    setData(field, value);
    if (localErrors[field]) setLocalErrors({ ...localErrors, [field]: null });
  };

  return (
    <div className="h-screen overflow-hidden bg-white font-sans selection:bg-[#282c3f] selection:text-white lg:grid lg:grid-cols-[1fr_480px] xl:grid-cols-[1fr_540px]">

      {/* LEFT PANEL - Brand + Franchise CTA */}
      <div className="relative hidden overflow-hidden bg-[#282c3f] lg:flex lg:flex-col">

        {/* ❄️ Subtle Metallic Background Glow */}
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        {/* Logo at top */}
        <motion.div
          className="relative flex items-center gap-4 p-12 z-10"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="grid size-12 place-items-center bg-white text-[#282c3f] font-black text-xs tracking-widest shadow-xl">
            IHO
          </div>
          <div>
            <p className="font-black text-white text-2xl tracking-tighter uppercase leading-none italic">
              IHO<span className="font-light text-slate-400">STUDIO</span>
            </p>
            <p className="text-[8px] font-black tracking-[0.4em] text-[#ff3f6c] uppercase mt-1">Retail & Franchise Network</p>
          </div>
        </motion.div>

        {/* Franchise CTA moved to left panel below logo */}
        <div className="relative z-10 flex flex-col justify-center flex-1 px-12 pb-16">
          <motion.div
            className="border border-slate-700/50 bg-white/5 p-8 text-center group hover:bg-white/10 transition-all duration-500"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#ff3f6c] mb-2">Partner Program</p>
            <p className="text-sm font-black uppercase tracking-wide text-white mb-3">Operate an IHO Studio</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">After approval, Super Admin will create or approve your franchise admin login.</p>
            <Link href="/franchise/apply" className="inline-flex w-full items-center justify-center border border-white/30 px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-white hover:text-[#282c3f]">
              Submit Application
            </Link>
          </motion.div>
        </div>

        {/* Bottom */}
        <motion.div className="relative z-10 px-12 pb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          <div className="flex items-center gap-6">
            <div className="h-[1px] w-12 bg-slate-700" />
            <p className="text-[9px] font-black tracking-[0.3em] uppercase text-slate-500">
              © {new Date().getFullYear()} IHO STUDIO. ALL RIGHTS RESERVED.
            </p>
          </div>
        </motion.div>
      </div>

      {/* RIGHT PANEL - Registration Form */}
      <div className="h-screen overflow-y-auto bg-white">
        <div className="flex min-h-full items-center justify-center p-6 sm:p-10 relative">

          {/* Subtle background geometric pattern */}
          <div className="absolute inset-0 z-[0] pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(#282c3f 1px, transparent 1px), linear-gradient(90deg, #282c3f 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />

          <motion.div
            className="w-full max-w-sm relative z-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            {/* Mobile Logo */}
            <Link href="/" className="mb-8 flex items-center gap-4 lg:hidden">
              <div className="grid size-10 place-items-center bg-[#282c3f] text-white font-black text-xs tracking-widest shadow-xl">
                IHO
              </div>
              <span className="font-black text-[#282c3f] text-2xl tracking-tighter uppercase leading-none italic">
                STUDIO
              </span>
            </Link>

            <div className="mb-6">
              <h2 className="text-2xl font-black text-[#282c3f] tracking-tighter uppercase italic border-l-4 border-black pl-4">
                Registration
              </h2>
              <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#ff3f6c]">
                Establish your digital identity
              </p>
            </div>

            <form onSubmit={submit} className="grid gap-5">
              <FormField label="Full Name" error={errors.name}>
                <input
                  className={`w-full bg-slate-50 border ${errors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'} rounded-none px-4 py-2.5 focus:ring-1 focus:ring-black focus:border-black transition-all outline-none font-bold text-[#282c3f] placeholder:text-slate-300 text-sm`}
                  type="text"
                  name="name"
                  value={data.name}
                  autoComplete="name"
                  placeholder="E.g. Vikram Singh"
                  onChange={handleNameChange}
                  required
                />
              </FormField>

              <FormField label="Email Address" error={errors.email}>
                <input
                  className={`w-full bg-slate-50 border ${errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'} rounded-none px-4 py-2.5 focus:ring-1 focus:ring-black focus:border-black transition-all outline-none font-bold text-[#282c3f] placeholder:text-slate-300 text-sm`}
                  type="email"
                  name="email"
                  value={data.email}
                  autoComplete="email"
                  placeholder="client@ihostudio.com"
                  onChange={(e) => handleGeneralChange('email', e.target.value.trim())}
                  required
                />
              </FormField>

              <FormField label="Mobile Number" error={errors.mobile_number}>
                <input
                  className={`w-full bg-slate-50 border ${errors.mobile_number ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'} rounded-none px-4 py-2.5 focus:ring-1 focus:ring-black focus:border-black transition-all outline-none font-bold text-[#282c3f] placeholder:text-slate-300 text-sm tracking-widest`}
                  type="tel"
                  name="mobile_number"
                  value={data.mobile_number}
                  autoComplete="tel"
                  placeholder="10-DIGIT NUMBER"
                  onChange={handleMobileChange}
                  required
                />
              </FormField>

              <FormField label="Password" error={errors.password}>
                <input
                  className={`w-full bg-slate-50 border ${errors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'} rounded-none px-4 py-2.5 focus:ring-1 focus:ring-black focus:border-black transition-all outline-none font-black text-[#282c3f] placeholder:text-slate-300 tracking-[0.3em] text-sm`}
                  type="password"
                  name="password"
                  value={data.password}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  onChange={(e) => handleGeneralChange('password', e.target.value)}
                  required
                />
              </FormField>

              <FormField label="Confirm Password" error={errors.password_confirmation}>
                <input
                  className={`w-full bg-slate-50 border ${errors.password_confirmation ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'} rounded-none px-4 py-2.5 focus:ring-1 focus:ring-black focus:border-black transition-all outline-none font-black text-[#282c3f] placeholder:text-slate-300 tracking-[0.3em] text-sm`}
                  type="password"
                  name="password_confirmation"
                  value={data.password_confirmation}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  onChange={(e) => handleGeneralChange('password_confirmation', e.target.value)}
                  required
                />
              </FormField>

              <button
                disabled={processing}
                className="mt-2 flex min-h-[48px] w-full items-center justify-center gap-3 rounded-none bg-[#000000] px-6 text-[10px] font-black tracking-[0.3em] uppercase text-white transition-all duration-500 hover:bg-[#282c3f] disabled:opacity-50 shadow-2xl shadow-black/10 group"
                type="submit"
              >
                {processing ? 'Establishing Identity…' : 'Create Profile'}
                {!processing && <ArrowRight size={16} strokeWidth={2} className="group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>

            {/* ALREADY REGISTERED */}
            <div className="mt-6 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#ff3f6c]">
                Existing Client?{' '}
                <Link href="/login" className="text-[#282c3f] hover:text-slate-500 transition-colors border-b border-[#282c3f] hover:border-slate-500 pb-0.5 ml-1">
                  Authenticate Here
                </Link>
              </p>
            </div>

            <p className="mt-6 text-center pb-4">
              <Link href="/" className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-[#ff3f6c] hover:text-[#282c3f] transition-colors">
                <ChevronLeft size={14} strokeWidth={2.5} /> Return to Storefront
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// 💎 HELPER COMPONENT: Strict Minimalist Form Field with Absolute Error
function FormField({ label, error, children }) {
  return (
    <label className="grid gap-1.5 relative">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#282c3f]">{label}</span>
      {children}
      {error && (
        <span className="absolute -bottom-4 left-0 text-[9px] font-black tracking-widest text-red-500 flex items-center gap-1.5 uppercase">
          <AlertCircle size={10} strokeWidth={3} /> {error}
        </span>
      )}
    </label>
  );
}