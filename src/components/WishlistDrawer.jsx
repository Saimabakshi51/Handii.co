import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function WishlistDrawer() {
  const { wishlist, isWishlistOpen, closeWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  function handleMoveToCart(item) {
    addToCart(
      {
        productId: item.id,
        name: item.title,
        price: item.price,
        img: item.img,
        color: item.colors?.[0]?.color || 'Standard',
        quantity: 1
      },
      false
    );
    removeFromWishlist(item.id);
  }

  return (
    <>
      <div className={'cart-overlay' + (isWishlistOpen ? ' open' : '')} onClick={closeWishlist} />
      <div className={'cart-drawer craft-cart-panel' + (isWishlistOpen ? ' open' : '')}>
        {/* Drawer Header */}
        <div className="cart-head-bar">
          <div className="cart-head-title">
            <span className="cart-craft-icon">❤️</span>
            <div>
              <h3>Your Wishlist</h3>
              <span className="cart-count-sub">{wishlist.length} saved favorites</span>
            </div>
          </div>
          <button className="cart-close-btn" onClick={closeWishlist} title="Close wishlist">
            ✕
          </button>
        </div>

        {/* Wishlist Items List */}
        <div className="cart-body-scroll">
          <div className="cart-items-wrapper">
            {wishlist.length === 0 ? (
              <div className="cart-empty-state">
                <span className="empty-bag-icon">💌</span>
                <h4>Your Wishlist is Empty</h4>
                <p>Tap the heart icon on any piece you adore in our catalog to save it for later!</p>
                <button className="btn btn-primary btn-sm mt-3" onClick={closeWishlist}>
                  Browse Collection 🌸
                </button>
              </div>
            ) : (
              wishlist.map((item) => (
                <div className="cart-item-card" key={item.id}>
                  <div className="item-thumb-box">
                    <img src={item.img} alt={item.title} />
                  </div>

                  <div className="item-details-box">
                    <div className="item-header-row">
                      <h4 className="item-title">{item.title}</h4>
                      <button
                        type="button"
                        className="item-remove-btn"
                        onClick={() => removeFromWishlist(item.id)}
                        title="Remove favorite"
                      >
                        ✕
                      </button>
                    </div>

                    <span className="item-variant-tag">{item.cat} / {item.sub}</span>

                    <div className="item-bottom-row">
                      <span className="line-price">₹{item.price}</span>

                      {item.isOutOfStock ? (
                        <span className="stock-chip out">Out of Stock</span>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm move-to-bag-btn"
                          onClick={() => handleMoveToCart(item)}
                        >
                          Move to Bag 🧺
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
