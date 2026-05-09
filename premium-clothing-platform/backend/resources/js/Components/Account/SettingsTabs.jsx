import React, { useState } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import { ShieldCheck, User, AlertTriangle, CheckCircle2, Lock, Eye, EyeOff } from 'lucide-react';
import { MapPin, Plus, Edit2, Trash2, HelpCircle, Ticket as TicketIcon, Clock, Loader2, AlertCircle } from 'lucide-react';
import { Bell, CreditCard, RefreshCcw, Download, ShieldAlert } from 'lucide-react';

// 1. PROFILE DETAILS COMPONENT
export function ProfileSettings({ user }) {
    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        name: user.name || '',
        email: user.email || '',
        mobile_number: user.mobile_number || '',
        gender: user.gender || '',
        dob: user.dob || '',
    });

    const [localErrors, setLocalErrors] = useState({});

    const handleNameChange = (e) => {
        // Strict Validation: Only Alphabets and Spaces
        setData('name', e.target.value.replace(/[^a-zA-Z\s]/g, ''));
    };

    const handleMobileChange = (e) => {
        // Strict Validation: Only 10 digits starting with 6-9
        setData('mobile_number', e.target.value.replace(/\D/g, '').slice(0, 10));
    };

    const validate = () => {
        let errs = {};
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!data.name || data.name.length < 3) errs.name = "Valid name required (min 3 chars).";
        if (data.mobile_number && !phoneRegex.test(data.mobile_number)) errs.mobile_number = "Enter valid 10-digit Indian number.";
        setLocalErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const submit = (e) => {
        e.preventDefault();
        if (validate()) put('/user/profile-information'); // Laravel Fortify default endpoint
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <h3 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-wide border-b border-gray-100 pb-4 mb-6">Profile Details</h3>

            {recentlySuccessful && (
                <div className="bg-green-50 text-green-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
                    <CheckCircle2 size={18} /> Profile updated successfully.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Full Name" value={data.name} onChange={handleNameChange} error={errors.name || localErrors.name} />
                <InputField label="Email Address" type="email" value={data.email} readOnly className="bg-gray-50 opacity-70" />
                <InputField label="Mobile Number" value={data.mobile_number} onChange={handleMobileChange} error={errors.mobile_number || localErrors.mobile_number} placeholder="10-digit mobile number" />
                <SelectField label="Gender" value={data.gender} onChange={e => setData('gender', e.target.value)} options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} />
                <InputField label="Date of Birth" type="date" value={data.dob} onChange={e => setData('dob', e.target.value)} />
            </div>

            <button disabled={processing} className="mt-8 bg-[#1A1A2E] text-white px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-[#E94E3C] transition-all disabled:opacity-50">
                {processing ? 'Saving...' : 'Save Changes'}
            </button>
        </form>
    );
}

// 2. LOGIN & SECURITY COMPONENT
export function SecuritySettings() {
    const { data, setData, put, processing, errors, recentlySuccessful, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState('');

    const checkStrength = (pass) => {
        const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
        if (strongRegex.test(pass)) setPasswordStrength('Strong');
        else if (pass.length > 5) setPasswordStrength('Medium');
        else setPasswordStrength('Weak');
        setData('password', pass);
    };

    const submit = (e) => {
        e.preventDefault();
        put('/user/password', { preserveScroll: true, onSuccess: () => reset() });
    };

    return (
        <form onSubmit={submit} className="space-y-6 max-w-xl">
            <h3 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-wide border-b border-gray-100 pb-4 mb-6">Login & Security</h3>

            {recentlySuccessful && (
                <div className="bg-green-50 text-green-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
                    <CheckCircle2 size={18} /> Password changed securely.
                </div>
            )}

            <InputField label="Current Password" type="password" value={data.current_password} onChange={e => setData('current_password', e.target.value)} error={errors.current_password} />

            <div className="space-y-2 relative">
                <InputField label="New Password" type={showPassword ? "text" : "password"} value={data.password} onChange={e => checkStrength(e.target.value)} error={errors.password} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-10 text-gray-400">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {data.password && (
                    <p className={`text-xs font-bold ${passwordStrength === 'Strong' ? 'text-green-500' : passwordStrength === 'Medium' ? 'text-yellow-500' : 'text-red-500'}`}>
                        Password Strength: {passwordStrength} (Requires 8+ chars, 1 uppercase, 1 number, 1 special char)
                    </p>
                )}
            </div>

            <InputField label="Confirm New Password" type={showPassword ? "text" : "password"} value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} />

            <button disabled={processing || passwordStrength !== 'Strong'} className="bg-[#1A1A2E] text-white px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-[#E94E3C] transition-all disabled:opacity-50">
                Update Password
            </button>
        </form>
    );
}

// 3. DELETE ACCOUNT COMPONENT
export function DeleteAccount() {
    const { data, setData, delete: destroy, processing, errors } = useForm({
        password: '',
        reason: '',
        confirm_understand: false
    });

    const submit = (e) => {
        e.preventDefault();
        destroy('/user/account'); // Implement this route carefully in backend
    };

    return (
        <form onSubmit={submit} className="py-6 max-w-xl mx-auto text-center">
            <div className="size-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-wide mb-2">Delete Account</h3>
            <p className="text-gray-500 font-medium mb-8">
                Once you delete your account, there is no going back. All your orders, wishlist, and saved addresses will be permanently removed.
            </p>

            <div className="space-y-4 text-left">
                <SelectField label="Reason for leaving" value={data.reason} onChange={e => setData('reason', e.target.value)} options={[
                    { value: 'privacy', label: 'Privacy Concerns' },
                    { value: 'not_using', label: 'Not using website anymore' },
                    { value: 'bad_experience', label: 'Bad Experience' },
                    { value: 'other', label: 'Other' }
                ]} required />

                <InputField label="Enter Password to Confirm" type="password" value={data.password} onChange={e => setData('password', e.target.value)} error={errors.password} required />

                <label className="flex items-start gap-3 mt-6 cursor-pointer text-left">
                    <input type="checkbox" checked={data.confirm_understand} onChange={e => setData('confirm_understand', e.target.checked)} className="mt-1 size-4 text-red-500 focus:ring-red-500 rounded" required />
                    <span className="text-sm font-bold text-gray-600">I understand that this action is permanent and my data cannot be recovered.</span>
                </label>
            </div>

            <button disabled={processing || !data.confirm_understand} className="mt-8 bg-red-500 text-white px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-all disabled:opacity-50 w-full">
                {processing ? 'Deleting...' : 'Permanently Delete Account'}
            </button>
        </form>
    );
}


// 4. SMART ADDRESS BOOK COMPONENT
export function AddressBook() {
    const { auth } = usePage().props;
    const userAddresses = auth?.user?.addresses || []; // Replace with actual prop
    const [isAdding, setIsAdding] = useState(false);
    const [fetchingPincode, setFetchingPincode] = useState(false);
    const [localErrors, setLocalErrors] = useState({});

    const { data, setData, post, processing, reset } = useForm({
        full_name: '', mobile_number: '', house_no: '', area_locality: '',
        landmark: '', pincode: '', city: '', state: '', is_default: false
    });

    // 🚀 India Post API Auto-Detect
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
                    setData(prev => ({ ...prev, pincode: pin, state: postOffice.State, city: postOffice.District }));
                    setLocalErrors(prev => ({ ...prev, pincode: null }));
                } else {
                    setLocalErrors(prev => ({ ...prev, pincode: "Invalid Pincode." }));
                    setData(prev => ({ ...prev, state: '', city: '' }));
                }
            } catch (error) {
                setLocalErrors(prev => ({ ...prev, pincode: "Error fetching data." }));
            } finally {
                setFetchingPincode(false);
            }
        }
    };

    const submit = (e) => {
        e.preventDefault();
        // Add your Laravel endpoint here
        post('/user/addresses', {
            preserveScroll: true,
            onSuccess: () => { setIsAdding(false); reset(); }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <h3 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-wide">Address Book</h3>
                {!isAdding && (
                    <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 bg-[#E94E3C] text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#c0392b] transition-all">
                        <Plus size={16} /> Add New
                    </button>
                )}
            </div>

            {isAdding ? (
                <form onSubmit={submit} className="bg-gray-50 p-6 rounded-3xl border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <InputField label="Full Name" value={data.full_name} onChange={e => setData('full_name', e.target.value.replace(/[^a-zA-Z\s]/g, ''))} required />
                        <InputField label="Mobile Number" value={data.mobile_number} onChange={e => setData('mobile_number', e.target.value.replace(/\D/g, '').slice(0, 10))} required />

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex justify-between">Pincode *</label>
                            <div className="relative">
                                <input type="text" value={data.pincode} onChange={handlePincodeChange} placeholder="6-digit pincode" required className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#E94E3C] outline-none font-bold text-[#1A1A2E]" />
                                {fetchingPincode && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[#E94E3C]" size={18} />}
                            </div>
                            {localErrors.pincode && <p className="text-[10px] font-bold text-red-500">{localErrors.pincode}</p>}
                        </div>

                        <InputField label="State" value={data.state} readOnly className="bg-gray-100 opacity-70 cursor-not-allowed" />
                        <InputField label="City/District" value={data.city} readOnly className="bg-gray-100 opacity-70 cursor-not-allowed" />

                        <InputField label="House/Flat No." value={data.house_no} onChange={e => setData('house_no', e.target.value)} required />
                        <InputField label="Area/Locality" value={data.area_locality} onChange={e => setData('area_locality', e.target.value)} required />
                        <InputField label="Landmark (Optional)" value={data.landmark} onChange={e => setData('landmark', e.target.value)} />
                    </div>

                    <label className="flex items-center gap-3 mb-8 cursor-pointer">
                        <input type="checkbox" checked={data.is_default} onChange={e => setData('is_default', e.target.checked)} className="rounded text-[#E94E3C] focus:ring-[#E94E3C] size-4" />
                        <span className="text-sm font-bold text-gray-700">Set as Default Address</span>
                    </label>

                    <div className="flex gap-4">
                        <button type="submit" disabled={processing} className="bg-[#1A1A2E] text-white px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-[#E94E3C] transition-all disabled:opacity-50">Save Address</button>
                        <button type="button" onClick={() => setIsAdding(false)} className="px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-200 transition-all">Cancel</button>
                    </div>
                </form>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userAddresses.length > 0 ? userAddresses.map((addr) => (
                        <div key={addr.id} className="border border-gray-200 p-5 rounded-3xl relative hover:border-[#E94E3C]/50 transition-colors">
                            {addr.is_default && <span className="absolute top-4 right-4 bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded-md font-black uppercase tracking-widest">Default</span>}
                            <h4 className="text-lg font-black text-[#1A1A2E] mb-1">{addr.full_name}</h4>
                            <p className="text-sm text-gray-600 mb-1">{addr.house_no}, {addr.area_locality}</p>
                            <p className="text-sm text-gray-600 mb-3">{addr.city}, {addr.state} - {addr.pincode}</p>
                            <p className="text-sm font-bold text-[#1A1A2E] mb-4">+91 {addr.mobile_number}</p>

                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button className="text-xs font-bold text-gray-500 hover:text-[#1A1A2E] flex items-center gap-1"><Edit2 size={14} /> Edit</button>
                                <button className="text-xs font-bold text-red-400 hover:text-red-600 flex items-center gap-1 ml-4"><Trash2 size={14} /> Delete</button>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-2 text-center py-10 bg-gray-50 rounded-3xl border border-gray-100">
                            <MapPin size={40} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500 font-bold">No addresses saved yet.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}



// 🚀 FIX: HELP & SUPPORT COMPONENT (Updated to remove dummy ticket)
export function HelpSupport() {
    const { data, setData, post, processing, reset } = useForm({ subject: '', order_id: '', message: '' });

    // FIX: Changed from dummy data to an empty array []
    const [tickets, setTickets] = useState([]);

    const submit = (e) => {
        e.preventDefault();
        post('/user/support-tickets', { onSuccess: () => reset() });
    };

    return (
        <div className="space-y-10">
            {/* Raise a Ticket Form */}
            <div>
                <h3 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-wide border-b border-gray-100 pb-4 mb-6 flex items-center gap-2">
                    <HelpCircle size={24} className="text-[#E94E3C]" /> Need Help?
                </h3>
                <form onSubmit={submit} className="bg-gray-50 p-6 rounded-3xl border border-gray-200 grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SelectField label="Issue Type" value={data.subject} onChange={e => setData('subject', e.target.value)} required options={[
                            { value: 'order_issue', label: 'Order/Delivery Issue' },
                            { value: 'return_refund', label: 'Returns & Refunds' },
                            { value: 'payment', label: 'Payment Failure' },
                            { value: 'other', label: 'Other Queries' }
                        ]} />
                        <InputField label="Order ID (Optional)" placeholder="e.g. ORD-12345" value={data.order_id} onChange={e => setData('order_id', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Message *</label>
                        <textarea rows="4" required placeholder="Describe your issue in detail..." value={data.message} onChange={e => setData('message', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#E94E3C] outline-none font-medium text-[#1A1A2E]"></textarea>
                    </div>
                    <div>
                        <button disabled={processing} className="bg-[#1A1A2E] text-white px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-[#E94E3C] transition-all disabled:opacity-50">
                            Submit Ticket
                        </button>
                    </div>
                </form>
            </div>

            {/* Previous Tickets */}
            <div>
                <h4 className="text-lg font-black text-[#1A1A2E] uppercase tracking-wide mb-4">Previous Tickets</h4>
                <div className="space-y-3">
                    {tickets.length > 0 ? tickets.map((tkt, i) => (
                        <div key={i} className="flex flex-col md:flex-row md:items-center justify-between bg-white border border-gray-200 p-4 rounded-2xl hover:shadow-md transition-shadow">
                            <div>
                                <span className="text-[10px] font-black tracking-widest text-[#E94E3C] uppercase">{tkt.id}</span>
                                <h5 className="text-sm font-bold text-[#1A1A2E]">{tkt.subject}</h5>
                                <p className="text-xs font-medium text-gray-400 mt-1 flex items-center gap-1"><Clock size={12} /> {tkt.date}</p>
                            </div>
                            <div className="mt-3 md:mt-0">
                                <span className="bg-orange-100 text-orange-700 text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest">
                                    {tkt.status}
                                </span>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
                            <HelpCircle size={32} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">No support tickets raised yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// 💎 HELPER: Premium Toggle Switch
function ToggleSwitch({ label, description, checked, onChange }) {
    return (
        <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
            <div className="pr-4">
                <p className="text-sm font-bold text-[#1A1A2E]">{label}</p>
                {description && <p className="text-xs font-medium text-gray-500 mt-0.5">{description}</p>}
            </div>
            <button type="button" onClick={() => onChange(!checked)} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-[#E94E3C]' : 'bg-gray-200'}`}>
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </div>
    );
}


// 6. REAL NOTIFICATIONS COMPONENT
export function Notifications() {
    // 🚀 Fetch real settings from database (if available) otherwise use default
    const { auth } = usePage().props;
    const settings = auth?.user?.settings || {};

    const { data, setData, post, processing, recentlySuccessful } = useForm({
        order_updates: settings.order_updates ?? true,
        delivery_updates: settings.delivery_updates ?? true,
        offer_alerts: settings.offer_alerts ?? false,
        new_products: settings.new_products ?? true,
        email_notif: settings.email_notif ?? true,
        sms_notif: settings.sms_notif ?? true,
        whatsapp_notif: settings.whatsapp_notif ?? false
    });

    const submit = (e) => {
        e.preventDefault();
        // Sends actual POST request to save settings in DB
        post('/user/settings/notifications', { preserveScroll: true });
    };

    return (
        <form onSubmit={submit} className="space-y-6 max-w-2xl">
            <h3 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-wide border-b border-gray-100 pb-4 mb-6 flex items-center gap-2">
                <Bell size={24} className="text-[#E94E3C]" /> Communication Preferences
            </h3>
            {recentlySuccessful && <p className="text-green-600 font-bold text-sm bg-green-50 p-3 rounded-lg flex items-center gap-2"><CheckCircle2 size={16} /> Preferences saved successfully!</p>}

            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200">
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">What you receive</h4>
                <ToggleSwitch label="Order Updates" description="Confirmations, cancellations, and payment receipts." checked={data.order_updates} onChange={v => setData('order_updates', v)} />
                <ToggleSwitch label="Delivery Updates" description="Out for delivery, tracking links, and delays." checked={data.delivery_updates} onChange={v => setData('delivery_updates', v)} />
                <ToggleSwitch label="Exclusive Offers" description="Promo codes, flash sales, and early access." checked={data.offer_alerts} onChange={v => setData('offer_alerts', v)} />
                <ToggleSwitch label="New Arrivals" description="Be the first to know about new sportswear drops." checked={data.new_products} onChange={v => setData('new_products', v)} />
            </div>

            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200">
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Where you receive them</h4>
                <ToggleSwitch label="Email Notifications" checked={data.email_notif} onChange={v => setData('email_notif', v)} />
                <ToggleSwitch label="SMS Notifications" checked={data.sms_notif} onChange={v => setData('sms_notif', v)} />
                <ToggleSwitch label="WhatsApp Alerts" description="Get instant updates on your WhatsApp." checked={data.whatsapp_notif} onChange={v => setData('whatsapp_notif', v)} />
            </div>

            <button disabled={processing} className="bg-[#1A1A2E] text-white px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-[#E94E3C] transition-all disabled:opacity-50">
                {processing ? 'Saving...' : 'Save Preferences'}
            </button>
        </form>
    );
}

// 7. REAL PRIVACY SETTINGS COMPONENT (Download Button Working)
export function PrivacySettings() {
    const { data, setData, post, processing } = useForm({
        marketing_consent: false, personalized_recs: true, data_sharing: false
    });

    return (
        <div className="space-y-8 max-w-2xl">
            <h3 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-wide border-b border-gray-100 pb-4 mb-6 flex items-center gap-2">
                <Lock size={24} className="text-[#E94E3C]" /> Privacy & Data
            </h3>

            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200">
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Your Data Controls</h4>
                <ToggleSwitch label="Marketing Consent" description="Allow us to send you personalized marketing emails." checked={data.marketing_consent} onChange={v => setData('marketing_consent', v)} />
                <ToggleSwitch label="Personalized Recommendations" description="Allow us to use your browsing history to show better products." checked={data.personalized_recs} onChange={v => setData('personalized_recs', v)} />
                <ToggleSwitch label="Third-Party Data Sharing" description="Share anonymized data with our analytics partners." checked={data.data_sharing} onChange={v => setData('data_sharing', v)} />
            </div>

            <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Data Management</h4>
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* 🚀 FIXED DOWNLOAD BUTTON */}
                    <a href="/user/data/download" download className="flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-[#1A1A2E] px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:border-[#1A1A2E] hover:bg-gray-50 transition-all w-full">
                        <Download size={16} /> Download My Data (.JSON)
                    </a>

                    <button className="flex items-center justify-center gap-2 bg-white border-2 border-red-100 text-red-500 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-50 transition-all w-full">
                        <ShieldAlert size={16} /> Clear Browsing History
                    </button>
                </div>
            </div>
        </div>
    );
}

// 8. REAL PAYMENT METHODS COMPONENT (Remove Dummy Data)
export function PaymentMethods() {
    const { auth } = usePage().props;
    // 🚀 Fetch real payment methods from User
    const savedCards = auth?.user?.payment_methods || [];

    const handleRemoveCard = (id) => {
        if (confirm("Are you sure you want to remove this saved card?")) {
            router.delete(`/user/payment-methods/${id}`, { preserveScroll: true });
        }
    };

    return (
        <div className="space-y-8 max-w-3xl">
            <h3 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-wide border-b border-gray-100 pb-4 mb-6 flex items-center gap-2">
                <CreditCard size={24} className="text-[#E94E3C]" /> Saved Payment Methods
            </h3>

            <div className="space-y-4">
                <h4 className="text-sm font-black uppercase tracking-widest text-gray-400">Saved Cards</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* 🚀 Dynamic Card Mapping (No more dummy data) */}
                    {savedCards.length > 0 ? savedCards.map(card => (
                        <div key={card.id} className="bg-[#1A1A2E] text-white p-5 rounded-2xl relative overflow-hidden shadow-lg">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl -translate-y-1/2 translate-x-1/3"></div>
                            <p className="font-bold tracking-widest text-lg mb-4 mt-2">**** **** **** {card.last_four}</p>
                            <div className="flex justify-between items-end relative z-10">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Name on Card</p>
                                    <p className="text-sm font-bold uppercase">{card.card_name}</p>
                                </div>
                                {/* 🚀 Working Remove Button */}
                                <button type="button" onClick={() => handleRemoveCard(card.id)} className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors">Remove</button>
                            </div>
                        </div>
                    )) : (
                        <div className="border border-gray-200 rounded-2xl flex items-center justify-center p-6 text-gray-500 bg-gray-50">
                            <span className="text-sm font-bold">No saved cards found.</span>
                        </div>
                    )}

                    <button className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-6 text-gray-400 hover:text-[#E94E3C] hover:border-[#E94E3C]/50 hover:bg-gray-50 transition-all">
                        <div className="size-10 bg-white shadow-sm rounded-full flex items-center justify-center mb-2">
                            <CreditCard size={20} />
                        </div>
                        <span className="text-sm font-bold">Add New Card securely</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

w
// 9. COUPONS & RETURNS (Empty States)
export function Coupons() {
    return (
        <div>
            <h3 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-wide border-b border-gray-100 pb-4 mb-6 flex items-center gap-2">
                <TicketIcon size={24} className="text-[#E94E3C]" /> My Coupons
            </h3>
            {/* Active Coupon Example */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center bg-green-50 border border-green-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-green-500 text-white p-6 flex flex-col justify-center items-center font-black">
                        <span className="text-2xl">20%</span>
                        <span className="text-xs tracking-widest">OFF</span>
                    </div>
                    <div className="p-4 flex-1">
                        <h4 className="font-black text-[#1A1A2E] text-lg">WELCOME20</h4>
                        <p className="text-xs text-gray-500 font-medium mt-1">Valid on first order above ₹1999.</p>
                        <p className="text-[10px] font-bold text-green-600 mt-2 uppercase tracking-widest">Valid till 31 Dec</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ReturnsRefunds() {
    return (
        <div>
            <h3 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-wide border-b border-gray-100 pb-4 mb-6 flex items-center gap-2">
                <RefreshCcw size={24} className="text-[#E94E3C]" /> Returns & Refunds
            </h3>
            <div className="text-center py-16 bg-gray-50 rounded-3xl border border-gray-200">
                <div className="size-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                    <RefreshCcw size={32} className="text-gray-300" />
                </div>
                <h4 className="text-xl font-black text-[#1A1A2E] uppercase tracking-wide mb-2">No Active Returns</h4>
                <p className="text-gray-500 font-medium text-sm">You do not have any ongoing return or refund requests.</p>
            </div>
        </div>
    );
}


// Helper Inputs
function InputField({ label, type = "text", value, onChange, error, placeholder, readOnly, className, required }) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">{label}</label>
            <input type={type} value={value} onChange={onChange} readOnly={readOnly} placeholder={placeholder} required={required} className={`w-full bg-white border ${error ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#E94E3C] outline-none font-bold text-[#1A1A2E] ${className}`} />
            {error && <p className="text-[10px] font-bold text-red-500 uppercase">{error}</p>}
        </div>
    );
}

function SelectField({ label, value, onChange, options, required }) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">{label}</label>
            <select value={value} onChange={onChange} required={required} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#E94E3C] outline-none font-bold text-[#1A1A2E]">
                <option value="">Select an option...</option>
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
        </div>
    );
}