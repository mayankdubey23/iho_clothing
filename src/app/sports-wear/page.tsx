"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";

// TypeScript interfaces backend data structure ke liye
interface Sku {
  id: number;
  sku_code: string;
  size: string;
  color: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  base_price: string;
  franchise_price: string;
  skus: Sku[];
}

export default function SportsWearPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Laravel API se dynamic data fetch kar rahe hain
    axios.get("http://127.0.0.1:8000/api/products")
      .then((response) => {
        setProducts(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("API Error:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-brand-accent)]"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--color-brand-blue)] mb-4">
          Premium Sports Wear
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          Engineered for peak performance. Experience dynamic comfort and style.
        </p>
      </div>

      {/* MOBILE RESPONSIVE GRID: Mobile pe 1 column, Tablet pe 2, Laptop pe 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }} // Staggered animation
            whileHover={{ y: -10 }} // Premium hover effect
            className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col"
          >
            {/* Image Placeholder (Dynamic hone par yahan API se aayi image lagegi) */}
            <div className="h-64 bg-gray-100 flex items-center justify-center relative overflow-hidden group">
               <div className="text-gray-400 font-medium group-hover:scale-110 transition-transform duration-500">
                 [ Product Image 3D View ]
               </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
              <h2 className="text-xl font-bold text-[var(--color-brand-blue)] mb-2">
                {product.name}
              </h2>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                {product.description}
              </p>

              {/* Dynamic SKU / Sizes Display */}
              <div className="flex gap-2 mb-6 flex-wrap">
                {product.skus.map((sku) => (
                  <span key={sku.id} className="text-xs bg-[var(--color-brand-light)] text-[var(--color-brand-blue)] px-3 py-1 rounded-full font-medium border border-blue-100">
                    {sku.size} - {sku.color}
                  </span>
                ))}
              </div>

              <div className="mt-auto flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black text-[var(--color-brand-blue)]">
                    ₹{product.base_price}
                  </p>
                  {/* Franchise discount text */}
                  <p className="text-xs text-green-600 font-semibold mt-1">
                    Franchise: ₹{product.franchise_price}
                  </p>
                </div>
                <button className="bg-[var(--color-brand-accent)] text-white p-3 rounded-xl hover:bg-blue-700 transition-colors">
                  <ShoppingCart size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </main>
  );
}