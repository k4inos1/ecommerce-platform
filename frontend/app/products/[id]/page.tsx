import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductClient } from './ProductClient';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function getProduct(id: string) {
  const res = await fetch(`${API}/api/products/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await getProduct(params.id);
  if (!product) return { title: 'Producto no encontrado' };

  return {
    title: `${product.name} | TechStore Premium`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.image || 'https://techstore-placeholder.com/og.png'],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: [product.image || 'https://techstore-placeholder.com/og.png'],
    },
  };
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  if (!product) notFound();

  return <ProductClient product={product} />;
}
