'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const products = [
  { id: '1', name: 'MacBook Pro M3', price: 2499, emoji: '💻', category: 'Laptops', stock: 5, description: 'El chip M3 más potente en un diseño ultradelgado.' },
  { id: '2', name: 'AirPods Pro', price: 249, emoji: '🎧', category: 'Audio', stock: 20, description: 'Cancelación activa de ruido y audio espacial.' },
  { id: '3', name: 'iPhone 15 Pro', price: 1199, emoji: '📱', category: 'Phones', stock: 8, description: 'Titanio, cámara pro y USB-C.' },
  { id: '4', name: 'iPad Air', price: 749, emoji: '🖥️', category: 'Tablets', stock: 12, description: 'Potencia M1 en formato portátil.' },
  { id: '5', name: 'Apple Watch Ultra', price: 799, emoji: '⌚', category: 'Wearables', stock: 6, description: 'El watch más robusto y preciso.' },
  { id: '6', name: 'Logitech MX Keys', price: 119, emoji: '⌨️', category: 'Accessories', stock: 30, description: 'Teclado ergonómico con retroiluminación adaptativa.' },
  { id: '7', name: 'Samsung 4K Monitor', price: 649, emoji: '🖵', category: 'Monitors', stock: 4, description: 'Panel OLED 4K a 144Hz.' },
  { id: '8', name: 'Raspberry Pi 5', price: 80, emoji: '🔧', category: 'Accessories', stock: 25, description: 'Minicomputadora para proyectos IoT y más.' },
];

const categories = ['All', 'Laptops', 'Phones', 'Audio', 'Tablets', 'Wearables', 'Monitors', 'Accessories'];

export default function ProductsPage() {
  const { addItem } = useCart();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [added, setAdded] = useState<string | null>(null);

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || p.category === category;
    return matchSearch && matchCat;
  });

  const handleAdd = (p: typeof products[0]) => {
    addItem({ id: p.id, name: p.name, price: p.price, image: p.emoji });
    setAdded(p.id);
    setTimeout(() => setAdded(null), 1200);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Todos los Productos</h1>

      {/* Search & filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:border-brand focus:outline-none" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${category === c ? 'bg-brand text-white' : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-6">{filtered.length} producto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map(p => (
          <div key={p.id} className="card group hover:border-brand/50 hover:-translate-y-1 transition-all duration-300 flex flex-col">
            <div className="p-6 text-center flex-1">
              <div className="text-4xl mb-3">{p.emoji}</div>
              <div className="text-xs text-gray-500 mb-1">{p.category}</div>
              <div className="font-semibold text-white text-sm mb-1">{p.name}</div>
              <div className="text-xs text-gray-500 mb-3 line-clamp-2">{p.description}</div>
              <div className="text-brand font-bold text-lg">${p.price.toLocaleString()}</div>
              <div className="text-xs text-gray-600 mt-1">Stock: {p.stock}</div>
            </div>
            <div className="p-4 pt-0">
              <button onClick={() => handleAdd(p)}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${added === p.id ? 'bg-green-600 text-white' : 'bg-brand text-white hover:bg-brand-dark'}`}>
                {added === p.id ? '✓ Agregado' : '+ Agregar al Carrito'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
