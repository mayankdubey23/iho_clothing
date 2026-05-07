import React, { useState, useRef } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Banknote,
  BadgeCheck,
  Check,
  CheckCircle2,
  CreditCard,
  Filter,
  HeartHandshake,
  Loader2,
  Mail,
  MapPin,
  Package,
  PackageCheck,
  Search,
  Shield,
  ShoppingBag,
  Star,
  Store,
  Truck,
  X,
  Zap,
  Tag,
} from 'lucide-react';
import AppLayout, { EmptyState, Field, SectionHeading, imageFor, money, stockFor } from '../Layouts/AppLayout';

const HERO_FALLBACK   = 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=1600&q=80';
const PRODUCT_FALLBACK = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=70';

const CAT_COLORS = [
  'bg-teal-800 text-white ring-2 ring-teal-900/20',
  'bg-orange-800 text-white ring-2 ring-orange-900/20',
  'bg-zinc-900 text-white ring-2 ring-zinc-700/20',
  'bg-stone-800 text-white ring-2 ring-stone-700/20',
  'bg-cyan-800 text-white ring-2 ring-cyan-900/20',
  'bg-slate-800 text-white ring-2 ring-slate-900/20',
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const trustItems = [
  [PackageCheck, 'SKU inventory', 'Products include SKU and live stock data.'],
  [HeartHandshake, 'Franchise pricing', 'Retail and partner prices stay separate.'],
  [Truck, 'Smart Delivery', 'Auto-routes orders based on customer Pincode.'],
];

const marqueeItems = [
  '✦ Free delivery above ₹999',
  '✦ Premium activewear',
  '✦ Franchise opportunities available',
  '✦ SKU-level inventory tracking',
  '✦ Smart checkout with pincode routing',
  '✦ Premium Quality Guaranteed',
];

const howItWorks = [
  {
    step: '01',
    icon: Search,
    title: 'Browse & Filter',
    desc: 'Explore our premium catalog. Filter by category, price, and size to find exactly what you need.',
  },
  {
    step: '02',
    icon: CreditCard,
    title: 'Quick Checkout',
    desc: 'Fill your delivery details with pincode. Our system routes your order to the nearest franchise.',
  },
  {
    step: '03',
    icon: MapPin,
    title: 'Fast Delivery',
    desc: 'Your order is dispatched from the closest IHO franchise for the fastest possible delivery.',
  },
];

const testimonials = [
  {
    name: 'Rahul Sharma',
    city: 'New Delhi',
    role: 'Regular Customer',
    text: 'IHO Clothing has the best quality sportswear I have found online. The fabric is premium, delivery was super fast, and the franchise pricing is really transparent.',
    rating: 5,
    avatar: 'RS',
    color: 'bg-teal-600',
  },
  {
    name: 'Priya Mehta',
    city: 'Mumbai',
    role: 'Franchise Partner',
    text: 'I applied for a franchise 3 months ago and the support has been excellent. Stock management is seamless and the retail margin is very healthy.',
    rating: 5,
    avatar: 'PM',
    color: 'bg-orange-600',
  },
  {
    name: 'Arjun Singh',
    city: 'Bangalore',
    role: 'Sports Academy Coach',
    text: 'We ordered teamwear sets for 40 players. The bulk pricing and SKU-level customization options were exactly what we needed for our academy.',
    rating: 5,
    avatar: 'AS',
    color: 'bg-zinc-700',
  },
];

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

const CHECKOUT_ERROR_MESSAGES = {
  full_name: 'Please enter a valid full name.',
  mobile_number: 'Please enter a valid 10-digit mobile number.',
  email: 'Please enter a valid email address.',
  alternate_mobile_number: 'Please enter a valid alternate mobile number.',
  house_flat_building: 'Please enter your house, flat, or building number.',
  street_area_locality: 'Please enter your street, area, or locality.',
  landmark: 'Please enter a valid landmark.',
  city: 'Please enter a valid city name.',
  state: 'Please select your state.',
  pincode: 'Please enter a valid 6-digit pincode.',
  country: 'Please select your country.',
};

const nameRegex = /^[A-Za-z ]{3,}$/;
const mobileRegex = /^[6-9][0-9]{9}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const cityRegex = /^[A-Za-z ]{2,}$/;
const pincodeRegex = /^[1-9][0-9]{5}$/;

function trimCheckoutData(data) {
  return {
    ...data,
    full_name: (data.full_name || '').trim(),
    mobile_number: (data.mobile_number || '').trim(),
    email: (data.email || '').trim(),
    alternate_mobile_number: (data.alternate_mobile_number || '').trim(),
    house_flat_building: (data.house_flat_building || '').trim(),
    street_area_locality: (data.street_area_locality || '').trim(),
    landmark: (data.landmark || '').trim(),
    city: (data.city || '').trim(),
    state: (data.state || '').trim(),
    pincode: (data.pincode || '').trim(),
    country: (data.country || 'India').trim(),
  };
}

function validateCheckout(data) {
  const values = trimCheckoutData(data);
  const errors = {};

  if (!nameRegex.test(values.full_name)) errors.full_name = CHECKOUT_ERROR_MESSAGES.full_name;
  if (!mobileRegex.test(values.mobile_number)) errors.mobile_number = CHECKOUT_ERROR_MESSAGES.mobile_number;
  if (!emailRegex.test(values.email)) errors.email = CHECKOUT_ERROR_MESSAGES.email;
  if (values.alternate_mobile_number && !mobileRegex.test(values.alternate_mobile_number)) {
    errors.alternate_mobile_number = CHECKOUT_ERROR_MESSAGES.alternate_mobile_number;
  }
  if (values.house_flat_building.length < 2) errors.house_flat_building = CHECKOUT_ERROR_MESSAGES.house_flat_building;
  if (values.street_area_locality.length < 3) errors.street_area_locality = CHECKOUT_ERROR_MESSAGES.street_area_locality;
  if (values.landmark && (values.landmark.length < 3 || !/[A-Za-z0-9]/.test(values.landmark))) {
    errors.landmark = CHECKOUT_ERROR_MESSAGES.landmark;
  }
  if (!cityRegex.test(values.city)) errors.city = CHECKOUT_ERROR_MESSAGES.city;
  if (!values.state) errors.state = CHECKOUT_ERROR_MESSAGES.state;
  if (!pincodeRegex.test(values.pincode)) errors.pincode = CHECKOUT_ERROR_MESSAGES.pincode;
  if (values.country !== 'India') errors.country = CHECKOUT_ERROR_MESSAGES.country;

  return errors;
}

function firstError(errors, field) {
  const error = errors[field];
  return Array.isArray(error) ? error[0] : error;
}


export default function Storefront({ products, categories, plans, filters }) {
  const { data, setData, get } = useForm({
    category: filters.category || 'all',
    search: filters.search || '',
    min_price: filters.min_price || '',
    max_price: filters.max_price || '',
  });

  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterDone, setNewsletterDone] = useState(false);
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [checkoutErrors, setCheckoutErrors] = useState({});
  const [checkoutTouched, setCheckoutTouched] = useState({});
  const [checkoutAttempted, setCheckoutAttempted] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);
  const [pincodeApiError, setPincodeApiError] = useState('');
  const [paymentStep, setPaymentStep] = useState('form'); // 'form' | 'payment'

  // Coupon logic state
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const {
    data: orderData,
    setData: setOrderData,
    reset,
  } = useForm({
    full_name: '',
    mobile_number: '',
    email: '',
    alternate_mobile_number: '',
    house_flat_building: '',
    street_area_locality: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    total_amount: 0,
    items: [],
  });

  // ── Hero parallax ──────────────────────────────────────────────────────────
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const bgY   = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-18%']);

  // Mouse-tracking parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX    = useSpring(mouseX, { damping: 20, stiffness: 100, mass: 0.5 });
  const smoothY    = useSpring(mouseY, { damping: 20, stiffness: 100, mass: 0.5 });
  const bgParallaxX = useTransform(smoothX, [-1, 1], [-10, 10]);
  const bgParallaxY = useTransform(smoothY, [-1, 1], [-7, 7]);
  const orb1X       = useTransform(smoothX, [-1, 1], [-28, 28]);
  const orb1Y       = useTransform(smoothY, [-1, 1], [-20, 20]);
  const orb2X       = useTransform(smoothX, [-1, 1], [18, -18]);

  function handleHeroMouseMove(e) {
    const r = e.currentTarget.getBoundingClientRect();
    mouseX.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    mouseY.set(((e.clientY - r.top) / r.height - 0.5) * 2);
  }
  function handleHeroMouseLeave() { mouseX.set(0); mouseY.set(0); }
  // ───────────────────────────────────────────────────────────────────────────

  const heroImg = imageFor(products.data?.[0]) || HERO_FALLBACK;
  const featuredProducts = products.data?.slice(0, 4) || [];

  const siteStats = [
    { value: `${products.total}+`, label: 'Products', sub: 'Active listings' },
    { value: `${categories.length}+`, label: 'Categories', sub: 'Product types' },
    { value: `${plans.length}`, label: 'Franchise Plans', sub: 'Partnership tiers' },
    { value: '100%', label: 'Premium Quality', sub: 'Certified fabric' },
  ];

  function applyFilters(event) {
    event.preventDefault();
    get('/', { preserveState: true, preserveScroll: true });
  }


  function handleBuyNow(product) {
    const sku = product.skus?.[0];
    if (!sku) return alert('Out of stock!');
    setCheckoutProduct(product);
    setOrderData({
      full_name: '',
      mobile_number: '',
      email: '',
      alternate_mobile_number: '',
      house_flat_building: '',
      street_area_locality: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      total_amount: product.base_price,
      items: [{ product_id: product.id, sku_id: sku.id, quantity: 1, price: product.base_price }],
    });
    setCheckoutErrors({});
    setCheckoutTouched({});
    setCheckoutAttempted(false);
    setCheckoutMessage('');
    setPincodeApiError('');
    setIsFetchingPincode(false);
    setPaymentStep('form');
    setCouponCode('');
    setDiscount(0);
    setFinalTotal(product.base_price);
  }

  const liveCheckoutErrors = validateCheckout(orderData);
  const checkoutIsValid = Object.keys(liveCheckoutErrors).length === 0 && (orderData.items?.length || 0) > 0;

  function handleCheckoutField(field, value) {
    setOrderData(field, value);
    setCheckoutTouched((current) => ({ ...current, [field]: true }));
    setCheckoutErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  // Match API state name to INDIAN_STATES list (case-insensitive, handles & vs and)
  function matchState(apiState) {
    if (!apiState) return '';
    const normalise = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, ' ').trim();
    const target = normalise(apiState);
    return INDIAN_STATES.find((s) => normalise(s) === target) || '';
  }

  // Pincode auto-fill: calls postal API when 6 digits entered
  async function handlePincodeChange(e) {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    handleCheckoutField('pincode', val);
    setPincodeApiError('');

    if (val.length === 6) {
      setIsFetchingPincode(true);
      try {
        const res = await axios.get(`https://api.postalpincode.in/pincode/${val}`);
        const data = res.data[0];
        if (data.Status === 'Success' && data.PostOffice?.length > 0) {
          const po = data.PostOffice[0];
          const detectedCity = po.District || po.Block || '';
          const detectedState = matchState(po.State);
          setOrderData('city', detectedCity);
          setOrderData('state', detectedState);
          // Clear any backend errors for these fields
          setCheckoutErrors((cur) => {
            const next = { ...cur };
            delete next.city;
            delete next.state;
            return next;
          });
        } else {
          setPincodeApiError('Invalid pincode. Please check and try again.');
          setOrderData('city', '');
          setOrderData('state', '');
        }
      } catch {
        setPincodeApiError('Could not verify pincode. Please enter city and state manually.');
      } finally {
        setIsFetchingPincode(false);
      }
    } else if (val.length === 0) {
      setOrderData('city', '');
      setOrderData('state', '');
    }
  }

  function fieldError(field) {
    if (!checkoutTouched[field] && !checkoutAttempted && !checkoutErrors[field]) return '';
    return firstError(checkoutErrors, field) || firstError(liveCheckoutErrors, field) || '';
  }

  function checkoutInputClass(field, extra = '') {
    return `input ${fieldError(field) ? '!border-red-500 !bg-red-50 focus:!border-red-500' : ''} ${extra}`.trim();
  }

  function requiredLabel(label) {
    return <span>{label} <span className="text-red-500">*</span></span>;
  }


  // Coupon apply logic for checkout modal
  async function applyCoupon() {
    if (!couponCode || !checkoutProduct) return;
    setIsApplyingCoupon(true);
    try {
      const res = await axios.post('/coupons/apply', {
        code: couponCode,
        cart_total: checkoutProduct.base_price
      });
      if (res.data.success) {
        setDiscount(res.data.discount_amount);
        setFinalTotal(res.data.new_total);
        setOrderData('total_amount', res.data.new_total);
        alert(`Coupon Applied! You saved ₹${res.data.discount_amount}`);
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Invalid Coupon');
      setDiscount(0);
      setFinalTotal(checkoutProduct.base_price);
      setOrderData('total_amount', checkoutProduct.base_price);
    }
    setIsApplyingCoupon(false);
  }

  // Step 1 — Validate form then advance to payment method selection
  function handleCheckout(e) {
    e.preventDefault();
    setCheckoutAttempted(true);
    setCheckoutMessage('');

    const validationErrors = validateCheckout(trimCheckoutData(orderData));
    if (Object.keys(validationErrors).length > 0 || !checkoutProduct || !(orderData.items?.length > 0)) {
      setCheckoutErrors(validationErrors);
      setCheckoutMessage('Please fix the highlighted errors before continuing.');
      return;
    }

    setPaymentStep('payment');
  }

  // Shared: build order POST payload
  function buildOrderPayload(method) {
    return {
      ...trimCheckoutData(orderData),
      total_amount: finalTotal || checkoutProduct.base_price,
      coupon_code: discount > 0 ? couponCode : null,
      items: orderData.items,
      payment_method: method,
    };
  }

  // Shared: handle backend error and return to form step
  function handleOrderApiError(error) {
    const data = error.response?.data || {};
    if (error.response?.status === 422 && data.errors) {
      setCheckoutErrors(data.errors);
      setCheckoutMessage(data.message || 'Please fix the highlighted errors.');
    } else {
      setCheckoutMessage(data.message || data.error || 'Failed to place order. Please try again.');
    }
    setPaymentStep('form');
  }

  // Step 2a — Cash on Delivery
  async function handleCOD() {
    setOrderProcessing(true);
    setCheckoutMessage('');
    try {
      const response = await axios.post('/orders', buildOrderPayload('cod'));
      if (response.data.success || response.data.status) {
        setCheckoutProduct(null);
        reset();
        alert('Order placed! Our team will collect payment at delivery.');
        window.location.href = '/account';
      }
    } catch (error) {
      handleOrderApiError(error);
    } finally {
      setOrderProcessing(false);
    }
  }

  // Step 2b — Online payment via Razorpay
  async function handleRazorpay() {
    setOrderProcessing(true);
    setCheckoutMessage('');
    try {
      const response = await axios.post('/orders', buildOrderPayload('online'));
      if (response.data.success || response.data.status) {
        if (!window.Razorpay) {
          setCheckoutMessage('Payment gateway could not be loaded. Please refresh and try again.');
          setPaymentStep('form');
          return;
        }
        const sanitized = trimCheckoutData(orderData);
        const options = {
          key: 'rzp_test_Sm4nLu6gjKZ8zt',
          amount: Number(response.data.amount || finalTotal || checkoutProduct.base_price) * 100,
          currency: 'INR',
          name: 'IHO Clothing',
          description: 'Premium Fashion Order',
          order_id: response.data.razorpay_order_id,
          handler: async function (paymentResponse) {
            try {
              await axios.post('/payment/verify', {
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
              });
              alert('Payment Successful! Order Confirmed.');
              setCheckoutProduct(null);
              reset();
              window.location.href = '/account';
            } catch {
              alert('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            name: sanitized.full_name,
            email: sanitized.email,
            contact: sanitized.mobile_number,
          },
          theme: { color: '#0f766e' },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      handleOrderApiError(error);
    } finally {
      setOrderProcessing(false);
    }
  }

  function handleNewsletter(e) {
    e.preventDefault();
    setNewsletterDone(true);
  }

  return (
    <AppLayout active="storefront">

      {/* ══════════════════════════════════
          1. HERO  — premium Framer Motion
      ══════════════════════════════════ */}
      <motion.section
        ref={heroRef}
        className="relative flex min-h-[700px] items-end overflow-hidden bg-zinc-950 lg:min-h-[90vh]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9 }}
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
      >
        {/* ── Parallax background (scroll + mouse) ──────────────── */}
        <motion.div className="absolute inset-0 scale-[1.12]" style={{ y: bgY }}>
          <motion.div className="absolute inset-0" style={{ x: bgParallaxX, y: bgParallaxY }}>
            <img
              className="h-full w-full object-cover"
              src={heroImg}
              onError={(e) => { e.target.src = HERO_FALLBACK; e.target.onerror = null; }}
              alt=""
              loading="eager"
            />
          </motion.div>
        </motion.div>

        {/* ── Multi-layer dark overlay ───────────────────────────── */}
        <div className="absolute inset-0 bg-[linear-gradient(108deg,rgba(9,9,11,.98)_0%,rgba(9,9,11,.80)_46%,rgba(9,9,11,.18)_100%)]" />
        {/* Radial spotlight behind text */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_75%_at_5%_68%,rgba(20,184,166,0.14),transparent_72%)]" />

        {/* ── Ambient orbs — mouse-reactive ─────────────────────── */}
        <motion.div
          className="pointer-events-none absolute right-[7%] top-[8%] h-[440px] w-[440px] rounded-full bg-teal-500/[0.18] blur-[150px]"
          style={{ x: orb1X, y: orb1Y }}
          animate={{ scale: [1, 1.22, 1], opacity: [0.5, 0.88, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="pointer-events-none absolute bottom-[4%] right-[20%] h-80 w-80 rounded-full bg-orange-500/[0.14] blur-[130px]"
          style={{ x: orb2X }}
          animate={{ scale: [1.1, 0.84, 1.1], opacity: [0.38, 0.72, 0.38] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2.2 }}
        />
        <motion.div
          className="pointer-events-none absolute left-[40%] top-[28%] h-56 w-56 rounded-full bg-violet-500/[0.09] blur-[100px]"
          animate={{ scale: [0.82, 1.32, 0.82], opacity: [0.22, 0.5, 0.22] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />

        {/* ── Floating geometric accents ────────────────────────── */}
        <motion.div
          className="pointer-events-none absolute right-[13%] top-[19%] h-32 w-32 rounded-3xl border border-white/[0.06] bg-white/[0.025]"
          animate={{ y: [0, -26, 0], rotate: [0, 7, 0], opacity: [0.18, 0.48, 0.18] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="pointer-events-none absolute right-[34%] top-[15%] h-[60px] w-[60px] rounded-2xl border border-teal-400/[0.22] bg-teal-400/[0.04]"
          animate={{ y: [0, 19, 0], rotate: [0, -11, 0], opacity: [0.28, 0.62, 0.28] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1.6 }}
        />
        <motion.div
          className="pointer-events-none absolute right-[22%] bottom-[18%] h-10 w-10 rounded-xl border border-orange-400/[0.22] bg-orange-400/[0.04]"
          animate={{ y: [0, -14, 0], rotate: [0, 16, 0], opacity: [0.22, 0.58, 0.22] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 3.2 }}
        />

        {/* ── Hero text content ──────────────────────────────────── */}
        <motion.div
          className="relative z-10 max-w-3xl px-6 pb-16 pt-36 text-white lg:px-16 lg:pb-32"
          style={{ y: textY }}
        >
          {/* Eyebrow badge with pulsing live dot */}
          <motion.p
            className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.14] bg-white/[0.08] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-orange-200 backdrop-blur-md"
            initial={{ opacity: 0, y: 22, scale: 0.84 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            {/* Pulsing live indicator */}
            <span className="relative flex h-2 w-2 shrink-0">
              <motion.span
                className="absolute inline-flex h-full w-full rounded-full bg-orange-400"
                animate={{ scale: [1, 2.2, 1], opacity: [0.75, 0, 0.75] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-400" />
            </span>
            <motion.span
              animate={{ rotate: [0, 20, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
              className="inline-flex"
            >
              <Zap size={12} />
            </motion.span>
            Premium activewear franchise
          </motion.p>

          {/* H1 — word-clip reveal + gradient on "IHO" */}
          <h1 className="font-display mt-5 text-6xl font-black leading-none sm:text-7xl lg:text-8xl">
            <div className="overflow-hidden leading-[1.06]">
              <motion.span
                className="inline-block bg-gradient-to-r from-white via-teal-100 to-teal-300 bg-clip-text text-transparent"
                initial={{ y: '115%', opacity: 0, skewY: 4 }}
                animate={{ y: 0, opacity: 1, skewY: 0 }}
                transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: 0.28 }}
              >
                IHO
              </motion.span>
            </div>
            <div className="overflow-hidden leading-[1.06]">
              <motion.span
                className="inline-block text-white"
                initial={{ y: '115%', opacity: 0, skewY: 4 }}
                animate={{ y: 0, opacity: 1, skewY: 0 }}
                transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: 0.44 }}
              >
                Clothing
              </motion.span>
            </div>
          </h1>

          {/* Animated gradient underline */}
          <motion.div
            className="mt-4 h-[3px] w-28 rounded-full bg-gradient-to-r from-teal-400 via-teal-300 to-orange-400"
            style={{ transformOrigin: 'left' }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: 0.66 }}
          />

          {/* Subtitle */}
          <motion.p
            className="mt-6 max-w-lg text-lg leading-8 text-white/65"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.76 }}
          >
            Premium sportswear, clean catalog browsing, and franchise-ready pricing — all in one place.
          </motion.p>

          {/* CTA buttons — staggered entrance + hover/tap */}
          <motion.div
            className="mt-8 flex flex-wrap gap-3"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.11, delayChildren: 0.92 } } }}
          >
            <motion.a
              href="#catalog"
              className="button-glow inline-flex min-h-12 items-center gap-2.5 rounded-xl bg-teal-600 px-6 text-sm font-bold transition-colors hover:bg-teal-700"
              variants={fadeUp}
              whileHover={{ scale: 1.06, y: -3, transition: { duration: 0.18 } }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingBag size={17} /> Shop catalog
            </motion.a>
            <motion.div
              variants={fadeUp}
              whileHover={{ scale: 1.06, y: -3, transition: { duration: 0.18 } }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/sports-wear" className="button-glow inline-flex min-h-12 items-center gap-2.5 rounded-xl border border-white/20 bg-white/10 px-6 text-sm font-bold backdrop-blur-sm transition-colors hover:bg-white/[0.15]">
                <PackageCheck size={17} /> Sports wear
              </Link>
            </motion.div>
            <motion.div
              variants={fadeUp}
              whileHover={{ scale: 1.06, y: -3, transition: { duration: 0.18 } }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/franchise-apply" className="button-glow inline-flex min-h-12 items-center gap-2.5 rounded-xl border border-white/20 bg-white/10 px-6 text-sm font-bold backdrop-blur-sm transition-colors hover:bg-white/[0.15]">
                <Store size={17} /> Apply franchise
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ── Floating stat pills (xl+ only) ────────────────────── */}
        <div className="absolute right-10 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-3 xl:flex">
          {[
            { icon: Package,       label: `${products?.total ?? '500'}+`, sub: 'Products',        delay: 1.1 },
            { icon: Truck,         label: 'Pan India',                     sub: 'Delivery',        delay: 1.3 },
            { icon: BadgeCheck,    label: '100%',                          sub: 'Premium Quality', delay: 1.5 },
            { icon: HeartHandshake,label: `${plans?.length ?? 3}`,         sub: 'Franchise Plans', delay: 1.7 },
          ].map(({ icon: Icon, label, sub, delay }) => (
            <motion.div
              key={sub}
              className="flex items-center gap-3 rounded-2xl border border-white/[0.10] bg-white/[0.07] px-4 py-3 backdrop-blur-md"
              initial={{ opacity: 0, x: 50, scale: 0.88 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1], delay }}
              whileHover={{ scale: 1.05, x: -6, backgroundColor: 'rgba(255,255,255,0.12)', transition: { duration: 0.18 } }}
            >
              <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-teal-500/[0.22]">
                <Icon size={16} className="text-teal-300" />
              </div>
              <div>
                <p className="text-sm font-black leading-tight text-white">{label}</p>
                <p className="text-[11px] font-medium text-white/40">{sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Scroll indicator ──────────────────────────────────── */}
        <motion.div
          className="pointer-events-none absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.6, duration: 1.2 }}
        >
          <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/20">Scroll</span>
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowDown size={14} className="text-white/25" />
          </motion.div>
        </motion.div>
      </motion.section>


      {/* ══════════════════════════════════
          2. PREMIUM PRODUCT CAROUSEL
      ══════════════════════════════════ */}
      <section className="relative z-20 bg-white border-b border-stone-200 py-10 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
            <SectionHeading eyebrow="Trending now" title="Best Sellers" aside="Handpicked for you" />
          </motion.div>
          <motion.div
            className="flex gap-7 overflow-x-auto py-4 hide-scrollbar"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {products.data.slice(0, 10).map((product, i) => {
              const img = imageFor(product) || PRODUCT_FALLBACK;
              const stock = stockFor(product);
              return (
                <motion.div
                  key={product.id}
                  className="min-w-[260px] max-w-[260px] flex-shrink-0 rounded-2xl border border-stone-200 bg-white shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col"
                  variants={fadeUp}
                  whileHover={{ scale: 1.04, y: -6 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="h-44 overflow-hidden rounded-t-2xl bg-stone-100 flex items-center justify-center">
                    <img
                      src={img}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                      onError={e => { e.target.src = PRODUCT_FALLBACK; e.target.onerror = null; }}
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <span className="text-xs font-bold uppercase tracking-wide text-teal-700">{product.category?.name || 'Clothing'}</span>
                    <h3 className="font-bold leading-tight text-zinc-900 text-base min-h-10">{product.name}</h3>
                    <div className="flex items-center justify-between gap-2 mt-auto pt-2">
                      <strong className="text-lg font-bold text-zinc-900">{money.format(Number(product.base_price))}</strong>
                      <button
                        onClick={() => handleBuyNow(product)}
                        disabled={stock === 0}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-800 disabled:opacity-50"
                      >
                        <CreditCard size={14} /> Buy
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════
          3. MARQUEE
      ══════════════════════════════════ */}
      <div className="overflow-hidden border-y border-stone-300 bg-zinc-900 py-3">
        <div className="marquee-track flex whitespace-nowrap text-sm font-semibold text-zinc-400">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="px-8">{item}</span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════
          3. TRUST STRIP
      ══════════════════════════════════ */}
      <motion.section
        className="border-b border-stone-200 bg-white"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
      >
        <div className="mx-auto grid max-w-7xl divide-y divide-stone-200 px-4 lg:grid-cols-3 lg:divide-x lg:divide-y-0 lg:px-8">
          {trustItems.map(([Icon, title, text]) => (
            <motion.div key={title} className="flex items-start gap-4 px-4 py-6" variants={fadeUp}>
              <div className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-teal-50">
                <Icon className="text-teal-700" size={20} />
              </div>
              <div>
                <strong className="block font-bold text-zinc-900">{title}</strong>
                <span className="mt-0.5 block text-sm leading-6 text-stone-500">{text}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ══════════════════════════════════
          4. CATEGORY GRID
      ══════════════════════════════════ */}
      {categories.length > 0 && (
        <section className="border-b border-stone-200 bg-[#f9f7f4] px-4 py-14 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
              <SectionHeading eyebrow="Browse by" title="Category" aside={`${categories.length} collections`} />
            </motion.div>
            <motion.div
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
            >
              {categories.map((cat, i) => (
                <motion.div key={cat.id} variants={fadeUp}>
                  <Link
                    href={`/?category=${cat.slug}`}
                    className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 border-white/10 p-5 pt-16 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${CAT_COLORS[i % CAT_COLORS.length]}`}
                  >
                    {/* top cap highlight */}
                    <span className="absolute left-3 top-3 grid size-10 place-items-center rounded-xl bg-white/10 ring-1 ring-white/10 transition-transform duration-200 group-hover:rotate-3">
                      <ArrowRight size={14} className="text-white" />
                    </span>

                    {/* subtle inner frame */}
                    <span className="pointer-events-none absolute inset-0 border border-white/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

                    <strong className="block text-sm font-black leading-tight tracking-tight text-white">{cat.name}</strong>
                    <span className="mt-2 inline-flex items-center justify-center gap-2 text-xs font-extrabold text-white/80 transition-colors group-hover:text-white">
                      Shop now
                    </span>

                    {/* bottom flourish */}
                    <span className="pointer-events-none absolute bottom-0 left-0 h-1 w-full bg-white/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════
          5. FEATURED / NEW ARRIVALS
      ══════════════════════════════════ */}
      {featuredProducts.length > 0 && (
        <section className="border-b border-stone-200 bg-white px-4 py-14 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
              <SectionHeading eyebrow="Just in" title="New Arrivals" aside="Fresh collection" />
            </motion.div>
            <motion.div
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              {featuredProducts.map((product, i) => {
                const img = imageFor(product) || PRODUCT_FALLBACK;
                const stock = stockFor(product);
                const isFeatured = i === 0;
                return (
                  <motion.article
                    key={product.id}
                    className={`lift-card flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm ${isFeatured ? 'sm:col-span-2 sm:row-span-2' : ''}`}
                    variants={fadeUp}
                  >
                    <div className={`image-zoom overflow-hidden bg-stone-100 ${isFeatured ? 'h-72 sm:h-80' : 'h-52'}`}>
                      <img
                        className="h-full w-full object-cover"
                        src={img}
                        onError={(e) => { e.target.src = PRODUCT_FALLBACK; e.target.onerror = null; }}
                        alt={product.name}
                        loading="lazy"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-5">
                      {isFeatured && (
                        <span className="w-fit rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                          Featured Pick
                        </span>
                      )}
                      <span className="text-xs font-bold uppercase tracking-wide text-teal-700">
                        {product.category?.name || 'Clothing'}
                      </span>
                      <h3 className={`font-bold leading-tight text-zinc-900 ${isFeatured ? 'text-xl' : 'text-base'}`}>
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between gap-2 mt-auto pt-2">
                        <strong className="text-lg font-bold text-zinc-900">
                          {money.format(Number(product.base_price))}
                        </strong>
                        <button
                          onClick={() => handleBuyNow(product)}
                          disabled={stock === 0}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-800 disabled:opacity-50"
                        >
                          <CreditCard size={14} /> Buy
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════
          6. STATS BANNER
      ══════════════════════════════════ */}
      <section className="bg-zinc-900 px-4 py-16 text-white lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="grid grid-cols-2 gap-8 lg:grid-cols-4"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {siteStats.map(({ value, label, sub }) => (
              <motion.div key={label} className="text-center" variants={fadeUp}>
                <strong className="font-display block text-5xl font-black text-white lg:text-6xl">
                  {value}
                </strong>
                <p className="mt-2 font-bold text-teal-300">{label}</p>
                <p className="mt-0.5 text-xs font-medium text-zinc-500">{sub}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════
          7. HOW IT WORKS
      ══════════════════════════════════ */}
      <section className="border-b border-stone-200 bg-[#f9f7f4] px-4 py-14 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
            <SectionHeading eyebrow="Simple process" title="How it works" />
          </motion.div>
          <motion.div
            className="grid gap-6 md:grid-cols-3"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {howItWorks.map(({ step, icon: Icon, title, desc }) => (
              <motion.div key={step} className="relative rounded-2xl border border-stone-200 bg-white p-7 shadow-sm" variants={fadeUp}>
                <span className="font-display absolute right-5 top-5 text-6xl font-black leading-none text-stone-100 select-none">
                  {step}
                </span>
                <div className="mb-5 grid size-12 place-items-center rounded-xl bg-teal-50">
                  <Icon className="text-teal-700" size={22} />
                </div>
                <h3 className="text-xl font-bold text-zinc-900">{title}</h3>
                <p className="mt-2.5 text-sm leading-7 text-stone-500">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════
          8. CATALOG WITH FILTERS
      ══════════════════════════════════ */}
      <section id="catalog" className="mx-auto max-w-7xl px-4 py-14 lg:px-8 lg:py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
          <SectionHeading eyebrow="Catalog" title="Retail collection" aside={`${products.total} products`} />
        </motion.div>

        <div className="grid items-start gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Filter Sidebar */}
          <motion.form
            onSubmit={applyFilters}
            className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm lg:sticky lg:top-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
          >
            <div className="flex items-center gap-2 font-bold text-zinc-900">
              <Filter size={17} /> Filters
            </div>
            <Field label="Search">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                <input className="input pl-10" value={data.search} onChange={(e) => setData('search', e.target.value)} placeholder="Search product" />
              </div>
            </Field>
            <Field label="Category">
              <select className="input" value={data.category} onChange={(e) => setData('category', e.target.value)}>
                <option value="all">All categories</option>
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Min price">
                <input className="input" type="number" min="0" value={data.min_price} onChange={(e) => setData('min_price', e.target.value)} placeholder="₹ 0" />
              </Field>
              <Field label="Max price">
                <input className="input" type="number" min="0" value={data.max_price} onChange={(e) => setData('max_price', e.target.value)} placeholder="₹ max" />
              </Field>
            </div>
            <button className="button-glow inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 text-sm font-bold text-white hover:bg-zinc-800" type="submit">
              Apply filters
            </button>
            {(data.search || data.category !== 'all' || data.min_price || data.max_price) && (
              <button type="button" onClick={() => { setData({ category: 'all', search: '', min_price: '', max_price: '' }); router.get('/', {}, { preserveState: false }); }} className="text-center text-xs font-semibold text-stone-400 hover:text-stone-600">
                Clear all filters
              </button>
            )}
          </motion.form>

          {/* Product Grid */}
          <motion.div
            className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.06 }}
          >
            {products.data.map((product) => {
              const img = imageFor(product) || PRODUCT_FALLBACK;
              const stock = stockFor(product);
              return (
                <motion.article key={product.id} className="lift-card flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm" variants={fadeUp}>
                  <div className="image-zoom h-72 overflow-hidden bg-stone-100">
                    <img
                      className="h-full w-full object-cover"
                      src={img}
                      onError={(e) => { e.target.src = PRODUCT_FALLBACK; e.target.onerror = null; }}
                      alt={product.name}
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <span className="text-xs font-bold uppercase tracking-wide text-teal-700">
                      {product.category?.name || 'Clothing'}
                    </span>
                    <h3 className="min-h-12 text-lg font-bold leading-tight text-zinc-900">{product.name}</h3>
                    {product.description && (
                      <p className="line-clamp-2 text-sm leading-6 text-stone-500">{product.description}</p>
                    )}
                    <div className="flex items-end justify-between gap-2">
                      <strong className="text-xl font-bold text-zinc-900">{money.format(Number(product.base_price))}</strong>
                      <small className="rounded-md bg-orange-50 px-2 py-0.5 text-xs font-bold text-orange-700">
                        Franchise {money.format(Number(product.franchise_price))}
                      </small>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-teal-700">
                      <BadgeCheck size={15} />
                      {stock > 0 ? `${stock} units in stock` : 'Out of stock'}
                    </div>
                    <button
                      onClick={() => handleBuyNow(product)}
                      disabled={stock === 0}
                      className="button-glow mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-bold text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <CreditCard size={16} /> Buy Now
                    </button>
                  </div>
                </motion.article>
              );
            })}
            {products.data.length === 0 && (
              <div className="col-span-full">
                <EmptyState text="No products match your filters." />
              </div>
            )}
          </motion.div>
        </div>

        {/* Pagination */}
        {products.last_page > 1 && (
          <div className="mt-10 flex justify-center gap-2">
            {products.links?.map((link, i) => (
              <button
                key={i}
                disabled={!link.url}
                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                className={`min-h-9 min-w-9 rounded-lg px-3 text-sm font-semibold transition-colors ${
                  link.active ? 'bg-zinc-900 text-white' : link.url ? 'bg-white text-stone-600 hover:bg-stone-100' : 'cursor-not-allowed text-stone-300'
                }`}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════
          9. TESTIMONIALS
      ══════════════════════════════════ */}
      <section className="border-t border-stone-200 bg-stone-100 px-4 py-14 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
            <SectionHeading eyebrow="Reviews" title="What customers say" />
          </motion.div>
          <motion.div
            className="grid gap-6 md:grid-cols-3"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {testimonials.map(({ name, city, role, text, rating, avatar, color }) => (
              <motion.div key={name} className="lift-card flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm" variants={fadeUp}>
                <div className="flex gap-1">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="flex-1 text-sm leading-7 text-stone-600">"{text}"</p>
                <div className="flex items-center gap-3 border-t border-stone-100 pt-4">
                  <div className={`grid size-10 shrink-0 place-items-center rounded-full ${color} text-sm font-black text-white`}>
                    {avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{name}</p>
                    <p className="text-xs font-medium text-stone-400">{role} · {city}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════
          10. WHY CHOOSE US
      ══════════════════════════════════ */}
      <section className="border-t border-stone-200 bg-white px-4 py-14 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 lg:items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
              <motion.p className="mb-2 text-xs font-bold uppercase tracking-widest text-orange-700" variants={fadeUp}>
                Why IHO
              </motion.p>
              <motion.h2 className="font-display text-4xl font-black leading-tight text-zinc-900 sm:text-5xl" variants={fadeUp}>
                Built for quality.<br />Built to scale.
              </motion.h2>
              <motion.p className="mt-5 text-base leading-8 text-stone-500" variants={fadeUp}>
                IHO Clothing is more than just a clothing brand — it's a fully integrated retail and franchise platform with live SKU tracking, smart order routing, and premium garment standards.
              </motion.p>
              <motion.div className="mt-8 grid gap-4" variants={stagger}>
                {[
                  [Shield, 'Premium quality fabric', 'Every piece is tested to meet our quality standards before it reaches you.'],
                  [Package, 'Live inventory tracking', 'Real-time SKU and stock data ensures you always know what\'s available.'],
                  [Store, 'Franchise network', 'Orders are routed to the nearest franchise for fast, local delivery.'],
                ].map(([Icon, title, desc]) => (
                  <motion.div key={title} className="flex gap-4" variants={fadeUp}>
                    <div className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-teal-50">
                      <Icon size={18} className="text-teal-700" />
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900">{title}</p>
                      <p className="mt-0.5 text-sm leading-6 text-stone-500">{desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            <motion.div
              className="grid grid-cols-2 gap-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
            >
              {[
                { icon: CheckCircle2, label: 'ISO-grade stitching', color: 'bg-teal-50 text-teal-700' },
                { icon: Truck, label: 'Same-city delivery', color: 'bg-orange-50 text-orange-700' },
                { icon: BadgeCheck, label: 'Authentic products', color: 'bg-zinc-100 text-zinc-700' },
                { icon: HeartHandshake, label: 'Partner support 24/7', color: 'bg-stone-100 text-stone-700' },
              ].map(({ icon: Icon, label, color }) => (
                <motion.div key={label} className={`flex flex-col items-center gap-3 rounded-2xl border border-stone-200 p-6 text-center ${color.split(' ')[0]}`} variants={fadeUp}>
                  <Icon size={28} className={color.split(' ')[1]} />
                  <p className="text-sm font-semibold text-zinc-800">{label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          11. NEWSLETTER
      ══════════════════════════════════ */}
      <section className="border-t border-teal-800 bg-teal-700 px-4 py-14 text-white lg:px-8 lg:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} variants={stagger}>
            <motion.div className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-white/15" variants={fadeUp}>
              <Mail size={22} />
            </motion.div>
            <motion.h2 className="font-display text-3xl font-black sm:text-4xl" variants={fadeUp}>
              Stay in the loop
            </motion.h2>
            <motion.p className="mt-3 text-base text-teal-100" variants={fadeUp}>
              Get new arrivals, exclusive franchise deals and seasonal drops straight to your inbox.
            </motion.p>
            {newsletterDone ? (
              <motion.div
                className="mt-6 flex items-center justify-center gap-3 rounded-xl bg-white/15 px-6 py-4 text-sm font-semibold"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <CheckCircle2 size={18} /> You're subscribed! Welcome to IHO family.
              </motion.div>
            ) : (
              <motion.form onSubmit={handleNewsletter} className="mt-6 flex gap-3" variants={fadeUp}>
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 rounded-xl border-0 bg-white/15 px-4 py-3 text-sm font-medium text-white placeholder-teal-200 outline-none ring-1 ring-white/20 transition focus:bg-white/20 focus:ring-white/40"
                />
                <button type="submit" className="button-glow inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-teal-700 transition-colors hover:bg-teal-50">
                  Subscribe <ArrowRight size={15} />
                </button>
              </motion.form>
            )}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════
          12. FRANCHISE PLANS
      ══════════════════════════════════ */}
      <section className="border-t border-stone-200 bg-stone-100 px-4 py-14 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
            <SectionHeading eyebrow="Franchise" title="Partner plans" aside={`${plans.length} plans`} />
          </motion.div>
          <motion.div
            className="grid gap-6 lg:grid-cols-3"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.12 }}
          >
            {plans.map((plan) => (
              <motion.article className="lift-card flex flex-col gap-5 rounded-2xl border border-stone-200 bg-white p-7 shadow-sm" key={plan.id} variants={fadeUp}>
                <div className="flex items-start justify-between">
                  <Store className="float-icon text-orange-700" size={26} />
                  <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold capitalize text-orange-700">{plan.type}</span>
                </div>
                <div>
                  <h3 className="font-display text-2xl font-black text-zinc-900">{plan.name}</h3>
                  <strong className="mt-1 block text-3xl font-bold text-teal-700">{money.format(Number(plan.price))}</strong>
                </div>
                <ul className="grid flex-1 gap-2.5">
                  {(plan.features_list || []).map((feature) => (
                    <li className="flex gap-2.5 text-sm text-stone-600" key={feature}>
                      <Check className="mt-0.5 shrink-0 text-teal-600" size={15} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link className="button-glow inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 text-sm font-bold text-white hover:bg-orange-800 transition-colors" href="/franchise-apply">
                  Apply now <ArrowRight size={15} />
                </Link>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════
          CHECKOUT MODAL
      ══════════════════════════════════ */}
      <AnimatePresence>
        {checkoutProduct && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setCheckoutProduct(null)}
          >
            <motion.div
              className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl"
              initial={{ scale: 0.94, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, y: 24, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between border-b border-stone-100 bg-zinc-900 px-6 py-4">
                <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                  <PackageCheck size={20} className="text-teal-400" /> Express Checkout
                </h3>
                <button onClick={() => setCheckoutProduct(null)} className="rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="max-h-[calc(92vh-65px)] overflow-y-auto p-6">
                <div className="mb-5 flex items-center gap-4 rounded-xl bg-stone-50 p-3">
                  <img
                    src={imageFor(checkoutProduct) || PRODUCT_FALLBACK}
                    onError={(e) => { e.target.src = PRODUCT_FALLBACK; e.target.onerror = null; }}
                    alt=""
                    className="h-16 w-16 flex-shrink-0 rounded-xl object-cover bg-stone-200"
                  />
                  <div>
                    <h4 className="font-bold leading-tight text-zinc-900">{checkoutProduct.name}</h4>
                    <p className="mt-0.5 text-lg font-bold text-teal-700">{money.format(Number(checkoutProduct.base_price))}</p>
                  </div>
                </div>
                {/* Coupon Section */}
                <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg flex gap-3">
                  <div className="relative flex-1">
                    <Tag size={18} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Have a coupon code?"
                      className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded uppercase font-bold text-slate-700 outline-none focus:border-blue-500"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={isApplyingCoupon}
                    className="bg-slate-900 text-white px-5 rounded font-bold hover:bg-slate-800 disabled:opacity-50 transition"
                  >
                    Apply
                  </button>
                </div>
                {/* Billing Summary */}
                <div className="mb-4 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-500"><span>Product Price</span> <span>₹{checkoutProduct.base_price}</span></div>
                  {discount > 0 && <div className="flex justify-between text-emerald-500 font-bold"><span>Discount</span> <span>- ₹{discount}</span></div>}
                  <div className="flex justify-between text-xl font-black text-slate-900 pt-2 border-t border-slate-200 mt-2"><span>Payable Amount</span> <span>₹{finalTotal || checkoutProduct.base_price}</span></div>
                </div>
                {/* Global error banner — visible in both steps */}
                {checkoutMessage && (
                  <div className="mb-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                    {checkoutMessage}
                  </div>
                )}

                {/* ── STEP 1: Delivery details form ─────────────────── */}
                {paymentStep === 'form' && (
                <form onSubmit={handleCheckout} noValidate className="grid gap-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label={requiredLabel('Full Name')} error={fieldError('full_name')}>
                      <input
                        className={checkoutInputClass('full_name')}
                        value={orderData.full_name}
                        onChange={(e) => handleCheckoutField('full_name', e.target.value)}
                        placeholder="Rahul Sharma"
                        autoComplete="name"
                      />
                    </Field>
                    <Field label={requiredLabel('Mobile Number')} error={fieldError('mobile_number')}>
                      <input
                        className={checkoutInputClass('mobile_number')}
                        value={orderData.mobile_number}
                        onChange={(e) => handleCheckoutField('mobile_number', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="9876543210"
                        inputMode="numeric"
                        autoComplete="tel"
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label={requiredLabel('Email Address')} error={fieldError('email')}>
                      <input
                        type="email"
                        className={checkoutInputClass('email')}
                        value={orderData.email}
                        onChange={(e) => handleCheckoutField('email', e.target.value)}
                        placeholder="rahul@example.com"
                        autoComplete="email"
                      />
                    </Field>
                    <Field label="Alternate Mobile Number" error={fieldError('alternate_mobile_number')}>
                      <input
                        className={checkoutInputClass('alternate_mobile_number')}
                        value={orderData.alternate_mobile_number}
                        onChange={(e) => handleCheckoutField('alternate_mobile_number', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="Optional"
                        inputMode="numeric"
                        autoComplete="tel"
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label={requiredLabel('House / Flat / Building Number')} error={fieldError('house_flat_building')}>
                      <input
                        className={checkoutInputClass('house_flat_building')}
                        value={orderData.house_flat_building}
                        onChange={(e) => handleCheckoutField('house_flat_building', e.target.value)}
                        placeholder="Flat 204, Tower B"
                        autoComplete="address-line1"
                      />
                    </Field>
                    <Field label={requiredLabel('Street / Area / Locality')} error={fieldError('street_area_locality')}>
                      <input
                        className={checkoutInputClass('street_area_locality')}
                        value={orderData.street_area_locality}
                        onChange={(e) => handleCheckoutField('street_area_locality', e.target.value)}
                        placeholder="Sector 18 Market"
                        autoComplete="address-line2"
                      />
                    </Field>
                  </div>

                  <Field label="Landmark" error={fieldError('landmark')}>
                    <input
                      className={checkoutInputClass('landmark')}
                      value={orderData.landmark}
                      onChange={(e) => handleCheckoutField('landmark', e.target.value)}
                      placeholder="Near metro station"
                    />
                  </Field>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label={requiredLabel('City')} error={fieldError('city')}>
                      <input
                        className={checkoutInputClass('city')}
                        value={orderData.city}
                        onChange={(e) => handleCheckoutField('city', e.target.value)}
                        placeholder="Noida"
                        autoComplete="address-level2"
                      />
                    </Field>
                    <Field label={requiredLabel('State')} error={fieldError('state')}>
                      <select
                        className={checkoutInputClass('state')}
                        value={orderData.state}
                        onChange={(e) => handleCheckoutField('state', e.target.value)}
                        autoComplete="address-level1"
                      >
                        <option value="">Select state</option>
                        {INDIAN_STATES.map((state) => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label={requiredLabel('Pincode')} error={fieldError('pincode') || pincodeApiError}>
                      <div className="relative">
                        <input
                          className={checkoutInputClass('pincode', pincodeRegex.test((orderData.pincode || '').trim()) ? 'border-teal-400 bg-teal-50 font-bold' : 'font-bold')}
                          value={orderData.pincode}
                          onChange={handlePincodeChange}
                          placeholder="201309"
                          inputMode="numeric"
                          autoComplete="postal-code"
                          maxLength={6}
                          disabled={isFetchingPincode}
                        />
                        {isFetchingPincode && (
                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-teal-600">
                            <Loader2 size={16} className="animate-spin" />
                          </span>
                        )}
                      </div>
                    </Field>
                    <Field label={requiredLabel('Country')} error={fieldError('country')}>
                      <input
                        className={checkoutInputClass('country')}
                        value={orderData.country}
                        onChange={(e) => handleCheckoutField('country', e.target.value)}
                        placeholder="India"
                        readOnly
                        autoComplete="country-name"
                      />
                    </Field>
                  </div>
                  <button
                    type="submit"
                    disabled={!checkoutIsValid || orderProcessing}
                    className="button-glow mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-700 text-base font-bold text-white transition-colors hover:bg-orange-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Proceed to Payment <ArrowRight size={17} />
                  </button>
                </form>
                )}

                {/* ── STEP 2: Payment method selection ──────────────── */}
                {paymentStep === 'payment' && (
                  <div className="space-y-4 pt-1">
                    {/* Delivery summary */}
                    <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm">
                      <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-stone-400">Delivering to</p>
                      <p className="font-bold text-zinc-900">
                        {orderData.full_name} <span className="font-normal text-stone-400">·</span> {orderData.mobile_number}
                      </p>
                      <p className="mt-1 leading-5 text-stone-500">
                        {orderData.house_flat_building}, {orderData.street_area_locality}
                        {orderData.landmark ? `, ${orderData.landmark}` : ''}, {orderData.city}, {orderData.state} – {orderData.pincode}
                      </p>
                    </div>

                    <p className="text-center text-xs font-bold uppercase tracking-widest text-stone-400">Choose payment method</p>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {/* Cash on Delivery */}
                      <button
                        type="button"
                        onClick={handleCOD}
                        disabled={orderProcessing}
                        className="group flex flex-col items-center gap-2.5 rounded-xl border-2 border-stone-200 bg-white p-5 text-center transition-all hover:border-teal-500 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Banknote size={30} className="text-teal-600 transition-transform group-hover:scale-110" />
                        <strong className="text-sm font-bold text-zinc-900">Cash on Delivery</strong>
                        <span className="text-xs text-stone-500">Pay ₹{finalTotal || checkoutProduct.base_price} when delivered</span>
                      </button>

                      {/* Online via Razorpay */}
                      <button
                        type="button"
                        onClick={handleRazorpay}
                        disabled={orderProcessing}
                        className="group flex flex-col items-center gap-2.5 rounded-xl border-2 border-stone-200 bg-white p-5 text-center transition-all hover:border-orange-500 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <CreditCard size={30} className="text-orange-600 transition-transform group-hover:scale-110" />
                        <strong className="text-sm font-bold text-zinc-900">Pay Online</strong>
                        <span className="text-xs text-stone-500">UPI · Cards · Net Banking</span>
                        <span className="mt-0.5 text-xs font-bold text-orange-600">₹{finalTotal || checkoutProduct.base_price}</span>
                      </button>
                    </div>

                    {orderProcessing && (
                      <div className="flex items-center justify-center gap-2 text-sm font-semibold text-teal-700">
                        <Loader2 size={15} className="animate-spin" />
                        Processing your order…
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => { setPaymentStep('form'); setCheckoutMessage(''); }}
                      disabled={orderProcessing}
                      className="flex w-full items-center justify-center gap-1.5 text-sm font-semibold text-stone-400 transition-colors hover:text-stone-600 disabled:opacity-40"
                    >
                      <ArrowLeft size={14} /> Edit delivery details
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
