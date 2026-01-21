import React, { createContext, useContext, useMemo, useState } from 'react';
import { readCart, writeCart } from '../utils/cartStorage';

const CartContext = createContext(null);

function normalizeCartItems(items) {
  return items
    .filter((i) => i && typeof i.productId === 'string')
    .map((i) => ({
      productId: i.productId,
      qty: Math.max(1, Number(i.qty || 1)),
    }));
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => normalizeCartItems(readCart()));

  const setAndPersist = (next) => {
    const resolved = typeof next === 'function' ? next(items) : next;
    const normalized = normalizeCartItems(resolved);
    setItems(normalized);
    writeCart(normalized);
  };

  const addToCart = (productId, qty = 1) => {
    setAndPersist((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === productId ? { ...i, qty: i.qty + Math.max(1, qty) } : i
        );
      }
      return [...prev, { productId, qty: Math.max(1, qty) }];
    });
  };

  const removeFromCart = (productId) => {
    setAndPersist((prev) => prev.filter((i) => i.productId !== productId));
  };

  const setQty = (productId, qty) => {
    const safeQty = Math.max(1, Number(qty || 1));
    setAndPersist((prev) => prev.map((i) => (i.productId === productId ? { ...i, qty: safeQty } : i)));
  };

  const increment = (productId) => {
    setAndPersist((prev) => prev.map((i) => (i.productId === productId ? { ...i, qty: i.qty + 1 } : i)));
  };

  const decrement = (productId) => {
    setAndPersist((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, qty: Math.max(1, i.qty - 1) } : i))
    );
  };

  const clear = () => {
    setAndPersist([]);
  };

  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);

  const value = useMemo(
    () => ({ items, count, addToCart, removeFromCart, setQty, increment, decrement, clear }),
    [items, count]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
