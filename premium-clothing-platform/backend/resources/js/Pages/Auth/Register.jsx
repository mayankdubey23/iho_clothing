import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useForm } from '@inertiajs/react';
import { ArrowRight, ShieldCheck, Dumbbell, Globe, AlertCircle, ChevronLeft } from 'lucide-react';

const brandFeatures = [
  { icon: Globe, text: 'Unified Global Retail Platform' },
  { icon: Dumbbell, text: 'Exclusive Performance Collections' },
  { icon: ShieldCheck, text: 'Secure Studio Profile & Vault' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
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
    <div className="grid min-h-screen lg:grid-cols-[1fr_500px] xl:grid-cols-[1fr_600px] bg-white font-sans selection:bg-[#1E293B] selection:text-white">

      {/* 🚀 Premium Brand Panel (Left Side - Deep Slate) */}
      <div className="relative hidden overflow-hidden bg-[#0F172A] lg:flex lg:flex-col lg:justify-between lg:p-16 border-r border-slate-800">

        {/* ❄️ Subtle Metallic Background Glow */}
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-slate-600/10 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

        {/* Ghost Typography Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-[0.03]">
          <h2 className="text-[25vw] font-black text-white uppercase tracking-tighter leading-none">
            STUDIO
          </h2>
        </div>

        {/* Logo */}
        <motion.div
          className="relative flex items-center gap-4 z-10"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="grid size-12 place-items-center bg-white text-[#0F172A] font-black text-xs tracking-widest shadow-xl">
            IHO
          </div>
          <div>
            <p className="font-black text-white text-2xl tracking-tighter uppercase leading-none italic">
              IHO<span className="font-light text-slate-400">STUDIO</span>
            </p>
            <p className="text-[8px] font-black tracking-[0.4em] text-[#94A3B8] uppercase mt-1">Retail & Franchise Network</p>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div className="relative z-10" variants={stagger} initial="hidden" animate="visible">
          <motion.p className="mb-6 text-[10px] font-black uppercase tracking-[0.4em] text-[#94A3B8]" variants={fadeUp}>
            Initiation Protocol
          </motion.p>

          <motion.h1 className="text-5xl font-black leading-[1.1] text-white xl:text-7xl tracking-tighter uppercase" variants={fadeUp}>
            JOIN <br />
            <span className="text-transparent italic opacity-50" style={{ WebkitTextStroke: '2px white' }}>THE STUDIO</span>
          </motion.h1>

          <motion.p className="mt-8 max-w-sm text-xs font-bold uppercase tracking-widest leading-loose text-slate-400" variants={fadeUp}>
            Create your master profile to acquire premium activewear and track your franchise operations from a unified command center.
          </motion.p>

          <motion.ul className="mt-14 grid gap-6" variants={stagger}>
            {brandFeatures.map(({ icon: Icon, text }) => (
              <motion.li key={text} className="flex items-center gap-5 group" variants={fadeUp}>
                <div className="grid size-12 place-items-center border border-slate-700 bg-white/5 group-hover:bg-white group-hover:border-white transition-all duration-500">
                  <Icon size={18} className="text-slate-400 group-hover:text-[#0F172A] transition-colors duration-500" strokeWidth={1.5} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-300 group-hover:text-white transition-colors duration-500">{text}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Bottom */}
        <motion.div className="relative z-10 flex items-center gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          <div className="h-[1px] w-12 bg-slate-700" />
          <p className="text-[9px] font-black tracking-[0.3em] uppercase text-slate-500">
            © {new Date().getFullYear()} IHO STUDIO. ALL RIGHTS RESERVED.
          </p>
        </motion.div>
      </div>

      {/* 🚀 Form Panel (Right Side - Light Theme) */}
      <div className="flex items-start justify-center p-8 sm:p-16 relative overflow-hidden bg-white h-screen overflow-y-auto custom-scrollbar">

        {/* Subtle background geometric pattern */}
        <div className="absolute inset-0 z-[0] pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#1E293B 1px, transparent 1px), linear-gradient(90deg, #1E293B 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />

        <motion.div
          className="w-full max-w-sm relative z-10 py-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          {/* Mobile Logo */}
          <Link href="/" className="mb-12 flex items-center gap-4 lg:hidden">
            <div className="grid size-10 place-items-center bg-[#0F172A] text-white font-black text-xs tracking-widest shadow-xl">
              IHO
            </div>
            <span className="font-black text-[#1E293B] text-2xl tracking-tighter uppercase leading-none italic">
              STUDIO
            </span>
          </Link>

          <div className="mb-12">
            <h2 className="text-3xl font-black text-[#1E293B] tracking-tighter uppercase italic border-l-4 border-black pl-4">
              Registration
            </h2>
            <p className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#94A3B8]">
              Establish your digital identity
            </p>
          </div>

          <form onSubmit={submit} className="grid gap-7">
            <FormField label="Full Name" error={errors.name}>
              <input
                className={`w-full bg-slate-50 border ${errors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'} rounded-none px-5 py-3.5 focus:ring-1 focus:ring-black focus:border-black transition-all outline-none font-bold text-[#1E293B] placeholder:text-slate-300 text-sm`}
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
                className={`w-full bg-slate-50 border ${errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'} rounded-none px-5 py-3.5 focus:ring-1 focus:ring-black focus:border-black transition-all outline-none font-bold text-[#1E293B] placeholder:text-slate-300 text-sm`}
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
                className={`w-full bg-slate-50 border ${errors.mobile_number ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'} rounded-none px-5 py-3.5 focus:ring-1 focus:ring-black focus:border-black transition-all outline-none font-bold text-[#1E293B] placeholder:text-slate-300 text-sm tracking-widest`}
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
                className={`w-full bg-slate-50 border ${errors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'} rounded-none px-5 py-3.5 focus:ring-1 focus:ring-black focus:border-black transition-all outline-none font-black text-[#1E293B] placeholder:text-slate-300 tracking-[0.3em] text-sm`}
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
                className={`w-full bg-slate-50 border ${errors.password_confirmation ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'} rounded-none px-5 py-3.5 focus:ring-1 focus:ring-black focus:border-black transition-all outline-none font-black text-[#1E293B] placeholder:text-slate-300 tracking-[0.3em] text-sm`}
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
              className="mt-4 flex min-h-[56px] w-full items-center justify-center gap-3 rounded-none bg-[#000000] px-6 text-[10px] font-black tracking-[0.3em] uppercase text-white transition-all duration-500 hover:bg-[#1E293B] disabled:opacity-50 shadow-2xl shadow-black/10 group"
              type="submit"
            >
              {processing ? 'Establishing Identity…' : 'Create Profile'}
              {!processing && <ArrowRight size={16} strokeWidth={2} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          {/* 🟢 ALREADY REGISTERED */}
          <div className="mt-10 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">
              Existing Client?{' '}
              <Link href="/login" className="text-[#1E293B] hover:text-slate-500 transition-colors border-b border-[#1E293B] hover:border-slate-500 pb-0.5 ml-1">
                Authenticate Here
              </Link>
            </p>
          </div>

          <div className="mt-10 flex items-center gap-4 opacity-40">
            <div className="h-px flex-1 bg-slate-400" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">OR</span>
            <div className="h-px flex-1 bg-slate-400" />
          </div>

          {/* 🟢 FRANCHISE APPLICATION HIGHLIGHT BOX (Boutique Style) */}
          <div className="mt-10 border border-slate-200 bg-slate-50/50 p-8 text-center group hover:border-[#1E293B] transition-colors duration-500">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#94A3B8] mb-2">Partner Program</p>
            <p className="text-sm font-black text-[#1E293B] uppercase tracking-wide mb-6">Operate an IHO Studio</p>
            <Link href="/franchise/apply" className="inline-flex items-center justify-center gap-3 text-[10px] font-black tracking-[0.2em] text-[#1E293B] uppercase border border-[#1E293B] px-8 py-3.5 hover:bg-[#1E293B] hover:text-white transition-all w-full">
              Submit Application
            </Link>
          </div>

          <p className="mt-12 text-center pb-10">
            <Link href="/" className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-[#94A3B8] hover:text-[#1E293B] transition-colors">
              <ChevronLeft size={14} strokeWidth={2.5} /> Return to Storefront
            </Link>
          </p>
        </motion.div>
      </div>

      {/* CSS for custom scrollbar so the form area scrolls smoothly */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
      `}} />
    </div>
  );
}

// 💎 HELPER COMPONENT: Strict Minimalist Form Field with Absolute Error
function FormField({ label, error, children }) {
  return (
    <label className="grid gap-2.5 relative">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1E293B]">{label}</span>
      {children}
      {error && (
        <span className="absolute -bottom-5 left-0 text-[9px] font-black tracking-widest text-red-500 flex items-center gap-1.5 uppercase">
          <AlertCircle size={10} strokeWidth={3} /> {error}
        </span>
      )}
    </label>
  );
}