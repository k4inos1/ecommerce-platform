'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getOrders, getToken, updateOrderStatus } from '@/lib/api';
import { AdminLayout } from '@/components/ui/AdminLayout';

interface Order { _id: string; user: { name: string; email: string }; totalAmount: number; status: string; createdAt: string; items: { name: string; quantity: number; price: number }[] }

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  paid: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  shipped: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  delivered: 'text-green-400 bg-green-400/10 border-green-400/20',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente', paid: 'Pagado', shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado',
};

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch { router.push('/admin/login'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (!getToken()) { router.push('/admin/login'); return; } fetchOrders(); }, []);

  const handleStatus = async (id: string, status: string) => {
    try {
      await updateOrderStatus(id, status);
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
    } catch { alert('Error al actualizar estado'); }
  };

  return (
    <AdminLayout title="Órdenes">
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-24"><div className="animate-spin w-8 h-8 border-2 border-brand border-t-transparent rounded-full" /></div>
        ) : orders.length === 0 ? (
          <div className="card p-12 text-center text-gray-500">No hay órdenes todavía.</div>
        ) : orders.map(order => (
          <div key={order._id} className="card overflow-hidden">
            <div className="p-5 flex flex-wrap items-center gap-4 cursor-pointer hover:bg-gray-800/40 transition-colors"
              onClick={() => setExpanded(expanded === order._id ? null : order._id)}>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white text-sm">{order.user?.name || 'Usuario'}</div>
                <div className="text-xs text-gray-500">{order.user?.email} · {new Date(order.createdAt).toLocaleDateString('es-CL')}</div>
              </div>
              <div className="font-bold text-brand font-mono">${order.totalAmount.toLocaleString()}</div>
              <div>
                <select value={order.status}
                  onChange={e => { e.stopPropagation(); handleStatus(order._id, e.target.value); }}
                  onClick={e => e.stopPropagation()}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium bg-transparent cursor-pointer ${STATUS_COLORS[order.status]}`}>
                  {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v} className="bg-gray-900 text-white">{l}</option>)}
                </select>
              </div>
            </div>
            {expanded === order._id && (
              <div className="border-t border-gray-800 p-5 bg-gray-900/50">
                <div className="text-xs text-gray-500 uppercase font-mono mb-3">Items de la Orden</div>
                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-300">{item.name} <span className="text-gray-600">×{item.quantity}</span></span>
                      <span className="text-white font-mono">${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-800 mt-3 pt-3 flex justify-between font-bold">
                  <span className="text-gray-400 text-sm">Total</span>
                  <span className="text-brand">${order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
