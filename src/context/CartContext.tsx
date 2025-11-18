import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '../lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import type { Product } from '../lib/types'; // Optional: point to your Product type

type CartItem = {
  id?: string; // cart_items doc id in Firestore (optional for local items)
  product: Product;
  quantity: number;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;
  cartCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [userId] = useState(() => {
    const existing = localStorage.getItem('userId');
    if (existing) return existing;

    // generate a UUID-v4 fallback
    const generateUUID = () => {
      try {
        // @ts-ignore
        if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
          // @ts-ignore
          return crypto.randomUUID();
        }
      } catch {}
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    };

    const id = generateUUID();
    try {
      localStorage.setItem('userId', id);
    } catch {}
    return id;
  });

  // Load cart: fetch cart_items for userId, then fetch product docs
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const q = query(collection(db, 'cart_items'), where('user_id', '==', userId));
        const snap = await getDocs(q);
        // For each cart doc, load product doc
        const items = await Promise.all(
          snap.docs.map(async (d) => {
            const data = d.data() as any;
            const productRef = doc(db, 'products', data.product_id);
            const pSnap = await getDoc(productRef);
            const product = pSnap.exists() ? ({ id: pSnap.id, ...(pSnap.data() as any) } as Product) : null;
            return product
              ? { id: d.id, product, quantity: data.quantity } as CartItem
              : null; // skip if product deleted
          })
        );
        const filtered = items.filter(Boolean) as CartItem[];
        if (mounted) setCartItems(filtered);
      } catch (err) {
        console.error('Unexpected error loading cart:', err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [userId]);

  // helper: find existing cart_item doc for product
  async function findCartDoc(productId: string) {
    const q = query(
      collection(db, 'cart_items'),
      where('user_id', '==', userId),
      where('product_id', '==', productId)
    );
    const snap = await getDocs(q);
    return snap.docs.length ? { id: snap.docs[0].id, data: snap.docs[0].data() as any } : null;
  }

  const addToCart = async (product: Product, quantity: number) => {
    if (!product || quantity <= 0) return;

    // optimistic local update
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { product, quantity }];
    });

    try {
      const existing = await findCartDoc(product.id);
      if (existing) {
        const newQty = (existing.data.quantity || 0) + quantity;
        const docRef = doc(db, 'cart_items', existing.id);
        await updateDoc(docRef, { quantity: newQty, updated_at: new Date().toISOString() });
      } else {
        await addDoc(collection(db, 'cart_items'), {
          user_id: userId,
          product_id: product.id,
          quantity,
          created_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Unexpected error during addToCart:', err);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const existing = await findCartDoc(productId);
      if (existing) {
        await deleteDoc(doc(db, 'cart_items', existing.id));
      }
    } catch (err) {
      console.error('Failed to delete cart item on server:', err);
    }

    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    try {
      const existing = await findCartDoc(productId);
      if (existing) {
        await updateDoc(doc(db, 'cart_items', existing.id), {
          quantity,
          updated_at: new Date().toISOString(),
        });
      } else {
        // If no server entry, create one
        await addDoc(collection(db, 'cart_items'), {
          user_id: userId,
          product_id: productId,
          quantity,
          created_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Failed to update cart item on server:', err);
    }

    setCartItems((prev) => prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item)));
  };

  const clearCart = async () => {
    try {
      // delete all cart_items for user
      const q = query(collection(db, 'cart_items'), where('user_id', '==', userId));
      const snap = await getDocs(q);
      const deletes = snap.docs.map((d) => deleteDoc(doc(db, 'cart_items', d.id)));
      await Promise.all(deletes);
    } catch (err) {
      console.error('Failed to clear cart on server:', err);
    }
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
