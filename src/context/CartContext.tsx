"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import {
  Cart,
  CartItem,
  addToCartAction,
  createCartAction,
  getCartAction,
  removeFromCartAction,
  updateCartQuantityAction,
} from "@/lib/shopify/cart";

interface AddToCartPayload {
  variantId: string;
  title: string;
  variantTitle?: string;
  handle: string;
  price: { amount: string; currencyCode: string };
  image?: { url: string; altText?: string };
  quantity?: number;
}

interface CartContextType {
  cart: Cart | null;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: AddToCartPayload) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_ID_COOKIE = "shopify_cart_id";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedCartId = localStorage.getItem(CART_ID_COOKIE);
    if (savedCartId) {
      getCartAction(savedCartId).then((fetchedCart) => {
        if (fetchedCart) {
          setCart(fetchedCart);
        } else {
          localStorage.removeItem(CART_ID_COOKIE);
        }
      });
    }
  }, []);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  const calculateSubtotal = (lines: CartItem[]) => {
    const total = lines.reduce(
      (sum, item) => sum + parseFloat(item.price.amount) * item.quantity,
      0
    );
    const currencyCode = lines[0]?.price.currencyCode || "USD";
    return { amount: total.toFixed(2), currencyCode };
  };

  const addItem = async (payload: AddToCartPayload) => {
    const qty = payload.quantity || 1;
    const previousCart = cart;

    openCart();

    if (cart) {
      const existingLineIndex = cart.lines.findIndex(
        (l) => l.variantId === payload.variantId
      );

      const updatedLines = [...cart.lines];
      if (existingLineIndex > -1) {
        const existing = updatedLines[existingLineIndex];
        updatedLines[existingLineIndex] = {
          ...existing,
          quantity: existing.quantity + qty,
        };
      } else {
        updatedLines.push({
          id: `temp-${Date.now()}`,
          variantId: payload.variantId,
          title: payload.title,
          variantTitle: payload.variantTitle || "",
          handle: payload.handle,
          price: payload.price,
          quantity: qty,
          image: payload.image,
        });
      }

      setCart({
        ...cart,
        totalQuantity: cart.totalQuantity + qty,
        subtotalPrice: calculateSubtotal(updatedLines),
        lines: updatedLines,
      });
    }

    try {
      let serverCart: Cart;
      if (!cart?.id) {
        serverCart = await createCartAction(payload.variantId, qty);
        localStorage.setItem(CART_ID_COOKIE, serverCart.id);
      } else {
        serverCart = await addToCartAction(cart.id, payload.variantId, qty);
      }
      setCart(serverCart);
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      setCart(previousCart);
    }
  };

  const removeItem = async (lineId: string) => {
    if (!cart) return;
    const previousCart = cart;

    const itemToRemove = cart.lines.find((l) => l.id === lineId);
    if (!itemToRemove) return;

    const updatedLines = cart.lines.filter((l) => l.id !== lineId);
    const newTotalQty = cart.totalQuantity - itemToRemove.quantity;

    setCart({
      ...cart,
      totalQuantity: Math.max(0, newTotalQty),
      subtotalPrice: calculateSubtotal(updatedLines),
      lines: updatedLines,
    });

    try {
      const serverCart = await removeFromCartAction(cart.id, [lineId]);
      setCart(serverCart);
    } catch (error) {
      console.error("Failed to remove item:", error);
      setCart(previousCart);
    }
  };

  const updateQuantity = async (lineId: string, quantity: number) => {
    if (!cart) return;
    if (quantity <= 0) {
      return removeItem(lineId);
    }

    const previousCart = cart;

    const updatedLines = cart.lines.map((item) =>
      item.id === lineId ? { ...item, quantity } : item
    );
    const newTotalQty = updatedLines.reduce((acc, i) => acc + i.quantity, 0);

    setCart({
      ...cart,
      totalQuantity: newTotalQty,
      subtotalPrice: calculateSubtotal(updatedLines),
      lines: updatedLines,
    });

    try {
      const serverCart = await updateCartQuantityAction(cart.id, [
        { id: lineId, quantity },
      ]);
      setCart(serverCart);
    } catch (error) {
      console.error("Failed to update quantity:", error);
      setCart(previousCart);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        removeItem,
        updateQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
