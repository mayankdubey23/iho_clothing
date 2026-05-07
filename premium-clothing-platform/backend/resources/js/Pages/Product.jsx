import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Share2, Ruler, ChevronDown, ChevronUp, Star } from 'lucide-react';

export default function Product({ product }) {
    // Premium placeholder data for design testing
    const displayProduct = product || {
        id: 1,
        name: 'Essential Heavyweight Boxy Tee',
        price: 2499,
        category: 'T-Shirts',
        description: 'Crafted from ultra-heavyweight 280GSM organic cotton. This piece features a dropped shoulder, a cropped hem, and a structured, boxy silhouette. Designed to age beautifully and maintain its shape wash after wash.',
        features: ['280GSM Heavyweight Cotton', 'Boxy, cropped fit', 'Dropped shoulders', 'Pre-shrunk to minimize shrinkage'],
        images: [
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=1200&auto=format&fit=crop'
        ],
        colors: [
            { name: 'Onyx Black', hex: '#1A1A1A' },
            { name: 'Vintage White', hex: '#F9F8F6' },
            { name: 'Deep Burgundy', hex: '#4A001F' }
        ],
        sizes: ['S', 'M', 'L', 'XL', 'XXL']
    };

    const [selectedColor, setSelectedColor] = useState(displayProduct.colors[0].name);
    const [selectedSize, setSelectedSize] = useState('L');
    const [openAccordion, setOpenAccordion] = useState('details');

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const fadeUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <AppLayout>
            <Head title={`${displayProduct.name} | IHO Clothing`} />

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
                
                {/* Breadcrumbs */}
                <nav className="mb-8 text-xs font-bold uppercase tracking-widest text-[#A39E93]">
                    <Link href="/" className="hover:text-[#1A1A1A] transition-colors">Home</Link>
                    <span className="mx-3">/</span>
                    <Link href={`/category/${displayProduct.category.toLowerCase()}`} className="hover:text-[#1A1A1A] transition-colors">{displayProduct.category}</Link>
                    <span className="mx-3">/</span>
                    <span className="text-[#1A1A1A]">{displayProduct.name}</span>
                </nav>

                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 relative">
                    
                    {/* LEFT SIDE: Image Gallery (Scrollable) */}
                    <motion.div 
                        variants={staggerContainer} initial="hidden" animate="visible"
                        className="w-full lg:w-3/5 flex flex-col gap-4"
                    >
                        {displayProduct.images.map((img, index) => (
                            <motion.div key={index} variants={fadeUp} className="w-full bg-[#F3F0EA] aspect-[4/5] rounded-sm overflow-hidden">
                                <img src={img} alt={`${displayProduct.name} view ${index + 1}`} className="w-full h-full object-cover" />
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* RIGHT SIDE: Sticky Product Info */}
                    <div className="w-full lg:w-2/5 relative">
                        <motion.div 
                            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
                            className="sticky top-32 flex flex-col gap-8 pb-12"
                        >
                            {/* Header & Price */}
                            <div>
                                <div className="flex justify-between items-start gap-4">
                                    <h1 className="text-3xl md:text-4xl font-black text-[#1A1A1A] tracking-tight leading-none uppercase">
                                        {displayProduct.name}
                                    </h1>
                                    <button className="text-[#A39E93] hover:text-[#4A001F] transition-colors mt-1">
                                        <Share2 size={22} />
                                    </button>
                                </div>
                                <p className="text-xl font-bold text-[#1A1A1A] mt-4">₹{displayProduct.price.toLocaleString('en-IN')}</p>
                                
                                {/* Reviews mockup */}
                                <div className="flex items-center gap-2 mt-4 text-[#7A756B]">
                                    <div className="flex text-[#1A1A1A]">
                                        {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#1A1A1A" />)}
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest border-b border-[#E8E4D9]">124 Reviews</span>
                                </div>
                            </div>

                            {/* Color Selector */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]">Color: {selectedColor}</span>
                                </div>
                                <div className="flex gap-3">
                                    {displayProduct.colors.map((color) => (
                                        <button 
                                            key={color.name}
                                            onClick={() => setSelectedColor(color.name)}
                                            className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor === color.name ? 'border-[#1A1A1A] scale-110' : 'border-transparent hover:border-[#E8E4D9]'}`}
                                            style={{ backgroundColor: color.hex, outline: selectedColor === color.name && color.hex === '#F9F8F6' ? '1px solid #E8E4D9' : 'none' }}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Size Selector */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]">Size: {selectedSize}</span>
                                    <button className="text-xs font-bold uppercase tracking-widest text-[#7A756B] flex items-center gap-1 hover:text-[#1A1A1A] transition-colors">
                                        <Ruler size={14} /> Size Guide
                                    </button>
                                </div>
                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                                    {displayProduct.sizes.map((size) => (
                                        <button 
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`py-3.5 text-sm font-bold transition-all rounded-sm border ${
                                                selectedSize === size 
                                                    ? 'bg-[#1A1A1A] text-[#F9F8F6] border-[#1A1A1A]' 
                                                    : 'bg-transparent text-[#1A1A1A] border-[#E8E4D9] hover:border-[#1A1A1A]'
                                            }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-4">
                                <button className="flex-1 bg-[#1A1A1A] text-[#F9F8F6] py-4 md:py-5 text-sm font-bold uppercase tracking-widest hover:bg-[#4A001F] transition-all flex items-center justify-center gap-2 rounded-sm shadow-xl hover:shadow-2xl hover:-translate-y-0.5">
                                    <ShoppingBag size={18} strokeWidth={2} /> Add to Bag
                                </button>
                                <button className="w-14 md:w-16 bg-[#F3F0EA] text-[#1A1A1A] flex items-center justify-center border border-[#E8E4D9] hover:bg-[#E8E4D9] hover:text-[#4A001F] transition-all rounded-sm">
                                    <Heart size={20} strokeWidth={1.5} />
                                </button>
                            </div>

                            {/* Free Shipping Notice */}
                            <div className="bg-[#F3F0EA] p-4 text-xs font-bold uppercase tracking-widest text-[#7A756B] text-center border border-[#E8E4D9] rounded-sm">
                                Free premium shipping on this item.
                            </div>

                            {/* Product Info Accordion */}
                            <div className="border-t border-[#E8E4D9] mt-4">
                                
                                {/* Details Tab */}
                                <div className="border-b border-[#E8E4D9]">
                                    <button 
                                        onClick={() => setOpenAccordion(openAccordion === 'details' ? '' : 'details')}
                                        className="w-full py-5 flex justify-between items-center text-sm font-bold uppercase tracking-widest text-[#1A1A1A] hover:text-[#4A001F]"
                                    >
                                        Details & Fit {openAccordion === 'details' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </button>
                                    <AnimatePresence>
                                        {openAccordion === 'details' && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="pb-6 text-[#7A756B] text-sm leading-relaxed">
                                                    <p className="mb-4">{displayProduct.description}</p>
                                                    <ul className="list-disc pl-5 space-y-1">
                                                        {displayProduct.features.map((feat, i) => <li key={i}>{feat}</li>)}
                                                    </ul>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Shipping Tab */}
                                <div className="border-b border-[#E8E4D9]">
                                    <button 
                                        onClick={() => setOpenAccordion(openAccordion === 'shipping' ? '' : 'shipping')}
                                        className="w-full py-5 flex justify-between items-center text-sm font-bold uppercase tracking-widest text-[#1A1A1A] hover:text-[#4A001F]"
                                    >
                                        Shipping & Returns {openAccordion === 'shipping' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </button>
                                    <AnimatePresence>
                                        {openAccordion === 'shipping' && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="pb-6 text-[#7A756B] text-sm leading-relaxed">
                                                    <p className="mb-2"><strong className="text-[#1A1A1A]">Standard Shipping:</strong> 3-5 Business Days</p>
                                                    <p className="mb-2"><strong className="text-[#1A1A1A]">Express Shipping:</strong> 1-2 Business Days</p>
                                                    <p>We accept returns within 14 days of delivery. Items must be unworn with original tags attached.</p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                        </motion.div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}