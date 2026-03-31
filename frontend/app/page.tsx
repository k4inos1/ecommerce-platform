import Link from 'next/link';
import { ArrowRight, ShieldCheck, Truck, RotateCcw, Zap, Package, ChevronRight } from 'lucide-react';
import { ProductCard } from '@/components/ui/ProductCard';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function getFeaturedProducts() {
  try {
    const res = await fetch(`${API}/api/products?limit=8`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
  } catch { return []; }
}

const CATEGORIES = [
  { emoji: '💻', name: 'Laptops', desc: 'Portátiles & ultrabooks', color: 'from-blue-600/10 to-transparent border-blue-500/20 hover:border-blue-400/40' },
  { emoji: '📱', name: 'Phones', desc: 'Smartphones desbloqueados', color: 'from-emerald-600/10 to-transparent border-emerald-500/20 hover:border-emerald-400/40' },
  { emoji: '🎧', name: 'Audio', desc: 'Auriculares & parlantes', color: 'from-purple-600/10 to-transparent border-purple-500/20 hover:border-purple-400/40' },
  { emoji: '🖥️', name: 'Tablets', desc: 'iPads & Android tablets', color: 'from-orange-600/10 to-transparent border-orange-500/20 hover:border-orange-400/40' },
  { emoji: '⌚', name: 'Wearables', desc: 'Smartwatches & fitness', color: 'from-pink-600/10 to-transparent border-pink-500/20 hover:border-pink-400/40' },
  { emoji: '🖵', name: 'Monitors', desc: '4K, OLED & gaming', color: 'from-cyan-600/10 to-transparent border-cyan-500/20 hover:border-cyan-400/40' },
];

export default async function Home() {
  const featured = await getFeaturedProducts();

  return (
    <div>
      {/* ── Announcement bar ──────────────────────────────────── */}
      <div className="bg-indigo-600/10 border-b border-indigo-500/20 py-2.5 text-center text-xs text-indigo-300 font-medium tracking-wide">
        🚚 Envío gratuito en pedidos sobre $99 &nbsp;·&nbsp; Pagos con Stripe y Transbank
      </div>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pt-16 pb-24">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[500px] h-[400px] bg-indigo-600/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 right-1/4 w-[350px] h-[300px] bg-violet-700/8 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-[11px] font-semibold text-indigo-300 uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
              Novedades · Temporada 2025
            </div>

            <h1 className="font-display text-5xl lg:text-6xl font-black leading-[1.06] mb-5">
              <span className="text-white">Importa tecnología</span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 bg-clip-text text-transparent">
                al mejor precio
              </span>
            </h1>

            <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-lg">
              Seleccionamos los mejores gadgets directamente de proveedores globales.
              Envío rápido, garantía real y soporte en español.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/products" className="btn-primary px-7 py-3.5 text-base">
                Ver catálogo <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/products?category=Audio" className="btn-ghost px-7 py-3.5 text-base">
                Explorar Audio
              </Link>
            </div>

            {/* Trust pills */}
            <div className="mt-8 flex flex-wrap gap-3">
              {[
                { icon: <Truck className="w-3.5 h-3.5" />, text: 'Envío express' },
                { icon: <ShieldCheck className="w-3.5 h-3.5" />, text: 'Pago seguro' },
                { icon: <RotateCcw className="w-3.5 h-3.5" />, text: '30 días devolución' },
              ].map(t => (
                <span key={t.text} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-gray-400">
                  <span className="text-indigo-400">{t.icon}</span>
                  {t.text}
                </span>
              ))}
            </div>
          </div>

          {/* Right: category quick-links grid */}
          <div className="hidden lg:grid grid-cols-2 gap-3">
            {CATEGORIES.slice(0, 4).map(cat => (
              <Link key={cat.name} href={`/products?category=${cat.name}`}
                className={`group flex items-center gap-4 p-5 rounded-2xl border bg-gradient-to-br ${cat.color} transition-all duration-200 hover:-translate-y-0.5`}>
                <span className="text-3xl">{cat.emoji}</span>
                <div>
                  <div className="text-sm font-semibold text-white group-hover:text-indigo-200 transition-colors">{cat.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{cat.desc}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 ml-auto transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-24">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="section-label mb-1.5">Catálogo</p>
              <h2 className="text-2xl font-display font-bold text-white">Productos destacados</h2>
            </div>
            <Link href="/products" className="btn-ghost text-sm hidden sm:inline-flex">
              Ver todo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((p: any) => (
              <ProductCard key={p._id} p={p} />
            ))}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Link href="/products" className="btn-ghost text-sm">
              Ver todo el catálogo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* ── Categories full grid ──────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="section-label mb-1.5">Categorías</p>
            <h2 className="text-2xl font-display font-bold text-white">Encuentra lo que buscas</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map(cat => (
            <Link key={cat.name} href={`/products?category=${cat.name}`}
              className={`group flex flex-col items-center gap-2.5 p-5 rounded-2xl border bg-gradient-to-b ${cat.color} transition-all duration-200 hover:-translate-y-0.5`}>
              <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{cat.emoji}</span>
              <div className="text-center">
                <div className="text-xs font-semibold text-gray-200">{cat.name}</div>
                <div className="text-[10px] text-gray-500 mt-0.5 hidden sm:block">{cat.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Value props ───────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pb-28">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: <Zap className="w-5 h-5" />,
              title: 'Stock gestionado en tiempo real',
              desc: 'Cada unidad reflejada al instante. Sin sorpresas al llegar a la caja.',
              color: 'border-indigo-500/20 bg-indigo-500/[0.03]',
              iconColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
            },
            {
              icon: <ShieldCheck className="w-5 h-5" />,
              title: 'Pagos protegidos',
              desc: 'Stripe y Transbank con encriptación SSL. Tu información nunca se almacena.',
              color: 'border-emerald-500/20 bg-emerald-500/[0.03]',
              iconColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            },
            {
              icon: <Package className="w-5 h-5" />,
              title: 'Seguimiento de órdenes',
              desc: 'Monitorea tu compra desde el pago hasta la entrega en tu puerta.',
              color: 'border-violet-500/20 bg-violet-500/[0.03]',
              iconColor: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
            },
          ].map(f => (
            <div key={f.title} className={`card p-6 border ${f.color}`}>
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${f.iconColor}`}>
                {f.icon}
              </div>
              <h3 className="font-semibold text-white mb-2 text-sm">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
