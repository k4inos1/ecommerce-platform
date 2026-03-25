'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct, deleteProduct, getProducts, getToken, updateProduct } from '@/lib/api';
import { AdminLayout } from '@/components/ui/AdminLayout';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';

interface Product { _id: string; name: string; description: string; price: number; stock: number; category: string; image: string }

const EMPTY: Omit<Product, '_id'> = { name: '', description: '', price: 0, stock: 0, category: '', image: '' };
const CATEGORIES = ['Laptops', 'Phones', 'Audio', 'Tablets', 'Wearables', 'Monitors', 'Accessories'];

export default function AdminProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    try {
      const data = await getProducts({ page: 1 });
      setProducts(data.products || []);
    } catch { router.push('/admin/login'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (!getToken()) { router.push('/admin/login'); return; } fetchProducts(); }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY); setShowForm(true); setError(''); };
  const openEdit = (p: Product) => { setEditing(p); setForm({ name: p.name, description: p.description, price: p.price, stock: p.stock, category: p.category, image: p.image }); setShowForm(true); setError(''); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) { await updateProduct(editing._id, form); }
      else { await createProduct(form); }
      await fetchProducts();
      setShowForm(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return;
    setDeleting(id);
    try { await deleteProduct(id); await fetchProducts(); }
    catch { setError('Error al eliminar'); }
    finally { setDeleting(null); }
  };

  return (
    <AdminLayout title="Productos">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-gray-400 text-sm">{products.length} producto{products.length !== 1 ? 's' : ''} en total</p>
          <button onClick={openNew} className="btn-primary text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nuevo Producto
          </button>
        </div>

        {/* Product Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <h2 className="font-bold text-white">{editing ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                {[
                  { label: 'Nombre', key: 'name', type: 'text', placeholder: 'MacBook Pro M3' },
                  { label: 'Descripción', key: 'description', type: 'text', placeholder: 'Descripción del producto...' },
                  { label: 'Imagen URL', key: 'image', type: 'url', placeholder: 'https://...' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
                    <input required type={f.type} placeholder={f.placeholder}
                      value={form[f.key as keyof typeof form]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-brand focus:outline-none" />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Precio ($)</label>
                    <input required type="number" min="0" step="0.01" placeholder="999"
                      value={form.price} onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-brand focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Stock</label>
                    <input required type="number" min="0" placeholder="10"
                      value={form.stock} onChange={e => setForm(p => ({ ...p, stock: Number(e.target.value) }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-brand focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Categoría</label>
                  <select required value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-brand focus:outline-none">
                    <option value="">Seleccionar...</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {error && <p className="text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-800 text-white py-2.5 rounded-xl text-sm hover:bg-gray-700 transition-colors">Cancelar</button>
                  <button type="submit" disabled={saving} className="flex-1 btn-primary text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                    <Check className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-24"><div className="animate-spin w-8 h-8 border-2 border-brand border-t-transparent rounded-full" /></div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-900 border-b border-gray-800 text-xs uppercase text-gray-500 font-mono">
                <tr>
                  <th className="p-4 text-left">Producto</th>
                  <th className="p-4 text-left">Categoría</th>
                  <th className="p-4 text-right">Precio</th>
                  <th className="p-4 text-right">Stock</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {products.map(p => (
                  <tr key={p._id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-white">{p.name}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">{p.description}</div>
                    </td>
                    <td className="p-4"><span className="px-2 py-1 bg-brand/10 text-brand text-xs rounded-full border border-brand/20">{p.category}</span></td>
                    <td className="p-4 text-right font-mono text-white">${p.price.toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <span className={`font-mono text-sm ${p.stock === 0 ? 'text-red-400' : p.stock < 5 ? 'text-yellow-400' : 'text-green-400'}`}>{p.stock}</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(p)} className="p-2 text-gray-500 hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(p._id)} disabled={deleting === p._id} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={5} className="p-12 text-center text-gray-500">No hay productos. Crea el primero 👆</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
