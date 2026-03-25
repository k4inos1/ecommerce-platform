import type { Metadata } from 'next';
import { CartProvider } from '@/context/CartContext';
import { Navbar } from '@/components/ui/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'TechStore | E-Commerce Platform',
  description: 'Tienda online de tecnología - React, Next.js, MongoDB',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth">
      <body>
        <CartProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <footer className="border-t border-gray-800 py-8 text-center text-sm text-gray-500 mt-16">
            © 2025 TechStore · Desarrollado por <span className="text-brand">Ricardo Sanhueza</span>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
