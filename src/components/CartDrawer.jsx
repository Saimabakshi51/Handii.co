import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartDrawer({ onOrderSuccess }) {
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountAmount,
    total,
    coupon,
    couponError,
    applyCoupon,
    removeCoupon,
    clearCart,
    isCheckoutStep,
    setCheckoutStep
  } = useCart();

  const { user } = useAuth();

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Checkout form state
  const [custName, setCustName] = useState(user?.name || '');
  const [custPhone, setCustPhone] = useState(user?.phone || '');
  const [custEmail, setCustEmail] = useState(user?.email || '');
  const [shippingAddress, setShippingAddress] = useState(
    user?.addresses?.[0]?.street
      ? `${user.addresses[0].street}, ${user.addresses[0].city} ${user.addresses[0].pincode}`
      : ''
  );
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('whatsapp'); // 'whatsapp' | 'online'
  const [placingOrder, setPlacingOrder] = useState(false);

  // Sync user info if available
  if (user && !custName && user.name) {
    setCustName(user.name);
    setCustEmail(user.email);
    if (user.phone) setCustPhone(user.phone);
  }

  async function handleApplyCoupon(e) {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    await applyCoupon(couponInput.trim());
    setCouponLoading(false);
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();
    if (!custName || !custPhone || !shippingAddress) {
      alert('Please provide your name, phone, and complete delivery address.');
      return;
    }

    setPlacingOrder(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || null,
          customerName: custName,
          customerPhone: custPhone,
          customerEmail: custEmail,
          shippingAddress,
          items: cart,
          paymentMethod,
          couponCode: coupon?.code || null,
          notes: orderNotes
        })
      });

      const data = await res.json();
      setPlacingOrder(false);

      if (data.success && data.order) {
        const orderNum = data.order.orderNumber;
        clearCart();
        closeCart();

        if (paymentMethod === 'whatsapp') {
          // Trigger prefilled WhatsApp order message
          const lines = cart.map(
            (item) => `• ${item.name} x${item.quantity || 1} (${item.color || 'Standard'}) — ₹${item.price}`
          );
          const message = `🌸 *New Order Placed on handii.co!* 🌸\n\n*Order ID:* #${orderNum}\n*Customer:* ${custName} (${custPhone})\n*Address:* ${shippingAddress}\n\n*Items:*\n${lines.join(
            '\n'
          )}\n\n*Total Amount:* ₹${data.order.totalAmount}\n\nLooking forward to confirmation! ✨`;

          const phone = '919876543210';
          window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
        }

        if (onOrderSuccess) onOrderSuccess(data.order);
        alert(`Order #${orderNum} placed successfully! 🌸 Track it in your Customer Dashboard.`);
      } else {
        alert(data.message || 'Failed to place order.');
      }
    } catch (err) {
      setPlacingOrder(false);
      alert('Network error while placing order.');
    }
  }

  return (
    <>
      <div className={'cart-overlay' + (isCartOpen ? ' open' : '')} onClick={closeCart} />
      <div className={'cart-drawer' + (isCartOpen ? ' open' : '')}>
        {/* Drawer Header */}
        <div className="cart-head">
          <h3>{isCheckoutStep ? 'Checkout & Shipping 📦' : 'Your Bag 🧺'}</h3>
          <button className="cart-close" onClick={closeCart}>✕</button>
        </div>

        {!isCheckoutStep ? (
          /* STEP 1: BAG REVIEW */
          <>
            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="empty-state-box">
                  <span className="empty-icon">🌸</span>
                  <p className="cart-empty">
                    Your bag is empty — add a few handmade pieces to get started!
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div className="cart-item" key={item.cartItemId}>
                    <img src={item.img} alt={item.name} />
                    <div className="cart-item-info">
                      <h5>{item.name}</h5>
                      <p className="cart-item-opt">Option: {item.color}</p>
                      <p className="cart-item-price">₹{item.price}</p>

                      <div className="qty-stepper">
                        <button onClick={() => updateQuantity(item.cartItemId, -1)}>-</button>
                        <span>{item.quantity || 1}</span>
                        <button onClick={() => updateQuantity(item.cartItemId, 1)}>+</button>
                      </div>
                    </div>
                    <button
                      className="cart-item-remove"
                      onClick={() => removeFromCart(item.cartItemId)}
                      title="Remove piece"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">
                {/* Coupon Box */}
                <div className="cart-coupon-section">
                  {coupon ? (
                    <div className="applied-coupon-pill">
                      <span>🎟️ Code: <strong>{coupon.code}</strong> applied (-₹{discountAmount})</span>
                      <button type="button" className="remove-coupon-btn" onClick={removeCoupon}>
                        ✕
                      </button>
                    </div>
                  ) : (
                    <form className="coupon-input-group" onSubmit={handleApplyCoupon}>
                      <input
                        type="text"
                        placeholder="Enter Promo Code (e.g. WELCOME10)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      />
                      <button type="submit" className="btn btn-outline btn-sm" disabled={couponLoading}>
                        {couponLoading ? 'Checking...' : 'Apply'}
                      </button>
                    </form>
                  )}
                  {couponError && <p className="coupon-err-txt">{couponError}</p>}
                </div>

                {/* Pricing Summary */}
                <div className="cart-summary-breakdown">
                  <div className="sum-row">
                    <span>Subtotal:</span>
                    <span>₹{subtotal}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="sum-row discount">
                      <span>Promo Discount:</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="sum-row total">
                    <strong>Total Amount:</strong>
                    <strong>₹{total}</strong>
                  </div>
                </div>

                <button
                  className="btn btn-primary w-100 proceed-checkout-btn"
                  onClick={() => setCheckoutStep(true)}
                >
                  Proceed to Checkout →
                </button>
              </div>
            )}
          </>
        ) : (
          /* STEP 2: SHIPPING DETAILS & ORDER PLACEMENT */
          <form className="checkout-step-body" onSubmit={handlePlaceOrder}>
            <button
              type="button"
              className="btn btn-outline btn-sm back-to-cart-btn"
              onClick={() => setCheckoutStep(false)}
            >
              ← Back to Bag
            </button>

            <div className="checkout-scroll-area">
              <h4>Shipping &amp; Contact Information</h4>

              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Maya Sharma"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>WhatsApp / Mobile Phone *</label>
                <input
                  type="tel"
                  placeholder="e.g. 9812345678"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Complete Shipping Address *</label>
                <textarea
                  rows={3}
                  placeholder="House/Flat No, Street, Landmark, City, State, Pincode"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Special Crafting / Gifting Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Please add a handwritten birthday gift card!"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Choose Confirmation Method:</label>
                <div className="payment-options-grid">
                  <label className={`pay-tile ${paymentMethod === 'whatsapp' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="pay"
                      value="whatsapp"
                      checked={paymentMethod === 'whatsapp'}
                      onChange={() => setPaymentMethod('whatsapp')}
                    />
                    <div>
                      <strong>Order via WhatsApp 💬</strong>
                      <p>Confirm custom colors &amp; pay via UPI on chat</p>
                    </div>
                  </label>

                  <label className={`pay-tile ${paymentMethod === 'online' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="pay"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                    />
                    <div>
                      <strong>Direct Online Order ✨</strong>
                      <p>Instant booking with automated dispatch tracking</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="checkout-sticky-footer">
              <div className="sum-row total">
                <strong>Payable Total:</strong>
                <strong>₹{total}</strong>
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100 place-order-btn"
                disabled={placingOrder}
              >
                {placingOrder ? 'Processing Handmade Order...' : 'Confirm & Place Order 🌸'}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
