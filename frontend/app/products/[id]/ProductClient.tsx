'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Star, Shield, Truck, RotateCcw, Plus, Minus, Check, Zap } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { ReviewSection } from '@/components/ui/ReviewSection';

const EMOJI: Record<string, string> = { Laptops: '💻', Phones: '📱', Audio: '🎧', Tablets: '🖥️', Wearables: '⌚', Monitors: '🖵', Accessories: '🔧' };

interface Product { _id: string; name: string; price: number; image: string; category: string; stock: number; description: string }

export function ProductClient({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [timeLeft, setTimeLeft] = useState('04:59:59');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const h = 23 - now.getHours(), m = 59 - now.getMinutes(), s = 59 - now.getSeconds();
      setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) {
      addItem({ id: product._id, name: product.name, price: product.price, image: product.image || EMOJI[product.category] || '📦' });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const isImg = product.image?.startsWith('http');

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Link href="/products" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-8 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Volver al catálogo
      </Link>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
        {/* Left — Visuals */}
        <div className="space-y-6">
          {/* Flash Offer Banner */}
          <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl p-4 flex items-center justify-between text-white shadow-lg shadow-red-900/20">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 fill-white animate-pulse" />
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-80">Oferta Relámpago</div>
                <div className="text-sm font-bold">Ahorra hasta un 15% adicional</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-black uppercase tracking-widest opacity-80">Termina en</div>
              <div className="text-lg font-mono font-black">{timeLeft}</div>
            </div>
          </div>
          <div className="card aspect-square flex items-center justify-center overflow-hidden bg-white/[0.02] border border-white/[0.05] shadow-2xl relative group">
            {isImg ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            ) : (
              <span className="text-[12rem] select-none group-hover:scale-110 transition-transform duration-700">{EMOJI[product.category] || '📦'}</span>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card aspect-square bg-white/[0.02] border border-white/[0.05] rounded-xl flex items-center justify-center text-2xl text-gray-700 grayscale hover:grayscale-0 transition-all cursor-not-allowed">
                {EMOJI[product.category] || '📦'}
              </div>
            ))}
          </div>
        </div>

        {/* Right — Info */}
        <div className="flex flex-col">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
                {product.category}
              </span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
                <span className="text-xs text-gray-500 font-bold ml-1">4.9 (12Reseñas)</span>
              </div>
            </div>
            <h1 className="text-4xl lg:text-5xl font-display font-black text-white leading-[1.1] mb-6">{product.name}</h1>
            <div className="text-5xl font-display font-black text-white mb-6">
              ${product.price.toLocaleString()}
              <span className="text-sm text-gray-500 font-medium ml-3 font-sans">IVA Incluido</span>
            </div>
            <p className="text-gray-400 text-lg leading-relaxed">{product.description}</p>
          </div>

          <div className="space-y-8 mt-auto">
            {/* Stock status */}
            <div className={`flex items-center gap-3 p-4 rounded-2xl border ${product.stock > 5 ? 'bg-green-500/5 border-green-500/10 text-green-400' : product.stock > 0 ? 'bg-orange-500/5 border-orange-500/10 text-orange-400' : 'bg-red-500/5 border-red-500/10 text-red-500'}`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${product.stock > 0 ? 'bg-current' : 'bg-red-500'}`} />
              <span className="text-sm font-bold uppercase tracking-wider">
                {product.stock > 5 ? `Disponible: ${product.stock} unidades` : product.stock > 0 ? `¡Solo quedan ${product.stock} unidades!` : 'Producto Agotado'}
              </span>
            </div>

            {product.stock > 0 && (
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center justify-between bg-white/[0.03] border border-white/[0.07] rounded-2xl px-6 py-4 min-w-[140px]">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="text-gray-500 hover:text-white transition-colors">
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-xl font-display font-black text-white">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="text-gray-500 hover:text-white transition-colors">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <button onClick={handleAdd} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${added ? 'bg-green-600 text-white translate-y-0.5' : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-2xl hover:shadow-indigo-900/40 active:translate-y-1'}`}>
                  {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                  {added ? 'Agregado ✓' : 'Comprar Ahora'}
                </button>
              </div>
            )}

            {/* Features Info */}
            <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-8">
              {[
                { icon: Shield, label: 'Garantía', sub: '12 Meses' },
                { icon: Truck, label: 'Envío', sub: '24-48 horas' },
                { icon: RotateCcw, label: 'Devolución', sub: '30 Días' },
              ].map((f, i) => (
                <div key={i} className="text-center">
                  <f.icon className="w-5 h-5 text-gray-600 mx-auto mb-2" />
                  <div className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">{f.label}</div>
                  <div className="text-[11px] text-white font-medium">{f.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20 pt-10 border-t border-white/5">
        <ReviewSection productId={product._id} />
      </div>
    </div>
  );
}
