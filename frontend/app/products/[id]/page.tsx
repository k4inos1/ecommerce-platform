'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Star, Shield, Truck, RotateCcw, Plus, Minus, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { getProduct, getRelatedProducts } from '@/lib/api';
import { ReviewSection } from '@/components/ui/ReviewSection';

const EMOJI: Record<string, string> = { Laptops: '💻', Phones: '📱', Audio: '🎧', Tablets: '🖥️', Wearables: '⌚', Monitors: '🖵', Accessories: '🔧' };

interface Product { _id: string; name: string; price: number; image: string; category: string; stock: number; description: string }

export default function ProductDetail({ params }: { params: { id: string } }) {
  const { addItem } = useCart();
  const { isInWishlist, toggle: toggleWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    getProduct(params.id)
      .then(p => {
        setProduct(p);
        return getRelatedProducts(params.id);
      })
      .then(setRelated)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleAdd = () => {
    if (!product) return;
    for (let i = 0; i < qty; i++) {
      addItem({ id: product._id, name: product.name, price: product.price, image: product.image || EMOJI[product.category] || '📦' });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin w-10 h-10 border-2 border-brand border-t-transparent rounded-full" />
    </div>
  );

  if (!product) return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <div className="text-6xl mb-6">🔍</div>
      <h1 className="text-2xl font-bold text-white mb-4">Producto no encontrado</h1>
      <Link href="/products" className="btn-primary inline-block">Ver todos los productos</Link>
    </div>
  );

  const isImg = product.image?.startsWith('http');

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Link href="/products" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Volver a productos
      </Link>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Left — Product visual */}
        <div className="space-y-4">
          <div className="card aspect-square flex items-center justify-center overflow-hidden">
            {isImg ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[10rem] select-none">{EMOJI[product.category] || '📦'}</span>
            )}
          </div>
        </div>

        {/* Right — Info */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-mono text-brand bg-brand/10 px-3 py-1 rounded-full border border-brand/20">{product.category}</span>
            <h1 className="text-3xl font-black text-white mt-3">{product.name}</h1>
          </div>

          <div className="text-4xl font-black text-brand">${product.price.toLocaleString()}</div>
          <p className="text-gray-400 leading-relaxed">{product.description}</p>

          {/* Stock */}
          <div className={`text-sm font-medium ${product.stock > 5 ? 'text-green-400' : product.stock > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
            {product.stock > 5 ? `✅ En stock (${product.stock} disponibles)` : product.stock > 0 ? `⚠️ ¡Últimas ${product.stock} unidades!` : '❌ Agotado'}
          </div>

          {/* Qty + Add + Wishlist */}
          {product.stock > 0 && (
            <div className="flex gap-3">
              <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="text-gray-400 hover:text-white transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-mono text-white font-bold">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="text-gray-400 hover:text-white transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button onClick={handleAdd} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${added ? 'bg-green-600 text-white' : 'bg-brand text-white hover:bg-brand-dark'}`}>
                <ShoppingCart className="w-5 h-5" />
                {added ? '✓ Agregado al carrito' : `Agregar ${qty > 1 ? `(${qty})` : ''} al Carrito`}
              </button>
              <button
                onClick={() => toggleWishlist(product._id)}
                className={`p-3 rounded-xl border transition-all ${isInWishlist(product._id) ? 'bg-pink-500/20 border-pink-500/40 text-pink-400' : 'border-white/10 text-gray-400 hover:text-pink-400 hover:border-pink-500/30'}`}
                title={isInWishlist(product._id) ? 'Quitar de favoritos' : 'Guardar en favoritos'}
              >
                <Heart className={`w-5 h-5 ${isInWishlist(product._id) ? 'fill-pink-400' : ''}`} />
              </button>
            </div>
          )}

          {/* Wishlist button when out of stock */}
          {product.stock === 0 && (
            <button
              onClick={() => toggleWishlist(product._id)}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold border transition-all ${isInWishlist(product._id) ? 'bg-pink-500/20 border-pink-500/40 text-pink-400' : 'border-white/10 text-gray-400 hover:text-pink-400 hover:border-pink-500/30'}`}
            >
              <Heart className={`w-5 h-5 ${isInWishlist(product._id) ? 'fill-pink-400' : ''}`} />
              {isInWishlist(product._id) ? 'Guardado en favoritos' : 'Guardar en favoritos'}
            </button>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: <Truck className="w-5 h-5" />, text: 'Envío Gratis', sub: '+$99' },
              { icon: <Shield className="w-5 h-5" />, text: 'Pago Seguro', sub: 'Stripe SSL' },
              { icon: <RotateCcw className="w-5 h-5" />, text: 'Devolución', sub: '30 días' },
            ].map(b => (
              <div key={b.text} className="card p-3 text-center">
                <div className="text-brand flex justify-center mb-1">{b.icon}</div>
                <div className="text-xs font-semibold text-white">{b.text}</div>
                <div className="text-[10px] text-gray-500">{b.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Reviews ─── */}
      <ReviewSection productId={product._id} />

      {/* ─── Related Products ─── */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-6">También te puede gustar</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {related.map(r => (
              <Link key={r._id} href={`/products/${r._id}`}
                className="card group hover:border-indigo-500/30 hover:-translate-y-1 transition-all duration-200 p-4 flex flex-col">
                <div className="aspect-square rounded-xl bg-white/[0.03] overflow-hidden flex items-center justify-center mb-4">
                  {r.image?.startsWith('http') ? (
                    <img src={r.image} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <span className="text-4xl">{EMOJI[r.category] || '📦'}</span>
                  )}
                </div>
                <div className="text-[11px] text-gray-500 mb-1">{r.category}</div>
                <div className="font-medium text-white text-sm leading-snug line-clamp-2 group-hover:text-indigo-300 transition-colors">{r.name}</div>
                <div className="mt-auto pt-2 text-indigo-400 font-bold">${r.price.toLocaleString()}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
