'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Star, Shield, Truck, RotateCcw, Plus, Minus } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const catalog: Record<string, { id: string; name: string; price: number; emoji: string; category: string; stock: number; description: string; features: string[]; rating: number; reviews: number }> = {
  '1': { id: '1', name: 'MacBook Pro M3', price: 2499, emoji: '💻', category: 'Laptops', stock: 5, description: 'El MacBook Pro más potente de la historia, con el revolucionario chip M3 que ofrece un rendimiento sin precedentes. Hasta 22 horas de batería, pantalla Liquid Retina XDR de 14 pulgadas y un diseño ultradelgado.', features: ['Chip Apple M3 Pro', 'Pantalla 14" Liquid Retina XDR', 'Hasta 22 horas de batería', 'SSD de hasta 8 TB', 'Compatible con Thunderbolt 4'], rating: 4.9, reviews: 324 },
  '2': { id: '2', name: 'AirPods Pro', price: 249, emoji: '🎧', category: 'Audio', stock: 20, description: 'Cancelación activa de ruido de última generación con chip H2. Audio espacial personalizado, estuche con altavoz USB-C y hasta 30 horas de escucha en total.', features: ['Cancelación activa de ruido', 'Audio espacial adaptativo', 'Chip Apple H2', 'Resistencia IP54', 'Carga USB-C'], rating: 4.7, reviews: 892 },
  '3': { id: '3', name: 'iPhone 15 Pro', price: 1199, emoji: '📱', category: 'Phones', stock: 8, description: 'El primer iPhone con diseño en titanio aeroespacial. Cámara pro de 48 MP, puerto USB-C y el chip A17 Pro para gaming y IA de nivel profesional.', features: ['Titanio aeroespacial grado 5', 'Cámara principal 48 MP', 'Chip A17 Pro', 'USB-C con hasta 10 Gb/s', 'Action Button personalizable'], rating: 4.8, reviews: 1207 },
  '4': { id: '4', name: 'iPad Air', price: 749, emoji: '🖥️', category: 'Tablets', stock: 12, description: 'El iPad Air ofrece el potente chip M1 en un diseño ultradelgado de 10.9 pulgadas, compatible con Apple Pencil y el Magic Keyboard.', features: ['Chip Apple M1', 'Pantalla Liquid Retina 10.9"', 'Compatible con Apple Pencil', 'Touch ID integrado', 'Wi-Fi 6'], rating: 4.6, reviews: 546 },
  '5': { id: '5', name: 'Apple Watch Ultra', price: 799, emoji: '⌚', category: 'Wearables', stock: 6, description: 'El smartwatch más robusto y avanzado de Apple. Diseñado para expediciones extremas con una caja de titanio de 49mm, GPS de doble frecuencia y hasta 60 horas de batería.', features: ['Caja titanio 49mm', 'GPS de doble frecuencia L1 y L5', 'Hasta 60h de batería', 'Resistencia al agua 100m', 'Sensor temperatura corporal'], rating: 4.8, reviews: 183 },
  '6': { id: '6', name: 'Logitech MX Keys', price: 119, emoji: '⌨️', category: 'Accessories', stock: 30, description: 'Teclado inalámbrico premium con retroiluminación adaptativa por tecla. Conectividad con hasta 3 dispositivos y 10 días de batería con retroiluminación.', features: ['Retroiluminación adaptativa', 'Conexión multidispositivo (x3)', 'USB-C recargable', '10 días de batería con luz', 'Compatible Windows y macOS'], rating: 4.5, reviews: 1089 },
  '7': { id: '7', name: 'Samsung 4K Monitor', price: 649, emoji: '🖵', category: 'Monitors', stock: 4, description: 'Panel OLED 4K de ultra baja latencia a 144Hz. Colores perfectos, negros absolutos y diseño sin marcos. La pantalla ideal para creativos y gamers profesionales.', features: ['Panel OLED 4K a 144Hz', 'Negros absolutos perfectos', 'Baja latencia 0.1ms', 'USB-C con 90W Power Delivery', 'G-Sync y FreeSync Premium'], rating: 4.7, reviews: 267 },
  '8': { id: '8', name: 'Raspberry Pi 5', price: 80, emoji: '🔧', category: 'Accessories', stock: 25, description: 'La nueva generación de la mítica minicomputadora. 2-3x más rápida que la Pi 4, con 4GB o 8GB de RAM, conector PCIe y un nuevo chip de E/S RP1 diseñado por Raspberry Pi.', features: ['CPU ARM Cortex-A76 de 2.4GHz', 'Hasta 8 GB RAM LPDDR4X', 'Conector PCIe 2.0', 'Doble pantalla 4K a 60fps', 'Puerto de cámara y pantalla CSI/DSI'], rating: 4.9, reviews: 412 },
};

export default function ProductDetail({ params }: { params: { id: string } }) {
  const product = catalog[params.id];
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="text-2xl font-bold text-white mb-4">Producto no encontrado</h1>
        <Link href="/products" className="btn-primary inline-block">Ver todos los productos</Link>
      </div>
    );
  }

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) {
      addItem({ id: product.id, name: product.name, price: product.price, image: product.emoji });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Link href="/products" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Volver a productos
      </Link>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Left — Product visual */}
        <div className="space-y-4">
          <div className="card aspect-square flex items-center justify-center">
            <span className="text-[10rem] select-none">{product.emoji}</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card aspect-square flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                <span className="text-4xl">{product.emoji}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Info */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-mono text-brand bg-brand/10 px-3 py-1 rounded-full border border-brand/20">{product.category}</span>
            <h1 className="text-3xl font-black text-white mt-3">{product.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}`} />
                ))}
              </div>
              <span className="text-sm text-gray-400">{product.rating} ({product.reviews} reseñas)</span>
            </div>
          </div>

          <div className="text-4xl font-black text-brand">${product.price.toLocaleString()}</div>
          <p className="text-gray-400 leading-relaxed">{product.description}</p>

          {/* Features */}
          <div className="card p-4 space-y-2">
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-3">Características</div>
            {product.features.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-brand text-xs">✓</span> {f}
              </div>
            ))}
          </div>

          {/* Stock */}
          <div className={`text-sm font-medium ${product.stock > 5 ? 'text-green-400' : 'text-yellow-400'}`}>
            {product.stock > 5 ? `✅ En stock (${product.stock} disponibles)` : `⚠️ ¡Últimas ${product.stock} unidades!`}
          </div>

          {/* Qty + Add */}
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
    </div>
  );
}
