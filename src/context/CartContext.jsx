import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user, token } = useAuth();

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

  // When user logs in with savedCart on backend, merge or load it
  useEffect(() => {
    if (user && Array.isArray(user.savedCart) && user.savedCart.length > 0 && cart.length === 0) {
      setCart(user.savedCart);
    }
  }, [user]);

  // Persist cart to localStorage and sync with user profile if authenticated
  useEffect(() => {
    try {
      localStorage.setItem('handii_cart', JSON.stringify(cart));
      if (token) {
        fetch('/api/auth/sync-cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ cart })
        }).catch(() => {});
      }
    } catch (err) {
      console.error('Error saving cart:', err);
    }
  }, [cart, token]);

  const addToCart = useCallback((item, openDrawer = true) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (i) =>
          i.productId !== undefined &&
          i.productId === item.productId &&
          (i.color || '') === (item.color || '') &&
          !i.isCustomOrder
      );

      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: (updated[existingIdx].quantity || 1) + (item.quantity || 1)
        };
        return updated;
      }

      return [
        ...prev,
        {
          ...item,
          cartItemId: Date.now() + '-' + Math.random().toString(36).substr(2, 5),
          quantity: item.quantity || 1
        }
      ];
    });

    if (openDrawer) {
      setCartOpen(true);
    }
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

  // Increase/Decrease directly from product card by productId and color
  const updateProductQuantity = useCallback((productId, color, delta) => {
    setCart((prev) => {
      const idx = prev.findIndex(
        (i) => i.productId === productId && (!color || (i.color || '') === (color || ''))
      );

      if (idx === -1) {
        return prev;
      }

      const updated = [...prev];
      const newQty = (updated[idx].quantity || 1) + delta;
      if (newQty > 0) {
        updated[idx] = { ...updated[idx], quantity: newQty };
        return updated;
      } else {
        return updated.filter((_, i) => i !== idx);
      }
    });
  }, []);

  const getItemQuantity = useCallback(
    (productId, color) => {
      if (productId === undefined) return 0;
      const match = cart.find(
        (i) => i.productId === productId && (!color || (i.color || '') === (color || ''))
      );
      return match ? match.quantity || 1 : 0;
    },
    [cart]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    setCoupon(null);
    setCouponError('');
  }, []);

  // Subtotal of all items
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = parseInt(String(item.price).replace(/[^0-9]/g, ''), 10) || 0;
      return sum + price * (item.quantity || 1);
    }, 0);
  }, [cart]);

  // Non-combo eligible subtotal for coupon discount
  const eligibleSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      if (item.isCombo || item.comboId) return sum;
      const price = parseInt(String(item.price).replace(/[^0-9]/g, ''), 10) || 0;
      return sum + price * (item.quantity || 1);
    }, 0);
  }, [cart]);

  const hasOnlyCombos = useMemo(() => {
    return cart.length > 0 && cart.every((item) => item.isCombo || item.comboId);
  }, [cart]);

  const applyCoupon = useCallback(
    async (code) => {
      setCouponError('');
      if (!code) return { success: false, message: 'Please enter a coupon code' };

      if (hasOnlyCombos || eligibleSubtotal <= 0) {
        const msg = 'Promo coupons cannot be applied to Combo Bundles (already heavily discounted).';
        setCouponError(msg);
        return { success: false, message: msg };
      }

      try {
        const res = await fetch('/api/coupons/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            subtotal,
            eligibleSubtotal,
            userId: user?.id,
            userEmail: user?.email,
            hasOnlyCombos
          })
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
    },
    [subtotal, eligibleSubtotal, hasOnlyCombos, user]
  );

  const removeCoupon = useCallback(() => {
    setCoupon(null);
    setCouponError('');
  }, []);

  const discountAmount = useMemo(() => {
    if (!coupon || eligibleSubtotal <= 0) return 0;
    if (coupon.discountType === 'percentage') {
      const disc = Math.round((eligibleSubtotal * coupon.discountValue) / 100);
      return coupon.maxDiscountCap ? Math.min(disc, coupon.maxDiscountCap) : disc;
    }
    return Math.min(eligibleSubtotal, coupon.discountValue);
  }, [coupon, eligibleSubtotal]);

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
          `• ${item.name} x${item.quantity || 1} (${item.color || 'Standard'}) — ₹${item.price}`
      );

      let message = `🌸 *New Order Inquiry on handii.co* 🌸\n\n`;
      if (customerDetails.name)
        message += `*Customer:* ${customerDetails.name} (${customerDetails.phone || ''})\n`;
      if (customerDetails.address) message += `*Delivery Address:* ${customerDetails.address}\n\n`;

      message += `*Items:*\n${lines.join('\n')}\n\n`;
      message += `*Subtotal:* ₹${subtotal}\n`;
      if (coupon && discountAmount > 0)
        message += `*Coupon (${coupon.code}):* -₹${discountAmount}\n`;
      message += `*Estimated Total:* ₹${total}\n\n`;
      message += `Please confirm order availability and dispatch timeline! ✨`;

      const phone = '918847277218';
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
        updateProductQuantity,
        getItemQuantity,
        clearCart,
        subtotal,
        eligibleSubtotal,
        hasOnlyCombos,
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
