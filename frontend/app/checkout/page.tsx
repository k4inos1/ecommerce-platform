'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { CreditCard, Lock } from 'lucide-react';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const [form, setForm] = useState({ name: '', email: '', street: '', city: '', postal: '', country: 'Chile', card: '', expiry: '', cvv: '' });
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    // Simulate Stripe payment delay
    await new Promise(r => setTimeout(r, 2000));
    clearCart();
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-3xl font-bold text-white mb-3">¡Orden Confirmada!</h1>
        <p className="text-gray-400 mb-2">Tu pago fue procesado exitosamente por Stripe.</p>
        <p className="text-sm text-gray-500 mb-8">Recibirás un email de confirmación con los detalles del envío.</p>
        <a href="/" className="btn-primary inline-block">Volver al inicio</a>
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-6 animate-pulse">💳</div>
        <h1 className="text-2xl font-bold text-white mb-3">Procesando pago...</h1>
        <p className="text-gray-400">Por favor espera mientras Stripe verifica tu tarjeta.</p>
        <div className="mt-8 flex justify-center gap-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-3 h-3 bg-brand rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
        <Lock className="w-6 h-6 text-green-400" /> Checkout Seguro
      </h1>

      <div className="grid md:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="md:col-span-2 space-y-6">
          {/* Shipping */}
          <div className="card p-6 space-y-4">
            <h2 className="font-bold text-white">Información de Envío</h2>
            {[
              { label: 'Nombre completo', key: 'name', type: 'text', placeholder: 'Ricardo Sanhueza' },
              { label: 'Email', key: 'email', type: 'email', placeholder: 'correo@email.com' },
              { label: 'Dirección', key: 'street', type: 'text', placeholder: 'Calle 123' },
              { label: 'Ciudad', key: 'city', type: 'text', placeholder: 'Concepción' },
              { label: 'Código postal', key: 'postal', type: 'text', placeholder: '4030000' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
                <input required type={f.type} placeholder={f.placeholder}
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-brand focus:outline-none" />
              </div>
            ))}
          </div>

          {/* Payment */}
          <div className="card p-6 space-y-4">
            <h2 className="font-bold text-white flex items-center gap-2"><CreditCard className="w-4 h-4" /> Datos de Pago (Stripe)</h2>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Número de tarjeta</label>
              <input required placeholder="4242 4242 4242 4242" maxLength={19}
                value={form.card} onChange={e => setForm(p => ({ ...p, card: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-brand focus:outline-none font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Expiración</label>
                <input required placeholder="MM/AA" maxLength={5}
                  value={form.expiry} onChange={e => setForm(p => ({ ...p, expiry: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-brand focus:outline-none font-mono" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">CVV</label>
                <input required placeholder="123" maxLength={4}
                  value={form.cvv} onChange={e => setForm(p => ({ ...p, cvv: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-brand focus:outline-none font-mono" />
              </div>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1"><Lock className="w-3 h-3" /> Usa 4242 4242 4242 4242 para simular el pago (test mode)</p>
          </div>

          <button type="submit" className="btn-primary w-full text-base py-4 flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" /> Pagar ${total.toLocaleString()}
          </button>
        </form>

        {/* Order summary */}
        <div className="card p-6 h-fit space-y-3">
          <h3 className="font-bold text-white">Tu Orden</h3>
          {items.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-400 truncate">{item.image} {item.name} ×{item.quantity}</span>
              <span className="text-white shrink-0 ml-2">${(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="border-t border-gray-800 pt-3 flex justify-between font-bold text-white">
            <span>Total</span>
            <span className="text-brand">${total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
