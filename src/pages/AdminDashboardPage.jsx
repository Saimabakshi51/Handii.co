import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboardPage() {
  const { user, token, isAdmin, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'orders' | 'inventory' | 'custom' | 'combos' | 'coupons'

  // Data states
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customOrders, setCustomOrders] = useState([]);
  const [combos, setCombos] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters & Search
  const [productSearch, setProductSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Custom Order Chat & Quoting Modal state
  const [selectedCustomOrder, setSelectedCustomOrder] = useState(null);
  const [adminChatMessages, setAdminChatMessages] = useState([]);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [quotePrice, setQuotePrice] = useState('');
  const [quoteDays, setQuoteDays] = useState('3');
  const [quoteNotes, setQuoteNotes] = useState('');
  const [declineReason, setDeclineReason] = useState('');

  // Combo Builder State
  const [comboTitle, setComboTitle] = useState('');
  const [comboDescription, setComboDescription] = useState('');
  const [comboBadge, setComboBadge] = useState('Special Duo Bundle');
  const [comboProductIds, setComboProductIds] = useState([]);
  const [comboPriceInput, setComboPriceInput] = useState('');
  const [marginAnalysis, setMarginAnalysis] = useState(null);

  // Coupon Creator State
  const [couponCode, setCouponCode] = useState('');
  const [couponDesc, setCouponDesc] = useState('');
  const [couponType, setCouponType] = useState('percentage');
  const [couponVal, setCouponVal] = useState('10');
  const [couponMinSpend, setCouponMinSpend] = useState('399');

  // New Product Modal State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCat, setNewCat] = useState('pipecleaner');
  const [newSub, setNewSub] = useState('flowers');
  const [newImg, setNewImg] = useState('');
  const [newStock, setNewStock] = useState('10');

  useEffect(() => {
    if (token && isAdmin) {
      loadAllAdminData();
    }
  }, [token, isAdmin]);

  async function loadAllAdminData() {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [ordRes, prodRes, custRes, comboRes, coupRes] = await Promise.all([
        fetch('/api/orders/admin/all', { headers }),
        fetch('/api/products'),
        fetch('/api/custom-orders/admin/all', { headers }),
        fetch('/api/combos'),
        fetch('/api/coupons', { headers })
      ]);

      const ordData = await ordRes.json();
      const prodData = await prodRes.json();
      const custData = await custRes.json();
      const comboData = await comboRes.json();
      const coupData = await coupRes.json();

      if (ordData.success) setOrders(ordData.orders || []);
      if (prodData.success) setProducts(prodData.products || []);
      if (custData.success) setCustomOrders(custData.customOrders || []);
      if (comboData.success) setCombos(comboData.combos || []);
      if (coupData.success) setCoupons(coupData.coupons || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Order management
  async function handleUpdateOrderStatus(orderId, newStatus) {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
      }
    } catch (err) {
      alert('Failed to update status');
    }
  }

  // Stock management
  async function handleToggleStock(productId, currentOutOfStock) {
    try {
      const res = await fetch(`/api/products/${productId}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          isOutOfStock: !currentOutOfStock,
          stockCount: currentOutOfStock ? 10 : 0
        })
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.map((p) => (p.id === productId ? data.product : p)));
      }
    } catch (err) {
      alert('Failed to toggle stock');
    }
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle,
          price: newPrice,
          cat: newCat,
          sub: newSub,
          img: newImg || '/images/flowermain.jpeg',
          stockCount: parseInt(newStock, 10) || 10,
          colors: []
        })
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => [data.product, ...prev]);
        setShowAddProductModal(false);
        setNewTitle('');
        setNewPrice('');
      }
    } catch (err) {
      alert('Failed to add product');
    }
  }

  // Custom order quoting & chat
  async function openCustomChat(custOrder) {
    setSelectedCustomOrder(custOrder);
    setQuotePrice(custOrder.quotePrice || '');
    setQuoteDays(custOrder.estimatedDays || '3');
    try {
      const res = await fetch(`/api/custom-orders/${custOrder.customOrderId}`);
      const data = await res.json();
      if (data.success) {
        setAdminChatMessages(data.messages || []);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSendAdminReply(e) {
    e.preventDefault();
    if (!adminReplyText.trim() || !selectedCustomOrder) return;
    try {
      const res = await fetch(`/api/custom-orders/${selectedCustomOrder.customOrderId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'admin',
          senderName: 'Handii Studio',
          message: adminReplyText.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setAdminReplyText('');
        const chatRes = await fetch(`/api/custom-orders/${selectedCustomOrder.customOrderId}`);
        const chatData = await chatRes.json();
        if (chatData.success) setAdminChatMessages(chatData.messages || []);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSendQuoteOffer(e) {
    e.preventDefault();
    if (!quotePrice || !selectedCustomOrder) return;
    try {
      const res = await fetch(`/api/custom-orders/${selectedCustomOrder.customOrderId}/quote`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          quotePrice,
          estimatedDays: quoteDays,
          quoteNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedCustomOrder(data.customOrder);
        setCustomOrders((prev) =>
          prev.map((c) => (c.customOrderId === data.customOrder.customOrderId ? data.customOrder : c))
        );
        const chatRes = await fetch(`/api/custom-orders/${selectedCustomOrder.customOrderId}`);
        const chatData = await chatRes.json();
        if (chatData.success) setAdminChatMessages(chatData.messages || []);
        alert('Quote Offer sent to customer! 🌸');
      }
    } catch (err) {
      alert('Failed to send quote');
    }
  }

  async function handleDeclineCustomOrder() {
    if (!selectedCustomOrder) return;
    try {
      const res = await fetch(`/api/custom-orders/${selectedCustomOrder.customOrderId}/decline`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ declineReason })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedCustomOrder(data.customOrder);
        setCustomOrders((prev) =>
          prev.map((c) => (c.customOrderId === data.customOrder.customOrderId ? data.customOrder : c))
        );
        alert('Custom order declined with feedback.');
      }
    } catch (err) {
      alert('Failed to decline');
    }
  }

  // Margin analysis for combo creator
  async function checkComboMargin(selectedIds, priceVal) {
    if (!selectedIds.length) {
      setMarginAnalysis(null);
      return;
    }
    try {
      const res = await fetch('/api/combos/calculate-margin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productIds: selectedIds,
          proposedComboPrice: priceVal
        })
      });
      const data = await res.json();
      if (data.success) {
        setMarginAnalysis(data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreateCombo(e) {
    e.preventDefault();
    if (!comboTitle || !comboProductIds.length || !comboPriceInput) return;
    try {
      const res = await fetch('/api/combos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: comboTitle,
          description: comboDescription,
          badge: comboBadge,
          productIds: comboProductIds,
          comboPrice: comboPriceInput
        })
      });
      const data = await res.json();
      if (data.success) {
        setCombos((prev) => [...prev, data.combo]);
        setComboTitle('');
        setComboPriceInput('');
        setComboProductIds([]);
        setMarginAnalysis(null);
        alert('Combo bundle created successfully with protected margin! 🎁');
      } else {
        alert(data.message || 'Failed to create combo.');
      }
    } catch (err) {
      alert('Error creating combo');
    }
  }

  // Coupon creator
  async function handleCreateCoupon(e) {
    e.preventDefault();
    if (!couponCode) return;
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          code: couponCode,
          description: couponDesc,
          discountType: couponType,
          discountValue: couponVal,
          minOrderValue: couponMinSpend
        })
      });
      const data = await res.json();
      if (data.success) {
        setCoupons((prev) => [...prev, data.coupon]);
        setCouponCode('');
        setCouponDesc('');
        alert(`Coupon ${data.coupon.code} activated! 🎟️`);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Failed to create coupon');
    }
  }

  // Delete Combo Bundle
  async function handleDeleteCombo(comboId, title) {
    if (!window.confirm(`Are you sure you want to remove the published bundle "${title || 'Combo'}" from the storefront?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/combos/${comboId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setCombos((prev) => prev.filter((c) => c.id !== comboId));
      } else {
        alert(data.message || 'Failed to delete combo bundle.');
      }
    } catch (err) {
      alert('Error deleting combo bundle.');
    }
  }

  // Delete Coupon
  async function handleDeleteCoupon(couponId, code) {
    if (!window.confirm(`Are you sure you want to delete coupon code "${code}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/coupons/${couponId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setCoupons((prev) => prev.filter((c) => c.id !== couponId));
      } else {
        alert(data.message || 'Failed to delete coupon.');
      }
    } catch (err) {
      alert('Error deleting coupon.');
    }
  }


  if (!isAdmin) {
    return (
      <div className="page-view wrap">
        <div className="empty-state">
          <span className="tag">Restricted Access</span>
          <h2>Admin Sign In Required 🛡️</h2>
          <p>Please sign in with an Administrator account to access the store management portal.</p>
          <button className="btn btn-primary mt-3" onClick={() => openAuthModal('login')}>
            Sign In as Admin
          </button>
        </div>
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingQuotes = customOrders.filter((c) => c.status === 'submitted').length;
  const outOfStockCount = products.filter((p) => p.isOutOfStock || p.stockCount === 0).length;

  return (
    <div className="page-view admin-page wrap">
      <div className="breadcrumb-bar">
        <Link to="/">Home</Link>
        <span>/</span>
        <span className="current-page">Admin Operations Portal</span>
      </div>

      <div className="admin-page-header">
        <div>
          <span className="tag">Studio Operations</span>
          <h1>Master Admin Control Portal 🛡️</h1>
        </div>
        <span className="admin-profile-tag">Logged in as {user?.name}</span>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="admin-page-tabs">
        <button
          className={`atab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics &amp; KPIs
        </button>
        <button
          className={`atab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📦 Orders ({orders.length})
        </button>
        <button
          className={`atab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          🏷️ Stock &amp; Inventory ({products.length})
        </button>
        <button
          className={`atab ${activeTab === 'custom' ? 'active' : ''}`}
          onClick={() => setActiveTab('custom')}
        >
          💬 Custom Quotes &amp; DMs ({customOrders.length})
        </button>
        <button
          className={`atab ${activeTab === 'combos' ? 'active' : ''}`}
          onClick={() => setActiveTab('combos')}
        >
          🎁 Margin-Safe Combos ({combos.length})
        </button>
        <button
          className={`atab ${activeTab === 'coupons' ? 'active' : ''}`}
          onClick={() => setActiveTab('coupons')}
        >
          🎟️ Coupons ({coupons.length})
        </button>
      </div>

      {/* Tab 1: Analytics & KPIs */}
      {activeTab === 'analytics' && (
        <div className="admin-content-section">
          <div className="kpi-grid">
            <div className="kpi-card">
              <span className="kpi-icon">💰</span>
              <div className="kpi-info">
                <span className="kpi-title">Total Sales Revenue</span>
                <span className="kpi-val">₹{totalRevenue.toLocaleString()}</span>
              </div>
            </div>
            <div className="kpi-card">
              <span className="kpi-icon">📋</span>
              <div className="kpi-info">
                <span className="kpi-title">Total Orders</span>
                <span className="kpi-val">{orders.length}</span>
              </div>
            </div>
            <div className="kpi-card highlight-gold">
              <span className="kpi-icon">💬</span>
              <div className="kpi-info">
                <span className="kpi-title">Pending Custom Quotes</span>
                <span className="kpi-val">{pendingQuotes}</span>
              </div>
            </div>
            <div className="kpi-card highlight-rose">
              <span className="kpi-icon">⚠️</span>
              <div className="kpi-info">
                <span className="kpi-title">Out of Stock Items</span>
                <span className="kpi-val">{outOfStockCount}</span>
              </div>
            </div>
          </div>

          <div className="recent-activity-panel">
            <h3>Recent Incoming Orders</h3>
            <div className="recent-orders-mini-table">
              {orders.slice(0, 6).map((o) => (
                <div key={o.id} className="mini-order-row">
                  <div>
                    <strong>#{o.orderNumber}</strong> — {o.customerName} ({o.customerPhone})
                  </div>
                  <div className="mini-meta">
                    <span className={`status-pill ${o.status}`}>{o.status}</span>
                    <span className="price-tag">₹{o.totalAmount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Orders Fulfillment */}
      {activeTab === 'orders' && (
        <div className="admin-content-section">
          <div className="admin-actions-bar">
            <div className="filter-group">
              <label>Filter Orders by Status:</label>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="crafting">Crafting / In Progress</option>
                <option value="shipped">Dispatched / Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>

          <div className="admin-orders-table">
            {orders
              .filter((o) => orderStatusFilter === 'all' || o.status === orderStatusFilter)
              .map((ord) => (
                <div key={ord.id} className="admin-order-row-card">
                  <div className="aorder-head">
                    <div>
                      <strong>#{ord.orderNumber}</strong> —{' '}
                      <span className="customer-name">{ord.customerName}</span> ({ord.customerPhone})
                    </div>
                    <span className="aorder-date">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="aorder-address">
                    📍 {typeof ord.shippingAddress === 'string' ? ord.shippingAddress : JSON.stringify(ord.shippingAddress)}
                  </div>

                  <div className="aorder-items-list">
                    {(ord.items || []).map((item, i) => (
                      <div key={i} className="aorder-item">
                        <span>
                          • {item.name} x{item.quantity || 1} (Colour: {item.color || 'Custom'})
                        </span>
                        <span>₹{item.price}</span>
                      </div>
                    ))}
                  </div>

                  <div className="aorder-footer-bar">
                    <div className="aorder-total">
                      Total: <strong>₹{ord.totalAmount}</strong> (Method: {ord.paymentMethod})
                    </div>

                    <div className="aorder-status-actions">
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                      >
                        <option value="pending">Pending 📋</option>
                        <option value="crafting">Coiling / Crafting 🧵</option>
                        <option value="shipped">Dispatched 🚚</option>
                        <option value="delivered">Delivered 🌸</option>
                      </select>

                      <a
                        href={`https://wa.me/${ord.customerPhone}?text=${encodeURIComponent(
                          `Hi ${ord.customerName}! Update on your handii.co order #${ord.orderNumber}: Status is now ${ord.status}.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline btn-sm"
                      >
                        WhatsApp Customer 💬
                      </a>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Tab 3: Stock & Inventory CMS */}
      {activeTab === 'inventory' && (
        <div className="admin-content-section">
          {/* Action Bar */}
          <div className="admin-actions-bar">
            <input
              type="text"
              placeholder="🔍  Search catalog products by name..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="admin-search-input"
            />
            <div className="inv-summary-chips">
              <span className="inv-chip total">
                🏷️ {products.length} products
              </span>
              <span className="inv-chip out-chip">
                ⚠️ {products.filter(p => p.isOutOfStock || p.stockCount === 0).length} out of stock
              </span>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddProductModal(true)}
            >
              + Add New Product
            </button>
          </div>

          {/* Inventory Product Card Grid */}
          <div className="inv-card-grid">
            {products
              .filter(
                (p) =>
                  !productSearch ||
                  p.title?.toLowerCase().includes(productSearch.toLowerCase())
              )
              .map((prod) => {
                const isOut = prod.isOutOfStock || prod.stockCount === 0;
                return (
                  <div className={`inv-product-card ${isOut ? 'inv-card-out' : ''}`} key={prod.id}>
                    {/* Product Thumbnail */}
                    <div className="inv-card-img-wrap">
                      <img src={prod.img} alt={prod.title} />
                      {/* Stock Status Badge */}
                      <span className={`inv-stock-badge ${isOut ? 'badge-out-stock' : 'badge-in-stock'}`}>
                        {isOut ? '⚠️ Out of Stock' : '✓ In Stock'}
                      </span>
                    </div>

                    {/* Product Info */}
                    <div className="inv-card-body">
                      <div className="inv-card-category">
                        <span className="inv-cat-pill">{prod.cat}</span>
                        {prod.sub && prod.sub !== 'all' && (
                          <span className="inv-sub-pill">{prod.sub}</span>
                        )}
                      </div>

                      <h5 className="inv-card-title">{prod.title}</h5>

                      <div className="inv-card-meta">
                        <span className="inv-price">₹{prod.price}</span>
                        <span className="inv-qty-tag">
                          Stock: <strong>{prod.stockCount ?? 0}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Card Footer Action */}
                    <div className="inv-card-footer">
                      <button
                        className={`inv-toggle-btn ${isOut ? 'btn-restock' : 'btn-mark-out'}`}
                        onClick={() => handleToggleStock(prod.id, prod.isOutOfStock)}
                      >
                        {isOut ? '📦 Mark In Stock' : '🚫 Mark Out of Stock'}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>

          {products.filter(p => !productSearch || p.title?.toLowerCase().includes(productSearch.toLowerCase())).length === 0 && (
            <div className="empty-state">
              <span className="tag">No products found</span>
              <p>No catalog items match your search.</p>
            </div>
          )}
        </div>
      )}


      {/* Tab 4: Custom Orders & Quoting */}
      {activeTab === 'custom' && (
        <div className="admin-content-section">
          {selectedCustomOrder ? (
            <div className="admin-dm-portal">
              <button
                className="btn btn-outline btn-sm mb-3"
                onClick={() => setSelectedCustomOrder(null)}
              >
                ← Back to Inquiries List
              </button>

              <div className="admin-dm-grid">
                <div className="adm-chat-col">
                  <div className="adm-chat-head">
                    <h3>Chat with {selectedCustomOrder.customerName} ({selectedCustomOrder.customOrderId})</h3>
                    <span className={`status-pill ${selectedCustomOrder.status}`}>
                      {selectedCustomOrder.status}
                    </span>
                  </div>

                  <div className="adm-chat-box">
                    {adminChatMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`dm-message-row ${
                          msg.sender === 'admin' ? 'msg-admin' : 'msg-customer'
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

                  <form className="dm-input-bar" onSubmit={handleSendAdminReply}>
                    <input
                      type="text"
                      placeholder="Type reply to customer..."
                      value={adminReplyText}
                      onChange={(e) => setAdminReplyText(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary btn-sm">
                      Send Reply
                    </button>
                  </form>
                </div>

                <div className="adm-spec-col">
                  <h3>Request Specifications</h3>
                  <p><strong>Category:</strong> {selectedCustomOrder.category}</p>
                  <p><strong>Custom Text:</strong> {selectedCustomOrder.customText || 'None'}</p>
                  <p><strong>Colors:</strong> {selectedCustomOrder.colorPreferences}</p>
                  <p><strong>Specs:</strong> {selectedCustomOrder.specifications}</p>

                  {selectedCustomOrder.referencePhotos?.length > 0 && (
                    <div className="ref-photos-row">
                      <strong>Uploaded Photos:</strong>
                      <div className="ref-thumbs">
                        {selectedCustomOrder.referencePhotos.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noreferrer">
                            <img src={url} alt="Reference" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <hr className="divider-sm" />

                  <h3>Official Price Quote</h3>
                  <form onSubmit={handleSendQuoteOffer} className="quote-form">
                    <div className="form-group">
                      <label>Quote Price (₹) *</label>
                      <input
                        type="number"
                        placeholder="e.g. 650"
                        value={quotePrice}
                        onChange={(e) => setQuotePrice(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Estimated Days to Craft</label>
                      <input
                        type="number"
                        value={quoteDays}
                        onChange={(e) => setQuoteDays(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Quote Note (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Includes premium ribbon box packaging"
                        value={quoteNotes}
                        onChange={(e) => setQuoteNotes(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                      Send Official Quote ✨
                    </button>
                  </form>

                  <div className="decline-section">
                    <input
                      type="text"
                      placeholder="Reason if declining..."
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-outline btn-sm w-100 mt-2"
                      onClick={handleDeclineCustomOrder}
                    >
                      Decline Custom Order
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="admin-custom-requests-grid">
              {customOrders.map((req) => (
                <div className="admin-custom-card" key={req.id}>
                  <div className="req-card-head">
                    <div>
                      <strong>{req.customOrderId}</strong> — {req.customerName}
                    </div>
                    <span className={`status-pill ${req.status}`}>{req.status}</span>
                  </div>
                  <p className="req-card-specs">{req.specifications}</p>
                  <div className="req-card-foot">
                    <span>Category: {req.category}</span>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => openCustomChat(req)}
                    >
                      Open DM &amp; Quote 💬
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Margin-Safe Combo Builder */}
      {activeTab === 'combos' && (
        <div className="admin-content-section">
          <div className="combo-builder-layout">
            <form className="combo-creator-form" onSubmit={handleCreateCombo}>
              <h3>Create Margin-Protected Combo Bundle</h3>
              <div className="form-group">
                <label>Bundle Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Spring Blossom & Alphabet Keychain Duo"
                  value={comboTitle}
                  onChange={(e) => setComboTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Select Products for Combo (Pick 2 or more) *</label>
                <div className="combo-products-picker">
                  {products.slice(0, 30).map((p) => {
                    const isSelected = comboProductIds.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        className={`combo-pick-chip ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          const newIds = isSelected
                            ? comboProductIds.filter((id) => id !== p.id)
                            : [...comboProductIds, p.id];
                          setComboProductIds(newIds);
                          checkComboMargin(newIds, comboPriceInput);
                        }}
                      >
                        {p.title} (₹{p.price})
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-group">
                <label>Proposed Bundle Price (₹) *</label>
                <input
                  type="number"
                  placeholder="e.g. 349"
                  value={comboPriceInput}
                  onChange={(e) => {
                    setComboPriceInput(e.target.value);
                    checkComboMargin(comboProductIds, e.target.value);
                  }}
                  required
                />
              </div>

              {marginAnalysis && (
                <div
                  className={`margin-guard-box ${
                    marginAnalysis.isProfitable ? 'safe' : 'loss-warning'
                  }`}
                >
                  <h4>Smart Margin Analysis:</h4>
                  <p>
                    Total Retail Value: ₹{marginAnalysis.totalRetail} | Base Cost: ₹{marginAnalysis.totalCost}
                  </p>
                  <p>
                    Minimum Safe Price (25% margin floor):{' '}
                    <strong>₹{marginAnalysis.minSafePrice}</strong>
                  </p>
                  <p>
                    Profit: <strong>₹{marginAnalysis.profitAmount}</strong> ({marginAnalysis.profitMarginPercent}% Margin) | Customer Discount: {marginAnalysis.discountPercent}%
                  </p>
                  {marginAnalysis.warning && (
                    <div className="margin-alert-txt">⚠️ {marginAnalysis.warning}</div>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={!marginAnalysis || !marginAnalysis.isProfitable}
              >
                {marginAnalysis && !marginAnalysis.isProfitable
                  ? 'Adjust Price to Safe Margin'
                  : 'Publish Safe Combo Bundle 🎁'}
              </button>
            </form>

            <div className="active-combos-list">
              <div className="list-head-row">
                <h3>Live Published Bundles ({combos.length})</h3>
                <span className="info-subtext">Shown on /combos storefront</span>
              </div>

              {combos.length === 0 ? (
                <div className="empty-state">
                  <span className="tag">No Bundles Yet</span>
                  <p>Create your first combo bundle using the builder on the left.</p>
                </div>
              ) : (
                <div className="admin-combos-grid">
                  {combos.map((c) => (
                    <div key={c.id} className="admin-combo-item-card">
                      <div className="acombo-header">
                        <div>
                          <span className="acombo-badge">{c.badge || 'Curated Bundle'}</span>
                          <h4 className="acombo-title">{c.title}</h4>
                        </div>
                        <button
                          type="button"
                          className="btn-delete-bundle"
                          onClick={() => handleDeleteCombo(c.id, c.title)}
                          title="Remove this published bundle"
                        >
                          🗑️ Remove
                        </button>
                      </div>

                      {c.description && <p className="acombo-desc">{c.description}</p>}

                      {c.products && c.products.length > 0 && (
                        <div className="acombo-products-chips">
                          {c.products.map((p, idx) => (
                            <span key={idx} className="acombo-prod-chip">
                              ✨ {p.title} <small>(₹{p.price})</small>
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="acombo-footer">
                        <div className="acombo-pricing">
                          <span className="strike">₹{c.regularPrice}</span>
                          <span className="deal-price">₹{c.comboPrice}</span>
                          <span className="savings-pill">Save ₹{c.savingsAmount}</span>
                        </div>
                        {c.profitMarginPercent !== undefined && (
                          <span className="margin-pill">
                            🛡️ {c.profitMarginPercent}% Margin
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Coupons */}
      {activeTab === 'coupons' && (
        <div className="admin-content-section">
          <div className="coupon-manager-layout">
            <form className="coupon-form" onSubmit={handleCreateCoupon}>
              <h3>Create Promo Discount Code</h3>
              <div className="form-group">
                <label>Coupon Code *</label>
                <input
                  type="text"
                  placeholder="e.g. HANDMADE20"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  required
                />
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Discount Type</label>
                  <select
                    value={couponType}
                    onChange={(e) => setCouponType(e.target.value)}
                  >
                    <option value="percentage">Percentage (%) Off</option>
                    <option value="fixed">Flat Amount (₹) Off</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Discount Value</label>
                  <input
                    type="number"
                    value={couponVal}
                    onChange={(e) => setCouponVal(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description / Note</label>
                <input
                  type="text"
                  placeholder="e.g. Festive discount on orders above ₹399"
                  value={couponDesc}
                  onChange={(e) => setCouponDesc(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Minimum Cart Spend (₹)</label>
                <input
                  type="number"
                  value={couponMinSpend}
                  onChange={(e) => setCouponMinSpend(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Activate Coupon 🎟️
              </button>
            </form>

            <div className="coupons-table">
              <div className="list-head-row">
                <h3>Active Promo Codes ({coupons.length})</h3>
              </div>

              {coupons.length === 0 ? (
                <div className="empty-state">
                  <span className="tag">No Coupons</span>
                  <p>Create a promo code to offer special discounts to customers.</p>
                </div>
              ) : (
                <div className="admin-coupons-grid">
                  {coupons.map((coup) => (
                    <div key={coup.id} className="coupon-chip-card">
                      <div className="code-head">
                        <div className="code-badge-group">
                          <strong className="code-text">{coup.code}</strong>
                          <span className="disc-badge">
                            {coup.discountType === 'percentage'
                              ? `${coup.discountValue}% OFF`
                              : `₹${coup.discountValue} OFF`}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn-delete-coupon"
                          onClick={() => handleDeleteCoupon(coup.id, coup.code)}
                          title="Delete coupon"
                        >
                          🗑️
                        </button>
                      </div>
                      <p className="coup-desc">
                        {coup.description || (coup.minOrderValue ? `Valid on orders above ₹${coup.minOrderValue}` : 'No minimum spend')}
                      </p>
                      <div className="coup-meta-bar">
                        <span className="used-count">Times used: <strong>{coup.usedCount || 0}</strong></span>
                        {coup.minOrderValue > 0 && (
                          <span className="min-spend-tag">Min ₹{coup.minOrderValue}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="sub-modal-overlay">
          <div className="sub-modal-box">
            <h3>Add New Handcrafted Piece</h3>
            <form onSubmit={handleAddProduct}>
              <div className="form-group">
                <label>Product Title *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="text"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Stock Count</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Category</label>
                  <select value={newCat} onChange={(e) => setNewCat(e.target.value)}>
                    <option value="pipecleaner">Pipe Cleaner</option>
                    <option value="resin">Resin</option>
                    <option value="bracelets">Bracelets</option>
                    <option value="pixelart">Pixel Art</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Subcategory</label>
                  <input
                    type="text"
                    value={newSub}
                    onChange={(e) => setNewSub(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="text"
                  placeholder="/images/flowermain.jpeg"
                  value={newImg}
                  onChange={(e) => setNewImg(e.target.value)}
                />
              </div>
              <div className="modal-actions mt-3">
                <button type="submit" className="btn btn-primary">
                  Save Product
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowAddProductModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
