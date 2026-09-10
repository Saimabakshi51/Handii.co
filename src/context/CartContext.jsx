import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setCartOpen] = useState(false);

  const addToCart = useCallback((item) => {
    setCart((prev) => [...prev, item]);
    setCartOpen(true);
  }, []);

  const removeFromCart = useCallback((index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const checkoutWhatsApp = useCallback(() => {
    if (cart.length === 0) return;
    const lines = cart.map((item) => `- ${item.name} (Colour: ${item.color})`);
    const message = `Hi handii.co! I'd like to order:\n${lines.join('\n')}\n\nPlease confirm pricing and availability. Thank you!`;
    const phone = '919876543210';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  }, [cart]);

  return (
    <CartContext.Provider
      value={{ cart, isCartOpen, addToCart, removeFromCart, openCart, closeCart, checkoutWhatsApp }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
