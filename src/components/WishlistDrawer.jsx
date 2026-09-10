import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function WishlistDrawer() {
  const { wishlist, isWishlistOpen, closeWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  function handleMoveToCart(item) {
    addToCart({
      productId: item.id,
      name: item.title,
      price: item.price,
      img: item.img,
      color: item.colors?.[0]?.color || 'Standard',
      quantity: 1
    });
    removeFromWishlist(item.id);
  }

  return (
    <>
      <div className={'cart-overlay' + (isWishlistOpen ? ' open' : '')} onClick={closeWishlist} />
      <div className={'cart-drawer wishlist-drawer' + (isWishlistOpen ? ' open' : '')}>
        <div className="cart-head">
          <h3>Your Wishlist ❤️</h3>
          <button className="cart-close" onClick={closeWishlist}>✕</button>
        </div>

        <div className="cart-items">
          {wishlist.length === 0 ? (
            <div className="empty-state-box">
              <span className="empty-icon">💌</span>
              <p className="cart-empty">
                Your wishlist is empty. Tap the heart on pieces you adore to save them here!
              </p>
            </div>
          ) : (
            wishlist.map((item) => (
              <div className="cart-item wishlist-item-card" key={item.id}>
                <img src={item.img} alt={item.title} />
                <div className="cart-item-info">
                  <h5>{item.title}</h5>
                  <p className="cart-item-price">₹{item.price}</p>
                  {item.isOutOfStock ? (
                    <span className="stock-chip out">Out of Stock</span>
                  ) : (
                    <button className="move-cart-btn" onClick={() => handleMoveToCart(item)}>
                      Move to Bag 🧺
                    </button>
                  )}
                </div>
                <button
                  className="cart-item-remove"
                  title="Remove from wishlist"
                  onClick={() => removeFromWishlist(item.id)}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
