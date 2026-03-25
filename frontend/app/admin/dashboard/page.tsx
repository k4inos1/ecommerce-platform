'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getOrders, getProducts, getToken } from '@/lib/api';
import { AdminLayout } from '@/components/ui/AdminLayout';
import { Package, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) { router.push('/admin/login'); return; }
    Promise.all([getProducts(), getOrders()])
      .then(([pData, orders]) => {
        const revenue = orders.reduce((s: number, o: { totalAmount: number }) => s + o.totalAmount, 0);
        const pending = orders.filter((o: { status: string }) => o.status === 'pending').length;
        setStats({ products: pData.total, orders: orders.length, revenue, pending });
      })
      .catch(() => router.push('/admin/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const cards = [
    { label: 'Productos', value: stats.products, icon: <Package className="w-6 h-6" />, color: 'text-blue-400', bg: 'bg-blue-400/10', href: '/admin/products' },
    { label: 'Órdenes', value: stats.orders, icon: <ShoppingCart className="w-6 h-6" />, color: 'text-green-400', bg: 'bg-green-400/10', href: '/admin/orders' },
    { label: 'Pendientes', value: stats.pending, icon: <TrendingUp className="w-6 h-6" />, color: 'text-yellow-400', bg: 'bg-yellow-400/10', href: '/admin/orders' },
    { label: 'Revenue', value: `$${stats.revenue.toLocaleString()}`, icon: <DollarSign className="w-6 h-6" />, color: 'text-brand', bg: 'bg-brand/10', href: '/admin/orders' },
  ];

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin w-8 h-8 border-2 border-brand border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {cards.map(c => (
              <Link key={c.label} href={c.href} className="card p-6 hover:border-gray-700 transition-colors">
                <div className={`inline-flex p-3 rounded-xl ${c.bg} ${c.color} mb-4`}>{c.icon}</div>
                <div className="text-2xl font-black text-white">{c.value}</div>
                <div className="text-sm text-gray-500 mt-0.5">{c.label}</div>
              </Link>
            ))}
          </div>
          <div className="card p-6">
            <h2 className="font-semibold text-white mb-4">Accesos Rápidos</h2>
            <div className="flex gap-3">
              <Link href="/admin/products" className="btn-primary text-sm inline-block">+ Nuevo Producto</Link>
              <Link href="/admin/orders" className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm hover:bg-gray-700 transition-colors">Ver Órdenes</Link>
              <Link href="/" target="_blank" className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm hover:bg-gray-700 transition-colors">Ver Tienda →</Link>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
