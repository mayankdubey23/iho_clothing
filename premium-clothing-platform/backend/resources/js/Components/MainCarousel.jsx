import React, { useRef } from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

export default function MainCarousel({ products }) {
    const scrollRef = useRef(null);

    if (!products || products.length === 0) return null;

    return (
        <section className="relative w-full overflow-hidden pt-8 md:pt-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-none">
                        Latest <br /> <span className="text-blue-600">Drops.</span>
                    </h1>
                </div>

                {/* Mobile sliding effects utilizing snap-x */}
                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto gap-6 md:gap-8 pb-12 pt-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {products.slice(0, 6).map((product, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            key={product.id || index}
                            className="min-w-[80vw] md:min-w-[380px] max-w-[380px] snap-center flex-shrink-0 relative group cursor-pointer"
                        >
                            <Link href={`/product/${product.slug || product.id}`} className="block relative bg-white rounded-3xl overflow-hidden h-[500px] shadow-sm transition-all duration-500 ease-out group-hover:shadow-[0_20px_50px_rgba(59,130,246,0.15)] group-hover:-translate-y-2 group-hover:scale-[1.02]">

                                {/* Product Image Container - Pops out on hover */}
                                <div className="absolute inset-0 bg-[#F1F5F9] overflow-hidden">
                                    <img
                                        src={product.images?.[0]?.image_path || '/images/placeholder.png'}
                                        alt={product.name}
                                        className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-110"
                                    />
                                    {/* Glass gradient overlay to protect text readability */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                                </div>

                                {/* Product Info (Pops up from bottom) */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20 text-[10px] font-bold uppercase tracking-widest mb-3">
                                        {product.category_name || 'New Arrival'}
                                    </span>
                                    <h3 className="text-2xl font-black text-white leading-tight mb-1">
                                        {product.name}
                                    </h3>
                                    <p className="text-blue-300 font-bold text-lg mb-4">
                                        ₹{product.price}
                                    </p>

                                    <button
                                        onClick={(e) => { e.preventDefault(); }}
                                        className="w-full flex items-center justify-center space-x-2 bg-white text-slate-900 py-3 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-colors"
                                    >
                                        <ShoppingBag className="w-5 h-5" />
                                        <span>Quick Add</span>
                                    </button>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}