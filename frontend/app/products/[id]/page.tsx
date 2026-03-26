'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Star, Shield, Truck, RotateCcw, Plus, Minus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { getProduct } from '@/lib/api';
import { ReviewSection } from '@/components/ui/ReviewSection';

const EMOJI: Record<string, string> = { Laptops: '💻', Phones: '📱', Audio: '🎧', Tablets: '🖥️', Wearables: '⌚', Monitors: '🖵', Accessories: '🔧' };

interface Product { _id: string; name: string; price: number; image: string; category: string; stock: number; description: string }

export default function ProductDetail({ params }: { params: { id: string } }) {
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    getProduct(params.id)
      .then(setProduct)
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

          {/* Qty + Add */}
          {product.stock > 0 && (
            <div className="flex gap-4">
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
            </div>
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
    </div>
  );
}
