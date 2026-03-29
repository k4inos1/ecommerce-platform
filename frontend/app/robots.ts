import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://ecommerce-platform-frontend-three.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/products', '/products/*'],
        disallow: ['/admin/', '/profile', '/checkout', '/cart', '/wishlist', '/mis-ordenes'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
