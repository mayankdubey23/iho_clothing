import Link from "next/link";
import { ShoppingBag, Briefcase } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 w-full bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo Section */}
          <Link href="/" className="text-2xl font-bold tracking-tight text-[var(--color-brand-blue)]">
            IHO<span className="text-[var(--color-brand-accent)]">Clothing</span>
          </Link>

          {/* Menu Links */}
          <div className="flex gap-8">
            <Link 
              href="/sports-wear" 
              className="flex items-center gap-2 font-medium text-[var(--color-brand-blue)] hover:text-[var(--color-brand-accent)] transition-colors"
            >
              <ShoppingBag size={18} />
              Sports Wear
            </Link>
            <Link 
              href="/franchise" 
              className="flex items-center gap-2 font-medium text-[var(--color-brand-blue)] hover:text-[var(--color-brand-accent)] transition-colors"
            >
              <Briefcase size={18} />
              Partner With Us
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}