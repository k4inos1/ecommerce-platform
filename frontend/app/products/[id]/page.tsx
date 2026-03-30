import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductClient } from './ProductClient';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  stock: number;
}

async function fetchProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API}/api/products/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await fetchProduct(params.id);
  if (!product) {
    return { title: 'Producto no encontrado — TechStore' };
  }
  const description = product.description
    ? product.description.slice(0, 160)
    : `${product.name} — disponible en TechStore. Precio: $${product.price.toLocaleString()}.`;
  const imageUrl = product.image?.startsWith('http') ? product.image : undefined;

  return {
    title: `${product.name} — TechStore`,
    description,
    openGraph: {
      title: `${product.name} — TechStore`,
      description,
      type: 'website',
      ...(imageUrl ? { images: [{ url: imageUrl, alt: product.name }] } : {}),
    },
  };
}

export default async function ProductDetail({ params }: { params: { id: string } }) {
  const product = await fetchProduct(params.id);
  if (!product) notFound();
  return <ProductClient product={product} />;
}

