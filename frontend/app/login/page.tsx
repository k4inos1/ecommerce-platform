'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const f = (key: keyof typeof form, v: string) => setForm(p => ({ ...p, [key]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error de autenticación');

      localStorage.setItem('userToken', data.token);
      localStorage.setItem('userName', data.name || form.name);
      localStorage.setItem('userEmail', data.email || form.email);

      // Redirect to previous page or home
      const returnTo = new URLSearchParams(window.location.search).get('return') || '/';
      router.push(returnTo);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5">
            <User className="w-7 h-7 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white">
            {mode === 'login' ? 'Bienvenido de vuelta' : 'Crear cuenta'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {mode === 'login' ? 'Inicia sesión para ver tus órdenes' : 'Regístrate para comprar'}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex bg-white/[0.03] border border-white/[0.07] rounded-xl p-1 mb-6">
          {(['login', 'register'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === m ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
              {m === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {mode === 'register' && (
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Nombre completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input required value={form.name} onChange={e => f('name', e.target.value)}
                  placeholder="Ricardo Sanhueza" type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none" />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input required value={form.email} onChange={e => f('email', e.target.value)}
                placeholder="correo@email.com" type="email"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input required value={form.password} onChange={e => f('password', e.target.value)}
                placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
                type={showPass ? 'text' : 'password'} minLength={6}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base mt-2 disabled:opacity-50">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : (
              <>{mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'} <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-4">
          ¿Problema para acceder? <Link href="/" className="text-indigo-400 hover:underline">Volver al inicio</Link>
        </p>
      </div>
    </div>
  );
}
