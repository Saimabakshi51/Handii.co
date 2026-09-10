import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Received', icon: '📋' },
  { key: 'crafting', label: 'Coiling & Knotting', icon: '🧵' },
  { key: 'curing', label: 'Resin Curing / Finishing', icon: '✨' },
  { key: 'shipped', label: 'Dispatched', icon: '🚚' },
  { key: 'delivered', label: 'Delivered', icon: '🌸' }
];

export default function CustomerDashboard({ isOpen, onClose }) {
  const { user, token, logout, openAuthModal } = useAuth();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'custom' | 'wishlist' | 'profile'
  const [orders, setOrders] = useState([]);
  const [customOrders, setCustomOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [activeCustomChat, setActiveCustomChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Address edit state
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newPincode, setNewPincode] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (isOpen && token) {
      fetchMyOrders();
      fetchMyCustomOrders();
    }
  }, [isOpen, token]);

  async function fetchMyOrders() {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/orders/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  }

  async function fetchMyCustomOrders() {
    try {
      const res = await fetch('/api/custom-orders/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCustomOrders(data.customOrders || []);
      }
    } catch (err) {
      console.error('Failed to load custom orders:', err);
    }
  }

  async function openCustomOrderChat(customOrder) {
    setActiveCustomChat(customOrder);
    try {
      const res = await fetch(`/api/custom-orders/${customOrder.customOrderId}`);
      const data = await res.json();
      if (data.success) {
        setChatMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Failed to load chat messages:', err);
    }
  }

  async function handleSendReply(e) {
    e.preventDefault();
    if (!replyMessage.trim() || !activeCustomChat) return;
    setSendingMessage(true);
    try {
      const res = await fetch(`/api/custom-orders/${activeCustomChat.customOrderId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'customer',
          senderName: user?.name || 'Customer',
          message: replyMessage.trim()
        })
      });
      const data = await res.json();
      setSendingMessage(false);
      if (data.success) {
        setReplyMessage('');
        const chatRes = await fetch(`/api/custom-orders/${activeCustomChat.customOrderId}`);
        const chatData = await chatRes.json();
        if (chatData.success) setChatMessages(chatData.messages || []);
      }
    } catch (err) {
      setSendingMessage(false);
    }
  }

  async function handleAcceptQuote(customOrderId) {
    try {
      const res = await fetch(`/api/custom-orders/${customOrderId}/accept`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success && data.cartItem) {
        addToCart(data.cartItem);
        fetchMyCustomOrders();
        alert('Quote accepted! Custom order added to your Bag 🧺');
      }
    } catch (err) {
      alert('Error accepting quote');
    }
  }

  async function handleSaveAddress(e) {
    e.preventDefault();
    if (!newStreet || !newCity || !newPincode) return;
    setSavingAddress(true);
    try {
      const res = await fetch('/api/auth/address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          street: newStreet,
          city: newCity,
          pincode: newPincode,
          isDefault: true
        })
      });
      const data = await res.json();
      setSavingAddress(false);
      if (data.success) {
        setNewStreet('');
        setNewCity('');
        setNewPincode('');
        alert('Address saved successfully! 🌸');
      }
    } catch (err) {
      setSavingAddress(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="craft-modal dashboard-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>

        {/* Dashboard Header */}
        <div className="dashboard-head">
          <div className="user-profile-badge">
            <span className="user-avatar">🌸</span>
            <div>
              <h3>{user ? `Hello, ${user.name}!` : 'Customer Hub'}</h3>
              <p className="user-email">{user?.email || 'Guest Session'}</p>
            </div>
          </div>
          {user ? (
            <button className="btn btn-outline btn-sm" onClick={logout}>
              Sign Out
            </button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => openAuthModal('login')}>
              Sign In
            </button>
          )}
        </div>

        {/* Tab Strip */}
        <div className="dashboard-tabs">
          <button
            className={`dtab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            🧾 My Orders ({orders.length})
          </button>
          <button
            className={`dtab ${activeTab === 'custom' ? 'active' : ''}`}
            onClick={() => setActiveTab('custom')}
          >
            💬 Custom DMs &amp; Quotes ({customOrders.length})
          </button>
          <button
            className={`dtab ${activeTab === 'wishlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('wishlist')}
          >
            ❤️ Wishlist ({wishlist.length})
          </button>
          <button
            className={`dtab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            📍 Address &amp; Profile
          </button>
        </div>

        {/* Tab 1: My Orders */}
        {activeTab === 'orders' && (
          <div className="dashboard-content-panel">
            {loadingOrders ? (
              <p className="loading-txt">Loading your handmade orders...</p>
            ) : orders.length === 0 ? (
              <div className="empty-state-box">
                <span className="empty-icon">🧺</span>
                <p>No orders yet. Discover our handmade pieces in the shop!</p>
              </div>
            ) : (
              <div className="orders-list-grid">
                {orders.map((ord) => {
                  const stepIndex =
                    ord.status === 'delivered'
                      ? 4
                      : ord.status === 'shipped'
                      ? 3
                      : ord.status === 'crafting'
                      ? 1
                      : 0;

                  return (
                    <div className="customer-order-card" key={ord.id}>
                      <div className="order-top-row">
                        <div>
                          <span className="order-num">#{ord.orderNumber}</span>
                          <span className="order-date">
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span className={`status-pill ${ord.status}`}>
                          {ord.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Visual Crafting Stepper */}
                      <div className="craft-timeline-stepper">
                        {STATUS_STEPS.map((step, sIdx) => (
                          <div
                            key={step.key}
                            className={`step-point ${sIdx <= stepIndex ? 'completed' : ''}`}
                          >
                            <span className="step-bullet">{step.icon}</span>
                            <span className="step-lbl">{step.label}</span>
                          </div>
                        ))}
                      </div>

                      {/* Item Preview */}
                      <div className="order-items-preview">
                        {(ord.items || []).map((item, iIdx) => (
                          <div key={iIdx} className="ord-item-chip">
                            {item.img && <img src={item.img} alt={item.name} />}
                            <div>
                              <strong>{item.name}</strong>
                              <span className="color-tag">Color: {item.color || 'Custom'}</span>
                            </div>
                            <span className="ord-price">₹{item.price}</span>
                          </div>
                        ))}
                      </div>

                      <div className="order-bottom-row">
                        <span className="total-label">
                          Total: <strong>₹{ord.totalAmount}</strong>
                        </span>
                        <a
                          href={`https://wa.me/919876543210?text=${encodeURIComponent(
                            `Hi! Inquiring about my order #${ord.orderNumber}`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-whatsapp-track"
                        >
                          Chat about Order 💬
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Custom Orders & Private DMs */}
        {activeTab === 'custom' && (
          <div className="dashboard-content-panel">
            {activeCustomChat ? (
              <div className="inline-custom-chat">
                <button
                  className="btn btn-outline btn-sm mb-3"
                  onClick={() => setActiveCustomChat(null)}
                >
                  ← Back to Custom Requests List
                </button>

                <div className="chat-card-panel">
                  <div className="chat-panel-head">
                    <h4>
                      Order {activeCustomChat.customOrderId}: {activeCustomChat.category}
                    </h4>
                    <span className={`status-pill ${activeCustomChat.status}`}>
                      {activeCustomChat.status.toUpperCase()}
                    </span>
                  </div>

                  {activeCustomChat.status === 'quoted' && (
                    <div className="quote-deal-box">
                      <p>
                        ✨ <strong>Quote Offer: ₹{activeCustomChat.quotePrice}</strong> (Estimated:{' '}
                        {activeCustomChat.estimatedDays || 3} days)
                      </p>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleAcceptQuote(activeCustomChat.customOrderId)}
                      >
                        Accept &amp; Add to Bag 🧺
                      </button>
                    </div>
                  )}

                  <div className="dash-chat-messages">
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`dm-message-row ${
                          msg.sender === 'customer' ? 'msg-customer' : 'msg-admin'
                        }`}
                      >
                        <div className="dm-bubble">
                          <div className="dm-author">
                            <strong>{msg.senderName}</strong>
                            <span className="dm-time">
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="dm-text">{msg.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <form className="dm-input-bar" onSubmit={handleSendReply}>
                    <input
                      type="text"
                      placeholder="Type reply to studio artisan..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      disabled={sendingMessage || !replyMessage.trim()}
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
            ) : customOrders.length === 0 ? (
              <div className="empty-state-box">
                <span className="empty-icon">🎨</span>
                <p>No custom inquiries yet. Head to the Customize section to create one!</p>
              </div>
            ) : (
              <div className="custom-orders-table">
                {customOrders.map((req) => (
                  <div className="custom-req-card" key={req.id}>
                    <div className="req-header">
                      <div>
                        <strong>{req.customOrderId}</strong> — <span>{req.category}</span>
                      </div>
                      <span className={`status-pill ${req.status}`}>{req.status}</span>
                    </div>
                    <p className="req-specs">{req.specifications}</p>
                    {req.quotePrice && (
                      <p className="quoted-amt">
                        Quoted Price: <strong>₹{req.quotePrice}</strong>
                      </p>
                    )}
                    <div className="req-actions">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => openCustomOrderChat(req)}
                      >
                        Open Private Chat 💬
                      </button>
                      {req.status === 'quoted' && (
                        <button
                          className="btn btn-gold btn-sm"
                          onClick={() => handleAcceptQuote(req.customOrderId)}
                        >
                          Accept Offer 🧺
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Wishlist */}
        {activeTab === 'wishlist' && (
          <div className="dashboard-content-panel">
            {wishlist.length === 0 ? (
              <div className="empty-state-box">
                <span className="empty-icon">💌</span>
                <p>Your wishlist is empty.</p>
              </div>
            ) : (
              <div className="wishlist-dash-grid">
                {wishlist.map((item) => (
                  <div className="wishlist-dash-item" key={item.id}>
                    <img src={item.img} alt={item.title} />
                    <div className="wish-info">
                      <h4>{item.title}</h4>
                      <p className="wish-price">₹{item.price}</p>
                    </div>
                    <div className="wish-btns">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          addToCart({
                            productId: item.id,
                            name: item.title,
                            price: item.price,
                            img: item.img,
                            color: item.colors?.[0]?.color || 'Standard',
                            quantity: 1
                          });
                          removeFromWishlist(item.id);
                        }}
                      >
                        Move to Bag 🧺
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => removeFromWishlist(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Address Book & Profile */}
        {activeTab === 'profile' && (
          <div className="dashboard-content-panel">
            <div className="profile-section">
              <h4>Saved Delivery Addresses</h4>
              <div className="addresses-list">
                {(user?.addresses || []).map((addr, aIdx) => (
                  <div key={aIdx} className="address-card">
                    <span className="addr-label">{addr.label}</span>
                    <p>{addr.street}</p>
                    <p>
                      {addr.city}, {addr.pincode}
                    </p>
                  </div>
                ))}
              </div>

              <form className="add-address-form" onSubmit={handleSaveAddress}>
                <h5>+ Add New Address</h5>
                <div className="form-group">
                  <label>Street Address / Apartment *</label>
                  <input
                    type="text"
                    placeholder="e.g. Flat 402, Sunshine Heights"
                    value={newStreet}
                    onChange={(e) => setNewStreet(e.target.value)}
                    required
                  />
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Pincode *</label>
                    <input
                      type="text"
                      placeholder="e.g. 400050"
                      value={newPincode}
                      onChange={(e) => setNewPincode(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={savingAddress}
                >
                  {savingAddress ? 'Saving...' : 'Save Address'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
