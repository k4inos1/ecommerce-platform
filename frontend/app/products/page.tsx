'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, ShoppingCart, Check, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchParams, useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const CATEGORIES = ['All', 'Laptops', 'Phones', 'Audio', 'Tablets', 'Wearables', 'Monitors', 'Accessories'];
const EMOJI: Record<string, string> = { Laptops: '💻', Phones: '📱', Audio: '🎧', Tablets: '🖥️', Wearables: '⌚', Monitors: '🖵', Accessories: '🔧' };

interface Product { _id: string; name: string; price: number; image: string; category: string; description: string; stock: number; supplierPrice?: number }

function ProductsContent() {
  const { addItem } = useCart();
  const router = useRouter();
  const params = useSearchParams();

  const [search, setSearch] = useState(params.get('q') || '');
  const [category, setCategory] = useState(params.get('category') || 'All');
  const [sort, setSort] = useState('newest');
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [added, setAdded] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [minPrice, setMinPrice] = useState(params.get('min') || '');
  const [maxPrice, setMaxPrice] = useState(params.get('max') || '');

  const debouncedSearch = useDebounce(search, 400);
  const debouncedMin = useDebounce(minPrice, 400);
  const debouncedMax = useDebounce(maxPrice, 400);

  useEffect(() => {
    setLoading(true); setError('');
    const q = new URLSearchParams();
    if (debouncedSearch) q.set('search', debouncedSearch);
    if (category !== 'All') q.set('category', category);
    if (debouncedMin) q.set('minPrice', debouncedMin);
    if (debouncedMax) q.set('maxPrice', debouncedMax);
    q.set('limit', '24');

    fetch(`${API}/api/products?${q}`)
      .then(r => r.json())
      .then(d => { setProducts(d.products || []); setTotal(d.total || 0); })
      .catch(() => setError('No se pudo conectar al servidor.'))
      .finally(() => setLoading(false));
  }, [debouncedSearch, category, debouncedMin, debouncedMax]);

  // Client-side sort
  const sorted = [...products].sort((a, b) => {
    if (sort === 'price-asc') return a.price - b.price;
    if (sort === 'price-desc') return b.price - a.price;
    return 0; // newest = API default
  });

  const handleAdd = (p: Product) => {
    addItem({ id: p._id, name: p.name, price: p.price, image: p.image || EMOJI[p.category] || '📦' });
    setAdded(p._id);
    setTimeout(() => setAdded(null), 1400);
  };

  const clearFilters = () => {
    setSearch(''); setCategory('All'); setMinPrice(''); setMaxPrice(''); setSort('newest');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-end justify-between mb-8 border-b border-white/5 pb-6">
        <div>
          <p className="text-xs font-mono text-indigo-400 uppercase tracking-widest mb-2">TechStore Catalog</p>
          <h1 className="text-4xl font-display font-black text-white">Explora la Tecnología</h1>
        </div>
        {!loading && <p className="text-sm font-mono text-gray-500 bg-white/5 px-3 py-1 rounded-full">{total} items</p>}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className={`lg:w-64 space-y-8 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          {/* Categories */}
          <div>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" /> Categorías
            </h3>
            <div className="flex flex-col gap-1">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${category === c ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                  <span className="flex items-center gap-2">
                    <span className="text-base">{EMOJI[c] || '📁'}</span> {c}
                  </span>
                  {category === c && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-white font-bold mb-4">Rango de Precio</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl pl-6 pr-2 py-2.5 text-xs text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none" />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl pl-6 pr-2 py-2.5 text-xs text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none" />
              </div>
            </div>
          </div>

          <button onClick={clearFilters} className="text-xs text-indigo-400 hover:text-white transition-colors underline underline-offset-4">Limpiar filtros</button>
        </aside>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Top Bar (Search + Sort) */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="¿Qué estás buscando hoy?"
                className="w-full bg-white/[0.03] border border-white/[0.07] rounded-2xl pl-10 pr-4 py-3.5 text-sm text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none transition-all shadow-inner" />
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden p-3.5 bg-white/[0.03] border border-white/[0.07] rounded-2xl text-gray-400 hover:text-white">
                <SlidersHorizontal className="w-5 h-5" />
              </button>
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="bg-white/[0.03] border border-white/[0.07] rounded-2xl px-4 py-3.5 text-sm text-gray-300 focus:border-indigo-500 focus:outline-none cursor-pointer">
                <option value="newest">Más recientes</option>
                <option value="price-asc">Precio: Bajo a Alto</option>
                <option value="price-desc">Precio: Alto a Bajo</option>
              </select>
            </div>
          </div>

          {error && <div className="card p-5 text-yellow-400 text-sm border-yellow-500/20 bg-yellow-500/5 mb-6">⚠️ {error}</div>}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="aspect-square rounded-2xl bg-white/[0.03] mb-4" />
                  <div className="h-4 bg-white/[0.03] rounded w-3/4 mb-2" />
                  <div className="h-4 bg-white/[0.03] rounded w-full mb-4" />
                  <div className="h-10 bg-white/[0.03] rounded" />
                </div>
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-32">
              <div className="w-20 h-20 bg-white/[0.02] border border-white/[0.05] rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-gray-700" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">No encontramos coincidencias</h2>
              <p className="text-gray-500 text-sm mb-8">Intenta ajustando tus filtros o términos de búsqueda.</p>
              <button onClick={clearFilters} className="btn-primary px-8">Ver todo el catálogo</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sorted.map(p => (
                <div key={p._id} className="card group hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col relative overflow-hidden">
                  <Link href={`/products/${p._id}`} className="flex flex-col flex-1 p-5">
                    {/* Image */}
                    <div className="aspect-square rounded-2xl bg-white/[0.03] overflow-hidden flex items-center justify-center mb-5 relative">
                      {p.image?.startsWith('http') ? (
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <span className="text-6xl group-hover:scale-110 transition-transform duration-500">{EMOJI[p.category] || '📦'}</span>
                      )}
                      {p.stock <= 3 && p.stock > 0 && (
                        <div className="absolute top-2 right-2 bg-orange-500 text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter animate-pulse">¡Últimas unidades!</div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{p.category}</span>
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-[10px] text-gray-400 font-bold">4.8</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-white text-base leading-tight mb-2 line-clamp-2 group-hover:text-indigo-400 transition-colors">{p.name}</h3>
                    
                    <div className="mt-auto pt-4 flex items-end justify-between">
                      <div>
                        <div className="text-[10px] text-gray-600 mb-0.5 font-medium">Precio Final</div>
                        <div className="text-2xl font-display font-black text-white group-hover:text-indigo-400 transition-colors">
                          ${p.price.toLocaleString()}
                        </div>
                      </div>
                      <div className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${p.stock > 0 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        {p.stock > 0 ? 'EN STOCK' : 'AGOTADO'}
                      </div>
                    </div>
                  </Link>
                  <div className="p-5 pt-0">
                    <button onClick={(e) => { e.preventDefault(); handleAdd(p); }} disabled={p.stock === 0}
                      className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${added === p._id ? 'bg-green-600 text-white' : p.stock === 0 ? 'bg-white/5 text-gray-700 cursor-not-allowed border border-white/5' : 'bg-white/5 text-white hover:bg-indigo-600 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-900/40 border border-white/10'}`}>
                      {added === p._id ? <><Check className="w-4 h-4" /> Agregado</> : <><ShoppingCart className="w-4 h-4" /> Comprar Ahora</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-24"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <ProductsContent />
    </Suspense>
  );
}
