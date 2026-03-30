'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getOrders, getProducts, getToken } from '@/lib/api';
import { Package, ShoppingCart, LayoutDashboard, LogOut, TrendingUp, Zap, MessageSquare, Ticket, Users, CreditCard } from 'lucide-react';

export function AdminLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  const navItems = [
    { href: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard' },
    { href: '/admin/analytics', icon: <TrendingUp className="w-4 h-4" />, label: 'Analytics' },
    { href: '/admin/products', icon: <Package className="w-4 h-4" />, label: 'Productos' },
    { href: '/admin/orders', icon: <ShoppingCart className="w-4 h-4" />, label: 'Órdenes' },
    { href: '/admin/payments', icon: <CreditCard className="w-4 h-4" />, label: 'Pagos' },
    { href: '/admin/coupons', icon: <Ticket className="w-4 h-4" />, label: 'Cupones' },
    { href: '/admin/users', icon: <Users className="w-4 h-4" />, label: 'Usuarios' },
    { href: '/admin/support', icon: <MessageSquare className="w-4 h-4" />, label: 'Soporte' },
    { href: '/admin/import', icon: <Zap className="w-4 h-4" />, label: 'Importar' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="text-lg font-black text-white">🛍️ <span className="text-brand">Tech</span>Store</div>
          <div className="text-xs text-gray-500 mt-0.5">Panel de Administración</div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-3">
                {item.icon} {item.label}
              </div>
              {item.label === 'Soporte' && (
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
              )}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors">
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="border-b border-gray-800 bg-gray-900/50 px-8 py-4">
          <h1 className="text-xl font-bold text-white">{title}</h1>
        </div>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
