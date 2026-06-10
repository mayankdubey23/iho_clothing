import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertCircle, ArrowRight, ChevronLeft, Eye, EyeOff, Smartphone } from 'lucide-react';

export default function Login({ otpMode = false, status = null }) {
  const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
    remember: false,
    captcha_token: '',
    otp: '',
  });

  const [loginStatus, setLoginStatus] = useState('Login');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [helperMessage, setHelperMessage] = useState(status || '');
  const [mobileOtpOpen, setMobileOtpOpen] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [mobileStep, setMobileStep] = useState('request');
  const [mobileProcessing, setMobileProcessing] = useState(false);
  const [googleProcessing, setGoogleProcessing] = useState(false);

  const csrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
  const jsonHeaders = () => ({
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-CSRF-TOKEN': csrfToken(),
    'X-Requested-With': 'XMLHttpRequest',
  });

  const submit = (event) => {
    event.preventDefault();
    setLoginStatus(otpMode ? 'Verifying OTP...' : 'Authenticating...');

    post(otpMode ? '/login/otp' : '/login', {
      preserveScroll: true,
      onSuccess: () => setLoginStatus('Securing your workspace...'),
      onError: () => setLoginStatus('Login'),
    });
  };

  const requestForgotPassword = async () => {
    if (!forgotIdentifier) {
      setHelperMessage('Enter your email or mobile number first.');
      return;
    }

    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ identifier: forgotIdentifier }),
    });
    const payload = await response.json();
    setHelperMessage(payload.message || 'If this account exists, reset instructions have been sent.');
  };

  const requestMobileOtp = async () => {
    if (!/^[6-9][0-9]{9}$/.test(mobileNumber)) {
      setHelperMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setMobileProcessing(true);
    const response = await fetch('/login/mobile-otp', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ mobile_number: mobileNumber }),
    });
    const payload = await response.json();
    setMobileProcessing(false);
    if (response.ok) {
      setMobileStep('verify');
    }
    setHelperMessage(payload.message || 'If this mobile number exists, an OTP has been sent.');
  };

  const verifyMobileOtp = async () => {
    if (!/^[0-9]{6}$/.test(mobileOtp)) {
      setHelperMessage('Please enter the 6-digit OTP.');
      return;
    }

    setMobileProcessing(true);
    const response = await fetch('/login/mobile-otp/verify', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ mobile_number: mobileNumber, otp: mobileOtp }),
    });
    const payload = await response.json();
    setMobileProcessing(false);
    setHelperMessage(payload.message || (response.ok ? 'OTP verified.' : 'Invalid OTP.'));

    if (response.ok && payload.redirect) {
      window.location.href = payload.redirect;
    }
  };

  const continueWithGoogle = async () => {
    setGoogleProcessing(true);
    const response = await fetch('/auth/google/status', { headers: { Accept: 'application/json' } });
    const payload = await response.json();
    setGoogleProcessing(false);

    if (payload.configured && payload.redirect) {
      window.location.href = payload.redirect;
      return;
    }

    setHelperMessage(payload.message || 'Google login is not available right now.');
  };

  return (
    <div className="h-screen overflow-hidden bg-white font-sans selection:bg-[#282c3f] selection:text-white lg:grid lg:grid-cols-[1fr_480px] xl:grid-cols-[1fr_540px]">
      <Head title={otpMode ? 'Verify OTP | IHO Studio' : 'Login | IHO Studio'} />

      {/* LEFT PANEL - Brand + Franchise CTA */}
      <aside className="relative hidden overflow-hidden bg-[#282c3f] text-white lg:flex lg:flex-col">
        <div className="absolute left-0 top-0 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-[120px]" />

        {/* Logo at top */}
        <div className="relative z-10 flex items-center gap-4 p-12">
          <div className="grid size-12 place-items-center bg-white text-xs font-black tracking-widest text-[#282c3f]">IHO</div>
          <div>
            <p className="text-2xl font-black uppercase italic leading-none tracking-tighter">IHO<span className="font-light text-slate-400">STUDIO</span></p>
            <p className="mt-1 text-[8px] font-black uppercase tracking-[0.4em] text-[#ff3f6c]">Retail & Franchise Network</p>
          </div>
        </div>

        {/* Franchise CTA moved to left panel */}
        <div className="relative z-10 flex flex-col justify-center flex-1 px-12 pb-16">
          <div className="border border-slate-700/50 bg-white/5 p-8 text-center group hover:bg-white/10 transition-all duration-500">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#ff3f6c] mb-2">Partner Program</p>
            <p className="text-sm font-black uppercase tracking-wide text-white mb-3">Operate an IHO Studio</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">After approval, Super Admin will create or approve your franchise admin login.</p>
            <Link href="/franchise-enquiry" className="inline-flex w-full items-center justify-center border border-white/30 px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-white hover:text-[#282c3f]">
              Apply for Franchise
            </Link>
          </div>
        </div>

        {/* Copyright at bottom */}
        <p className="relative z-10 px-12 pb-8 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">
          © {new Date().getFullYear()} IHO Studio. All rights reserved.
        </p>
      </aside>

      {/* RIGHT PANEL - Login Form (scrollable only within) */}
      <main className="h-screen overflow-y-auto bg-white">
        <div className="flex min-h-full items-center justify-center p-6 sm:p-10 relative">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(#282c3f 1px, transparent 1px), linear-gradient(90deg, #282c3f 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative z-10 w-full max-w-sm">
            {/* Mobile Logo */}
            <Link href="/" className="mb-8 flex items-center gap-4 lg:hidden">
              <div className="grid size-10 place-items-center bg-[#282c3f] text-xs font-black tracking-widest text-white">IHO</div>
              <span className="text-2xl font-black uppercase italic tracking-tighter text-[#282c3f]">Studio</span>
            </Link>

            <div className="mb-6">
              <h2 className="border-l-4 border-black pl-4 text-2xl font-black uppercase italic tracking-tighter text-[#282c3f]">
                {otpMode ? 'OTP Verification' : 'Login'}
              </h2>
              <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#ff3f6c]">
                {otpMode ? 'Enter the code sent to your registered contact.' : 'Track orders, manage wishlist, checkout faster.'}
              </p>
            </div>

            {helperMessage && (
              <div className="mb-4 border border-slate-200 bg-slate-50 p-3 text-[10px] font-bold uppercase tracking-widest text-[#282c3f]">
                {helperMessage}
              </div>
            )}

            <form onSubmit={submit} className="grid gap-4">
              {otpMode ? (
                <FormField label="Security OTP" error={errors.otp}>
                  <input
                    className={`form-input tracking-[0.35em] ${errors.otp ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={data.otp}
                    placeholder="000000"
                    onChange={(e) => setData('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                  />
                </FormField>
              ) : (
                <>
                  <FormField label="Email Address" error={errors.email}>
                    <input
                      className={`form-input ${errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'}`}
                      type="email"
                      value={data.email}
                      autoComplete="username"
                      placeholder="customer@ihostudio.com"
                      onChange={(e) => setData('email', e.target.value)}
                      required
                    />
                  </FormField>

                  <FormField label="Password" error={errors.password}>
                    <div className="relative">
                      <input
                        className={`form-input pr-14 ${errors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'}`}
                        type={showPassword ? 'text' : 'password'}
                        value={data.password}
                        autoComplete="current-password"
                        placeholder="Password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 grid w-12 place-items-center text-slate-400 hover:text-[#282c3f]"
                        title={showPassword ? 'Hide Password' : 'Show Password'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </FormField>

                  <div className="flex items-center justify-between gap-4">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <input
                        type="checkbox"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                        className="size-4 rounded-none border-slate-300 text-[#282c3f] focus:ring-[#282c3f]"
                      />
                      Remember Me
                    </label>
                    <button type="button" onClick={() => setForgotOpen(!forgotOpen)} className="text-[10px] font-black uppercase tracking-widest text-[#282c3f] underline decoration-dotted">
                      Forgot Password?
                    </button>
                  </div>

                  {errors.captcha && (
                    <label className="flex items-center gap-2 border border-amber-200 bg-amber-50 p-3 text-[10px] font-black uppercase tracking-widest text-amber-700">
                      <input
                        type="checkbox"
                        checked={data.captcha_token === 'confirmed'}
                        onChange={(e) => setData('captcha_token', e.target.checked ? 'confirmed' : '')}
                        className="size-4"
                      />
                      I am not a robot
                    </label>
                  )}
                </>
              )}

              <button
                disabled={processing}
                className="mt-1 flex min-h-[48px] w-full items-center justify-center gap-3 bg-[#000000] px-6 text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-2xl shadow-black/10 transition-all duration-500 hover:bg-[#282c3f] disabled:opacity-50"
                type="submit"
              >
                {processing ? loginStatus : otpMode ? 'Verify OTP' : 'Login'}
                {!processing && <ArrowRight size={16} strokeWidth={2} />}
              </button>
            </form>

            {!otpMode && forgotOpen && (
              <div className="mt-4 border border-slate-200 bg-white p-4">
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#282c3f]">Forgot Password</p>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Enter email/mobile, receive OTP or reset link, create a new password, then login again.</p>
                <div className="flex gap-2">
                  <input
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    placeholder="Email or mobile"
                    className="min-w-0 flex-1 border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold outline-none focus:border-black"
                  />
                  <button type="button" onClick={requestForgotPassword} className="bg-[#282c3f] px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-white">
                    Send
                  </button>
                </div>
              </div>
            )}

            {!otpMode && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setMobileOtpOpen(!mobileOtpOpen)} className="flex items-center justify-center gap-2 border border-slate-200 bg-white px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#282c3f] hover:border-[#282c3f]">
                  <Smartphone size={14} /> Mobile OTP
                </button>
                <button type="button" onClick={continueWithGoogle} disabled={googleProcessing} className="flex items-center justify-center gap-2 border border-slate-200 bg-white px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#282c3f] hover:border-[#282c3f] disabled:opacity-50">
                  {googleProcessing ? '...' : 'Google'}
                </button>
              </div>
            )}

            {!otpMode && mobileOtpOpen && (
              <div className="mt-4 border border-slate-200 bg-white p-4">
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#282c3f]">Mobile OTP Login</p>
                <div className="grid gap-2">
                  <input
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile number"
                    className="border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold outline-none focus:border-black"
                  />
                  {mobileStep === 'verify' && (
                    <input
                      value={mobileOtp}
                      onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter OTP"
                      className="border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold tracking-[0.35em] outline-none focus:border-black"
                    />
                  )}
                  <button
                    type="button"
                    onClick={mobileStep === 'verify' ? verifyMobileOtp : requestMobileOtp}
                    disabled={mobileProcessing}
                    className="bg-[#282c3f] px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-white disabled:opacity-50"
                  >
                    {mobileProcessing ? 'Please wait...' : mobileStep === 'verify' ? 'Verify OTP' : 'Send OTP'}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#ff3f6c]">
                New customer?{' '}
                <Link href="/register" className="ml-1 border-b border-[#282c3f] pb-0.5 text-[#282c3f] hover:text-slate-500">
                  Create Account
                </Link>
              </p>
            </div>

            <p className="mt-6 text-center">
              <Link href="/" className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-[#ff3f6c] transition-colors hover:text-[#282c3f]">
                <ChevronLeft size={14} strokeWidth={2.5} /> Return to Storefront
              </Link>
            </p>
          </div>
        </div>
      </main>

      <style>{`
        .form-input {
          width: 100%;
          background: #f5f5f6;
          border-width: 1px;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          font-weight: 700;
          color: #282c3f;
          outline: none;
          transition: all 0.2s ease;
        }
        .form-input:focus {
          border-color: #000;
          background: #fff;
          box-shadow: 0 0 0 1px #000;
        }
        .form-input::placeholder {
          color: #ffe1e8;
        }
      `}</style>
    </div>
  );
}

function FormField({ label, error, children }) {
  return (
    <label className="relative grid gap-1.5">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#282c3f]">{label}</span>
      {children}
      {error && (
        <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-red-500">
          <AlertCircle size={10} strokeWidth={3} /> {error}
        </span>
      )}
    </label>
  );
}