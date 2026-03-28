'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/ui/AdminLayout';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '@/lib/api';
import { Plus, Trash2, Tag, Check, X, ToggleLeft, ToggleRight } from 'lucide-react';

interface Coupon {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  discount: number;
  minOrderAmount: number;
  maxUses: number;
  usedCount: number;
  active: boolean;
  expiresAt?: string;
  createdAt: string;
}

const EMPTY_FORM = {
  code: '',
  type: 'percentage' as 'percentage' | 'fixed',
  discount: '',
  minOrderAmount: '',
  maxUses: '',
  expiresAt: '',
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try { setCoupons(await getCoupons()); } catch { setCoupons([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createCoupon({
        code: form.code.toUpperCase().trim(),
        type: form.type,
        discount: Number(form.discount),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
        maxUses: form.maxUses ? Number(form.maxUses) : 0,
        expiresAt: form.expiresAt || undefined,
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al crear cupón');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (c: Coupon) => {
    try {
      await updateCoupon(c._id, { active: !c.active });
      setCoupons(prev => prev.map(x => x._id === c._id ? { ...x, active: !c.active } : x));
    } catch { /* noop */ }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este cupón?')) return;
    try {
      await deleteCoupon(id);
      setCoupons(prev => prev.filter(c => c._id !== id));
    } catch { /* noop */ }
  };

  return (
    <AdminLayout title="Cupones de Descuento">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-gray-400 text-sm">{coupons.length} cupón{coupons.length !== 1 ? 'es' : ''} registrado{coupons.length !== 1 ? 's' : ''}</p>
          <button onClick={() => setShowForm(p => !p)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors">
            <Plus className="w-4 h-4" /> Nuevo Cupón
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <form onSubmit={handleCreate} className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2"><Tag className="w-4 h-4 text-indigo-400" /> Crear Cupón</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Código *</label>
                <input required value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder="DESCUENTO20" className="input-admin" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Tipo *</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as 'percentage' | 'fixed' }))}
                  className="input-admin">
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="fixed">Fijo ($)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  Descuento * {form.type === 'percentage' ? '(%)' : '($)'}
                </label>
                <input required type="number" min="0" step="0.01" value={form.discount}
                  onChange={e => setForm(p => ({ ...p, discount: e.target.value }))}
                  placeholder={form.type === 'percentage' ? '20' : '10'}
                  className="input-admin" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Monto mínimo ($)</label>
                <input type="number" min="0" step="0.01" value={form.minOrderAmount}
                  onChange={e => setForm(p => ({ ...p, minOrderAmount: e.target.value }))}
                  placeholder="0" className="input-admin" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Usos máximos (0 = ilimitado)</label>
                <input type="number" min="0" value={form.maxUses}
                  onChange={e => setForm(p => ({ ...p, maxUses: e.target.value }))}
                  placeholder="0" className="input-admin" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Fecha de expiración (opcional)</label>
                <input type="date" value={form.expiresAt}
                  onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))}
                  className="input-admin" />
              </div>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-60">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                Guardar
              </button>
              <button type="button" onClick={() => { setShowForm(false); setError(''); setForm(EMPTY_FORM); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-sm transition-colors">
                <X className="w-4 h-4" /> Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Coupons table */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Tag className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No hay cupones creados aún.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-800/60 text-left">
                  {['Código', 'Tipo', 'Descuento', 'Mín. Orden', 'Usos', 'Expira', 'Estado', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {coupons.map(c => (
                  <tr key={c._id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-white bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-lg text-xs">
                        {c.code}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {c.type === 'percentage' ? 'Porcentaje' : 'Fijo'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-green-400">
                      {c.type === 'percentage' ? `${c.discount}%` : `$${c.discount}`}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {c.minOrderAmount > 0 ? `$${c.minOrderAmount}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {c.usedCount}{c.maxUses > 0 ? `/${c.maxUses}` : ''}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('es-CL') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggle(c)} title={c.active ? 'Desactivar' : 'Activar'}
                        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${c.active ? 'text-green-400 hover:text-green-300' : 'text-gray-600 hover:text-gray-400'}`}>
                        {c.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        {c.active ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(c._id)}
                        className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .input-admin {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 14px;
          color: white;
          outline: none;
          transition: border-color 0.15s;
        }
        .input-admin:focus {
          border-color: rgb(99,102,241);
        }
        .input-admin::placeholder {
          color: rgb(75,85,99);
        }
      `}</style>
    </AdminLayout>
  );
}
