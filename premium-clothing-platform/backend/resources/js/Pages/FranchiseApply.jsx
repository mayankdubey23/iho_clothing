import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, ChevronLeft, Briefcase, MapPin, IndianRupee, FileText, User, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

// 🗺️ Preferred Location Map (For Target Franchise Territory)
const STATE_CITY_MAP = {
  "Uttar Pradesh": ["Ghaziabad", "Noida", "Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik"],
  "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru", "Hubli"],
  "Haryana": ["Gurugram", "Faridabad", "Panipat", "Rohtak"],
};

const STEPS = [
  { id: 1, title: 'Personal', icon: User },
  { id: 2, title: 'Business', icon: Briefcase },
  { id: 3, title: 'Location', icon: MapPin },
  { id: 4, title: 'Investment', icon: IndianRupee },
  { id: 5, title: 'Verification', icon: FileText },
];

export default function FranchiseApply() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formErrors, setFormErrors] = useState({});
  const [fetchingPincode, setFetchingPincode] = useState(false);
  const [sameAsMobile, setSameAsMobile] = useState(false); // 👈 Same as Mobile State

  const { data, setData, post, processing, recentlySuccessful } = useForm({
    full_name: '', mobile_number: '', whatsapp_number: '', email: '', age: '', gender: '',
    house_no: '', area_locality: '', state: '', city: '', pincode: '',
    owns_business: '', business_type: '', business_name: '', gst_number: '', experience_years: '',
    franchise_type: '', preferred_state: '', preferred_city: '', location_type: '', shop_size: '',
    investment_budget: '', expected_sales: '',
    why_franchise: '', terms_accepted: false,
    pan_number: '', aadhaar_doc: null, pan_doc: null
  });

  // Reset Preferred City when Preferred State changes
  useEffect(() => {
    setData('preferred_city', '');
  }, [data.preferred_state]);

  // 🚀 SAME AS MOBILE LOGIC
  const handleMobileChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setData(prev => {
      const newData = { ...prev, mobile_number: val };
      if (sameAsMobile) newData.whatsapp_number = val;
      return newData;
    });
  };

  const handleCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setSameAsMobile(isChecked);
    if (isChecked) {
      setData('whatsapp_number', data.mobile_number);
      setFormErrors(prev => ({ ...prev, whatsapp_number: null })); // clear error if auto-filled
    }
  };

  // 🚀 INDIA POST API INTEGRATION LOGIC
  const handlePincodeChange = async (e) => {
    const pin = e.target.value.replace(/\D/g, '').slice(0, 6);
    setData('pincode', pin);

    if (pin.length === 6) {
      setFetchingPincode(true);
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const result = await response.json();

        if (result[0].Status === 'Success') {
          const postOffice = result[0].PostOffice[0];
          setData(prev => ({
            ...prev,
            pincode: pin,
            state: postOffice.State,
            city: postOffice.District
          }));
          setFormErrors(prev => ({ ...prev, pincode: null, state: null, city: null }));
        } else {
          setFormErrors(prev => ({ ...prev, pincode: "Invalid Indian Pincode." }));
          setData(prev => ({ ...prev, state: '', city: '' }));
        }
      } catch (error) {
        setFormErrors(prev => ({ ...prev, pincode: "Error verifying pincode." }));
      } finally {
        setFetchingPincode(false);
      }
    } else {
      if (data.state || data.city) setData(prev => ({ ...prev, state: '', city: '' }));
    }
  };

  // 🛡️ STRICT FRONTEND VALIDATION
  const validateStep = (step) => {
    let errs = {};
    const nameRegex = /^[A-Za-z\s]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    const pincodeRegex = /^\d{6}$/;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
    const numberOnlyRegex = /^\d+$/;

    const trimmed = (val) => (typeof val === 'string' ? val.trim() : val);

    if (step === 1) {
      if (!trimmed(data.full_name) || trimmed(data.full_name).length < 3) errs.full_name = "Please enter a valid full name.";
      else if (!nameRegex.test(trimmed(data.full_name))) errs.full_name = "Name cannot contain numbers or special characters.";
      if (!trimmed(data.email) || !emailRegex.test(trimmed(data.email))) errs.email = "Please enter a valid email address.";
      if (!trimmed(data.mobile_number) || !phoneRegex.test(trimmed(data.mobile_number))) errs.mobile_number = "Please enter a valid 10-digit mobile number.";
      if (!trimmed(data.whatsapp_number) || !phoneRegex.test(trimmed(data.whatsapp_number))) errs.whatsapp_number = "Please enter a valid 10-digit WhatsApp number.";
      if (!data.gender) errs.gender = "This field is required.";
      if (!data.age || !numberOnlyRegex.test(data.age) || data.age < 18 || data.age > 80) errs.age = "Please enter a valid age (18+ only).";
    }

    if (step === 2) {
      if (!data.owns_business) errs.owns_business = "This field is required.";
      if (data.owns_business === 'yes') {
        if (!trimmed(data.business_name)) errs.business_name = "Please enter a valid business name.";
        if (!data.business_type) errs.business_type = "This field is required.";
        if (!data.experience_years) errs.experience_years = "This field is required.";
        if (trimmed(data.gst_number) && !gstRegex.test(trimmed(data.gst_number))) errs.gst_number = "Please enter a valid 15-character GSTIN format.";
      }
    }

    if (step === 3) {
      if (!data.franchise_type) errs.franchise_type = "This field is required.";
      if (!data.preferred_state) errs.preferred_state = "Please select a preferred state.";
      if (!data.preferred_city) errs.preferred_city = "Please select a preferred city.";

      if (data.franchise_type === 'offline' || data.franchise_type === 'both') {
        if (!data.location_type) errs.location_type = "This field is required.";
        if (!data.shop_size || !numberOnlyRegex.test(data.shop_size)) errs.shop_size = "Please enter numbers only for shop size.";
      }

      if (!trimmed(data.house_no)) errs.house_no = "This field is required.";
      if (!trimmed(data.area_locality)) errs.area_locality = "This field is required.";
      if (!trimmed(data.pincode) || !pincodeRegex.test(trimmed(data.pincode))) errs.pincode = "Please enter a valid 6-digit pincode.";
      if (!trimmed(data.state)) errs.state = "State auto-detection failed.";
      if (!trimmed(data.city)) errs.city = "City auto-detection failed.";
    }

    if (step === 4) {
      if (!data.investment_budget) errs.investment_budget = "This field is required.";
      if (!trimmed(data.expected_sales) || !numberOnlyRegex.test(trimmed(data.expected_sales))) errs.expected_sales = "Please enter numbers only.";
    }

    if (step === 5) {
      if (trimmed(data.pan_number) && !panRegex.test(trimmed(data.pan_number))) errs.pan_number = "Please enter a valid PAN format (e.g., ABCDE1234F).";
      if (!trimmed(data.why_franchise) || trimmed(data.why_franchise).length < 20) errs.why_franchise = "Please provide a valid reason (min 20 characters).";
      if (!data.terms_accepted) errs.terms_accepted = "You must accept the terms to apply.";
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = (e) => {
    e.preventDefault();
    if (validateStep(5)) {
      const finalData = { ...data };
      Object.keys(finalData).forEach(key => { if (typeof finalData[key] === 'string') finalData[key] = finalData[key].trim(); });
      post('/franchise/apply', finalData);
    }
  };

  // 🎥 PREMIUM FULL-SCREEN SUCCESS ANIMATION
  if (recentlySuccessful) {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 bg-[#1A1A2E] flex flex-col items-center justify-center p-4 overflow-hidden"
      >
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-[#E94E3C]/20 to-transparent rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/3"></div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
          className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-[3rem] text-center max-w-2xl shadow-2xl shadow-black/50"
        >
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.6, delay: 0.5 }}
            className="size-32 mx-auto bg-gradient-to-br from-[#E94E3C] to-[#c0392b] rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(233,78,60,0.5)] mb-8"
          >
            <CheckCircle2 size={64} className="text-white" strokeWidth={2.5} />
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="text-[#E94E3C] font-black tracking-[0.3em] uppercase text-xs mb-4">
            Application Received
          </motion.p>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-6 leading-tight">
            Welcome to the <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">IHO Network</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="text-gray-400 font-medium leading-relaxed max-w-md mx-auto mb-10">
            Your franchise enquiry has been securely transmitted to our executive team. We will review your profile and initiate contact within 48-72 hours.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
            <a href="/" className="inline-flex items-center gap-2 bg-white text-[#1A1A2E] px-8 py-4 rounded-full font-black uppercase tracking-widest text-sm hover:bg-[#E94E3C] hover:text-white transition-all hover:scale-105 shadow-xl">
              Return to Homepage <ArrowRight size={16} strokeWidth={2.5} />
            </a>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f8f6] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <Head title="Apply for Franchise | IHO Clothing" />

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="bg-[#E94E3C]/10 text-[#E94E3C] text-[10px] font-black tracking-widest uppercase px-4 py-2 rounded-full">Business Partnership</span>
          <h1 className="mt-6 text-4xl md:text-5xl font-black text-[#1A1A2E] tracking-tighter uppercase">Franchise Application</h1>
          <p className="mt-4 text-gray-500 font-medium max-w-2xl mx-auto">Join India's fastest-growing premium sportswear brand. Ensure all details are strictly accurate.</p>
        </div>

        {/* Progress Bar */}
        <div className="flex justify-between items-center mb-12 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#E94E3C] -z-10 rounded-full transition-all duration-500" style={{ width: `${((currentStep - 1) / 4) * 100}%` }}></div>

          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isPast = step.id < currentStep;

            return (
              <div key={step.id} className="flex flex-col items-center gap-2 bg-[#f9f8f6] px-2">
                <div className={`size-12 rounded-full flex items-center justify-center transition-all duration-300 border-4 border-[#f9f8f6] ${isActive ? 'bg-[#E94E3C] text-white scale-110 shadow-lg shadow-[#E94E3C]/30' : isPast ? 'bg-[#1A1A2E] text-white' : 'bg-gray-200 text-gray-400'}`}>
                  {isPast ? <CheckCircle2 size={20} /> : <Icon size={20} />}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest hidden sm:block ${isActive ? 'text-[#E94E3C]' : 'text-gray-400'}`}>{step.title}</span>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-gray-100 overflow-hidden">
          <form onSubmit={submit} className="p-6 md:p-10">
            <AnimatePresence mode="wait">
              <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>

                {/* 🟢 STEP 1: PERSONAL */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-black text-[#1A1A2E] uppercase tracking-wide border-b pb-4 mb-6">Personal Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField label="Full Name" placeholder="Enter your full name" value={data.full_name} error={formErrors.full_name} onChange={e => setData('full_name', e.target.value.replace(/[^a-zA-Z\s]/g, ''))} required />
                      <InputField label="Email Address" type="email" placeholder="Enter your email address" value={data.email} error={formErrors.email} onChange={e => setData('email', e.target.value)} required />

                      <div className="space-y-1">
                        <InputField label="Mobile Number" type="tel" placeholder="10-digit mobile number" value={data.mobile_number} error={formErrors.mobile_number} onChange={handleMobileChange} required />
                        <label className="flex items-center gap-2 mt-2 cursor-pointer group w-max">
                          <input type="checkbox" checked={sameAsMobile} onChange={handleCheckboxChange} className="rounded text-[#E94E3C] focus:ring-[#E94E3C] border-gray-300 cursor-pointer" />
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest group-hover:text-[#1A1A2E] transition-colors">Same as WhatsApp</span>
                        </label>
                      </div>

                      <InputField label="WhatsApp Number" type="tel" placeholder="10-digit WhatsApp number" value={data.whatsapp_number} error={formErrors.whatsapp_number} readOnly={sameAsMobile} className={sameAsMobile ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''} onChange={e => setData('whatsapp_number', e.target.value.replace(/\D/g, '').slice(0, 10))} required />

                      <SelectField label="Gender" value={data.gender} error={formErrors.gender} onChange={e => setData('gender', e.target.value)} required options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} />
                      <InputField label="Age" type="number" placeholder="Enter your age" value={data.age} error={formErrors.age} onChange={e => setData('age', e.target.value)} required />
                    </div>
                  </div>
                )}

                {/* 🟢 STEP 2: BUSINESS */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-black text-[#1A1A2E] uppercase tracking-wide border-b pb-4 mb-6">Business Profile</h3>
                    <SelectField label="Do you currently own a business or store?" value={data.owns_business} error={formErrors.owns_business} onChange={e => setData('owns_business', e.target.value)} required options={[{ value: 'yes', label: 'Yes, I currently own a business' }, { value: 'no', label: 'No, I am a new entrepreneur' }]} />

                    <AnimatePresence>
                      {data.owns_business === 'yes' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                          <InputField label="Business Name" placeholder="Enter business name" value={data.business_name} error={formErrors.business_name} onChange={e => setData('business_name', e.target.value)} required />
                          <SelectField label="Business Type" value={data.business_type} error={formErrors.business_type} onChange={e => setData('business_type', e.target.value)} required options={[{ value: 'clothing', label: 'Clothing / Fashion' }, { value: 'footwear', label: 'Footwear' }, { value: 'ecommerce', label: 'E-commerce' }, { value: 'other', label: 'Other Retail' }]} />
                          <SelectField label="Experience Level" value={data.experience_years} error={formErrors.experience_years} onChange={e => setData('experience_years', e.target.value)} required options={[{ value: '0-2', label: '0 to 2 Years' }, { value: '3-5', label: '3 to 5 Years' }, { value: '5+', label: 'More than 5 Years' }]} />
                          <InputField label="GST Number (Optional)" placeholder="e.g. 07AAAAA0000A1Z5" value={data.gst_number} error={formErrors.gst_number} onChange={e => setData('gst_number', e.target.value.toUpperCase())} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* 🟢 STEP 3: LOCATION (Current & Preferred) */}
                {currentStep === 3 && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-black text-[#1A1A2E] uppercase tracking-wide border-b pb-4 mb-6">Current Address</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="House/Flat/Building" placeholder="House/Flat No., Building Name" value={data.house_no} error={formErrors.house_no} onChange={e => setData('house_no', e.target.value)} required />
                        <InputField label="Area / Locality" placeholder="Street, Area, Locality" value={data.area_locality} error={formErrors.area_locality} onChange={e => setData('area_locality', e.target.value)} required />

                        <div className="space-y-2">
                          <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex justify-between">Pincode <span className="text-[#E94E3C]">*</span></label>
                          <div className="relative">
                            <input type="text" value={data.pincode} onChange={handlePincodeChange} placeholder="Enter 6-digit pincode" className={`w-full bg-gray-50 border ${formErrors.pincode ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#E94E3C] outline-none font-bold text-[#1A1A2E]`} required />
                            {fetchingPincode && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[#E94E3C]" size={18} />}
                          </div>
                          {formErrors.pincode && <p className="text-[10px] font-bold tracking-wide text-red-500 flex items-center gap-1 mt-1 uppercase"><AlertCircle size={12} /> {formErrors.pincode}</p>}
                        </div>

                        <InputField label="State (Auto-detected)" value={data.state} error={formErrors.state} placeholder="Auto-filled via Pincode" readOnly className="bg-gray-100 cursor-not-allowed opacity-70" />
                        <InputField label="City/District (Auto-detected)" value={data.city} error={formErrors.city} placeholder="Auto-filled via Pincode" readOnly className="bg-gray-100 cursor-not-allowed opacity-70" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-[#1A1A2E] uppercase tracking-wide border-b pb-4 mb-6">Target Franchise Territory</h3>
                      <SelectField label="Interested Franchise Type" value={data.franchise_type} error={formErrors.franchise_type} onChange={e => setData('franchise_type', e.target.value)} required options={[{ value: 'offline', label: 'Offline Store Franchise' }, { value: 'online', label: 'Online/Cloud Franchise' }, { value: 'both', label: 'Both (Hybrid Model)' }]} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <SelectField label="Preferred State" value={data.preferred_state} error={formErrors.preferred_state} onChange={e => setData('preferred_state', e.target.value)} required options={Object.keys(STATE_CITY_MAP).map(st => ({ value: st, label: st }))} />
                        <SelectField label="Preferred City" value={data.preferred_city} error={formErrors.preferred_city} onChange={e => setData('preferred_city', e.target.value)} required options={(STATE_CITY_MAP[data.preferred_state] || []).map(ct => ({ value: ct, label: ct }))} />
                      </div>

                      <AnimatePresence>
                        {(data.franchise_type === 'offline' || data.franchise_type === 'both') && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                            <SelectField label="Location Type" value={data.location_type} error={formErrors.location_type} onChange={e => setData('location_type', e.target.value)} required options={[{ value: 'mall', label: 'Shopping Mall' }, { value: 'high_street', label: 'High Street / Main Market' }, { value: 'residential', label: 'Residential Market' }, { value: 'gym_area', label: 'Near Gym/Sports Complex' }]} />
                            <InputField label="Expected Shop Size (Sq.Ft)" type="number" placeholder="Enter size in numbers (e.g., 500)" value={data.shop_size} error={formErrors.shop_size} onChange={e => setData('shop_size', e.target.value)} required />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-black text-[#1A1A2E] uppercase tracking-wide border-b pb-4 mb-6">Investment & Scale</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <SelectField label="Available Investment Budget" value={data.investment_budget} error={formErrors.investment_budget} onChange={e => setData('investment_budget', e.target.value)} required options={[{ value: '1L-3L', label: '₹1 Lakh - ₹3 Lakh' }, { value: '3L-5L', label: '₹3 Lakh - ₹5 Lakh' }, { value: '5L-10L', label: '₹5 Lakh - ₹10 Lakh' }, { value: '10L+', label: '₹10 Lakh+' }, { value: 'custom', label: 'Custom Budget' }]} />
                      <InputField label="Expected Monthly Sales (₹)" type="number" placeholder="Enter expected sales in numbers" value={data.expected_sales} error={formErrors.expected_sales} onChange={e => setData('expected_sales', e.target.value)} required />
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-black text-[#1A1A2E] uppercase tracking-wide border-b pb-4 mb-6">Verification & Submission</h3>
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
                      <p className="text-xs font-medium text-blue-800">Document uploads are optional at the enquiry stage, but will be required for final verification by our team.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <InputField label="PAN Number (Optional)" placeholder="e.g. ABCDE1234F" value={data.pan_number} error={formErrors.pan_number} onChange={e => setData('pan_number', e.target.value.toUpperCase())} />
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Aadhaar Card Copy (Optional)</label>
                        <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e => setData('aadhaar_doc', e.target.files[0])} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-[#1A1A2E] file:text-white hover:file:bg-[#E94E3C] cursor-pointer" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex justify-between">Why do you want to partner with us? <span className="text-[#E94E3C]">*</span></label>
                      <textarea rows="4" placeholder="Briefly describe your vision and capability..." value={data.why_franchise} onChange={e => setData('why_franchise', e.target.value)} className={`w-full bg-gray-50 border ${formErrors.why_franchise ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#E94E3C] outline-none font-bold text-[#1A1A2E]`} required></textarea>
                      {formErrors.why_franchise && <p className="text-[10px] font-bold tracking-wide text-red-500 uppercase mt-1"><AlertCircle size={12} className="inline mr-1" /> {formErrors.why_franchise}</p>}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center mt-0.5">
                          <input type="checkbox" className="peer appearance-none size-5 border-2 border-gray-300 rounded focus:ring-2 focus:ring-[#E94E3C] checked:bg-[#E94E3C] checked:border-[#E94E3C] transition-colors cursor-pointer" checked={data.terms_accepted} onChange={e => setData('terms_accepted', e.target.checked)} />
                          <CheckCircle2 size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                        </div>
                        <span className={`text-sm font-bold ${formErrors.terms_accepted ? 'text-red-500' : 'text-gray-600 group-hover:text-[#1A1A2E]'} transition-colors`}>I agree to the terms, privacy policy, and understand that submission does not guarantee approval.</span>
                      </label>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="mt-10 pt-6 border-t border-gray-100 flex justify-between items-center">
              {currentStep > 1 ? (
                <button type="button" onClick={prevStep} className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-gray-500 hover:bg-gray-50 hover:text-[#1A1A2E] transition-colors"><ChevronLeft size={18} strokeWidth={2.5} /> Back</button>
              ) : <div></div>}

              {currentStep < 5 ? (
                <button type="button" onClick={handleNext} className="flex items-center gap-2 px-8 py-3 bg-[#1A1A2E] text-white rounded-full font-black uppercase tracking-widest hover:bg-[#E94E3C] shadow-lg hover:-translate-y-0.5 transition-all">Next Step <ChevronRight size={18} strokeWidth={2.5} /></button>
              ) : (
                <button type="submit" disabled={processing} className="flex items-center gap-2 px-8 py-3 bg-[#E94E3C] text-white rounded-full font-black uppercase tracking-widest hover:bg-[#c0392b] shadow-lg hover:-translate-y-0.5 disabled:opacity-50 transition-all">
                  {processing ? 'Submitting...' : 'Submit Enquiry'} <CheckCircle2 size={18} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, type = "text", value, onChange, required = false, placeholder, error, readOnly, className }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex justify-between">{label} {required && <span className="text-[#E94E3C]">*</span>}</label>
      <input type={type} value={value} onChange={onChange} readOnly={readOnly} placeholder={placeholder} className={`w-full bg-gray-50 border ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#E94E3C] focus:border-transparent outline-none font-bold text-[#1A1A2E] placeholder:text-gray-300 placeholder:font-medium ${className || ''}`} />
      {error && <p className="text-[10px] font-bold tracking-wide text-red-500 flex items-center gap-1 mt-1 uppercase"><AlertCircle size={12} strokeWidth={2.5} /> {error}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, required = false, options = [], error }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex justify-between">{label} {required && <span className="text-[#E94E3C]">*</span>}</label>
      <select value={value} onChange={onChange} className={`w-full bg-gray-50 border ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#E94E3C] focus:border-transparent outline-none font-bold text-[#1A1A2E] appearance-none`} style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: `right 1rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}>
        <option value="" disabled className="font-medium text-gray-400">Choose an option...</option>
        {options.map((opt, i) => <option key={i} value={opt.value} className="font-bold">{opt.label}</option>)}
      </select>
      {error && <p className="text-[10px] font-bold tracking-wide text-red-500 flex items-center gap-1 mt-1 uppercase"><AlertCircle size={12} strokeWidth={2.5} /> {error}</p>}
    </div>
  );
}