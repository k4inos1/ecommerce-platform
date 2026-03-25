'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { getProducts } from '@/lib/api';
import { useCart } from '@/context/CartContext';

interface Product { _id: string; name: string; price: number; image: string; category: string; description: string; stock: number }

const CATEGORIES = ['All', 'Laptops', 'Phones', 'Audio', 'Tablets', 'Wearables', 'Monitors', 'Accessories'];

// Fallback emoji per category when no image URL is provided
const EMOJI: Record<string, string> = { Laptops: '💻', Phones: '📱', Audio: '🎧', Tablets: '🖥️', Wearables: '⌚', Monitors: '🖵', Accessories: '🔧' };

export default function ProductsPage() {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [added, setAdded] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getProducts({ search, category })
      .then(data => setProducts(data.products || []))
      .catch(() => setError('No se pudo conectar al servidor. Asegúrate de que el backend está corriendo.'))
      .finally(() => setLoading(false));
  }, [search, category]);

  const handleAdd = (p: Product) => {
    addItem({ id: p._id, name: p.name, price: p.price, image: p.image || EMOJI[p.category] || '📦' });
    setAdded(p._id);
    setTimeout(() => setAdded(null), 1200);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Todos los Productos</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:border-brand focus:outline-none" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${category === c ? 'bg-brand text-white' : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="card p-6 text-yellow-400 text-sm mb-6">⚠️ {error}</div>}

      {loading ? (
        <div className="flex justify-center py-24"><div className="animate-spin w-8 h-8 border-2 border-brand border-t-transparent rounded-full" /></div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-6">{products.length} producto{products.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(p => (
              <div key={p._id} className="card group hover:border-brand/50 hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <Link href={`/products/${p._id}`} className="p-6 text-center flex-1">
                  {p.image && p.image.startsWith('http') ? (
                    <img src={p.image} alt={p.name} className="w-full h-28 object-cover rounded-lg mb-3" />
                  ) : (
                    <div className="text-4xl mb-3">{EMOJI[p.category] || '📦'}</div>
                  )}
                  <div className="text-xs text-gray-500 mb-1">{p.category}</div>
                  <div className="font-semibold text-white text-sm mb-1">{p.name}</div>
                  <div className="text-xs text-gray-500 mb-3 line-clamp-2">{p.description}</div>
                  <div className="text-brand font-bold text-lg">${p.price.toLocaleString()}</div>
                  <div className="text-xs text-gray-600 mt-1">Stock: {p.stock}</div>
                </Link>
                <div className="p-4 pt-0">
                  <button onClick={() => handleAdd(p)}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${added === p._id ? 'bg-green-600 text-white' : 'bg-brand text-white hover:bg-brand-dark'}`}>
                    {added === p._id ? '✓ Agregado' : '+ Agregar al Carrito'}
                  </button>
                </div>
              </div>
            ))}
            {products.length === 0 && !loading && (
              <div className="col-span-full text-center py-16 text-gray-500">
                No se encontraron productos.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
