'use client';

import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { items, removeItem, updateQty, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-6">🛒</div>
        <h2 className="text-2xl font-bold text-white mb-3">Tu carrito está vacío</h2>
        <p className="text-gray-400 mb-8">Agrega productos para comenzar tu compra.</p>
        <Link href="/products" className="btn-primary inline-block">Ver Productos</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
        <ShoppingBag className="w-7 h-7" /> Tu Carrito
      </h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Items */}
        <div className="md:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className="card p-4 flex items-center gap-4">
              <div className="text-3xl shrink-0">{item.image}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white text-sm">{item.name}</div>
                <div className="text-brand font-bold">${item.price.toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQty(item.id, item.quantity - 1)}
                  className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center text-sm font-mono text-white">{item.quantity}</span>
                <button onClick={() => updateQty(item.id, item.quantity + 1)}
                  className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <div className="text-white font-semibold w-20 text-right text-sm">
                ${(item.price * item.quantity).toLocaleString()}
              </div>
              <button onClick={() => removeItem(item.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button onClick={clearCart} className="text-xs text-gray-500 hover:text-red-400 transition-colors">
            Vaciar carrito
          </button>
        </div>

        {/* Summary */}
        <div className="card p-6 h-fit space-y-4">
          <h3 className="font-bold text-white text-lg">Resumen</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span>
              <span>${total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Envío</span>
              <span className="text-green-400">{total >= 99 ? 'Gratis' : '$9.99'}</span>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-4 flex justify-between font-bold text-white">
            <span>Total</span>
            <span className="text-brand text-lg">${(total >= 99 ? total : total + 9.99).toLocaleString()}</span>
          </div>
          <Link href="/checkout" className="btn-primary block text-center w-full">
            Proceder al Pago
          </Link>
          <Link href="/products" className="block text-center text-sm text-gray-500 hover:text-gray-300 transition-colors">
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
