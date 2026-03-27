'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, ShoppingCart, Check, Star, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchParams, useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const CATEGORIES = ['All', 'Laptops', 'Phones', 'Audio', 'Tablets', 'Wearables', 'Monitors', 'Accessories'];
const EMOJI: Record<string, string> = { Laptops: '💻', Phones: '📱', Audio: '🎧', Tablets: '🖥️', Wearables: '⌚', Monitors: '🖵', Accessories: '🔧' };
const PRICE_PRESETS = [
  { label: '< $100', min: '', max: '100' },
  { label: '$100–500', min: '100', max: '500' },
  { label: '> $500', min: '500', max: '' },
];

interface Product { _id: string; name: string; price: number; image: string; category: string; description: string; stock: number; supplierPrice?: number }

function ProductsContent() {
  const { addItem } = useCart();
  const router = useRouter();
  const params = useSearchParams();

  const [search, setSearch] = useState(params.get('q') || '');
  const [category, setCategory] = useState(params.get('category') || 'All');
  const [sort, setSort] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [added, setAdded] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 400);
  const debouncedMin = useDebounce(minPrice, 500);
  const debouncedMax = useDebounce(maxPrice, 500);

  const hasActiveFilters = minPrice !== '' || maxPrice !== '';

  const clearPriceFilters = () => { setMinPrice(''); setMaxPrice(''); };

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="section-label mb-1">Catálogo</p>
          <h1 className="text-3xl font-display font-bold text-white">Todos los Productos</h1>
        </div>
        {!loading && <p className="text-sm text-gray-500">{total} resultado{total !== 1 ? 's' : ''}</p>}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            {loading && search && <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />}
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar productos..."
              className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none transition-colors" />
          </div>
          {/* Filters toggle */}
          <button onClick={() => setShowFilters(p => !p)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${showFilters || hasActiveFilters ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/[0.03] border-white/[0.07] text-gray-400 hover:text-white hover:border-white/20'}`}>
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filtros</span>
            {hasActiveFilters && <span className="w-2 h-2 bg-white rounded-full" />}
          </button>
          {/* Sort */}
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="bg-white/[0.03] border border-white/[0.07] rounded-xl px-3 py-3 text-sm text-gray-300 focus:border-indigo-500 focus:outline-none">
            <option value="newest">Más recientes</option>
            <option value="price-asc">Precio ↑</option>
            <option value="price-desc">Precio ↓</option>
          </select>
        </div>

        {/* Price range panel */}
        {showFilters && (
          <div className="card p-4 flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 uppercase font-mono mb-3 flex items-center justify-between">
                Rango de precio
                {hasActiveFilters && (
                  <button onClick={clearPriceFilters} className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors normal-case font-normal">
                    <X className="w-3 h-3" /> Limpiar
                  </button>
                )}
              </p>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input
                    type="number" min="0" placeholder="Mín"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl pl-7 pr-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
                <span className="text-gray-600 shrink-0">—</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input
                    type="number" min="0" placeholder="Máx"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl pl-7 pr-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {PRICE_PRESETS.map(r => (
                <button key={r.label} onClick={() => { setMinPrice(r.min); setMaxPrice(r.max); }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${minPrice === r.min && maxPrice === r.max ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/[0.03] border-white/[0.07] text-gray-400 hover:text-white hover:border-white/20'}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${category === c ? 'bg-indigo-600 text-white shadow shadow-indigo-900/40' : 'bg-white/[0.03] border border-white/[0.07] text-gray-400 hover:text-white hover:border-white/20'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="card p-5 text-yellow-400 text-sm mb-6 border-yellow-500/20 bg-yellow-500/5">⚠️ {error}</div>}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="aspect-square rounded-xl bg-white/[0.03] mb-4" />
              <div className="h-3 bg-white/[0.03] rounded mb-2 w-2/3" />
              <div className="h-4 bg-white/[0.03] rounded mb-3" />
              <div className="h-6 bg-white/[0.03] rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <div className="text-4xl mb-4">🔍</div>
          <p className="font-medium text-white mb-1">Sin resultados{debouncedSearch ? ` para "${debouncedSearch}"` : ''}</p>
          <p className="text-sm">Intenta con otra categoría{hasActiveFilters ? ', ajusta el rango de precio' : ''} o término de búsqueda.</p>
          {hasActiveFilters && (
            <button onClick={clearPriceFilters} className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              Quitar filtro de precio
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {sorted.map(p => (
            <div key={p._id} className="card group hover:border-indigo-500/30 hover:-translate-y-1 transition-all duration-200 flex flex-col">
              <Link href={`/products/${p._id}`} className="flex flex-col flex-1 p-4">
                {/* Image */}
                <div className="aspect-square rounded-xl bg-white/[0.03] overflow-hidden flex items-center justify-center mb-4">
                  {p.image?.startsWith('http') ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <span className="text-4xl">{EMOJI[p.category] || '📦'}</span>
                  )}
                </div>
                <div className="text-[11px] text-gray-500 mb-1 flex items-center justify-between">
                  <span>{p.category}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />)}
                  </div>
                </div>
                <div className="font-medium text-white text-sm leading-snug mb-2 line-clamp-2 group-hover:text-indigo-300 transition-colors">{p.name}</div>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-indigo-400 font-bold text-lg">${p.price.toLocaleString()}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.stock > 0 ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {p.stock > 0 ? `${p.stock} disp.` : 'Agotado'}
                  </span>
                </div>
              </Link>
              <div className="p-3 pt-0">
                <button onClick={() => handleAdd(p)} disabled={p.stock === 0}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${added === p._id ? 'bg-green-600 text-white' : p.stock === 0 ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/30'}`}>
                  {added === p._id ? <><Check className="w-4 h-4" /> Agregado</> : <><ShoppingCart className="w-4 h-4" /> Agregar</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
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
