import Link from 'next/link';
import { ArrowRight, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

const featured = [
  { id: '1', name: 'MacBook Pro M3', price: 2499, emoji: '💻', category: 'Laptops' },
  { id: '2', name: 'AirPods Pro', price: 249, emoji: '🎧', category: 'Audio' },
  { id: '3', name: 'iPhone 15 Pro', price: 1199, emoji: '📱', category: 'Phones' },
  { id: '4', name: 'iPad Air', price: 749, emoji: '🖥️', category: 'Tablets' },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-28 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/20 via-transparent to-transparent" />
        <div className="relative max-w-3xl mx-auto space-y-6">
          <span className="inline-block text-xs font-mono bg-brand/20 text-brand px-3 py-1 rounded-full border border-brand/30">
            🚀 Nueva colección 2025
          </span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white">
            Tech al <span className="text-brand">Siguiente Nivel</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Los mejores productos tecnológicos con envío rápido y pagos seguros con Stripe.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/products" className="btn-primary inline-flex items-center gap-2">
              Ver Productos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: <Truck className="w-6 h-6" />, title: 'Envío Gratis', desc: 'En pedidos sobre $99' },
            { icon: <ShieldCheck className="w-6 h-6" />, title: 'Pago Seguro', desc: 'Stripe encriptado SSL' },
            { icon: <RotateCcw className="w-6 h-6" />, title: 'Devoluciones', desc: '30 días sin preguntas' },
          ].map(f => (
            <div key={f.title} className="card p-6 flex gap-4 items-start">
              <div className="text-brand mt-1">{f.icon}</div>
              <div>
                <div className="font-semibold text-white">{f.title}</div>
                <div className="text-sm text-gray-400">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Featured products */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Destacados</h2>
          <Link href="/products" className="text-sm text-brand hover:underline flex items-center gap-1">
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featured.map(p => (
            <Link key={p.id} href={`/products/${p.id}`} className="card group hover:border-brand/50 hover:-translate-y-1 transition-all duration-300">
              <div className="p-6 text-center">
                <div className="text-5xl mb-4">{p.emoji}</div>
                <div className="text-xs text-gray-500 mb-1">{p.category}</div>
                <div className="font-semibold text-white text-sm mb-2">{p.name}</div>
                <div className="text-brand font-bold">${p.price.toLocaleString()}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
