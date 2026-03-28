'use client';

import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

const EMOJI: Record<string, string> = {
  Laptops: '💻', Phones: '📱', Audio: '🎧', Tablets: '🖥️',
  Wearables: '⌚', Monitors: '🖵', Accessories: '🔧',
};

export default function WishlistPage() {
  const { addItem } = useCart();
  const { wishlistItems, toggle, loading } = useWishlist();

  const handleAdd = (p: { _id: string; name: string; price: number; image: string; category: string }) => {
    addItem({ id: p._id, name: p.name, price: p.price, image: p.image || EMOJI[p.category] || '📦' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/products" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Volver a productos
      </Link>

      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="section-label mb-1">Mi lista</p>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            <Heart className="w-7 h-7 text-pink-400 fill-pink-400" /> Favoritos
          </h1>
        </div>
        {!loading && (
          <p className="text-sm text-gray-500">{wishlistItems.length} producto{wishlistItems.length !== 1 ? 's' : ''}</p>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="aspect-square rounded-xl bg-white/[0.03] mb-4" />
              <div className="h-3 bg-white/[0.03] rounded mb-2 w-2/3" />
              <div className="h-4 bg-white/[0.03] rounded mb-3" />
              <div className="h-6 bg-white/[0.03] rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="text-center py-24">
          <Heart className="w-16 h-16 text-gray-700 mx-auto mb-6" />
          <p className="text-xl font-semibold text-white mb-2">Tu lista de favoritos está vacía</p>
          <p className="text-gray-500 mb-8">Guarda los productos que te gustan para comprarlos después.</p>
          <Link href="/products" className="btn-primary">Explorar productos</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {wishlistItems.map(p => (
            <div key={p._id} className="card flex flex-col hover:border-pink-500/30 hover:-translate-y-1 transition-all duration-200">
              <Link href={`/products/${p._id}`} className="flex flex-col flex-1 p-4">
                <div className="aspect-square rounded-xl bg-white/[0.03] overflow-hidden flex items-center justify-center mb-4">
                  {p.image?.startsWith('http') ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">{EMOJI[p.category] || '📦'}</span>
                  )}
                </div>
                <div className="text-[11px] text-gray-500 mb-1">{p.category}</div>
                <div className="font-medium text-white text-sm leading-snug mb-2 line-clamp-2 hover:text-pink-300 transition-colors">{p.name}</div>
                <div className="mt-auto">
                  <span className="text-indigo-400 font-bold text-lg">${p.price.toLocaleString()}</span>
                </div>
              </Link>
              <div className="p-3 pt-0 flex gap-2">
                <button
                  onClick={() => handleAdd(p)}
                  disabled={p.stock === 0}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${p.stock === 0 ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {p.stock === 0 ? 'Agotado' : 'Agregar'}
                </button>
                <button
                  onClick={() => toggle(p._id)}
                  className="p-2.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all"
                  title="Quitar de favoritos"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
