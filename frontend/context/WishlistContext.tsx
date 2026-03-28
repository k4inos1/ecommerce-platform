'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getWishlist, addToWishlist, removeFromWishlist, getUserToken } from '@/lib/api';

interface WishlistProduct {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  description: string;
}

interface WishlistContextType {
  wishlistIds: Set<string>;
  wishlistItems: WishlistProduct[];
  toggle: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  loading: boolean;
  refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const wishlistIds = new Set(wishlistItems.map(p => p._id));

  const refresh = useCallback(async () => {
    if (!getUserToken()) { setWishlistItems([]); return; }
    try {
      setLoading(true);
      const items = await getWishlist();
      setWishlistItems(items);
    } catch {
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener('authchange', handler);
    return () => window.removeEventListener('authchange', handler);
  }, [refresh]);

  const toggle = async (productId: string) => {
    if (!getUserToken()) {
      window.location.href = '/login';
      return;
    }
    try {
      if (wishlistIds.has(productId)) {
        await removeFromWishlist(productId);
        setWishlistItems(prev => prev.filter(p => p._id !== productId));
      } else {
        const data = await addToWishlist(productId);
        setWishlistItems(data.wishlist || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isInWishlist = (id: string) => wishlistIds.has(id);

  return (
    <WishlistContext.Provider value={{ wishlistIds, wishlistItems, toggle, isInWishlist, loading, refresh }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
};
