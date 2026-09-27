import { useState, useEffect } from 'react';
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
    eligibleSubtotal,
    hasOnlyCombos,
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
  const [eligibleCoupons, setEligibleCoupons] = useState([]);

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
  useEffect(() => {
    if (user) {
      if (!custName && user.name) setCustName(user.name);
      if (!custEmail && user.email) setCustEmail(user.email);
      if (!custPhone && user.phone) setCustPhone(user.phone);
      if (!shippingAddress && user.addresses?.[0]) {
        setShippingAddress(`${user.addresses[0].street}, ${user.addresses[0].city} ${user.addresses[0].pincode}`);
      }
    }
  }, [user]);

  // Load eligible coupons when drawer opens
  useEffect(() => {
    if (isCartOpen) {
      fetchEligibleCoupons();
    }
  }, [isCartOpen, user]);

  async function fetchEligibleCoupons() {
    try {
      const url = user?.id ? `/api/coupons/eligible?userId=${user.id}` : '/api/coupons/eligible';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.coupons) {
        setEligibleCoupons(data.coupons);
      }
    } catch (err) {
      console.error('Failed to load eligible coupons:', err);
    }
  }

  async function handleApplyCoupon(e) {
    if (e) e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    await applyCoupon(couponInput.trim());
    setCouponLoading(false);
  }

  async function handleQuickApply(code) {
    setCouponInput(code);
    setCouponLoading(true);
    await applyCoupon(code);
    setCouponLoading(false);
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();
    if (!custName.trim() || !custPhone.trim() || !shippingAddress.trim()) {
      alert('Please provide your name, contact phone number, and complete delivery address.');
      return;
    }

    setPlacingOrder(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || null,
          customerName: custName.trim(),
          customerPhone: custPhone.trim(),
          customerEmail: custEmail.trim(),
          shippingAddress: shippingAddress.trim(),
          items: cart,
          paymentMethod,
          couponCode: coupon?.code || null,
          notes: orderNotes.trim()
        })
      });

      const data = await res.json();
      setPlacingOrder(false);

      if (data.success && data.order) {
        const orderNum = data.order.orderNumber;
        const currentCart = [...cart];
        clearCart();
        closeCart();

        if (paymentMethod === 'whatsapp') {
          const lines = currentCart.map(
            (item) => `• ${item.name} x${item.quantity || 1} (${item.color || 'Standard'}) — ₹${item.price}`
          );
          const message = `🌸 *New Order Placed on handii.co!* 🌸\n\n*Order ID:* #${orderNum}\n*Customer:* ${custName} (${custPhone})\n*Address:* ${shippingAddress}\n\n*Items:*\n${lines.join(
            '\n'
          )}\n\n*Total Payable:* ₹${data.order.totalAmount}\n\nLooking forward to confirmation! ✨`;

          const phone = '918847277218';
          window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
        }

        if (onOrderSuccess) onOrderSuccess(data.order);
        alert(`Order #${orderNum} placed successfully! 🌸 You can track its live crafting timeline in your Customer Dashboard.`);
      } else {
        alert(data.message || 'Failed to place order.');
      }
    } catch (err) {
      setPlacingOrder(false);
      alert('Network error while placing order.');
    }
  }

  const freeDeliveryThreshold = 499;
  const deliveryFee = subtotal >= freeDeliveryThreshold || subtotal === 0 ? 0 : 40;
  const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  return (
    <>
      <div className={'cart-overlay' + (isCartOpen ? ' open' : '')} onClick={closeCart} />
      <div className={'cart-drawer craft-cart-panel' + (isCartOpen ? ' open' : '')}>
        {/* Top Header */}
        <div className="cart-head-bar">
          <div className="cart-head-title">
            <span className="cart-craft-icon">🧺</span>
            <div>
              <h3>{isCheckoutStep ? 'Checkout & Delivery' : 'Your Shopping Bag'}</h3>
              <span className="cart-count-sub">
                {cart.reduce((sum, i) => sum + (i.quantity || 1), 0)} handmade pieces
              </span>
            </div>
          </div>
          <button className="cart-close-btn" onClick={closeCart} title="Close bag">
            ✕
          </button>
        </div>

        {/* Free Delivery Bar */}
        {cart.length > 0 && !isCheckoutStep && (
          <div className="free-shipping-bar">
            {subtotal >= freeDeliveryThreshold ? (
              <p className="free-ship-msg success">✨ You unlocked <strong>FREE Delivery &amp; Gift Wrap!</strong></p>
            ) : (
              <p className="free-ship-msg">
                Add <strong>₹{freeDeliveryThreshold - subtotal}</strong> more for <strong>FREE Delivery</strong> 🌸
              </p>
            )}
            <div className="shipping-progress-track">
              <div className="shipping-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        )}

        {!isCheckoutStep ? (
          /* STEP 1: BAG REVIEW */
          <div className="cart-body-scroll">
            <div className="cart-items-wrapper">
              {cart.length === 0 ? (
                <div className="cart-empty-state">
                  <span className="empty-bag-icon">🌸</span>
                  <h4>Your Bag is Empty</h4>
                  <p>Discover our handmade pipe cleaner bouquets, resin charms, and craft combos!</p>
                  <button className="btn btn-primary btn-sm mt-3" onClick={closeCart}>
                    Explore Collection ✂️
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div className="cart-item-card" key={item.cartItemId}>
                    <div className="item-thumb-box">
                      <img src={item.img} alt={item.name} />
                      {item.isCombo && <span className="item-combo-tag">Bundle</span>}
                    </div>

                    <div className="item-details-box">
                      <div className="item-header-row">
                        <h4 className="item-title">{item.name}</h4>
                        <button
                          type="button"
                          className="item-remove-btn"
                          onClick={() => removeFromCart(item.cartItemId)}
                          title="Remove from bag"
                        >
                          ✕
                        </button>
                      </div>

                      <span className="item-variant-tag">Option: {item.color || 'Standard'}</span>

                      <div className="item-bottom-row">
                        <div className="cart-qty-stepper">
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => updateQuantity(item.cartItemId, -1)}
                            title="Decrease"
                          >
                            −
                          </button>
                          <span className="qty-value">{item.quantity || 1}</span>
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => updateQuantity(item.cartItemId, 1)}
                            title="Increase"
                          >
                            +
                          </button>
                        </div>

                        <div className="item-pricing">
                          <span className="line-price">₹{parseInt(String(item.price).replace(/[^0-9]/g, ''), 10) * (item.quantity || 1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-bottom-actions">
                {/* Promo Coupons Tray */}
                <div className="cart-coupon-card">
                  <span className="coupon-box-title">🎟️ Promo Coupon Discount</span>

                  {coupon ? (
                    <div className="applied-coupon-pill">
                      <div className="applied-pill-info">
                        <span className="badge-applied">APPLIED</span>
                        <strong>{coupon.code}</strong>
                        <span className="disc-val">(-₹{discountAmount})</span>
                      </div>
                      <button type="button" className="remove-coupon-btn" onClick={removeCoupon}>
                        Remove ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <form className="coupon-form-row" onSubmit={handleApplyCoupon}>
                        <input
                          type="text"
                          placeholder="Enter Promo Code (e.g. WELCOME10)"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        />
                        <button type="submit" className="btn btn-outline btn-sm apply-btn" disabled={couponLoading}>
                          {couponLoading ? 'Checking...' : 'Apply'}
                        </button>
                      </form>

                      {hasOnlyCombos && (
                        <p className="coupon-combo-note">
                          ⚠️ Coupons are not applicable to curated Combo Bundles (already discounted).
                        </p>
                      )}

                      {/* Available / Eligible coupons chips */}
                      {eligibleCoupons.length > 0 && (
                        <div className="eligible-coupons-tray">
                          <span className="tray-label">Available for you:</span>
                          <div className="coupon-chips-list">
                            {eligibleCoupons.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                className={`coupon-quick-chip ${c.isAlreadyUsed ? 'used' : ''}`}
                                onClick={() => !c.isAlreadyUsed && !hasOnlyCombos && handleQuickApply(c.code)}
                                disabled={c.isAlreadyUsed || hasOnlyCombos}
                                title={c.isAlreadyUsed ? 'Already redeemed by your account' : c.description}
                              >
                                <span className="chip-code">{c.code}</span>
                                <span className="chip-desc">
                                  {c.isAlreadyUsed
                                    ? 'Used ✓'
                                    : c.discountType === 'percentage'
                                    ? `${c.discountValue}% OFF`
                                    : `₹${c.discountValue} OFF`}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {couponError && <p className="coupon-err-msg">{couponError}</p>}
                </div>

                {/* Price Breakdown */}
                <div className="cart-bill-summary">
                  <div className="bill-row">
                    <span>Bag Subtotal:</span>
                    <span>₹{subtotal}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="bill-row discount">
                      <span>Coupon ({coupon?.code}):</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}

                  <div className="bill-row">
                    <span>Estimated Delivery:</span>
                    <span>{deliveryFee === 0 ? <strong className="free-text">FREE</strong> : `₹${deliveryFee}`}</span>
                  </div>

                  <div className="bill-row total-row">
                    <strong>Total Amount:</strong>
                    <strong>₹{total + deliveryFee}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-primary w-100 proceed-checkout-btn"
                  onClick={() => setCheckoutStep(true)}
                >
                  Proceed to Checkout ({cart.length} items) →
                </button>
              </div>
            )}
          </div>
        ) : (
          /* STEP 2: SHIPPING & CHECKOUT */
          <form className="checkout-step-container" onSubmit={handlePlaceOrder}>
            <button
              type="button"
              className="btn-back-step"
              onClick={() => setCheckoutStep(false)}
            >
              ← Back to Bag Items
            </button>

            <div className="checkout-fields-scroll">
              <h4>Shipping &amp; Delivery Details 📦</h4>

              <div className="form-group">
                <label>Your Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Maya Sharma"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>WhatsApp Phone *</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9812345678"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. name@crafts.com"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Full Delivery Address *</label>
                <textarea
                  rows={3}
                  placeholder="House/Flat No, Apartment, Street, Landmark, City, State, Pincode"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Handwritten Gift Message / Custom Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Please pack in birthday wrapping paper with a note for Maya!"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Payment &amp; Confirmation Method:</label>
                <div className="payment-options-tray">
                  <label className={`pay-card-option ${paymentMethod === 'whatsapp' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="whatsapp"
                      checked={paymentMethod === 'whatsapp'}
                      onChange={() => setPaymentMethod('whatsapp')}
                    />
                    <div>
                      <strong>Order &amp; Pay on WhatsApp 💬</strong>
                      <p>Instant UPI link sent to WhatsApp, review colors directly with artisan</p>
                    </div>
                  </label>

                  <label className={`pay-card-option ${paymentMethod === 'online' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                    />
                    <div>
                      <strong>Direct Online Booking ✨</strong>
                      <p>Instant booking with automated dispatch tracking</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="checkout-fixed-bottom">
              <div className="bill-row total-row">
                <strong>Payable Total:</strong>
                <strong>₹{total + deliveryFee}</strong>
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100 place-order-btn"
                disabled={placingOrder}
              >
                {placingOrder ? 'Confirming with Studio...' : 'Place Order & Confirm 🌸'}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
