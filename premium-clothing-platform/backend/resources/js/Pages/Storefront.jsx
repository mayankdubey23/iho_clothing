import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, RefreshCcw, Shield, Zap, Flame, Award } from 'lucide-react';
import { FaInstagram } from 'react-icons/fa';
import HeroSection from '@/Components/HeroSection';
import PremiumProductCard from '@/Components/PremiumProductCard';

export default function Storefront({ categories, products }) {
    
    const dummyProducts = [
        { id: 'd1', name: 'Pro Performance Tee', base_price: '2,499', category_name: 'Training', image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=800&auto=format&fit=crop' },
        { id: 'd2', name: 'Elite Training Shorts', base_price: '1,999', category_name: 'Bottoms', image: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?q=80&w=800&auto=format&fit=crop' },
        { id: 'd3', name: 'Compression Base Layer', base_price: '2,799', category_name: 'Training', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop' },
        { id: 'd4', name: 'Windbreaker Jacket', base_price: '4,299', category_name: 'Outerwear', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop' },
        { id: 'd5', name: 'Ultra Light Running Shoes', base_price: '6,999', category_name: 'Footwear', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop' },
        { id: 'd6', name: 'Performance Hoodie', base_price: '3,799', category_name: 'Hoodies', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop' },
        { id: 'd7', name: 'Sports Duffle Bag', base_price: '3,499', category_name: 'Accessories', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop' },
        { id: 'd8', name: 'Training Gloves', base_price: '1,299', category_name: 'Accessories', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=800&auto=format&fit=crop' }
    ];

    const productList = Array.isArray(products) ? products : products?.data;
    const displayProducts = productList && productList.length > 0 ? productList : dummyProducts;

    const featuredCategories = [
        { id: 1, name: 'New Arrivals', slug: 'new', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop', description: 'Latest performance gear' },
        { id: 2, name: 'Training', slug: 'training', image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=800&auto=format&fit=crop', description: 'Elevate your workout' },
        { id: 3, name: 'Running', slug: 'running', image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=800&auto=format&fit=crop', description: 'Built for speed' },
        { id: 4, name: 'Lifestyle', slug: 'lifestyle', image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=800&auto=format&fit=crop', description: 'Street to gym' }
    ];

    const bestSellers = displayProducts.slice(0, 4);
    const newArrivals = displayProducts.slice(4, 8);

    const brandFeatures = [
        { icon: Zap, title: 'Quick Dry Tech', description: 'Moisture-wicking fabric' },
        { icon: Flame, title: 'Thermo Reg', description: 'Temperature control' },
        { icon: Award, title: 'Pro Grade', description: 'Athlete tested' },
        { icon: Truck, title: 'Free Shipping', description: 'On orders above ₹2,999' },
        { icon: RefreshCcw, title: 'Easy Returns', description: '30-day return policy' },
        { icon: Shield, title: 'Secure Payment', description: '100% secure transactions' }
    ];

    return (
        <AppLayout>
            <Head title="Premium Collection | IHO Clothing" />

            {/* Hero Section */}
            <HeroSection />

            {/* Category Marquee */}
            <section className="border-y border-gray-200 bg-gray-50 py-8 overflow-hidden relative">
                <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />
                
                <div className="flex gap-16 px-8 overflow-x-auto no-scrollbar items-center max-w-6xl mx-auto">
                    {(categories?.length > 0 ? categories : [
                        {id: 1, slug: 'new', name: 'New Arrivals'}, 
                        {id: 2, slug: 'training', name: 'Training'}, 
                        {id: 3, slug: 'running', name: 'Running'}, 
                        {id: 4, slug: 'lifestyle', name: 'Lifestyle'}
                    ]).map((cat, i) => (
                        <motion.a
                            key={cat.id} href={`/category/${cat.slug}`}
                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                            className="whitespace-nowrap text-lg md:text-xl uppercase tracking-widest font-bold text-[#1A1A2E] hover:text-[#E94E3C] transition-colors"
                        >
                            {cat.name}
                        </motion.a>
                    ))}
                </div>
            </section>

            {/* Featured Categories Grid */}
            <section className="max-w-6xl mx-auto px-6 lg:px-8 py-24">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-black tracking-tight text-[#1A1A2E] uppercase">Shop by Category</h2>
                    <p className="mt-4 text-[#E94E3C] text-sm uppercase tracking-widest font-bold">Find your gear</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredCategories.map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative overflow-hidden rounded-lg cursor-pointer"
                        >
                            <Link href={`/category/${category.slug}`} className="block">
                                <div className="aspect-[3/4] overflow-hidden">
                                    <img 
                                        src={category.image} 
                                        alt={category.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E]/90 via-[#1A1A2E]/20 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-6">
                                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">{category.name}</h3>
                                    <p className="text-[#E94E3C] text-sm mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        {category.description}
                                    </p>
                                    <span className="inline-flex items-center gap-2 text-white text-sm font-bold uppercase tracking-widest mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        Shop Now <ArrowRight size={16} />
                                    </span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Promotional Banner */}
            <section className="relative py-32 overflow-hidden">
                <div className="absolute inset-0">
                    <img 
                        src="https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=2070&auto=format&fit=crop"
                        alt="Sports Collection"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[#1A1A2E]/75" />
                </div>
                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    >
                        <span className="text-[#E94E3C] text-sm uppercase tracking-[0.3em] font-bold">Limited Time Offer</span>
                        <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter mt-4 mb-6">
                            Summer Sale
                        </h2>
                        <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                            Up to 40% off on performance gear. Train harder with the best equipment.
                        </p>
                        <Link 
                            href="/shop"
                            className="inline-flex items-center gap-3 bg-[#E94E3C] text-white px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-[#D63A2A] transition-colors rounded-sm"
                        >
                            Shop Sale <ArrowRight size={18} />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Best Sellers Section */}
            <section className="max-w-6xl mx-auto px-6 lg:px-8 py-24">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 border-b border-gray-200 pb-6">
                    <div>
                        <motion.h2 
                            initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                            className="text-4xl font-black tracking-tight text-[#1A1A2E] uppercase"
                        >
                            Best Sellers
                        </motion.h2>
                        <p className="mt-2 text-[#E94E3C] text-sm uppercase tracking-widest font-bold">Top performing gear</p>
                    </div>
                    <Link href="/shop?sort=bestselling" className="text-sm text-[#1A1A2E] tracking-widest uppercase font-bold hover:text-[#E94E3C] transition-colors inline-flex items-center gap-2">
                        View All <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
                    {bestSellers.map((product, index) => (
                        <PremiumProductCard key={product.id} product={product} index={index} />
                    ))}
                </div>
            </section>

            {/* New Arrivals Section */}
            <section className="bg-gray-50 py-24">
                <div className="max-w-6xl mx-auto px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 border-b border-gray-200 pb-6">
                        <div>
                            <motion.h2 
                                initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                                className="text-4xl font-black tracking-tight text-[#1A1A2E] uppercase"
                            >
                                New Arrivals
                            </motion.h2>
                            <p className="mt-2 text-[#E94E3C] text-sm uppercase tracking-widest font-bold">Just dropped</p>
                        </div>
                        <Link href="/shop?sort=newest" className="text-sm text-[#1A1A2E] tracking-widest uppercase font-bold hover:text-[#E94E3C] transition-colors inline-flex items-center gap-2">
                            View All <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
                        {newArrivals.map((product, index) => (
                            <PremiumProductCard key={product.id} product={product} index={index + 4} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Brand Features */}
            <section className="max-w-6xl mx-auto px-6 lg:px-8 py-24">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl font-black tracking-tight text-[#1A1A2E] uppercase">Why Choose IHO</h2>
                    <p className="mt-4 text-[#E94E3C] text-sm uppercase tracking-widest font-bold">Engineered for performance</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {brandFeatures.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="text-center p-6 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1A1A2E] text-white mb-6">
                                <feature.icon size={28} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-lg font-bold text-[#1A1A2E] uppercase tracking-tight mb-2">{feature.title}</h3>
                            <p className="text-gray-500 text-sm">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Instagram Section */}
            <section className="bg-gray-50 py-24">
                <div className="max-w-6xl mx-auto px-6 lg:px-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <FaInstagram className="mx-auto text-[#E94E3C] mb-4" size={32} />
                        <h2 className="text-3xl font-black tracking-tight text-[#1A1A2E] uppercase">@ihoclothing</h2>
                        <p className="mt-4 text-[#E94E3C] text-sm uppercase tracking-widest font-bold">Join our community</p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                            <motion.div
                                key={item}
                                initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                                transition={{ delay: item * 0.1 }}
                                className="aspect-square overflow-hidden rounded-lg group cursor-pointer"
                            >
                                <img 
                                    src={`https://images.unsplash.com/photo-${item % 2 === 0 ? '1571019614242-c3c032cd4464' : '1517841905240-472988babdf9'}?q=80&w=400&auto=format&fit=crop`}
                                    alt={`Instagram post ${item}`}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="max-w-4xl mx-auto px-6 lg:px-8 py-24">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className="bg-[#1A1A2E] rounded-2xl p-12 md:p-16 text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-full opacity-10">
                        <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-4">
                            Stay in the Game
                        </h2>
                        <p className="text-[#E94E3C] mb-8 max-w-md mx-auto">
                            Subscribe to our newsletter and get 10% off your first order plus exclusive access to new arrivals.
                        </p>
                        <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                            <input 
                                type="email" 
                                placeholder="Enter your email" 
                                className="flex-1 px-6 py-4 rounded-sm bg-white/10 border border-white/20 text-white placeholder:text-white/60 outline-none focus:border-[#E94E3C] transition-colors"
                            />
                            <button 
                                type="submit"
                                className="px-8 py-4 bg-[#E94E3C] text-white font-bold uppercase tracking-widest rounded-sm hover:bg-[#D63A2A] transition-colors whitespace-nowrap"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </motion.div>
            </section>
        </AppLayout>
    );
}
