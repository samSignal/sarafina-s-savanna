import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  updateItem: (id: number, updates: Partial<Omit<CartItem, "id">>) => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: number) => void;
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
          setItems(parsed);
        }
      } catch {
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const updateItem = (id: number, updates: Partial<Omit<CartItem, "id">>) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const addItem = (item: Omit<CartItem, "quantity">, quantity: number = 1) => {
    const safeQuantity = quantity < 1 ? 1 : Math.floor(quantity);

    setItems((current) => {
      const existing = current.find((i) => i.id === item.id);

      if (existing) {
        return current.map((i) =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + safeQuantity }
            : i
        );
      }

      return [...current, { ...item, quantity: safeQuantity }];
    });
  };

  const removeItem = (id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
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
