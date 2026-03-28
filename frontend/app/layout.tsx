import type { Metadata } from 'next';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { Navbar } from '@/components/ui/Navbar';
import { SupportChat } from '@/components/ui/SupportChat';
import './globals.css';

export const metadata: Metadata = {
  title: 'TechStore — Tecnología Premium',
  description: 'Los mejores productos tech con envío express, garantía extendida y pagos seguros.',
  keywords: 'laptops, phones, audio, tablets, wearables, tech, ecommerce',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">
        <CartProvider>
          <WishlistProvider>
            <Navbar />
            <main className="relative z-10 pt-16">
              {children}
            </main>
            <footer className="relative z-10 mt-24 border-t border-white/[0.05] py-10">
              <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">© 2025 TechStore. Todos los derechos reservados.</div>
                <div className="flex gap-6 text-sm text-gray-600">
                  <a href="#" className="hover:text-gray-400 transition-colors">Privacidad</a>
                  <a href="#" className="hover:text-gray-400 transition-colors">Términos</a>
                  <a href="#" className="hover:text-gray-400 transition-colors">Contacto</a>
                </div>
              </div>
            </footer>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
