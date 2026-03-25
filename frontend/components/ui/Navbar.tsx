'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export function Navbar() {
  const { count } = useCart();

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-white">
          🛍️ <span className="text-brand">Tech</span>Store
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/products" className="text-sm text-gray-400 hover:text-white transition-colors">
            Productos
          </Link>
          <Link href="/cart" className="relative text-gray-400 hover:text-white transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
