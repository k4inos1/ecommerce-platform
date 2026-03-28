'use client';

import Link from 'next/link';
import { ShoppingCart, Menu, X, Zap, User, Package, LogOut, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useState, useEffect, useRef } from 'react';

export function Navbar() {
  const { items } = useCart();
  const { wishlistIds } = useWishlist();
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const name = localStorage.getItem('userName');
    const token = localStorage.getItem('userToken');
    if (name && token) setUserName(name);
    // Listen for login/logout events
    const handler = () => {
      const n = localStorage.getItem('userName');
      const t = localStorage.getItem('userToken');
      setUserName(n && t ? n : null);
    };
    window.addEventListener('storage', handler);
    window.addEventListener('authchange', handler);
    return () => { window.removeEventListener('storage', handler); window.removeEventListener('authchange', handler); };
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => { if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    setUserName(null);
    setUserMenuOpen(false);
    window.dispatchEvent(new Event('authchange'));
  };

  const navLinks = [
    { href: '/products', label: 'Productos' },
    { href: '/products?category=Laptops', label: 'Laptops' },
    { href: '/products?category=Audio', label: 'Audio' },
  ];

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#080810]/80 backdrop-blur-xl border-b border-white/[0.06]' : 'bg-transparent'}`}>
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/50 group-hover:bg-indigo-500 transition-colors">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-white text-base tracking-tight">TechStore</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              {l.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          <Link href="/cart" className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all">
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Carrito</span>
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                {count}
              </span>
            )}
          </Link>

          {/* User menu */}
          {userName ? (
            <div className="relative" ref={userMenuRef}>
              <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline max-w-[100px] truncate">{userName.split(' ')[0]}</span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#0f0f1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                  <Link href="/profile" onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                    <User className="w-4 h-4 text-emerald-400" /> Mi Perfil
                  </Link>
                  <div className="h-px bg-white/[0.06]" />
                  <Link href="/mis-ordenes" onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                    <Package className="w-4 h-4 text-indigo-400" /> Mis Órdenes
                  </Link>
                  <div className="h-px bg-white/[0.06]" />
                  <Link href="/wishlist" onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                    <Heart className="w-4 h-4 text-pink-400" />
                    Favoritos
                    {wishlistIds.size > 0 && (
                      <span className="ml-auto bg-pink-500/20 text-pink-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-pink-500/30">
                        {wishlistIds.size}
                      </span>
                    )}
                  </Link>
                  <div className="h-px bg-white/[0.06]" />
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                    <LogOut className="w-4 h-4" /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all">
              <User className="w-4 h-4" /> Entrar
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#080810]/95 backdrop-blur-xl border-b border-white/5 px-4 pb-4">
          {[...navLinks, ...(userName ? [{ href: '/profile', label: 'Mi Perfil' }, { href: '/mis-ordenes', label: 'Mis Órdenes' }, { href: '/wishlist', label: 'Favoritos' }] : [{ href: '/login', label: 'Iniciar Sesión' }])].map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
              className="block py-3 text-sm text-gray-400 hover:text-white border-b border-white/5 last:border-0 transition-colors">
              {l.label}
            </Link>
          ))}
          {userName && (
            <button onClick={() => { handleLogout(); setMenuOpen(false); }}
              className="block w-full text-left py-3 text-sm text-red-400 transition-colors">
              Cerrar sesión
            </button>
          )}
        </div>
      )}
    </header>
  );
}
