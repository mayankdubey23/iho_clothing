import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ShoppingBag, Heart, ChevronRight, Ruler, Star, Truck, Zap, Activity, Wind, MapPin, ShieldCheck, MessageSquareText } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';


// 📸 Smart Image Helper
const getImageUrl = (path) => {
    if (!path) return '/placeholder.jpg';
    if (path.startsWith('http') || path.startsWith('/storage')) return path;
    return `/storage/${path}`;
};

export default function ProductDetail({
    product,
    availableSizes = [],
    availableColors = [],
    relatedProducts = [],
    reviewCount = 0,
    avgRating = 0,
    ratingBreakdown = {},
    reviewInsights = [],
    canReview = false,
    reviewEligibilityMessage = '',
}) {
    const initialMedia = product?.images?.length > 0
        ? product.images[0]
        : { image_path: '/placeholder.jpg', media_type: 'image' };

    // Basic States
    const [mainMedia, setMainMedia] = useState(initialMedia);
    const [isZoomed, setIsZoomed] = useState(false);

    // Selection States
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [error, setError] = useState('');

    // Delivery Check States
    const [pincode, setPincode] = useState('');
    const [deliveryMsg, setDeliveryMsg] = useState(null);
    const [isCheckingPin, setIsCheckingPin] = useState(false); // 👈 NAYA STATE

    const [showReviewForm, setShowReviewForm] = useState(false);

    // Inertia Form for Review
    const {
        data: reviewData,
        setData: setReviewData,
        post: postReview,
        processing: reviewProcessing,
        reset: resetReview,
        errors: reviewErrors,
    } = useForm({
        customer_name: '',
        rating: 5,
        comment: '',
    });

    // Derived Logic
    const currentPrice = product?.d2c_price || product?.base_price || 0;
    const mrp = product?.mrp || 0;
    const discountPercent = mrp > currentPrice ? Math.round(((mrp - currentPrice) / mrp) * 100) : 0;
    const ratingValue = Number(avgRating) || 0;
    const ratingRows = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: Number(ratingBreakdown?.[star] || ratingBreakdown?.[String(star)] || 0),
    }));
    const maxRatingCount = Math.max(...ratingRows.map((row) => row.count), 1);
    const verifiedBuyerText = `${reviewCount.toLocaleString('en-IN')} Verified ${reviewCount === 1 ? 'Buyer' : 'Buyers'}`;
    const insightRows = reviewInsights.length > 0
        ? reviewInsights
        : [
            { label: 'Fit', value: 'Just Right', percent: 77 },
            { label: 'Length', value: 'Just Right', percent: 82 },
        ];

    const mainMediaUrl = getImageUrl(mainMedia?.image_path);
    const isMainVideo = (mainMedia?.media_type || 'image') === 'video';

    // Exact SKU checking for Out of Stock logic
    const selectedSku = product?.skus?.find(sku => sku.size === selectedSize && sku.color === selectedColor);
    const isSelectionMade = selectedSize && selectedColor;
    const isOutOfStock = isSelectionMade && (!selectedSku || selectedSku.qty <= 0);

    // 🚚 REAL PINCODE VALIDATION LOGIC
    const handlePincodeCheck = async () => {
        // 1. Basic Validation
        if (pincode.length !== 6 || isNaN(pincode)) {
            setDeliveryMsg({ type: 'error', text: 'Please enter a valid 6-digit numeric pincode.' });
            return;
        }

        setIsCheckingPin(true);
        setDeliveryMsg(null);

        try {
            // 2. Call India Post Free Open API
            const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
            const data = await response.json();

            // 3. Process API Response
            if (data && data[0].Status === 'Success') {
                const locationDetails = data[0].PostOffice[0];
                const district = locationDetails.District;
                const state = locationDetails.State;

                // Create a dynamic delivery date (e.g., Today + 4 days)
                const deliveryDate = new Date();
                deliveryDate.setDate(deliveryDate.getDate() + 4);
                const formattedDate = deliveryDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

                setDeliveryMsg({
                    type: 'success',
                    text: `Delivery available to ${district}, ${state} by ${formattedDate}. COD Available.`
                });
            } else {
                setDeliveryMsg({ type: 'error', text: 'Oops! Service not available for this Pincode or invalid entry.' });
            }
        } catch (error) {
            setDeliveryMsg({ type: 'error', text: 'Network issue while checking pincode. Please try again.' });
        } finally {
            setIsCheckingPin(false);
        }
    };

    const addToCart = (isBuyNow = false) => {
        if (!selectedSize || !selectedColor) {
            setError('Please select required size and color.');
            return;
        }
        if (isOutOfStock) return;

        setError('');
        router.post('/cart', { sku_id: selectedSku.id, quantity: 1 }, {
            preserveScroll: true,
            onSuccess: () => {
                if (isBuyNow) router.visit('/checkout');
                else alert('Added to Bag successfully! 🛍️');
            }
        });
    };

    const submitReview = (e) => {
        e.preventDefault();

        postReview(`/product/${product.id}/review`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowReviewForm(false);
                resetReview();
                alert('Review submitted successfully!');
            },
        });
    };

    if (!product) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest text-xs">Loading Premium Experience...</div>;

    return (
        <AppLayout>
            <div className="min-h-screen bg-white animate-fade-in-up pb-20">
                <Head title={`${product.name} | IHO Studio`} />

                {/* Breadcrumbs */}
                <div className="w-full border-b border-slate-100 bg-white/90 backdrop-blur-md sticky top-0 z-40">
                    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4">
                        <nav className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 overflow-x-auto whitespace-nowrap no-scrollbar">
                            <Link href="/" className="hover:text-black transition-colors shrink-0">Home</Link>
                            <ChevronRight size={10} className="shrink-0" />
                            <Link href={`/shop?category=${product.category?.slug}`} className="hover:text-black transition-colors shrink-0">{product.category?.name || 'Shop'}</Link>
                            <ChevronRight size={10} className="shrink-0" />
                            <span className="text-black truncate">{product.name}</span>
                        </nav>
                    </div>
                </div>

                <main className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">

                    {/* 📸 LEFT: Visual Asset Gallery */}
                    <div className="lg:col-span-7 flex flex-col gap-3 lg:gap-4 lg:sticky lg:top-24 h-fit">
                        {/* Main Stage Media with Zoom on Hover */}
                        <div
                            className={`w-full aspect-[4/5] bg-slate-50 relative overflow-hidden group ${isMainVideo ? '' : 'cursor-crosshair'}`}
                            onMouseEnter={() => setIsZoomed(true)}
                            onMouseLeave={() => setIsZoomed(false)}
                        >
                            {isMainVideo ? (
                                <video
                                    src={mainMediaUrl}
                                    className="w-full h-full object-cover"
                                    controls
                                    muted
                                    playsInline
                                />
                            ) : (
                                <img
                                    src={mainMediaUrl}
                                    alt={product.name}
                                    className={`w-full h-full object-cover transition-transform duration-500 ease-out ${isZoomed ? 'scale-150' : 'scale-100'}`}
                                />
                            )}
                            {/* Product Tags */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                {product.is_best_seller && <span className="bg-[#282c3f] text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 shadow-lg">Best Seller</span>}
                                {product.is_featured && <span className="bg-[#ff3f6c] text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 shadow-lg">New Arrival</span>}
                            </div>
                        </div>

                        {/* Horizontal Thumbnails */}
                        <div className="flex gap-2 lg:gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar py-2">
                            {product.images?.map((img) => (
                                <button
                                    key={img.id}
                                    onClick={() => setMainMedia(img)}
                                    className={`relative shrink-0 w-20 md:w-24 aspect-[3/4] snap-start overflow-hidden bg-slate-50 transition-all duration-300 ${mainMedia?.id === img.id ? 'ring-2 ring-black ring-offset-2' : 'opacity-70 hover:opacity-100 hover:scale-[1.02]'}`}
                                >
                                    {(img.media_type || 'image') === 'video' ? (
                                        <>
                                            <video src={getImageUrl(img.image_path)} className="w-full h-full object-cover" muted />
                                            <span className="absolute inset-x-0 bottom-0 bg-black/70 py-1 text-[8px] font-black uppercase tracking-widest text-white">Video</span>
                                        </>
                                    ) : (
                                        <img src={getImageUrl(img.image_path)} alt="Thumbnail" className="w-full h-full object-cover" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 📝 RIGHT: Product Details & Logic */}
                    <div className="lg:col-span-5 flex flex-col py-2">

                        {/* Brand & Reviews Summary */}
                        <div className="flex justify-between items-start mb-2">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{product.brand?.name || 'IHO STUDIO'}</h2>
                            <div className="flex items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity" onClick={() => document.getElementById('reviews-section').scrollIntoView({ behavior: 'smooth' })}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Star key={star} size={12} fill={ratingValue >= star ? "#F59E0B" : "transparent"} color={ratingValue >= star ? "#F59E0B" : "#ffe1e8"} />
                                ))}
                                <span className="text-[10px] font-bold text-slate-400 ml-1 underline decoration-dotted">({reviewCount} Reviews)</span>
                            </div>
                        </div>

                        <h1 className="text-2xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter italic text-[#282c3f] mb-6 leading-none">
                            {product.name}
                        </h1>

                        {/* Price Section */}
                        <div className="flex flex-col gap-1 mb-8 p-4 bg-slate-50 border border-slate-100">
                            <div className="flex items-end gap-3">
                                <span className="text-2xl md:text-3xl font-black text-black">₹{currentPrice}</span>
                                {discountPercent > 0 && (
                                    <>
                                        <span className="text-sm md:text-base font-bold text-slate-400 line-through mb-1">MRP ₹{mrp}</span>
                                        <span className="text-[10px] md:text-xs font-black text-[#ff3f6c] uppercase tracking-widest mb-1.5 px-2 py-0.5 border border-[#ff3f6c]">{discountPercent}% OFF</span>
                                    </>
                                )}
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Inclusive of all taxes</span>
                        </div>

                        {/* Sportswear Tech Badges */}
                        <div className="grid grid-cols-3 gap-2 mb-8 border-y border-slate-100 py-4">
                            <div className="flex flex-col items-center gap-2 text-center"><Wind size={16} className="text-slate-400" /><span className="text-[8px] font-black uppercase tracking-widest text-slate-600">Breathable</span></div>
                            <div className="flex flex-col items-center gap-2 text-center"><Zap size={16} className="text-slate-400" /><span className="text-[8px] font-black uppercase tracking-widest text-slate-600">Quick Dry</span></div>
                            <div className="flex flex-col items-center gap-2 text-center"><Activity size={16} className="text-slate-400" /><span className="text-[8px] font-black uppercase tracking-widest text-slate-600">4-Way Stretch</span></div>
                        </div>

                        {/* Color Selector */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#282c3f]">Select Color *</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{selectedColor || 'None'}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 md:gap-3">
                                {availableColors.map((color) => (
                                    <button key={color} onClick={() => { setSelectedColor(color); setError(''); }} className={`px-5 py-3 border text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${selectedColor === color ? 'border-black bg-black text-white shadow-lg' : 'border-slate-200 text-slate-600 hover:border-black'}`}>{color}</button>
                                ))}
                            </div>
                        </div>

                        {/* Size Selector */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#282c3f]">Select Size *</span>
                                <button className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-colors underline decoration-dotted"><Ruler size={12} /> Size Guide</button>
                            </div>
                            <div className="flex flex-wrap gap-2 md:gap-3">
                                {availableSizes.map((size) => (
                                    <button key={size} onClick={() => { setSelectedSize(size); setError(''); }} className={`min-w-[3.5rem] h-12 border flex items-center justify-center text-xs font-black uppercase transition-all active:scale-95 ${selectedSize === size ? 'border-black bg-black text-white shadow-lg' : 'border-slate-200 text-slate-600 hover:border-black'}`}>{size}</button>
                                ))}
                            </div>
                        </div>

                        {/* Error & Out of Stock Messaging */}
                        {error && <div className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-4 bg-red-50 p-4 border border-red-100">{error}</div>}
                        {isOutOfStock && <div className="text-[#ff3f6c] text-[10px] font-black uppercase tracking-widest mb-4 bg-red-50/50 p-4 border border-red-100 flex items-center gap-2"><Star size={14} /> Currently Out of Stock for this variant.</div>}

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 mt-auto sticky bottom-4 z-40 bg-white/95 backdrop-blur-sm p-2 -mx-2 md:static md:bg-transparent md:p-0 md:mx-0 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] md:shadow-none border-t md:border-none border-slate-100">
                            <div className="flex gap-3">
                                <button onClick={() => addToCart(false)} disabled={isOutOfStock} className={`flex-1 flex items-center justify-center gap-3 py-4 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] ${isOutOfStock ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white border border-[#282c3f] text-[#282c3f] hover:bg-slate-50'}`}>
                                    <ShoppingBag size={16} /> Add to Bag
                                </button>
                                <button className="w-14 md:w-16 flex items-center justify-center border border-slate-200 hover:border-black text-slate-400 hover:text-black transition-all active:scale-[0.98] bg-white"><Heart size={20} /></button>
                            </div>
                            {!isOutOfStock ? (
                                <button onClick={() => addToCart(true)} className="w-full bg-[#282c3f] text-white py-4 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#ff3f6c] hover:shadow-xl hover:shadow-[#ff3f6c]/20 transition-all active:scale-[0.98]">
                                    Buy It Now
                                </button>
                            ) : (
                                <button className="w-full bg-transparent border border-dashed border-[#ff3f6c] text-[#ff3f6c] py-4 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-50 transition-all active:scale-[0.98]">
                                    Notify Me When Available
                                </button>
                            )}
                        </div>

                        {/* Delivery Section (API Connected) */}
                        <div className="mt-10 p-5 bg-slate-50 border border-slate-100">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#282c3f] mb-4 flex items-center gap-2">
                                <Truck size={14} /> Check Delivery & ETA
                            </h3>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={pincode}
                                        onChange={e => setPincode(e.target.value.replace(/\D/g, ''))} // Sirf numbers allow karega
                                        placeholder="Enter 6-digit Pincode"
                                        className="w-full pl-9 pr-4 py-3 text-xs font-bold border border-slate-200 focus:outline-none focus:border-black transition-colors"
                                        onKeyDown={e => e.key === 'Enter' && handlePincodeCheck()} // Enter dabane par check karega
                                    />
                                </div>
                                <button
                                    onClick={handlePincodeCheck}
                                    disabled={isCheckingPin || pincode.length !== 6}
                                    className="px-6 min-w-[100px] flex items-center justify-center bg-[#282c3f] text-white text-[9px] font-black uppercase tracking-widest hover:bg-[#ff3f6c] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isCheckingPin ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        </span>
                                    ) : 'Check'}
                                </button>
                            </div>

                            {/* Dynamic Success/Error Message */}
                            {deliveryMsg && (
                                <div className={`mt-4 p-3 border text-[10px] font-bold tracking-wide animate-[slideDown_0.3s_ease-out] flex gap-2 items-start
                                ${deliveryMsg.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-600'}`}
                                >
                                    {deliveryMsg.type === 'success' ? <ShieldCheck size={14} className="shrink-0 mt-0.5" /> : <Star size={14} className="shrink-0 mt-0.5 text-red-500" />}
                                    <span>{deliveryMsg.text}</span>
                                </div>
                            )}
                        </div>


                        {/* Information Accordions */}
                        <div className="mt-8 space-y-1 border-t border-slate-100 pt-4">
                            <details id="product-details" className="group cursor-pointer overflow-hidden scroll-mt-24" open>
                                <summary className="py-4 text-[10px] font-black uppercase tracking-widest text-[#282c3f] list-none flex justify-between items-center select-none">
                                    Description <ChevronRight size={14} className="group-open:rotate-90 transition-transform" />
                                </summary>
                                <div className="text-xs text-slate-500 pb-6 leading-relaxed font-medium space-y-4">
                                    <p>Engineered for high-intensity training and urban lifestyle. The {product.name} features our signature lightweight fabric architecture.</p>
                                    <ul className="list-disc pl-4 space-y-1">
                                        <li>Athletic Fit for unrestricted movement</li>
                                        <li>Moisture-wicking technology</li>
                                        <li>Reflective details for night visibility</li>
                                    </ul>
                                </div>
                            </details>
                            <details className="group border-t border-slate-100 cursor-pointer overflow-hidden">
                                <summary className="py-4 text-[10px] font-black uppercase tracking-widest text-[#282c3f] list-none flex justify-between items-center select-none">
                                    Shipping & Returns <ChevronRight size={14} className="group-open:rotate-90 transition-transform" />
                                </summary>
                                <p className="text-xs text-slate-500 pb-6 leading-relaxed font-medium">Free premium shipping on orders over ₹3000. Hassle-free 7-day returns for unworn items with original tags attached.</p>
                            </details>
                        </div>
                    </div>
                </main>

                <section className="max-w-[1400px] mx-auto px-4 md:px-6 pb-8">
                    <div className="grid grid-cols-3 border-y border-slate-100 text-center">
                        {[
                            ['Product Details', '#product-details'],
                            ['Ratings & Reviews', '#reviews-section'],
                            ['Similar Products', '#similar-products'],
                        ].map(([label, href]) => (
                            <a
                                key={label}
                                href={href}
                                className="px-2 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 transition-colors hover:bg-slate-50 hover:text-[#282c3f] md:text-[10px]"
                            >
                                {label}
                            </a>
                        ))}
                    </div>
                </section>

                {/* ⭐ Reviews Section */}
                <section id="reviews-section" className="max-w-[1000px] mx-auto px-4 md:px-6 py-16 border-t border-slate-100">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                        <div>
                            <h2 className="flex items-center gap-2 text-2xl font-black uppercase tracking-tighter text-[#282c3f] mb-2">
                                Ratings <Star size={22} className="text-[#282c3f]" />
                            </h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Verified purchase feedback</p>
                        </div>
                        <div className="flex flex-col items-start gap-2 md:items-end">
                            {canReview ? (
                                <button
                                    onClick={() => setShowReviewForm(!showReviewForm)}
                                    className="px-8 py-4 bg-white border-2 border-[#282c3f] text-[#282c3f] text-[10px] font-black uppercase tracking-widest hover:bg-[#282c3f] hover:text-white transition-colors"
                                >
                                    {showReviewForm ? 'Cancel Review' : 'Write a Review'}
                                </button>
                            ) : (
                                <Link
                                    href="/login"
                                    className="px-8 py-4 bg-slate-100 border-2 border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:border-[#282c3f] hover:text-[#282c3f] transition-colors"
                                >
                                    Write a Review
                                </Link>
                            )}
                            <span className={`max-w-xs text-[9px] font-black uppercase tracking-widest ${canReview ? 'text-green-600' : 'text-slate-400'} md:text-right`}>
                                {reviewEligibilityMessage}
                            </span>
                        </div>
                    </div>

                    <div className="mb-12 grid gap-8 border-y border-slate-200 py-8 md:grid-cols-[0.9fr_1.4fr] md:items-center">
                        <div className="flex items-end gap-3 md:border-r md:border-slate-200 md:pr-8">
                            <span className="text-6xl font-medium leading-none tracking-tight text-[#282c3f]">{ratingValue.toFixed(1)}</span>
                            <div className="pb-2">
                                <Star size={34} className="fill-teal-600 text-teal-600" />
                                <p className="mt-4 text-xl font-medium text-[#282c3f]">{verifiedBuyerText}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {ratingRows.map((row) => {
                                const width = `${Math.max((row.count / maxRatingCount) * 100, row.count > 0 ? 5 : 0)}%`;
                                const barColor = row.star >= 4 ? 'bg-teal-600' : row.star === 3 ? 'bg-slate-300' : row.star === 2 ? 'bg-amber-400' : 'bg-red-400';

                                return (
                                    <div key={row.star} className="grid grid-cols-[30px_1fr_48px] items-center gap-2 text-sm font-medium text-[#282c3f]">
                                        <span className="flex items-center gap-0.5 text-slate-400">{row.star} <Star size={11} className="fill-slate-300 text-slate-300" /></span>
                                        <div className="h-1.5 overflow-hidden bg-slate-100">
                                            <div className={`h-full ${barColor}`} style={{ width }} />
                                        </div>
                                        <span className="text-right">{row.count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mb-12 border-b border-slate-200 pb-8">
                        <h3 className="mb-5 flex items-center gap-2 text-2xl font-black uppercase tracking-tighter text-[#282c3f]">
                            What Customers Said <Star size={22} className="text-[#282c3f]" />
                        </h3>
                        <div className="grid gap-5 sm:grid-cols-2">
                            {insightRows.map((item) => (
                                <div key={item.label}>
                                    <p className="mb-2 text-lg font-medium text-[#282c3f]">{item.label}</p>
                                    <div className="flex items-center gap-5">
                                        <div className="h-1.5 w-full max-w-[210px] overflow-hidden bg-slate-100">
                                            <div className="h-full bg-teal-600" style={{ width: `${item.percent}%` }} />
                                        </div>
                                        <span className="whitespace-nowrap text-sm font-black text-[#282c3f]">
                                            {item.value} ({item.percent}%)
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button type="button" className="mt-6 text-sm font-black text-[#ff3f6c] transition-colors hover:text-[#282c3f]">
                            View Details
                        </button>
                    </div>
                    {reviewErrors.review && (
                        <div className="mb-8 border border-red-100 bg-red-50 p-4 text-[10px] font-black uppercase tracking-widest text-red-500">
                            {reviewErrors.review}
                        </div>
                    )}

                    {/* THE REAL REVIEW FORM */}
                    {showReviewForm && canReview && (
                        <div className="mb-12 bg-slate-50 p-6 md:p-8 border border-slate-200 animate-[slideDown_0.3s_ease-out]">
                            <h3 className="text-xs font-black uppercase tracking-widest mb-6">Share your experience</h3>
                            <form onSubmit={submitReview} className="space-y-6">
                                {/* Interactive Star Rating */}
                                <div>
                                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Your Rating *</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setReviewData('rating', star)}
                                                className="hover:scale-110 transition-transform"
                                            >
                                                <Star size={24} fill={reviewData.rating >= star ? '#F59E0B' : 'transparent'} color={reviewData.rating >= star ? '#F59E0B' : '#ffe1e8'} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Your Name *</label>
                                        <input
                                            type="text"
                                            value={reviewData.customer_name}
                                            onChange={e => setReviewData('customer_name', e.target.value)}
                                            className="w-full bg-white border border-slate-200 p-4 text-xs font-bold focus:border-black focus:outline-none"
                                            placeholder="Enter your name"
                                            required
                                        />
                                        {reviewErrors.customer_name && <span className="text-red-500 text-[9px] uppercase mt-1 block">{reviewErrors.customer_name}</span>}
                                    </div>

                                    <div>
                                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Your Review *</label>
                                        <textarea
                                            value={reviewData.comment}
                                            onChange={e => setReviewData('comment', e.target.value)}
                                            className="w-full bg-white border border-slate-200 p-4 text-xs font-medium focus:border-black focus:outline-none min-h-[120px]"
                                            placeholder="How was the fit, fabric, and overall experience?"
                                            required
                                        ></textarea>
                                        {reviewErrors.comment && <span className="text-red-500 text-[9px] uppercase mt-1 block">{reviewErrors.comment}</span>}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={reviewProcessing}
                                    className="px-8 py-4 bg-[#282c3f] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#ff3f6c] transition-colors disabled:opacity-50"
                                >
                                    {reviewProcessing ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Product Reviews Display Area */}
                    <div className="space-y-6">
                        {product.reviews && product.reviews.length > 0 ? (
                            product.reviews.map((review) => (
                                <div key={review.id} className="p-6 bg-slate-50 border border-slate-100 transition-all hover:border-slate-300">
                                    <div className="flex justify-between mb-4">
                                        <div>
                                            <div className="flex gap-1 mb-2">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <Star key={star} size={12} fill={review.rating >= star ? "#F59E0B" : "transparent"} color={review.rating >= star ? "#F59E0B" : "#ffe1e8"} />
                                                ))}
                                            </div>
                                            <h4 className="text-[11px] font-black uppercase tracking-widest text-black flex items-center gap-2">
                                                {review.customer_name}
                                                <ShieldCheck size={12} className="text-green-500" title="Verified" />
                                            </h4>
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-400">
                                            {new Date(review.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                        &quot;{review.comment}&quot;
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="p-10 bg-slate-50 border border-dashed border-slate-200 text-center flex flex-col items-center justify-center">
                                <MessageSquareText size={32} className="text-slate-300 mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No reviews yet. Verified buyers can share their experience after purchase.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 🛍️ Related Products Section */}
                {relatedProducts && relatedProducts.length > 0 && (
                    <section id="similar-products" className="max-w-[1400px] mx-auto px-4 md:px-6 py-16 border-t border-slate-100 scroll-mt-24">
                        <div className="flex justify-between items-end mb-8 md:mb-10">
                            <h2 className="text-2xl font-black uppercase tracking-tighter italic text-[#282c3f]">You May Also Like</h2>
                            <Link href={`/shop?category=${product.category?.slug}`} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black underline decoration-dotted transition-colors">View All</Link>
                        </div>
                        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 md:grid md:grid-cols-4 no-scrollbar pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
                            {relatedProducts.map((related) => {
                                const primaryImageMedia = related.images?.find((media) => (media.media_type || 'image') === 'image') || related.images?.[0];
                                const primaryImage = primaryImageMedia ? getImageUrl(primaryImageMedia.image_path) : '/placeholder.jpg';
                                const relatedPrice = related.d2c_price || related.base_price;

                                return (
                                    <Link
                                        key={related.id}
                                        href={`/product/${related.slug}`}
                                        className="w-[70vw] shrink-0 md:w-auto snap-start group flex flex-col cursor-pointer"
                                    >
                                        <div className="relative aspect-[3/4] overflow-hidden bg-slate-50 mb-4">
                                            <img
                                                src={primaryImage}
                                                alt={related.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            {related.is_featured && (
                                                <div className="absolute top-3 left-3 bg-[#ff3f6c] text-white text-[8px] font-black uppercase tracking-widest px-2 py-1">
                                                    Trending
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-[#282c3f] mb-1 truncate">
                                                {related.name}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-black text-black">
                                                    ₹{relatedPrice}
                                                </span>
                                                {related.mrp > relatedPrice && (
                                                    <span className="text-[10px] font-bold text-slate-400 line-through">
                                                        ₹{related.mrp}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}

                <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fadeIn 0.6s ease-out; }` }} />
            </div>
        </AppLayout>
    );
}
