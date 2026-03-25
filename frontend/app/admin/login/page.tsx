'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api';
import { Lock, ShoppingBag } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@techstore.cl');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await login(email, password);
      if (data.user.role !== 'admin') throw new Error('Se requieren permisos de administrador');
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));
      router.push('/admin/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand/10 border border-brand/30 rounded-2xl mb-4">
            <ShoppingBag className="w-8 h-8 text-brand" />
          </div>
          <h1 className="text-2xl font-black text-white">Panel Administrativo</h1>
          <p className="text-gray-500 text-sm mt-1">TechStore — Acceso restringido</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:border-brand focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Contraseña</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:border-brand focus:outline-none" />
            </div>
            {error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
              <Lock className="w-4 h-4" />
              {loading ? 'Autenticando...' : 'Ingresar al Panel'}
            </button>
          </form>
          <p className="text-center text-xs text-gray-600 mt-4">
            Demo: <span className="text-gray-400 font-mono">admin@techstore.cl / admin123456</span>
          </p>
        </div>
      </div>
    </div>
  );
}
