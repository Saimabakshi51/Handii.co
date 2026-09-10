import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const { cart, isCartOpen, closeCart, removeFromCart, checkoutWhatsApp } = useCart();

  return (
    <>
      <div className={'cart-overlay' + (isCartOpen ? ' open' : '')} onClick={closeCart} />
      <div className={'cart-drawer' + (isCartOpen ? ' open' : '')}>
        <div className="cart-head">
          <h3>Your Bag</h3>
          <button className="cart-close" onClick={closeCart}>✕</button>
        </div>
        <div className="cart-items">
          {cart.length === 0 ? (
            <p className="cart-empty">Your bag is empty — add a few handmade pieces to get started 🌸</p>
          ) : (
            cart.map((item, i) => (
              <div className="cart-item" key={i}>
                <img src={item.img} alt={item.name} />
                <div className="cart-item-info">
                  <h5>{item.name}</h5>
                  <p>Colour: {item.color}</p>
                  <p className="cart-item-price">{item.price}</p>
                </div>
                <button className="cart-item-remove" onClick={() => removeFromCart(i)}>✕</button>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-footer">
            <p className="cart-note">
              All pieces are made to order — we'll confirm final pricing, colours and delivery time over WhatsApp
              before anything is charged.
            </p>
            <button className="btn btn-primary cart-checkout" onClick={checkoutWhatsApp}>
              Order via WhatsApp
            </button>
          </div>
        )}
      </div>
    </>
  );
}
