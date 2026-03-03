import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CartItem, Product } from '@/data/mockData';
import { cartApi } from '@/lib/api';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, size: string, color: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper — normalise a backend cart item to our local CartItem shape
function normaliseApiItem(apiItem: { product: { _id: string; name: string; image?: string; price: number }; quantity: number; selectedSize?: string; selectedColor?: string }): CartItem {
  return {
    product: {
      id: apiItem.product._id,
      _id: apiItem.product._id,
      name: apiItem.product.name,
      image: apiItem.product.image ?? '',
      price: apiItem.product.price,
      // defaults for fields not returned by cart endpoint
      category: '',
      brand: '',
      description: '',
      sizes: [],
      colors: [],
      compatibleBikes: [],
      specifications: {},
      rating: 0,
      reviewCount: 0,
      inStock: true,
      isNew: false,
      discount: 0,
    } as unknown as Product,
    quantity: apiItem.quantity,
    selectedSize: apiItem.selectedSize ?? '',
    selectedColor: apiItem.selectedColor ?? '',
  };
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Sync cart from backend when user logs in (token present)
  useEffect(() => {
    const token = localStorage.getItem('bh_token');
    if (!token) return;
    cartApi.get().then(cart => {
      if (cart?.items?.length) {
        setItems(cart.items.map(normaliseApiItem));
      }
    }).catch(() => { /* silently ignore if backend unavailable */ });
  }, []);

  const addItem = useCallback((product: Product, size: string, color: string) => {
    const pid = (product as unknown as { _id?: string })._id ?? product.id;
    setItems(prev => {
      const existing = prev.find(
        i => i.product.id === pid && i.selectedSize === size && i.selectedColor === color
      );
      if (existing) {
        return prev.map(i =>
          i.product.id === pid && i.selectedSize === size && i.selectedColor === color
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product: { ...product, id: pid }, quantity: 1, selectedSize: size, selectedColor: color }];
    });
    // Sync with backend (fire-and-forget)
    const token = localStorage.getItem('bh_token');
    if (token) {
      cartApi.add({ productId: pid, quantity: 1, selectedSize: size, selectedColor: color }).catch(() => {});
    }
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
    const token = localStorage.getItem('bh_token');
    if (token) {
      cartApi.remove(productId).catch(() => {});
    }
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i));
    const token = localStorage.getItem('bh_token');
    if (token) {
      cartApi.update(productId, quantity).catch(() => {});
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    const token = localStorage.getItem('bh_token');
    if (token) {
      cartApi.clear().catch(() => {});
    }
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
