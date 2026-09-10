import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('handii_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setCartOpen] = useState(false);
  const [coupon, setCoupon] = useState(null); // { code, discountType, discountValue, discountAmount }
  const [couponError, setCouponError] = useState('');
  const [isCheckoutStep, setCheckoutStep] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('handii_cart', JSON.stringify(cart));
    } catch (err) {
      console.error('Error saving cart:', err);
    }
  }, [cart]);

  const addToCart = useCallback((item) => {
    setCart((prev) => [
      ...prev,
      {
        ...item,
        cartItemId: Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        quantity: item.quantity || 1
      }
    ]);
    setCartOpen(true);
  }, []);

  const removeFromCart = useCallback((cartItemId) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  }, []);

  const updateQuantity = useCallback((cartItemId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = (item.quantity || 1) + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setCoupon(null);
    setCouponError('');
  }, []);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = parseInt(String(item.price).replace(/[^0-9]/g, ''), 10) || 0;
      return sum + price * (item.quantity || 1);
    }, 0);
  }, [cart]);

  const applyCoupon = useCallback(async (code) => {
    setCouponError('');
    if (!code) return { success: false, message: 'Please enter a coupon code' };

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal })
      });
      const data = await res.json();
      if (!data.success) {
        setCouponError(data.message || 'Invalid coupon code');
        setCoupon(null);
        return { success: false, message: data.message };
      }

      setCoupon(data.coupon);
      return { success: true, coupon: data.coupon };
    } catch (err) {
      setCouponError('Error applying coupon');
      return { success: false, message: 'Failed to apply coupon' };
    }
  }, [subtotal]);

  const removeCoupon = useCallback(() => {
    setCoupon(null);
    setCouponError('');
  }, []);

  const discountAmount = useMemo(() => {
    if (!coupon) return 0;
    if (coupon.discountType === 'percentage') {
      const disc = Math.round((subtotal * coupon.discountValue) / 100);
      return coupon.maxDiscountCap ? Math.min(disc, coupon.maxDiscountCap) : disc;
    }
    return Math.min(subtotal, coupon.discountValue);
  }, [coupon, subtotal]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => {
    setCartOpen(false);
    setCheckoutStep(false);
  }, []);

  const checkoutWhatsApp = useCallback(
    (customerDetails = {}) => {
      if (cart.length === 0) return;
      const lines = cart.map(
        (item) =>
          `• ${item.name} x${item.quantity || 1} (Colour/Option: ${item.color || 'Standard'}) — ₹${item.price}`
      );

      let message = `🌸 *New Order Inquiry on handii.co* 🌸\n\n`;
      if (customerDetails.name) message += `*Customer:* ${customerDetails.name} (${customerDetails.phone || ''})\n`;
      if (customerDetails.address) message += `*Delivery Address:* ${customerDetails.address}\n\n`;

      message += `*Items:*\n${lines.join('\n')}\n\n`;
      message += `*Subtotal:* ₹${subtotal}\n`;
      if (coupon) message += `*Coupon (${coupon.code}):* -₹${discountAmount}\n`;
      message += `*Estimated Total:* ₹${total}\n\n`;
      message += `Please confirm order availability and dispatch timeline! ✨`;

      const phone = '919876543210';
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    },
    [cart, subtotal, coupon, discountAmount, total]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        discountAmount,
        total,
        coupon,
        couponError,
        applyCoupon,
        removeCoupon,
        isCheckoutStep,
        setCheckoutStep,
        checkoutWhatsApp
      }}
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
