'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getRelatedProducts, getProduct as getProductApi } from '@/lib/api';
import { ReviewSection } from '@/components/ui/ReviewSection';
import { ProductClient } from './ProductClient';

interface Product { 
  _id: string; 
  name: string; 
  price: number; 
  image: string; 
  category: string; 
  description: string; 
  stock: number 
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getProductApi(params.id)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
      <p className="text-gray-500 font-medium animate-pulse">Cargando producto...</p>
    </div>
  );

  if (!product) return (
    <div className="max-w-2xl mx-auto px-4 py-32 text-center">
      <div className="text-6xl mb-6 grayscale opacity-20">🔍</div>
      <h1 className="text-4xl font-display font-black text-white mb-4">Producto no encontrado</h1>
      <p className="text-gray-400 mb-8 max-w-sm mx-auto">Parece que el producto que buscas no existe o ha sido movido.</p>
      <Link href="/products" className="btn-primary inline-flex items-center gap-2 px-8 py-4">
        <ArrowLeft className="w-4 h-4" /> Volver al catálogo
      </Link>
    </div>
  );

  return <ProductClient product={product} />;
}
