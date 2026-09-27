import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('handii_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isWishlistOpen, setWishlistOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('handii_wishlist', JSON.stringify(wishlist));
    } catch (err) {
      console.error('Error saving wishlist:', err);
    }
  }, [wishlist]);

  const toggleWishlist = useCallback((product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  }, []);

  const isInWishlist = useCallback(
    (productId) => {
      return wishlist.some((item) => item.id === productId);
    },
    [wishlist]
  );

  const removeFromWishlist = useCallback((productId) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const openWishlist = useCallback(() => setWishlistOpen(true), []);
  const closeWishlist = useCallback(() => setWishlistOpen(false), []);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isWishlistOpen,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        openWishlist,
        closeWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider');
  return ctx;
}
