"use client"; // Yeh Framer motion (animations) ke liye zaroori hai

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center text-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold text-[var(--color-brand-blue)] tracking-tight mb-6">
          Elevate Your Performance.
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed">
          Premium sports wear designed for athletes. Explore our exclusive collection or join our growing network as a franchise partner.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/sports-wear"
            className="bg-[var(--color-brand-accent)] text-white px-8 py-4 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30"
          >
            Shop Sports Wear <ArrowRight size={20} />
          </Link>
          
          <Link 
            href="/franchise"
            className="bg-white text-[var(--color-brand-blue)] border-2 border-[var(--color-brand-blue)] px-8 py-4 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-[var(--color-brand-light)] transition-all"
          >
            Buy Franchise
          </Link>
        </div>
      </motion.div>
    </main>
  );
}