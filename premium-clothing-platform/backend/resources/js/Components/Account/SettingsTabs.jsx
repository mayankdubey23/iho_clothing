import React, { useState } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import { ShieldCheck, User, AlertTriangle, CheckCircle2, Lock, Eye, EyeOff } from 'lucide-react';
import { MapPin, Plus, Edit2, Trash2, HelpCircle, Ticket as TicketIcon, Clock, Loader2, AlertCircle } from 'lucide-react';
import { Bell, CreditCard, RefreshCcw, Download, ShieldAlert } from 'lucide-react';

// 💎 THEME CLASSES
const btnDark = "bg-[#000000] text-white px-10 py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-800 transition-all disabled:opacity-50 rounded-none shadow-xl shadow-black/10";
const btnLight = "bg-white text-[#282c3f] border border-slate-200 px-10 py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:border-black transition-all disabled:opacity-50 rounded-none";
const sectionHeader = "text-2xl font-black text-[#282c3f] uppercase tracking-tighter italic border-b border-slate-100 pb-4 mb-8 flex items-center gap-3";

// 1. PROFILE DETAILS COMPONENT
export function ProfileSettings({ user }) {
    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        mobile_number: user?.mobile_number || '',
        gender: user?.gender || '',
        dob: user?.dob || '',
    });

    const [localErrors, setLocalErrors] = useState({});

    const handleNameChange = (e) => setData('name', e.target.value.replace(/[^a-zA-Z\s]/g, ''));
    const handleMobileChange = (e) => setData('mobile_number', e.target.value.replace(/\D/g, '').slice(0, 10));

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
        if (validate()) put('/user/profile-information');
    };

    return (
        <form onSubmit={submit} className="space-y-8">
            <h3 className={sectionHeader}>Profile Identity</h3>

            {recentlySuccessful && (
                <div className="bg-slate-50 border border-slate-200 text-[#282c3f] p-4 text-xs font-bold uppercase tracking-widest flex items-center gap-3">
                    <CheckCircle2 size={16} /> Profile successfully updated.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <InputField label="Full Name" value={data.name} onChange={handleNameChange} error={errors.name || localErrors.name} />
                <InputField label="Email Address" type="email" value={data.email} readOnly className="bg-slate-50 text-slate-400 cursor-not-allowed border-transparent" />
                <InputField label="Mobile Number" value={data.mobile_number} onChange={handleMobileChange} error={errors.mobile_number || localErrors.mobile_number} placeholder="10-digit mobile number" />
                <SelectField label="Gender" value={data.gender} onChange={e => setData('gender', e.target.value)} options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} />
                <InputField label="Date of Birth" type="date" value={data.dob} onChange={e => setData('dob', e.target.value)} />
            </div>

            <button disabled={processing} className={btnDark}>
                {processing ? 'Saving...' : 'Save Changes'}
            </button>
        </form>
    );
}

// 2. LOGIN & SECURITY COMPONENT
export function SecuritySettings() {
    const { data, setData, put, processing, errors, recentlySuccessful, reset } = useForm({
        current_password: '', password: '', password_confirmation: '',
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
        <form onSubmit={submit} className="space-y-8 max-w-xl">
            <h3 className={sectionHeader}>Security & Access</h3>

            {recentlySuccessful && (
                <div className="bg-slate-50 border border-slate-200 text-[#282c3f] p-4 text-xs font-bold uppercase tracking-widest flex items-center gap-3">
                    <CheckCircle2 size={16} /> Password updated securely.
                </div>
            )}

            <InputField label="Current Password" type="password" value={data.current_password} onChange={e => setData('current_password', e.target.value)} error={errors.current_password} />

            <div className="space-y-2 relative">
                <InputField label="New Password" type={showPassword ? "text" : "password"} value={data.password} onChange={e => checkStrength(e.target.value)} error={errors.password} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-9 text-slate-400 hover:text-black transition-colors">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {data.password && (
                    <p className={`text-[9px] font-black uppercase tracking-widest ${passwordStrength === 'Strong' ? 'text-[#282c3f]' : passwordStrength === 'Medium' ? 'text-slate-400' : 'text-red-500'}`}>
                        Strength: {passwordStrength} <span className="normal-case tracking-normal font-medium text-slate-400 ml-1">(Min 8 chars, 1 uppercase, 1 number, 1 special)</span>
                    </p>
                )}
            </div>

            <InputField label="Confirm New Password" type={showPassword ? "text" : "password"} value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} />

            <button disabled={processing || passwordStrength !== 'Strong'} className={btnDark}>
                Update Password
            </button>
        </form>
    );
}

// 3. DELETE ACCOUNT COMPONENT
export function DeleteAccount() {
    const { data, setData, delete: destroy, processing, errors } = useForm({
        password: '', reason: '', confirm_understand: false
    });

    const submit = (e) => {
        e.preventDefault();
        destroy('/user/account');
    };

    return (
        <form onSubmit={submit} className="py-8 max-w-xl mx-auto text-center border border-slate-100 p-10 bg-slate-50/50">
            <ShieldAlert size={40} className="mx-auto text-[#282c3f] mb-6" strokeWidth={1.5} />
            <h3 className="text-2xl font-black text-[#282c3f] uppercase tracking-tighter italic mb-4">Account Deletion</h3>
            <p className="text-slate-500 text-sm font-medium mb-10 leading-relaxed">
                This action is irreversible. All your order history, privileges, and studio access will be permanently erased from our servers.
            </p>

            <div className="space-y-6 text-left">
                <SelectField label="Reason for departure" value={data.reason} onChange={e => setData('reason', e.target.value)} options={[
                    { value: 'privacy', label: 'Privacy Concerns' },
                    { value: 'not_using', label: 'No longer using the platform' },
                    { value: 'bad_experience', label: 'Unsatisfactory Experience' },
                    { value: 'other', label: 'Other Reasons' }
                ]} required />

                <InputField label="Authentication Required" type="password" placeholder="Enter your password" value={data.password} onChange={e => setData('password', e.target.value)} error={errors.password} required />

                <label className="flex items-start gap-3 mt-8 cursor-pointer text-left group">
                    <input type="checkbox" checked={data.confirm_understand} onChange={e => setData('confirm_understand', e.target.checked)} className="mt-0.5 size-4 text-black border-slate-300 focus:ring-black rounded-none transition-all" required />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-[#282c3f] transition-colors">I acknowledge that this action is permanent.</span>
                </label>
            </div>

            <button disabled={processing || !data.confirm_understand} className="mt-10 bg-red-600 text-white px-10 py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-red-700 transition-all disabled:opacity-50 w-full rounded-none">
                {processing ? 'Processing...' : 'Permanently Delete'}
            </button>
        </form>
    );
}


// 4. SMART ADDRESS BOOK COMPONENT
export function AddressBook() {
    const { auth } = usePage().props;
    const userAddresses = auth?.user?.addresses || [];
    const [isAdding, setIsAdding] = useState(false);
    const [fetchingPincode, setFetchingPincode] = useState(false);
    const [localErrors, setLocalErrors] = useState({});

    const { data, setData, post, processing, reset } = useForm({
        full_name: '', mobile_number: '', house_no: '', area_locality: '',
        landmark: '', pincode: '', city: '', state: '', is_default: false
    });

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
        post('/user/addresses', { preserveScroll: true, onSuccess: () => { setIsAdding(false); reset(); } });
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-8">
                <h3 className="text-2xl font-black text-[#282c3f] uppercase tracking-tighter italic">Address Book</h3>
                {!isAdding && (
                    <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] hover:text-slate-500 transition-colors">
                        <Plus size={14} strokeWidth={2.5} /> New Address
                    </button>
                )}
            </div>

            {isAdding ? (
                <form onSubmit={submit} className="bg-slate-50 p-8 border border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
                        <InputField label="Full Name" value={data.full_name} onChange={e => setData('full_name', e.target.value.replace(/[^a-zA-Z\s]/g, ''))} required />
                        <InputField label="Mobile Number" value={data.mobile_number} onChange={e => setData('mobile_number', e.target.value.replace(/\D/g, '').slice(0, 10))} required />

                        <div className="space-y-2 relative">
                            <label className="text-[10px] font-black text-[#ff3f6c] uppercase tracking-[0.2em]">Pincode *</label>
                            <div className="relative">
                                <input type="text" value={data.pincode} onChange={handlePincodeChange} placeholder="6-digit pincode" required className="w-full bg-white border border-slate-200 rounded-none px-4 py-3.5 focus:border-black focus:ring-1 focus:ring-black outline-none font-bold text-[#282c3f] transition-all" />
                                {fetchingPincode && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[#282c3f]" size={16} />}
                            </div>
                            {localErrors.pincode && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">{localErrors.pincode}</p>}
                        </div>

                        <InputField label="State" value={data.state} readOnly className="bg-slate-100 text-slate-500 cursor-not-allowed border-transparent" />
                        <InputField label="City/District" value={data.city} readOnly className="bg-slate-100 text-slate-500 cursor-not-allowed border-transparent" />

                        <InputField label="House/Flat No." value={data.house_no} onChange={e => setData('house_no', e.target.value)} required />
                        <InputField label="Area/Locality" value={data.area_locality} onChange={e => setData('area_locality', e.target.value)} required />
                        <InputField label="Landmark (Optional)" value={data.landmark} onChange={e => setData('landmark', e.target.value)} />
                    </div>

                    <label className="flex items-center gap-3 mb-10 cursor-pointer group w-fit">
                        <input type="checkbox" checked={data.is_default} onChange={e => setData('is_default', e.target.checked)} className="rounded-none text-black border-slate-300 focus:ring-black size-4 transition-all" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#282c3f] group-hover:text-slate-500 transition-colors">Set as Default Destination</span>
                    </label>

                    <div className="flex gap-4">
                        <button type="submit" disabled={processing} className={btnDark}>Save Address</button>
                        <button type="button" onClick={() => setIsAdding(false)} className={btnLight}>Cancel</button>
                    </div>
                </form>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userAddresses.length > 0 ? userAddresses.map((addr) => (
                        <div key={addr.id} className="border border-slate-200 p-6 relative group hover:border-[#282c3f] transition-colors bg-white">
                            {addr.is_default && <span className="absolute top-6 right-6 text-[9px] font-black uppercase tracking-[0.3em] text-[#ff3f6c]">Default</span>}
                            <h4 className="text-sm font-black text-[#282c3f] uppercase tracking-widest mb-2">{addr.full_name}</h4>
                            <div className="text-xs text-slate-500 leading-relaxed mb-6 font-medium">
                                <p>{addr.house_no}, {addr.area_locality}</p>
                                <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                                <p className="mt-2 text-[#282c3f] font-bold">T: +91 {addr.mobile_number}</p>
                            </div>

                            <div className="flex gap-6 pt-4 border-t border-slate-100">
                                <button className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-[#282c3f] transition-colors flex items-center gap-1.5"><Edit2 size={12} strokeWidth={2.5} /> Edit</button>
                                <button className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1.5"><Trash2 size={12} strokeWidth={2.5} /> Remove</button>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-2 text-center py-16 bg-slate-50 border border-slate-100 border-dashed">
                            <MapPin size={32} className="mx-auto text-slate-300 mb-4" strokeWidth={1} />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">No destinations saved.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// 5. HELP & SUPPORT COMPONENT
export function HelpSupport() {
    const { data, setData, post, processing, reset } = useForm({ subject: '', order_id: '', message: '' });
    const [tickets, setTickets] = useState([]);

    const submit = (e) => {
        e.preventDefault();
        post('/user/support-tickets', { onSuccess: () => reset() });
    };

    return (
        <div className="space-y-12">
            <div>
                <h3 className={sectionHeader}>Studio Support</h3>
                <form onSubmit={submit} className="bg-slate-50 p-8 border border-slate-100 grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <SelectField label="Inquiry Type" value={data.subject} onChange={e => setData('subject', e.target.value)} required options={[
                            { value: 'order_issue', label: 'Order & Logistics' },
                            { value: 'return_refund', label: 'Returns & Concierge' },
                            { value: 'payment', label: 'Billing & Payments' },
                            { value: 'other', label: 'General Inquiry' }
                        ]} />
                        <InputField label="Order Reference (Optional)" placeholder="e.g. ORD-12345" value={data.order_id} onChange={e => setData('order_id', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#ff3f6c] uppercase tracking-[0.2em]">Detailed Message *</label>
                        <textarea rows="4" required placeholder="How can we assist you today?" value={data.message} onChange={e => setData('message', e.target.value)} className="w-full bg-white border border-slate-200 rounded-none px-4 py-3.5 focus:border-black focus:ring-1 focus:ring-black outline-none font-medium text-[#282c3f] transition-all resize-none"></textarea>
                    </div>
                    <div>
                        <button disabled={processing} className={btnDark}>Submit Inquiry</button>
                    </div>
                </form>
            </div>

            <div>
                <h4 className="text-sm font-black text-[#282c3f] uppercase tracking-widest mb-6">Case History</h4>
                <div className="space-y-4">
                    {tickets.length > 0 ? tickets.map((tkt, i) => (
                        <div key={i} className="flex flex-col md:flex-row md:items-center justify-between bg-white border border-slate-200 p-6 hover:border-black transition-colors">
                            <div>
                                <span className="text-[9px] font-black tracking-[0.3em] text-[#ff3f6c] uppercase">{tkt.id}</span>
                                <h5 className="text-sm font-black text-[#282c3f] mt-1">{tkt.subject}</h5>
                                <p className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1.5"><Clock size={12} /> {tkt.date}</p>
                            </div>
                            <div className="mt-4 md:mt-0">
                                <span className="border border-[#282c3f] text-[#282c3f] text-[9px] px-3 py-1.5 font-black uppercase tracking-[0.2em]">
                                    {tkt.status}
                                </span>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-12 bg-slate-50 border border-slate-100 border-dashed">
                            <HelpCircle size={24} className="mx-auto text-slate-300 mb-3" strokeWidth={1.5} />
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.3em]">No active cases.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// 💎 HELPER: Premium Boutique Toggle Switch
function ToggleSwitch({ label, description, checked, onChange }) {
    return (
        <div className="flex items-start justify-between py-5 border-b border-slate-100 last:border-0 group">
            <div className="pr-6">
                <p className="text-[11px] font-black uppercase tracking-widest text-[#282c3f]">{label}</p>
                {description && <p className="text-[10px] font-medium text-slate-500 mt-1.5 leading-relaxed">{description}</p>}
            </div>
            <button type="button" onClick={() => onChange(!checked)} className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-none border border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${checked ? 'bg-[#282c3f]' : 'bg-slate-200'}`}>
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-none bg-white shadow-sm ring-0 transition duration-300 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`} />
            </button>
        </div>
    );
}

// 6. REAL NOTIFICATIONS COMPONENT
export function Notifications() {
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
        post('/user/settings/notifications', { preserveScroll: true });
    };

    return (
        <form onSubmit={submit} className="space-y-8 max-w-3xl">
            <h3 className={sectionHeader}>Communications</h3>
            {recentlySuccessful && <div className="bg-slate-50 border border-slate-200 text-[#282c3f] p-4 text-xs font-bold uppercase tracking-widest flex items-center gap-3"><CheckCircle2 size={16} /> Preferences updated.</div>}

            <div className="bg-white border border-slate-200 p-8">
                <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-[#ff3f6c] mb-6">Content Preferences</h4>
                <ToggleSwitch label="Logistics Updates" description="Order confirmations, shipping details, and receipts." checked={data.order_updates} onChange={v => setData('order_updates', v)} />
                <ToggleSwitch label="Delivery Tracking" description="Out for delivery alerts and real-time tracking links." checked={data.delivery_updates} onChange={v => setData('delivery_updates', v)} />
                <ToggleSwitch label="Studio Exclusives" description="Private access, seasonal drops, and performance insights." checked={data.offer_alerts} onChange={v => setData('offer_alerts', v)} />
                <ToggleSwitch label="New Innovations" description="Alerts for our latest fabric technologies and gear." checked={data.new_products} onChange={v => setData('new_products', v)} />
            </div>

            <div className="bg-white border border-slate-200 p-8">
                <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-[#ff3f6c] mb-6">Delivery Channels</h4>
                <ToggleSwitch label="Email Dispatch" checked={data.email_notif} onChange={v => setData('email_notif', v)} />
                <ToggleSwitch label="SMS Dispatch" checked={data.sms_notif} onChange={v => setData('sms_notif', v)} />
                <ToggleSwitch label="WhatsApp Concierge" description="Direct updates to your personal WhatsApp." checked={data.whatsapp_notif} onChange={v => setData('whatsapp_notif', v)} />
            </div>

            <button disabled={processing} className={btnDark}>
                Save Preferences
            </button>
        </form>
    );
}

// 7. PRIVACY SETTINGS COMPONENT
export function PrivacySettings() {
    const { data, setData, post, processing } = useForm({
        marketing_consent: false, personalized_recs: true, data_sharing: false
    });

    return (
        <div className="space-y-10 max-w-3xl">
            <h3 className={sectionHeader}>Privacy Controls</h3>

            <div className="bg-white border border-slate-200 p-8">
                <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-[#ff3f6c] mb-6">Data Utilization</h4>
                <ToggleSwitch label="Marketing Consent" description="Allow tailored performance gear recommendations via email." checked={data.marketing_consent} onChange={v => setData('marketing_consent', v)} />
                <ToggleSwitch label="Adaptive Experience" description="Permit browsing history utilization for a bespoke studio experience." checked={data.personalized_recs} onChange={v => setData('personalized_recs', v)} />
                <ToggleSwitch label="Analytical Sharing" description="Anonymized data contribution for global athletic insights." checked={data.data_sharing} onChange={v => setData('data_sharing', v)} />
            </div>

            <div className="space-y-6">
                <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-[#ff3f6c]">Data Export & Wipe</h4>
                <div className="flex flex-col sm:flex-row gap-4">
                    <a href="/user/data/download" download className={btnLight + " flex items-center justify-center gap-3 w-full text-center"}>
                        <Download size={14} /> Export Archive (.JSON)
                    </a>
                    <button className="flex items-center justify-center gap-3 bg-white border border-slate-200 text-red-500 px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:border-red-500 hover:bg-red-50 transition-all w-full">
                        <ShieldAlert size={14} /> Wipe Session Data
                    </button>
                </div>
            </div>
        </div>
    );
}

// 8. PAYMENT METHODS COMPONENT
export function PaymentMethods() {
    const { auth } = usePage().props;
    const savedCards = auth?.user?.payment_methods || [];

    const handleRemoveCard = (id) => {
        if (confirm("Revoke access for this payment method?")) {
            router.delete(`/user/payment-methods/${id}`, { preserveScroll: true });
        }
    };

    return (
        <div className="space-y-8 max-w-3xl">
            <h3 className={sectionHeader}>Payment Vault</h3>

            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {savedCards.length > 0 ? savedCards.map(card => (
                        <div key={card.id} className="bg-gradient-to-br from-[#282c3f] to-[#282c3f] text-white p-6 relative overflow-hidden shadow-2xl">
                            {/* Subtle Metallic sheen */}
                            <div className="absolute top-0 right-0 w-[150%] h-full bg-gradient-to-bl from-white/10 to-transparent skew-x-12 translate-x-1/4 pointer-events-none"></div>

                            <div className="flex justify-between items-start relative z-10 mb-8">
                                <CreditCard size={24} className="text-slate-400" strokeWidth={1} />
                                <button type="button" onClick={() => handleRemoveCard(card.id)} className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Revoke</button>
                            </div>

                            <p className="font-black tracking-[0.3em] text-lg mb-4 relative z-10">**** **** **** {card.last_four}</p>

                            <div className="relative z-10">
                                <p className="text-[8px] text-slate-400 uppercase tracking-[0.3em] mb-1">Cardholder</p>
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-200">{card.card_name}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="border border-slate-200 flex items-center justify-center p-8 text-[#ff3f6c] bg-slate-50/50">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Vault is empty</span>
                        </div>
                    )}

                    <button className="border border-slate-200 border-dashed flex flex-col items-center justify-center p-8 text-slate-400 hover:text-[#282c3f] hover:border-[#282c3f] hover:bg-slate-50 transition-all group">
                        <div className="size-10 bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Plus size={16} strokeWidth={2} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Add Secure Method</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

// 9. COUPONS & RETURNS (Minimalist Boutique States)
export function Coupons() {
    return (
        <div>
            <h3 className={sectionHeader}>Studio Privileges</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Minimalist Monochrome Coupon */}
                <div className="flex items-stretch bg-white border border-slate-200 overflow-hidden shadow-sm group hover:border-[#282c3f] transition-colors">
                    <div className="bg-[#282c3f] text-white p-6 flex flex-col justify-center items-center border-r border-dashed border-white/20">
                        <span className="text-3xl font-black tracking-tighter">20%</span>
                        <span className="text-[9px] font-black tracking-[0.4em] uppercase mt-1">OFF</span>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-center">
                        <h4 className="font-black text-[#282c3f] text-lg uppercase tracking-widest mb-1">STUDIO26</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">On orders above ₹1999.</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Exp: 31 Dec</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ReturnsRefunds() {
    return (
        <div>
            <h3 className={sectionHeader}>Returns & Exchanges</h3>
            <div className="text-center py-24 bg-white border border-slate-100">
                <RefreshCcw size={32} className="mx-auto text-slate-300 mb-6" strokeWidth={1} />
                <h4 className="text-sm font-black text-[#282c3f] uppercase tracking-[0.3em] mb-3">No Active Returns</h4>
                <p className="text-[#ff3f6c] font-bold text-xs uppercase tracking-widest">Your return archive is currently empty.</p>
            </div>
        </div>
    );
}

// 💎 REUSABLE HELPERS (Titanium Frost Styling)
function InputField({ label, type = "text", value, onChange, error, placeholder, readOnly, className, required }) {
    return (
        <div className="space-y-2 relative">
            <label className="text-[10px] font-black text-[#ff3f6c] uppercase tracking-[0.2em]">{label} {required && '*'}</label>
            <input
                type={type} value={value} onChange={onChange} readOnly={readOnly} placeholder={placeholder} required={required}
                className={`w-full bg-white border ${error ? 'border-red-500' : 'border-slate-200'} rounded-none px-4 py-3.5 focus:border-black focus:ring-1 focus:ring-black outline-none font-bold text-[#282c3f] transition-all placeholder:text-slate-300 ${className}`}
            />
            {error && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest absolute -bottom-5">{error}</p>}
        </div>
    );
}

function SelectField({ label, value, onChange, options, required }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-[#ff3f6c] uppercase tracking-[0.2em]">{label} {required && '*'}</label>
            <select value={value} onChange={onChange} required={required} className="w-full bg-white border border-slate-200 rounded-none px-4 py-3.5 focus:border-black focus:ring-1 focus:ring-black outline-none font-bold text-[#282c3f] transition-all appearance-none cursor-pointer">
                <option value="" disabled className="text-slate-400">Select an option...</option>
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
        </div>
    );
}