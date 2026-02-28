import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface CartItem {
  cartItemId: string;
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  metadata?: Record<string, any>;
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  updateItem: (cartItemId: string, updates: Partial<Omit<CartItem, "cartItemId" | "id">>) => void;
  addItem: (item: Omit<CartItem, "quantity" | "cartItemId">, quantity?: number) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "cartItems";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Migration: Ensure all items have cartItemId
          const migrated = parsed.map((item: any) => ({
            ...item,
            cartItemId: item.cartItemId || `${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          }));
          setItems(migrated);
        }
      } catch {
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const updateItem = (cartItemId: string, updates: Partial<Omit<CartItem, "cartItemId" | "id">>) => {
    setItems((current) =>
      current.map((item) => (item.cartItemId === cartItemId ? { ...item, ...updates } : item))
    );
  };

  const addItem = (item: Omit<CartItem, "quantity" | "cartItemId">, quantity: number = 1) => {
    const safeQuantity = quantity < 1 ? 1 : Math.floor(quantity);

    setItems((current) => {
      // Find existing item with same ID and same metadata
      const existing = current.find((i) => 
        i.id === item.id && 
        JSON.stringify(i.metadata) === JSON.stringify(item.metadata)
      );

      if (existing) {
        return current.map((i) =>
          i.cartItemId === existing.cartItemId
            ? { ...i, quantity: i.quantity + safeQuantity }
            : i
        );
      }

      const newItem: CartItem = {
        ...item,
        quantity: safeQuantity,
        cartItemId: `${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      return [...current, newItem];
    });
  };

  const removeItem = (cartItemId: string) => {
    setItems((current) => current.filter((item) => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const value: CartContextValue = {
    items,
    totalItems,
    totalPrice,
    updateItem,
    addItem,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);

  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return ctx;
}
