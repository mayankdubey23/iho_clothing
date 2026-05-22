import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, FileText, Loader2 } from 'lucide-react';

const steps = [
  'Personal Details',
  'Franchise Location',
  'Business Experience',
  'Investment Details',
  'Operations Setup',
  'Marketing Capability',
  'Documents',
  'Final Questions',
  'Submit Application',
];

const yesNo = [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }];
const genderOptions = [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }];
const franchiseTypes = [{ value: 'online', label: 'Online' }, { value: 'offline', label: 'Offline Store' }, { value: 'both', label: 'Both' }];
const locationTypes = ['Market', 'Mall', 'High Street', 'Gym Area', 'Residential Area'].map((label) => ({ value: label, label }));
const budgetOptions = ['₹1 Lakh – ₹3 Lakh', '₹3 Lakh – ₹5 Lakh', '₹5 Lakh – ₹10 Lakh', '₹10 Lakh+', 'Custom Budget'].map((label) => ({ value: label, label }));
const startOptions = ['Immediately', 'Within 15 days', 'Within 30 days', 'Within 60 days', 'After 60 days'].map((label) => ({ value: label, label }));
const experienceOptions = ['Clothing', 'Sportswear', 'Fitness', 'Ecommerce', 'Retail', 'New to this business'].map((label) => ({ value: label, label }));

export default function FranchiseApply() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formErrors, setFormErrors] = useState({});
  const [loadingPin, setLoadingPin] = useState({ current: false, preferred: false });
  const [sameAsMobile, setSameAsMobile] = useState(false);

  const { data, setData, post, processing, recentlySuccessful } = useForm({
    full_name: '', mobile_number: '', whatsapp_number: '', email: '', age: '', gender: '',
    current_city: '', current_state: '', full_address: '', pincode: '',
    preferred_state: '', preferred_city: '', preferred_area: '', preferred_pincode: '',
    franchise_type: '', has_shop: '', shop_size: '', location_type: '',
    owns_business: '', business_name: '', business_type: '', experience_years: '', clothing_experience: '',
    gst_number: '', pan_number: '', business_registration: '',
    investment_budget: '', can_purchase_initial_stock: '', expected_sales: '', ready_for_marketing_investment: '',
    has_storage_space: '', has_staff: '', can_manage_packing: '', can_manage_local_delivery: '',
    can_handle_returns: '', has_computer_internet: '', can_manage_customer_support: '',
    can_promote_social: '', has_social_page: '', has_local_network: '', can_run_ads: '', can_promote_events: '',
    social_media_links: '',
    aadhaar_doc: null, pan_doc: null, gst_doc: null, address_proof_doc: null, shop_proof_doc: null,
    business_registration_doc: null, bank_proof_doc: null,
    why_franchise: '', cover_area: '', start_timeline: '', agree_pricing_policy: false,
    additional_message: '', terms_accepted: false, privacy_accepted: false, verification_consent: false,
  });

  const setField = (field, value) => {
    setData(field, value);
    setFormErrors((prev) => ({ ...prev, [field]: null }));
  };

  const lookupPin = async (pin, target) => {
    if (pin.length !== 6) return;
    setLoadingPin((prev) => ({ ...prev, [target]: true }));
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const result = await response.json();
      const postOffice = result?.[0]?.PostOffice?.[0];
      if (result?.[0]?.Status === 'Success' && postOffice) {
        if (target === 'current') {
          setData((prev) => ({ ...prev, pincode: pin, current_state: postOffice.State, current_city: postOffice.District }));
        } else {
          setData((prev) => ({ ...prev, preferred_pincode: pin, preferred_state: postOffice.State, preferred_city: postOffice.District }));
        }
      } else {
        setFormErrors((prev) => ({ ...prev, [target === 'current' ? 'pincode' : 'preferred_pincode']: 'Please enter a valid 6-digit pincode.' }));
      }
    } catch {
      setFormErrors((prev) => ({ ...prev, [target === 'current' ? 'pincode' : 'preferred_pincode']: 'Unable to verify pincode right now.' }));
    } finally {
      setLoadingPin((prev) => ({ ...prev, [target]: false }));
    }
  };

  const handlePhone = (field, value) => {
    const phone = value.replace(/\D/g, '').slice(0, 10);
    if (field === 'mobile_number') {
      setData((prev) => ({ ...prev, mobile_number: phone, whatsapp_number: sameAsMobile ? phone : prev.whatsapp_number }));
    } else {
      setField(field, phone);
    }
  };

  const validateStep = (step) => {
    const errors = {};
    const nameRegex = /^[A-Za-z\s]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    const pinRegex = /^\d{6}$/;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/i;
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i;
    const required = (field, message = 'This field is required.') => {
      if (!String(data[field] || '').trim()) errors[field] = message;
    };

    if (step === 1) {
      required('full_name');
      if (data.full_name && !nameRegex.test(data.full_name.trim())) errors.full_name = 'Name cannot contain numbers or special characters.';
      if (!phoneRegex.test(data.mobile_number)) errors.mobile_number = 'Please enter a valid 10-digit Indian mobile number.';
      if (!phoneRegex.test(data.whatsapp_number)) errors.whatsapp_number = 'Please enter a valid 10-digit WhatsApp number.';
      if (!emailRegex.test(data.email)) errors.email = 'Please enter a valid email address.';
      if (!data.age || Number(data.age) < 18 || Number(data.age) > 80) errors.age = 'Please enter a valid age.';
      required('gender');
      required('full_address');
      if (!pinRegex.test(data.pincode)) errors.pincode = 'Please enter a valid 6-digit pincode.';
      required('current_city');
      required('current_state');
    }

    if (step === 2) {
      ['preferred_state', 'preferred_city', 'preferred_area', 'franchise_type', 'has_shop', 'location_type'].forEach((field) => required(field));
      if (!pinRegex.test(data.preferred_pincode)) errors.preferred_pincode = 'Please enter a valid 6-digit pincode.';
    }

    if (step === 3) {
      ['owns_business', 'clothing_experience', 'pan_number'].forEach((field) => required(field));
      if (data.pan_number && !panRegex.test(data.pan_number)) errors.pan_number = 'Please enter a valid PAN number.';
      if (data.gst_number && !gstRegex.test(data.gst_number)) errors.gst_number = 'Please enter a valid GST number.';
    }

    if (step === 4) {
      ['investment_budget', 'can_purchase_initial_stock', 'expected_sales', 'ready_for_marketing_investment'].forEach((field) => required(field));
    }

    if (step === 5) {
      ['has_storage_space', 'has_staff', 'can_manage_packing', 'can_manage_local_delivery', 'can_handle_returns', 'has_computer_internet', 'can_manage_customer_support'].forEach((field) => required(field));
    }

    if (step === 6) {
      ['can_promote_social', 'has_social_page', 'has_local_network', 'can_run_ads', 'can_promote_events'].forEach((field) => required(field));
    }

    if (step === 8) {
      required('why_franchise');
      if (data.why_franchise.trim().length < 20) errors.why_franchise = 'Please write at least 20 characters.';
      ['cover_area', 'start_timeline'].forEach((field) => required(field));
      if (!data.agree_pricing_policy) errors.agree_pricing_policy = 'Please confirm this agreement.';
    }

    if (step === 9) {
      if (!data.terms_accepted) errors.terms_accepted = 'Please accept terms and conditions.';
      if (!data.privacy_accepted) errors.privacy_accepted = 'Please accept privacy policy.';
      if (!data.verification_consent) errors.verification_consent = 'Please give verification consent.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep((step) => Math.min(step + 1, steps.length));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setCurrentStep((step) => Math.max(step - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = (event) => {
    event.preventDefault();
    if (!validateStep(9)) return;
    post('/franchise/apply', { forceFormData: true, preserveScroll: true });
  };

  if (recentlySuccessful) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A] px-4 text-center text-white">
        <div className="max-w-xl">
          <CheckCircle2 size={76} className="mx-auto mb-8 text-[#E94E3C]" />
          <h1 className="text-3xl font-black uppercase tracking-tight">Application Received</h1>
          <p className="mt-5 text-sm font-medium leading-7 text-slate-300">
            Thank you for applying for our franchise. Our team will review your details and contact you soon.
          </p>
          <a href="/" className="mt-9 inline-flex items-center gap-3 bg-white px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[#0F172A] hover:bg-[#E94E3C] hover:text-white">
            Return to Storefront <ArrowRight size={15} />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-10 text-[#1E293B]">
      <Head title="Apply for Franchise | IHO Studio" />

      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#E94E3C]">Business Partnership</p>
          <h1 className="mt-4 text-4xl font-black uppercase italic tracking-tight md:text-5xl">Apply for Franchise</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-medium text-slate-500">Submit your details for superadmin review and partner onboarding.</p>
        </div>

        <div className="mb-8 grid grid-cols-3 gap-2 md:grid-cols-9">
          {steps.map((step, index) => (
            <button
              key={step}
              type="button"
              onClick={() => index + 1 < currentStep && setCurrentStep(index + 1)}
              className={`px-3 py-3 text-[8px] font-black uppercase tracking-widest ${currentStep === index + 1 ? 'bg-[#1E293B] text-white' : index + 1 < currentStep ? 'bg-[#E94E3C] text-white' : 'bg-white text-slate-400'}`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="overflow-hidden bg-white shadow-xl shadow-slate-200/70">
          <div className="border-b border-slate-100 p-6 md:p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Step {currentStep} of {steps.length}</p>
            <h2 className="mt-2 text-2xl font-black uppercase tracking-tight">{steps[currentStep - 1]}</h2>
          </div>

          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div key={currentStep} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} className="grid gap-6">
                {currentStep === 1 && (
                  <div className="grid gap-6 md:grid-cols-2">
                    <Input label="Full Name" value={data.full_name} error={formErrors.full_name} onChange={(e) => setField('full_name', e.target.value.replace(/[^A-Za-z\s]/g, ''))} required />
                    <Input label="Mobile Number" value={data.mobile_number} error={formErrors.mobile_number} onChange={(e) => handlePhone('mobile_number', e.target.value)} required />
                    <div>
                      <Input label="WhatsApp Number" value={data.whatsapp_number} error={formErrors.whatsapp_number} onChange={(e) => handlePhone('whatsapp_number', e.target.value)} required />
                      <label className="mt-2 flex w-fit cursor-pointer items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <input type="checkbox" checked={sameAsMobile} onChange={(e) => { setSameAsMobile(e.target.checked); if (e.target.checked) setField('whatsapp_number', data.mobile_number); }} />
                        Same as mobile
                      </label>
                    </div>
                    <Input label="Email Address" type="email" value={data.email} error={formErrors.email} onChange={(e) => setField('email', e.target.value)} required />
                    <Input label="Age" type="number" value={data.age} error={formErrors.age} onChange={(e) => setField('age', e.target.value)} required />
                    <Select label="Gender" value={data.gender} error={formErrors.gender} onChange={(e) => setField('gender', e.target.value)} options={genderOptions} required />
                    <div className="md:col-span-2"><Textarea label="Full Address" value={data.full_address} error={formErrors.full_address} onChange={(e) => setField('full_address', e.target.value)} required /></div>
                    <PincodeInput label="Pincode" value={data.pincode} loading={loadingPin.current} error={formErrors.pincode} onChange={(pin) => { setField('pincode', pin); lookupPin(pin, 'current'); }} />
                    <Input label="Current City" value={data.current_city} error={formErrors.current_city} onChange={(e) => setField('current_city', e.target.value)} required />
                    <Input label="Current State" value={data.current_state} error={formErrors.current_state} onChange={(e) => setField('current_state', e.target.value)} required />
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="grid gap-6 md:grid-cols-2">
                    <PincodeInput label="Preferred Pincode" value={data.preferred_pincode} loading={loadingPin.preferred} error={formErrors.preferred_pincode} onChange={(pin) => { setField('preferred_pincode', pin); lookupPin(pin, 'preferred'); }} />
                    <Input label="Preferred Franchise City" value={data.preferred_city} error={formErrors.preferred_city} onChange={(e) => setField('preferred_city', e.target.value)} required />
                    <Input label="Preferred Franchise State" value={data.preferred_state} error={formErrors.preferred_state} onChange={(e) => setField('preferred_state', e.target.value)} required />
                    <Input label="Preferred Area / Locality" value={data.preferred_area} error={formErrors.preferred_area} onChange={(e) => setField('preferred_area', e.target.value)} required />
                    <Select label="Franchise Type" value={data.franchise_type} error={formErrors.franchise_type} onChange={(e) => setField('franchise_type', e.target.value)} options={franchiseTypes} required />
                    <Select label="Do you already have shop/showroom?" value={data.has_shop} error={formErrors.has_shop} onChange={(e) => setField('has_shop', e.target.value)} options={yesNo} required />
                    <Input label="Shop size if available" value={data.shop_size} error={formErrors.shop_size} onChange={(e) => setField('shop_size', e.target.value)} />
                    <Select label="Shop location type" value={data.location_type} error={formErrors.location_type} onChange={(e) => setField('location_type', e.target.value)} options={locationTypes} required />
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="grid gap-6 md:grid-cols-2">
                    <Select label="Do you already own a business?" value={data.owns_business} error={formErrors.owns_business} onChange={(e) => setField('owns_business', e.target.value)} options={yesNo} required />
                    <Input label="Current Business Name" value={data.business_name} error={formErrors.business_name} onChange={(e) => setField('business_name', e.target.value)} />
                    <Input label="Business Type" value={data.business_type} error={formErrors.business_type} onChange={(e) => setField('business_type', e.target.value)} />
                    <Input label="Years of Experience" value={data.experience_years} error={formErrors.experience_years} onChange={(e) => setField('experience_years', e.target.value)} />
                    <Select label="Experience in Clothing / Sportswear / Fitness / Ecommerce" value={data.clothing_experience} error={formErrors.clothing_experience} onChange={(e) => setField('clothing_experience', e.target.value)} options={experienceOptions} required />
                    <Input label="GST Number if available" value={data.gst_number} error={formErrors.gst_number} onChange={(e) => setField('gst_number', e.target.value.toUpperCase())} />
                    <Input label="PAN Number" value={data.pan_number} error={formErrors.pan_number} onChange={(e) => setField('pan_number', e.target.value.toUpperCase())} required />
                    <Input label="Business Registration if available" value={data.business_registration} error={formErrors.business_registration} onChange={(e) => setField('business_registration', e.target.value)} />
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="grid gap-6 md:grid-cols-2">
                    <Select label="Available Investment Budget" value={data.investment_budget} error={formErrors.investment_budget} onChange={(e) => setField('investment_budget', e.target.value)} options={budgetOptions} required />
                    <Select label="Can you purchase initial stock?" value={data.can_purchase_initial_stock} error={formErrors.can_purchase_initial_stock} onChange={(e) => setField('can_purchase_initial_stock', e.target.value)} options={yesNo} required />
                    <Input label="Expected Monthly Sales Target" value={data.expected_sales} error={formErrors.expected_sales} onChange={(e) => setField('expected_sales', e.target.value)} required />
                    <Select label="Ready for marketing investment?" value={data.ready_for_marketing_investment} error={formErrors.ready_for_marketing_investment} onChange={(e) => setField('ready_for_marketing_investment', e.target.value)} options={yesNo} required />
                  </div>
                )}

                {currentStep === 5 && <YesNoGrid data={data} setField={setField} errors={formErrors} fields={[
                  ['has_storage_space', 'Do you have storage space?'], ['has_staff', 'Do you have staff?'], ['can_manage_packing', 'Can you manage packing?'],
                  ['can_manage_local_delivery', 'Can you manage local delivery?'], ['can_handle_returns', 'Can you handle returns/exchanges?'],
                  ['has_computer_internet', 'Do you have computer/internet access?'], ['can_manage_customer_support', 'Can you manage customer support?'],
                ]} />}

                {currentStep === 6 && (
                  <div className="grid gap-6 md:grid-cols-2">
                    <YesNoGrid data={data} setField={setField} errors={formErrors} fields={[
                      ['can_promote_social', 'Can you promote products on Instagram/Facebook?'], ['has_social_page', 'Do you have existing social media page?'],
                      ['has_local_network', 'Do you have local customer network?'], ['can_run_ads', 'Can you run ads?'],
                      ['can_promote_events', 'Can you promote through gyms/local events?'],
                    ]} />
                    <div className="md:col-span-2"><Textarea label="Social Media Profile Links" value={data.social_media_links} error={formErrors.social_media_links} onChange={(e) => setField('social_media_links', e.target.value)} /></div>
                  </div>
                )}

                {currentStep === 7 && (
                  <div className="grid gap-5 md:grid-cols-2">
                    <Upload label="Aadhaar Card" onChange={(file) => setField('aadhaar_doc', file)} />
                    <Upload label="PAN Card" onChange={(file) => setField('pan_doc', file)} />
                    <Upload label="GST Certificate" onChange={(file) => setField('gst_doc', file)} />
                    <Upload label="Address Proof" onChange={(file) => setField('address_proof_doc', file)} />
                    <Upload label="Shop Proof if available" onChange={(file) => setField('shop_proof_doc', file)} />
                    <Upload label="Business Registration" onChange={(file) => setField('business_registration_doc', file)} />
                    <Upload label="Cancelled Cheque / Bank Proof if required" onChange={(file) => setField('bank_proof_doc', file)} />
                  </div>
                )}

                {currentStep === 8 && (
                  <div className="grid gap-6">
                    <Textarea label="Why do you want to buy our franchise?" value={data.why_franchise} error={formErrors.why_franchise} onChange={(e) => setField('why_franchise', e.target.value)} required />
                    <Textarea label="Which area do you want to cover?" value={data.cover_area} error={formErrors.cover_area} onChange={(e) => setField('cover_area', e.target.value)} required />
                    <Select label="How soon can you start?" value={data.start_timeline} error={formErrors.start_timeline} onChange={(e) => setField('start_timeline', e.target.value)} options={startOptions} required />
                    <Checkbox label="Do you agree to company pricing and franchise policy?" checked={data.agree_pricing_policy} error={formErrors.agree_pricing_policy} onChange={(value) => setField('agree_pricing_policy', value)} />
                    <Textarea label="Any additional message or questions?" value={data.additional_message} error={formErrors.additional_message} onChange={(e) => setField('additional_message', e.target.value)} />
                  </div>
                )}

                {currentStep === 9 && (
                  <div className="grid gap-5">
                    <Checkbox label="Terms & Conditions" checked={data.terms_accepted} error={formErrors.terms_accepted} onChange={(value) => setField('terms_accepted', value)} />
                    <Checkbox label="Privacy Policy" checked={data.privacy_accepted} error={formErrors.privacy_accepted} onChange={(value) => setField('privacy_accepted', value)} />
                    <Checkbox label="Verification Consent" checked={data.verification_consent} error={formErrors.verification_consent} onChange={(value) => setField('verification_consent', value)} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 p-6">
            {currentStep > 1 ? (
              <button type="button" onClick={prevStep} className="inline-flex items-center gap-2 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-[#1E293B]">
                <ChevronLeft size={16} /> Back
              </button>
            ) : <span />}

            {currentStep < steps.length ? (
              <button type="button" onClick={nextStep} className="inline-flex items-center gap-2 bg-[#1E293B] px-7 py-4 text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#E94E3C]">
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button type="submit" disabled={processing} className="inline-flex items-center gap-2 bg-[#E94E3C] px-7 py-4 text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#1E293B] disabled:opacity-50">
                {processing ? 'Submitting...' : 'Apply for Franchise'} <CheckCircle2 size={16} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({ label, error, required, className = '', ...props }) {
  return (
    <label className={`grid gap-2 ${className}`}>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{label}{required && <b className="text-[#E94E3C]"> *</b>}</span>
      <input {...props} className={`w-full border bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E293B] ${error ? 'border-red-400' : 'border-slate-200'}`} />
      {error && <ErrorText text={error} />}
    </label>
  );
}

function PincodeInput({ label, value, onChange, loading, error }) {
  return (
    <label className="grid gap-2">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{label} <b className="text-[#E94E3C]">*</b></span>
      <span className="relative">
        <input value={value} onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))} className={`w-full border bg-slate-50 px-4 py-3 pr-11 text-sm font-bold outline-none focus:border-[#1E293B] ${error ? 'border-red-400' : 'border-slate-200'}`} />
        {loading && <Loader2 size={17} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[#E94E3C]" />}
      </span>
      {error && <ErrorText text={error} />}
    </label>
  );
}

function Select({ label, value, onChange, options, error, required }) {
  return (
    <label className="grid gap-2">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{label}{required && <b className="text-[#E94E3C]"> *</b>}</span>
      <select value={value} onChange={onChange} className={`w-full border bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E293B] ${error ? 'border-red-400' : 'border-slate-200'}`}>
        <option value="">Select option...</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      {error && <ErrorText text={error} />}
    </label>
  );
}

function Textarea({ label, value, onChange, error, required }) {
  return (
    <label className="grid gap-2">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{label}{required && <b className="text-[#E94E3C]"> *</b>}</span>
      <textarea rows="4" value={value} onChange={onChange} className={`w-full resize-none border bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E293B] ${error ? 'border-red-400' : 'border-slate-200'}`} />
      {error && <ErrorText text={error} />}
    </label>
  );
}

function Upload({ label, onChange }) {
  return (
    <label className="grid cursor-pointer gap-2 border border-dashed border-slate-300 bg-slate-50 p-5 hover:border-[#1E293B]">
      <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#1E293B]"><FileText size={14} /> {label}</span>
      <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => onChange(e.target.files?.[0] || null)} className="text-xs font-bold text-slate-500 file:mr-3 file:border-0 file:bg-[#1E293B] file:px-4 file:py-2 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:text-white" />
    </label>
  );
}

function Checkbox({ label, checked, onChange, error }) {
  return (
    <label className="grid gap-2">
      <span className="flex cursor-pointer items-center gap-3 text-sm font-black text-[#1E293B]">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-5" />
        {label}
      </span>
      {error && <ErrorText text={error} />}
    </label>
  );
}

function YesNoGrid({ fields, data, setField, errors }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {fields.map(([field, label]) => (
        <Select key={field} label={label} value={data[field]} error={errors[field]} onChange={(e) => setField(field, e.target.value)} options={yesNo} required />
      ))}
    </div>
  );
}

function ErrorText({ text }) {
  return <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-red-500"><AlertCircle size={12} /> {text}</span>;
}
