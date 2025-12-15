"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

export type LocalCartItem = {
  id: number;
  qty: number;
  name: string;
  image_url: string | null;
  pack_size: number;
  price: number; 
};

type CartContextType = {
  items: LocalCartItem[];
  addToCart: (item: LocalCartItem) => void;
  updateQty: (id: number, delta: number) => void;
  clearCart: () => void;
  replaceCart: (items: LocalCartItem[]) => void;
  cartCount: number;
  cartTotal: number;
  isLoaded: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<LocalCartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("local_cart");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // 2. Save to LocalStorage
  useEffect(() => {
    if (isLoaded) {
      const prevStorage = localStorage.getItem("local_cart");
      if (items.length === 0 && prevStorage === null) {
        return;
      }
      localStorage.setItem("local_cart", JSON.stringify(items));
    }
  }, [items, isLoaded]);

  // ✅ FIXED: Wrapped in useCallback to prevent infinite loops
  const addToCart = useCallback((newItem: LocalCartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === newItem.id);
      if (existing) {
        return prev.map((i) => 
          i.id === newItem.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, newItem];
    });
  }, []);

  // ✅ FIXED: Wrapped in useCallback
  const updateQty = useCallback((id: number, delta: number) => {
    setItems((prev) => {
      return prev.map((item) => {
        if (item.id === id) {
          return { ...item, qty: Math.max(0, item.qty + delta) };
        }
        return item;
      }).filter(item => item.qty > 0); 
    });
  }, []);

  // ✅ FIXED: Wrapped in useCallback (The culprit of your crash)
  const clearCart = useCallback(() => {
    setItems([]);
    if (typeof window !== "undefined") {
      localStorage.setItem("local_cart", "[]"); 
    }
  }, []);

  // ✅ FIXED: Wrapped in useCallback
  const replaceCart = useCallback((newItems: LocalCartItem[]) => {
    setItems(newItems);
  }, []);

  const cartCount = items.reduce((acc, item) => acc + item.qty, 0);
  const cartTotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);

  return (
    <CartContext.Provider value={{ items, addToCart, updateQty, clearCart, replaceCart, cartCount, cartTotal, isLoaded }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}