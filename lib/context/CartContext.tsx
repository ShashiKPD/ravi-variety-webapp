"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

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
  replaceCart: (items: LocalCartItem[]) => void; // <--- NEW
  cartCount: number;
  cartTotal: number;
  isLoaded: boolean; // <--- NEW
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
    setIsLoaded(true); // <--- Flag ready
  }, []);

  // 2. Save to LocalStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("local_cart", JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addToCart = (newItem: LocalCartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === newItem.id);
      if (existing) {
        return prev.map((i) => 
          i.id === newItem.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, newItem];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setItems((prev) => {
      return prev.map((item) => {
        if (item.id === id) {
          return { ...item, qty: Math.max(0, item.qty + delta) };
        }
        return item;
      }).filter(item => item.qty > 0); 
    });
  };

  const clearCart = () => {
    setItems([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("local_cart");
    }
  };

  // New helper to hydrate from Server
  const replaceCart = (newItems: LocalCartItem[]) => {
    setItems(newItems);
  };

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