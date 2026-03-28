import Link from 'next/link';
import { ArrowRight, ShieldCheck, Truck, RotateCcw, Zap, Star, Package, ExternalLink, Check } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function getFeaturedProducts() {
  try {
    const res = await fetch(`${API}/api/products?limit=4`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
  } catch { return []; }
}

export default async function Home() {
  const featured = await getFeaturedProducts();

  return (
    <div className="relative">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden px-4">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Nuevos productos — Colección 2025
          </div>

          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-6">
            <span className="text-white">Tecnología que</span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300 bg-clip-text text-transparent">
              transforma vidas
            </span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
            Los mejores productos tech con envío express, garantía extendida y pagos seguros.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/products" className="btn-primary text-base px-8 py-4 shadow-2xl shadow-indigo-900/50">
              Explorar productos <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/products?category=Audio" className="btn-ghost text-base px-8 py-4">
              Ver Audio
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500">
            {[{ value: '4.9★', label: 'Valoración' }, { value: '2k+', label: 'Clientes' }, { value: '99%', label: 'Satisfacción' }].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-white font-bold text-base">{s.value}</div>
                <div className="text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2"><div className="w-px h-12 bg-gradient-to-b from-transparent to-gray-600" /></div>
      </section>

      {/* ── Trust bar ─────────────────────────────────────────── */}
      <section className="border-y border-white/5 bg-white/[0.02] py-5">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: <Truck className="w-5 h-5" />, title: 'Envío Gratis', desc: 'En pedidos sobre $99' },
              { icon: <ShieldCheck className="w-5 h-5" />, title: 'Pago Seguro', desc: 'Protegido con SSL' },
              { icon: <RotateCcw className="w-5 h-5" />, title: '30 días', desc: 'Devolución sin preguntas' },
            ].map(f => (
              <div key={f.title} className="flex items-center gap-3 justify-center">
                <div className="text-indigo-400 shrink-0">{f.icon}</div>
                <div className="hidden sm:block">
                  <div className="text-sm font-semibold text-white">{f.title}</div>
                  <div className="text-xs text-gray-500">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="section-label mb-2">Catálogo</p>
              <h2 className="text-3xl font-display font-bold text-white">Productos Destacados</h2>
            </div>
            <Link href="/products" className="btn-ghost hidden sm:inline-flex">
              Ver todo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured.map((p: any) => (
              <Link key={p._id} href={`/products/${p._id}`}
                className="card p-4 group hover:border-indigo-500/30 hover:-translate-y-1 transition-all duration-200 flex flex-col gap-3">
                <div className="aspect-square rounded-xl bg-white/[0.03] overflow-hidden flex items-center justify-center">
                  {p.image?.startsWith('http') ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <span className="text-4xl">{p.image || '📦'}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1">{p.category}</div>
                  <div className="font-medium text-white text-sm leading-snug line-clamp-2 group-hover:text-indigo-300 transition-colors">{p.name}</div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-indigo-400 font-bold">${p.price.toLocaleString()}</span>
                  <span className={`text-[10px] ${p.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {p.stock > 0 ? `${p.stock} disponibles` : 'Agotado'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Categories ────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="section-label mb-2">Categorías</p>
            <h2 className="text-3xl font-display font-bold text-white">Encuentra lo que buscas</h2>
          </div>
          <Link href="/products" className="btn-ghost hidden sm:inline-flex">Ver todo <ArrowRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { emoji: '💻', name: 'Laptops', color: 'from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:border-blue-400/40' },
            { emoji: '📱', name: 'Phones', color: 'from-green-500/10 to-green-600/5 border-green-500/20 hover:border-green-400/40' },
            { emoji: '🎧', name: 'Audio', color: 'from-purple-500/10 to-purple-600/5 border-purple-500/20 hover:border-purple-400/40' },
            { emoji: '🖥️', name: 'Tablets', color: 'from-orange-500/10 to-orange-600/5 border-orange-500/20 hover:border-orange-400/40' },
            { emoji: '⌚', name: 'Wearables', color: 'from-pink-500/10 to-pink-600/5 border-pink-500/20 hover:border-pink-400/40' },
            { emoji: '🖵', name: 'Monitors', color: 'from-cyan-500/10 to-cyan-600/5 border-cyan-500/20 hover:border-cyan-400/40' },
          ].map(cat => (
            <Link key={cat.name} href={`/products?category=${cat.name}`}
              className={`group flex flex-col items-center gap-3 p-5 rounded-2xl border bg-gradient-to-b ${cat.color} transition-all duration-200 hover:-translate-y-0.5`}>
              <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{cat.emoji}</span>
              <span className="text-xs font-medium text-gray-300">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Why us ────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="card p-8 md:p-12 relative overflow-hidden bg-white/[0.02]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative grid md:grid-cols-3 gap-8">
            {[
              { icon: <Zap className="w-6 h-6" />, title: 'Stock real', desc: 'Inventario en tiempo real, gestionado desde el admin panel.' },
              { icon: <Star className="w-6 h-6" />, title: 'Reseñas verificadas', desc: 'Solo clientes reales pueden reseñar. Sin valoraciones falsas.' },
              { icon: <Package className="w-6 h-6" />, title: 'Tracking completo', desc: 'Seguimiento de tu orden desde el pago hasta la entrega.' },
            ].map(f => (
              <div key={f.title} className="flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">{f.icon}</div>
                <div className="font-semibold text-white">{f.title}</div>
                <div className="text-sm text-gray-400 leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
