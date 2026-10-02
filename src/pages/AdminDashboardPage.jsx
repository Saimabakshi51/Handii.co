import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ComboImageSlider from '../components/ComboImageSlider';

const CRAFT_COLOR_PRESETS = [
  { name: 'Blush Pink', hex: '#f8bbd0' },
  { name: 'Lavender Mist', hex: '#d1c4e9' },
  { name: 'Sage Green', hex: '#c8e6c9' },
  { name: 'Daisy Glow', hex: '#fff59d' },
  { name: 'Sky Breeze', hex: '#b3e5fc' },
  { name: 'Rose Gold', hex: '#b76e79' },
  { name: 'Coral Peach', hex: '#ffccbc' },
  { name: 'Pearl White', hex: '#ffffff' },
  { name: 'Midnight Charcoal', hex: '#263238' }
];

export default function AdminDashboardPage() {
  const { user, token, isAdmin, openAuthModal, login, logout } = useAuth();
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
  const chatBottomRef = useRef(null);

  // Combo Builder State
  const [comboTitle, setComboTitle] = useState('');
  const [comboDescription, setComboDescription] = useState('');
  const [comboBadge, setComboBadge] = useState('Special Duo Bundle');
  const [comboCustomImg, setComboCustomImg] = useState('');
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
  const [newCostPrice, setNewCostPrice] = useState('');
  const [newCat, setNewCat] = useState('pipecleaner');
  const [newSub, setNewSub] = useState('flowers');
  const [newImg, setNewImg] = useState('');
  const [newStock, setNewStock] = useState('10');
  const [newBadge, setNewBadge] = useState('');
  const [newColors, setNewColors] = useState([]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#f8bbd0');
  const [newColorImg, setNewColorImg] = useState('');

  // Edit Product Modal State (Full Control: Title, Price, Cost, Stock, Colors, Badges)
  const [editingProduct, setEditingProduct] = useState(null);
  const [editColorName, setEditColorName] = useState('');
  const [editColorHex, setEditColorHex] = useState('#e8b4bc');
  const [editColorImg, setEditColorImg] = useState('');

  // Newsletter Subscribers State
  const [subscribers, setSubscribers] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [copiedSubscribers, setCopiedSubscribers] = useState(false);

  // Helper: Normalize image URLs (fixes Windows backslashes, removes redundant public/, trims spaces)
  function normalizeImageUrl(url) {
    if (!url) return '';
    let cleaned = String(url).trim().replace(/\\/g, '/');
    if (cleaned.startsWith('public/')) {
      cleaned = '/' + cleaned.slice(7);
    } else if (cleaned.startsWith('images/')) {
      cleaned = '/' + cleaned;
    } else if (cleaned.startsWith('uploads/')) {
      cleaned = '/' + cleaned;
    }
    return cleaned;
  }

  // Helper: Direct local file upload via /api/upload
  async function uploadLocalPhoto(file, onUploaded) {
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('photos', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.url) {
        onUploaded(data.url);
      } else {
        alert(data.message || 'Image upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload image from your computer.');
    } finally {
      setUploadingImage(false);
    }
  }

  useEffect(() => {
    if (token && isAdmin) {
      loadAllAdminData();
    }
  }, [token, isAdmin]);

  // Real-time Chat Polling when Admin has a Custom Order chat open
  useEffect(() => {
    let intervalId;
    if (selectedCustomOrder) {
      intervalId = setInterval(() => {
        fetchAdminChatUpdates(selectedCustomOrder.customOrderId);
      }, 2500);
    }
    return () => clearInterval(intervalId);
  }, [selectedCustomOrder]);

  async function loadAllAdminData() {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [ordRes, prodRes, custRes, comboRes, coupRes, subRes] = await Promise.all([
        fetch('/api/orders/admin/all', { headers }),
        fetch('/api/products'),
        fetch('/api/custom-orders/admin/all', { headers }),
        fetch('/api/combos'),
        fetch('/api/coupons', { headers }),
        fetch('/api/newsletter/subscribers')
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

      if (subRes.ok) {
        const subData = await subRes.json();
        if (subData.success) setSubscribers(subData.subscribers || []);
      }
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

  // Quick Stock Toggle
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

  // Add Color Swatch to New Piece
  function handleAddNewColorSwatch() {
    if (!newColorName.trim()) {
      alert('Please enter a color name (e.g. Pastel Rose)');
      return;
    }
    const cleanVariantImg = normalizeImageUrl(newColorImg);
    const colorItem = {
      color: newColorName.trim(),
      style: `background: ${newColorHex}`,
      title: newColorName.trim(),
      img: cleanVariantImg || normalizeImageUrl(newImg) || '/images/flowermain.jpeg'
    };
    setNewColors((prev) => [...prev, colorItem]);
    setNewColorName('');
    setNewColorImg('');
  }

  function handleRemoveNewColorSwatch(idx) {
    setNewColors((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleAddPresetColor(preset) {
    if (newColors.some((c) => c.color.toLowerCase() === preset.name.toLowerCase())) return;
    const cleanVariantImg = normalizeImageUrl(newColorImg);
    setNewColors((prev) => [
      ...prev,
      {
        color: preset.name,
        style: `background: ${preset.hex}`,
        title: preset.name,
        img: cleanVariantImg || normalizeImageUrl(newImg) || '/images/flowermain.jpeg'
      }
    ]);
  }

  // Add New Product
  async function handleAddProduct(e) {
    e.preventDefault();
    try {
      const numPrice = parseInt(String(newPrice).replace(/[^0-9]/g, ''), 10) || 150;
      const cost = newCostPrice ? parseInt(newCostPrice, 10) : Math.round(numPrice * 0.45);
      const cleanPrimaryImg = normalizeImageUrl(newImg) || '/images/flowermain.jpeg';
      const finalizedColors = newColors.map((c) => ({
        ...c,
        img: normalizeImageUrl(c.img) || cleanPrimaryImg
      }));

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          price: String(newPrice).trim(),
          costPrice: cost,
          cat: newCat,
          sub: newSub || 'all',
          badge: newBadge || null,
          img: cleanPrimaryImg,
          stockCount: parseInt(newStock, 10) || 10,
          colors: finalizedColors
        })
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => [data.product, ...prev]);
        setShowAddProductModal(false);
        setNewTitle('');
        setNewPrice('');
        setNewCostPrice('');
        setNewImg('');
        setNewBadge('');
        setNewColors([]);
        setNewColorName('');
        setNewColorImg('');
        alert('New handcrafted piece added to catalog! 🌸');
      }
    } catch (err) {
      alert('Failed to add product');
    }
  }

  // Save Product Edits
  async function handleSaveProductEdit(e) {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const cleanPrimaryImg = normalizeImageUrl(editingProduct.img) || '/images/flowermain.jpeg';
      const updatedProduct = {
        ...editingProduct,
        img: cleanPrimaryImg,
        colors: (editingProduct.colors || []).map((c) => ({
          ...c,
          img: normalizeImageUrl(c.img) || cleanPrimaryImg
        }))
      };

      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedProduct)
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? data.product : p)));
        setEditingProduct(null);
        alert(`Product "${data.product.title}" updated successfully! ✨`);
      } else {
        alert(data.message || 'Failed to update product');
      }
    } catch (err) {
      alert('Error updating product');
    }
  }

  // Delete Product
  async function handleDeleteProduct(productId, productTitle) {
    if (!window.confirm(`Are you sure you want to permanently delete "${productTitle}" from the shop catalog?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        if (editingProduct?.id === productId) setEditingProduct(null);
        alert(`Product "${productTitle}" deleted from catalog.`);
      }
    } catch (err) {
      alert('Failed to delete product');
    }
  }

  // Add Color to Editing Product
  function handleAddColorSwatch() {
    if (!editColorName.trim() || !editingProduct) return;
    const cleanVariantImg = normalizeImageUrl(editColorImg);
    const newColor = {
      color: editColorName.trim(),
      title: editColorName.trim(),
      style: `background: ${editColorHex || '#f8bbd0'}`,
      img: cleanVariantImg || normalizeImageUrl(editingProduct.img) || '/images/flowermain.jpeg'
    };

    setEditingProduct({
      ...editingProduct,
      colors: [...(editingProduct.colors || []), newColor]
    });

    setEditColorName('');
    setEditColorImg('');
  }

  // Add Preset Color to Editing Product
  function handleAddPresetColorToEdit(preset) {
    if (!editingProduct) return;
    if ((editingProduct.colors || []).some((c) => c.color.toLowerCase() === preset.name.toLowerCase())) {
      return;
    }
    const cleanVariantImg = normalizeImageUrl(editColorImg);
    const newColor = {
      color: preset.name,
      title: preset.name,
      style: `background: ${preset.hex}`,
      img: cleanVariantImg || normalizeImageUrl(editingProduct.img) || '/images/flowermain.jpeg'
    };
    setEditingProduct({
      ...editingProduct,
      colors: [...(editingProduct.colors || []), newColor]
    });
  }

  // Remove Color from Editing Product
  function handleRemoveColorSwatch(idx) {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      colors: (editingProduct.colors || []).filter((_, i) => i !== idx)
    });
  }

  // Custom order quoting & chat
  async function openCustomChat(custOrder) {
    setSelectedCustomOrder(custOrder);
    setQuotePrice(custOrder.quotePrice || '');
    setQuoteDays(custOrder.estimatedDays || '3');
    setQuoteNotes(custOrder.quoteNotes || '');
    try {
      const res = await fetch(`/api/custom-orders/${custOrder.customOrderId}`);
      const data = await res.json();
      if (data.success) {
        setAdminChatMessages(data.messages || []);
        setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchAdminChatUpdates(customOrderId) {
    try {
      const res = await fetch(`/api/custom-orders/${customOrderId}`);
      const data = await res.json();
      if (data.success) {
        setAdminChatMessages(data.messages || []);
      }
    } catch (err) {}
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
          senderName: 'Handii Studio Artisan',
          message: adminReplyText.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setAdminReplyText('');
        fetchAdminChatUpdates(selectedCustomOrder.customOrderId);
        setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
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
        fetchAdminChatUpdates(selectedCustomOrder.customOrderId);
        alert('Official Quote Offer sent to customer! 🌸');
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
        alert('Custom order declined with notes.');
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

  // Create Combo
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
          img: comboCustomImg.trim() || undefined,
          productIds: comboProductIds,
          comboPrice: comboPriceInput
        })
      });
      const data = await res.json();
      if (data.success) {
        setCombos((prev) => [...prev, data.combo]);
        setComboTitle('');
        setComboDescription('');
        setComboCustomImg('');
        setComboPriceInput('');
        setComboProductIds([]);
        setMarginAnalysis(null);
        alert('Combo bundle created successfully with protected profit margin! 🎁');
      } else {
        alert(data.message || 'Failed to create combo.');
      }
    } catch (err) {
      alert('Error creating combo');
    }
  }

  // Delete Combo
  async function handleDeleteCombo(comboId, title) {
    if (!window.confirm(`Delete combo bundle "${title}"?`)) return;
    try {
      const res = await fetch(`/api/combos/${comboId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCombos((prev) => prev.filter((c) => c.id !== comboId));
        alert('Combo bundle removed.');
      }
    } catch (err) {
      alert('Failed to delete combo');
    }
  }

  // Create Coupon
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
        alert(`Coupon ${data.coupon.code} created! 🎟️`);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error creating coupon');
    }
  }

  // Delete Coupon
  async function handleDeleteCoupon(couponId, code) {
    if (!window.confirm(`Delete coupon code "${code}"?`)) return;
    try {
      const res = await fetch(`/api/coupons/${couponId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCoupons((prev) => prev.filter((c) => c.id !== couponId));
      }
    } catch (err) {
      alert('Failed to delete coupon');
    }
  }

  const [gateEmail, setGateEmail] = useState('');
  const [gatePassword, setGatePassword] = useState('');
  const [gateLoading, setGateLoading] = useState(false);
  const [gateError, setGateError] = useState('');

  async function handleGateLogin(e) {
    if (e) e.preventDefault();
    setGateLoading(true);
    setGateError('');
    const res = await login(gateEmail.trim(), gatePassword);
    setGateLoading(false);
    if (!res.success) {
      setGateError(res.message || 'Invalid admin credentials');
    }
  }

  if (!isAdmin) {
    return (
      <div className="page-view wrap">
        <div className="admin-gate-card">
          <div className="admin-gate-icon">🛡️</div>
          <span className="tag">Handii Studio Staff</span>
          <h2>Studio Administrator Portal</h2>
          <p className="gate-desc">
            Sign in with Studio Admin credentials to access live revenue analytics, dispatch status, inventory controls, custom order quoting, and margin-protected combo builder.
          </p>

          {gateError && <div className="auth-error-banner mb-3">{gateError}</div>}

          <form onSubmit={handleGateLogin} className="admin-gate-form">
            <div className="form-group text-left">
              <label>Admin Email</label>
              <input
                type="email"
                value={gateEmail}
                onChange={(e) => setGateEmail(e.target.value)}
                placeholder="admin@handii.co"
                required
              />
            </div>

            <div className="form-group text-left">
              <label>Admin Password</label>
              <input
                type="password"
                value={gatePassword}
                onChange={(e) => setGatePassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={gateLoading}>
              {gateLoading ? 'Signing in...' : 'Sign In to Admin Dashboard 🛡️'}
            </button>
          </form>


        </div>
      </div>
    );
  }

  // Filtered lists
  const filteredProducts = products.filter((p) => {
    if (!productSearch) return true;
    const q = productSearch.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q) || (p.sub && p.sub.toLowerCase().includes(q));
  });

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'all') return true;
    return o.status === orderStatusFilter;
  });

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const customPendingCount = customOrders.filter((c) => c.status === 'submitted').length;
  const outOfStockCount = products.filter((p) => p.isOutOfStock || p.stockCount === 0).length;

  return (
    <div className="page-view admin-page wrap">
      <div className="breadcrumb-bar">
        <Link to="/">Home</Link>
        <span>/</span>
        <span className="current-page">Studio Admin CMS</span>
      </div>

      {/* Admin Header Banner */}
      <div className="admin-page-header">
        <div>
          <span className="tag">Studio Management</span>
          <h1>handii.co Management Suite 🛡️</h1>
          <p className="admin-sub">Logged in as {user.name} ({user.email})</p>
        </div>

        <div className="admin-top-actions">
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddProductModal(true)}>
            + Add New Product 🌸
          </button>
          <button className="btn btn-outline btn-sm" onClick={loadAllAdminData} disabled={loading}>
            {loading ? 'Refreshing...' : '↻ Refresh Data'}
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="admin-kpi-grid">
        <div className="kpi-card revenue">
          <span className="kpi-label">Total Revenue</span>
          <h2 className="kpi-val">₹{totalRevenue}</h2>
          <span className="kpi-note">{orders.length} total orders placed</span>
        </div>
        <div className="kpi-card pending">
          <span className="kpi-label">Pending Orders</span>
          <h2 className="kpi-val">{pendingCount}</h2>
          <span className="kpi-note">Awaiting dispatch</span>
        </div>
        <div className="kpi-card custom">
          <span className="kpi-label">Custom Inquiries</span>
          <h2 className="kpi-val">{customPendingCount}</h2>
          <span className="kpi-note">Bespoke requests to quote</span>
        </div>
        <div className="kpi-card stock">
          <span className="kpi-label">Out of Stock</span>
          <h2 className="kpi-val">{outOfStockCount}</h2>
          <span className="kpi-note">{products.length} catalog items</span>
        </div>
      </div>

      {/* Admin Tabs Bar */}
      <div className="admin-tabs-bar">
        <button
          type="button"
          className={`adm-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Overview
        </button>
        <button
          type="button"
          className={`adm-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          🧾 Order Manager ({orders.length})
        </button>
        <button
          type="button"
          className={`adm-tab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          📦 Catalog &amp; Colors ({products.length})
        </button>
        <button
          type="button"
          className={`adm-tab ${activeTab === 'custom' ? 'active' : ''}`}
          onClick={() => setActiveTab('custom')}
        >
          💬 Custom Quotes &amp; DMs ({customOrders.length})
        </button>
        <button
          type="button"
          className={`adm-tab ${activeTab === 'combos' ? 'active' : ''}`}
          onClick={() => setActiveTab('combos')}
        >
          🎁 Smart Combos ({combos.length})
        </button>
        <button
          type="button"
          className={`adm-tab ${activeTab === 'coupons' ? 'active' : ''}`}
          onClick={() => setActiveTab('coupons')}
        >
          🎟️ Promo Coupons ({coupons.length})
        </button>
        <button
          type="button"
          className={`adm-tab ${activeTab === 'subscribers' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscribers')}
        >
          💌 Drop Subscribers ({subscribers.length})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'analytics' && (
        <div className="admin-content-section">
          <div className="admin-overview-grid">
            <div className="overview-panel">
              <h3>Recent Customer Orders</h3>
              {orders.slice(0, 5).map((ord) => (
                <div key={ord.id} className="quick-order-row">
                  <div>
                    <strong>#{ord.orderNumber}</strong> — {ord.customerName}
                    <span className="ord-date">{new Date(ord.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="ord-right">
                    <strong>₹{ord.totalAmount}</strong>
                    <span className={`status-pill ${ord.status}`}>{ord.status}</span>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline btn-sm w-100 mt-3"
                onClick={() => setActiveTab('orders')}
              >
                View All {orders.length} Orders →
              </button>
            </div>

            <div className="overview-panel">
              <h3>Pending Custom Inquiries</h3>
              {customOrders.slice(0, 5).map((req) => (
                <div key={req.id} className="quick-order-row">
                  <div>
                    <strong>{req.customOrderId}</strong> — {req.customerName} ({req.category})
                    {req.targetDate && (
                      <span className="ord-date">Deliver by: {new Date(req.targetDate).toLocaleDateString()}</span>
                    )}
                  </div>
                  <div className="ord-right">
                    <span className={`status-pill ${req.status}`}>{req.status}</span>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        setActiveTab('custom');
                        openCustomChat(req);
                      }}
                    >
                      Quote 💬
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Orders Manager (Pastel Theme) */}
      {activeTab === 'orders' && (
        <div className="admin-content-section">
          {/* Pastel Status Metric Filter Bar */}
          <div className="orders-pastel-metrics-bar">
            <button
              type="button"
              className={`order-pastel-pill-btn pill-all ${orderStatusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setOrderStatusFilter('all')}
            >
              <span>📋 All Orders</span>
              <span className="pill-count-tag">{orders.length}</span>
            </button>
            <button
              type="button"
              className={`order-pastel-pill-btn pill-pending ${orderStatusFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setOrderStatusFilter('pending')}
            >
              <span>⏳ Pending Orders</span>
              <span className="pill-count-tag">{orders.filter((o) => o.status === 'pending').length}</span>
            </button>
            <button
              type="button"
              className={`order-pastel-pill-btn pill-crafting ${orderStatusFilter === 'crafting' ? 'active' : ''}`}
              onClick={() => setOrderStatusFilter('crafting')}
            >
              <span>🧵 In Crafting</span>
              <span className="pill-count-tag">{orders.filter((o) => o.status === 'crafting').length}</span>
            </button>
            <button
              type="button"
              className={`order-pastel-pill-btn pill-shipped ${orderStatusFilter === 'shipped' ? 'active' : ''}`}
              onClick={() => setOrderStatusFilter('shipped')}
            >
              <span>🚚 Dispatched</span>
              <span className="pill-count-tag">{orders.filter((o) => o.status === 'shipped').length}</span>
            </button>
            <button
              type="button"
              className={`order-pastel-pill-btn pill-delivered ${orderStatusFilter === 'delivered' ? 'active' : ''}`}
              onClick={() => setOrderStatusFilter('delivered')}
            >
              <span>🌸 Delivered</span>
              <span className="pill-count-tag">{orders.filter((o) => o.status === 'delivered').length}</span>
            </button>
          </div>

          <div className="admin-orders-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order Details</th>
                  <th>Customer Info</th>
                  <th>Quick Contact</th>
                  <th>Purchased Items &amp; Colors</th>
                  <th>Amount</th>
                  <th>Fulfillment Status</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#5c7175' }}>
                      No orders found under <strong>"{orderStatusFilter}"</strong> status.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord.id}>
                      <td>
                        <span className="order-num-pastel-chip">#{ord.orderNumber}</span>
                        <span className="table-sub mt-1" style={{ fontSize: '0.72rem', color: '#667' }}>
                          📅 {new Date(ord.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <div className="order-cust-avatar-box">
                          <div className="order-avatar-circle">
                            {(ord.customerName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong style={{ color: 'var(--ink)', fontSize: '0.9rem' }}>{ord.customerName}</strong>
                            <span className="table-sub" style={{ display: 'block', maxWidth: '180px', fontSize: '0.72rem', color: '#6b7280' }}>
                              📍 {ord.shippingAddress}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{ord.customerPhone}</span>
                        <div>
                          <a
                            href={`https://wa.me/${ord.customerPhone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Hi ${ord.customerName}! Handii Studio is reaching out regarding your order #${ord.orderNumber}.`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-wa-chip"
                          >
                            💬 WhatsApp
                          </a>
                        </div>
                      </td>
                      <td>
                        <div className="table-items-stack">
                          {(ord.items || []).map((it, idx) => (
                            <span key={idx} className="item-inline-chip">
                              🌸 {it.name} <small>x{it.quantity || 1}</small>
                              {it.color && <span className="color-tag">{it.color}</span>}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className="order-total-pastel-badge">₹{ord.totalAmount}</span>
                        {ord.couponCode && <span className="coup-badge" style={{ marginTop: '3px' }}>🎟️ {ord.couponCode}</span>}
                      </td>
                      <td>
                        <select
                          className={`status-select ${ord.status}`}
                          value={ord.status}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                        >
                          <option value="pending">📋 Pending</option>
                          <option value="crafting">🧵 Crafting</option>
                          <option value="shipped">🚚 Dispatched</option>
                          <option value="delivered">🌸 Delivered</option>
                        </select>
                      </td>
                      <td>
                        <span className="payment-mode-pill">{ord.paymentMethod || 'Prepaid Online'}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Catalog & Colors Manager (Full Control) */}
      {activeTab === 'inventory' && (
        <div className="admin-content-section">
          <div className="inventory-top-bar">
            <input
              type="text"
              placeholder="Search catalog by title, category, or subcategory..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="search-input"
            />
            <button className="btn btn-primary" onClick={() => setShowAddProductModal(true)}>
              + Add New Piece 🌸
            </button>
          </div>

          <div className="admin-products-grid">
            {filteredProducts.map((p) => (
              <div className="admin-product-card" key={p.id}>
                <div className="prod-head-row">
                  <img
                    src={p.img || '/images/flowermain.jpeg'}
                    alt={p.title}
                    className="admin-prod-thumb"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/images/flowermain.jpeg';
                    }}
                  />
                  <div className="admin-prod-meta">
                    <h4>{p.title}</h4>
                    <span className="tag-cat">
                      {p.cat === 'pipecleaner'
                        ? '🌸 Pipe Cleaner'
                        : p.cat === 'resin'
                        ? '💎 Resin Art'
                        : p.cat === 'bracelets'
                        ? '📿 Bracelets'
                        : '👾 Pixel Art'}{' '}
                      • {p.sub}
                    </span>
                    {p.badge && <span className="admin-badge-pill">{p.badge}</span>}
                  </div>
                </div>

                <div className="prod-numbers-row">
                  <div>
                    <span className="num-lbl">Selling Price</span>
                    <strong style={{ color: 'var(--rose)' }}>₹{p.price}</strong>
                  </div>
                  <div>
                    <span className="num-lbl">Base Cost</span>
                    <span>₹{p.costPrice || Math.round(parseInt(p.price, 10) * 0.45)}</span>
                  </div>
                  <div>
                    <span className="num-lbl">Stock</span>
                    <strong className={p.isOutOfStock || p.stockCount === 0 ? 'stock-zero' : ''}>
                      {p.stockCount} in stock
                    </strong>
                  </div>
                </div>

                {p.colors && p.colors.length > 0 ? (
                  <div className="admin-color-swatches-preview">
                    <span className="color-label" style={{ fontSize: '0.72rem', fontWeight: 600 }}>
                      Colors ({p.colors.length}):
                    </span>
                    {p.colors.map((c, i) => (
                      <span
                        key={i}
                        className="admin-color-dot"
                        title={c.color}
                        style={{ background: c.style?.replace('background:', '') || '#ccc' }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="admin-color-swatches-preview" style={{ opacity: 0.6 }}>
                    <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>No color variants set</span>
                  </div>
                )}

                <div className="admin-card-actions">
                  <button
                    type="button"
                    className="btn-edit-piece"
                    onClick={() => setEditingProduct(p)}
                  >
                    ✏️ Edit Piece &amp; Colors
                  </button>

                  <button
                    type="button"
                    className={`btn-stock-toggle ${p.isOutOfStock || p.stockCount === 0 ? 'out-stock' : 'in-stock'}`}
                    onClick={() => handleToggleStock(p.id, p.isOutOfStock || p.stockCount === 0)}
                  >
                    {p.isOutOfStock || p.stockCount === 0 ? 'Mark In Stock' : 'Out of Stock'}
                  </button>

                  <button
                    type="button"
                    className="btn-delete-piece-icon"
                    onClick={() => handleDeleteProduct(p.id, p.title)}
                    title="Delete product"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Custom Orders & Real-time Quoting DM */}
      {activeTab === 'custom' && (
        <div className="admin-content-section">
          {selectedCustomOrder ? (
            <div className="admin-dm-portal">
              <button
                className="btn btn-outline btn-sm mb-3"
                onClick={() => setSelectedCustomOrder(null)}
              >
                ← Back to Custom Inquiries List
              </button>

              <div className="admin-dm-grid">
                <div className="adm-chat-col">
                  <div className="adm-chat-head">
                    <div>
                      <h3>Chat with {selectedCustomOrder.customerName}</h3>
                      <span className="adm-chat-sub">Inquiry ID: {selectedCustomOrder.customOrderId} ({selectedCustomOrder.category})</span>
                    </div>
                    <div className="adm-chat-badges">
                      <span className={`status-pill ${selectedCustomOrder.status}`}>
                        {selectedCustomOrder.status.toUpperCase()}
                      </span>
                      <span className="live-pill">🟢 Live Realtime</span>
                    </div>
                  </div>

                  <div className="adm-chat-box">
                    {adminChatMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`dm-message-row ${
                          msg.isSystemMessage
                            ? 'msg-system'
                            : msg.sender === 'admin'
                            ? 'msg-admin'
                            : 'msg-customer'
                        }`}
                      >
                        <div className="dm-bubble">
                          <div className="dm-author">
                            <strong>{msg.isSystemMessage ? '📢 Studio Log' : msg.senderName}</strong>
                            <span className="dm-time">
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="dm-text">{msg.message}</p>
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="dm-attachments">
                              {msg.attachments.map((url, imgIdx) => (
                                <img key={imgIdx} src={url} alt="Attachment" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={chatBottomRef} />
                  </div>

                  <form className="dm-input-bar" onSubmit={handleSendAdminReply}>
                    <input
                      type="text"
                      placeholder="Type reply to customer..."
                      value={adminReplyText}
                      onChange={(e) => setAdminReplyText(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary btn-sm">
                      Send Reply 💬
                    </button>
                  </form>
                </div>

                <div className="adm-spec-col">
                  <h3>Inquiry Specifications</h3>
                  <div className="spec-item"><strong>Category:</strong> <span>{selectedCustomOrder.category}</span></div>
                  <div className="spec-item"><strong>Customer:</strong> <span>{selectedCustomOrder.customerName} ({selectedCustomOrder.customerPhone})</span></div>
                  {selectedCustomOrder.targetDate && (
                    <div className="spec-item target-date-highlight">
                      <strong>Target Delivery Date:</strong> <span>📅 {new Date(selectedCustomOrder.targetDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="spec-item"><strong>Custom Text:</strong> <span>{selectedCustomOrder.customText || 'None'}</span></div>
                  <div className="spec-item"><strong>Colors:</strong> <span>{selectedCustomOrder.colorPreferences || 'Not specified'}</span></div>
                  <div className="spec-item"><strong>Design Vision:</strong> <p>{selectedCustomOrder.specifications}</p></div>

                  {selectedCustomOrder.referencePhotos?.length > 0 && (
                    <div className="ref-photos-row">
                      <strong>Reference Photos:</strong>
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

                  <h3>Send Official Price Quote</h3>
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
                      <label>Note to Customer (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Includes premium gift packaging"
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
                      Decline Request
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
                      {req.targetDate && (
                        <span className="req-date-tag"> (Deliver by: {new Date(req.targetDate).toLocaleDateString()})</span>
                      )}
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

      {/* Tab 5: Margin-Safe Combo Builder & Manager */}
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
                <label>Description</label>
                <input
                  type="text"
                  placeholder="e.g. Handcrafted pipe cleaner bouquet paired with resin letter charm"
                  value={comboDescription}
                  onChange={(e) => setComboDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Custom Combo Photo URL (Optional - if blank, products slideshow is used)</label>
                <input
                  type="text"
                  placeholder="e.g. /images/flowermain.jpeg (or leave empty for Instagram-style slider)"
                  value={comboCustomImg}
                  onChange={(e) => setComboCustomImg(e.target.value)}
                />
              </div>

              {/* Theme-Matched Craft Product Selection Cards for Combo */}
              <div className="form-group">
                <label>Select Products for Combo (Pick 2 or more) *</label>
                <div className="combo-products-craft-picker">
                  {products.map((p) => {
                    const isSelected = comboProductIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        className={`combo-craft-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          const newIds = isSelected
                            ? comboProductIds.filter((id) => id !== p.id)
                            : [...comboProductIds, p.id];
                          setComboProductIds(newIds);
                          checkComboMargin(newIds, comboPriceInput);
                        }}
                      >
                        <div className="combo-craft-thumb">
                          <img src={p.img} alt={p.title} />
                          {isSelected && <span className="craft-check-seal">✓</span>}
                        </div>
                        <div className="combo-craft-info">
                          <strong className="craft-title">{p.title}</strong>
                          <div className="craft-price-row">
                            <span className="retail-badge">₹{p.price}</span>
                            <span className="cost-tag">Cost: ₹{p.costPrice || Math.round(parseInt(p.price, 10) * 0.45)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Smart Duo Preview (1st img + 2nd img) if 2 products selected */}
              {comboProductIds.length === 2 && (
                <div className="combo-live-builder-preview">
                  <div className="preview-duo-head">
                    <span className="sparkle-tag">✨ Smart Duo Preview (1st img + 2nd img)</span>
                    <span className="info-subtext">Storefront Presentation</span>
                  </div>
                  <div className="combo-duo-viewport preview-mini-viewport">
                    <div className="combo-duo-side piece-left" title="Piece 1">
                      <img
                        src={products.find((p) => p.id === comboProductIds[0])?.img || '/images/flowermain.jpeg'}
                        alt="1st Piece"
                        className="combo-duo-img"
                      />
                      <span className="combo-duo-tag">
                        {products.find((p) => p.id === comboProductIds[0])?.title || '1st Piece'}
                      </span>
                    </div>
                    <div className="combo-plus-connector" title="Bundle Pair (+)">
                      <span className="combo-plus-symbol">+</span>
                    </div>
                    <div className="combo-duo-side piece-right" title="Piece 2">
                      <img
                        src={products.find((p) => p.id === comboProductIds[1])?.img || '/images/flowermain.jpeg'}
                        alt="2nd Piece"
                        className="combo-duo-img"
                      />
                      <span className="combo-duo-tag">
                        {products.find((p) => p.id === comboProductIds[1])?.title || '2nd Piece'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

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
                <span className="info-subtext">Shown on /combos &amp; storefront</span>
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
                      <div className="acombo-media-wrap" style={{ borderRadius: '14px', overflow: 'hidden', marginBottom: '12px' }}>
                        <ComboImageSlider combo={c} />
                      </div>

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

                      {c.items && c.items.length > 0 && (
                        <div className="acombo-products-chips">
                          {c.items.map((p, idx) => (
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
                  placeholder="e.g. WELCOME10"
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
                  placeholder="e.g. 10% off for new customers on first order"
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
                <span className="info-subtext">Each code is strictly 1-time per user</span>
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

      {/* Tab 7: Email Subscribers */}
      {activeTab === 'subscribers' && (
        <div className="admin-content-section">
          <div className="list-head-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3>Early Drop &amp; Restock Subscribers ({subscribers.length}) 💌</h3>
              <span className="info-subtext">Customers subscribed to receive artisan restock notifications and private drop alerts</span>
            </div>
            {subscribers.length > 0 && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  const emails = subscribers.map((s) => s.email).join(', ');
                  navigator.clipboard.writeText(emails);
                  setCopiedSubscribers(true);
                  setTimeout(() => setCopiedSubscribers(false), 2500);
                }}
              >
                {copiedSubscribers ? 'Copied Emails to Clipboard! ✓' : '📋 Copy All Emails'}
              </button>
            )}
          </div>

          {subscribers.length === 0 ? (
            <div className="empty-state">
              <span className="tag">No Subscribers Yet</span>
              <p>When customers subscribe on the storefront newsletter form, their emails will appear here.</p>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-orders-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Email Address</th>
                    <th>Subscribed On</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((s, idx) => (
                    <tr key={s.id || idx}>
                      <td>{idx + 1}</td>
                      <td><strong>{s.email}</strong></td>
                      <td>
                        {s.subscribedAt
                          ? new Date(s.subscribedAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Recently'}
                      </td>
                      <td>
                        <span className="order-status-pill shipped">VIP Active</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-rose btn-sm"
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          title="Remove subscriber"
                          onClick={async () => {
                            if (!window.confirm(`Remove ${s.email} from drop alert list?`)) return;
                            await fetch(`/api/newsletter/subscribers/${s.id}`, { method: 'DELETE' });
                            setSubscribers((prev) => prev.filter((sub) => sub.id !== s.id));
                          }}
                        >
                          ✕ Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Product Modal (Revamped with Color Options & Live Storefront Preview) */}
      {showAddProductModal && (
        <div className="modal-overlay" onClick={() => setShowAddProductModal(false)}>
          <div className="craft-modal admin-add-piece-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowAddProductModal(false)}>✕</button>
            <div className="auth-header">
              <span className="tag">Handmade Studio Catalog</span>
              <h2>Add New Handcrafted Piece 🌸</h2>
              <p className="auth-sub">Configure piece details, colors, profit margins &amp; instant live storefront preview</p>
            </div>

            <div className="piece-modal-body">
              {/* Left Column: Comprehensive Creator Form */}
              <form onSubmit={handleAddProduct} className="admin-form-grid">
                {/* 1. Identity & Category */}
                <div className="form-sub-section">
                  <span className="section-legend">🌸 1. Piece Identity &amp; Craft Category</span>
                  <div className="form-group">
                    <label>Product Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Lavender Blossom Stem or Resin Letter Charm"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group mt-2">
                    <label>Category *</label>
                    <div className="cat-btn-group">
                      {[
                        { id: 'pipecleaner', label: '🌸 Pipe Cleaner' },
                        { id: 'resin', label: '💎 Resin Art' },
                        { id: 'bracelets', label: '📿 Bracelets' },
                        { id: 'pixelart', label: '👾 Pixel Art' }
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          className={`cat-select-btn ${newCat === cat.id ? 'active' : ''}`}
                          onClick={() => setNewCat(cat.id)}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-row-2 mt-2">
                    <div className="form-group">
                      <label>Subcategory</label>
                      <input
                        type="text"
                        placeholder="e.g. flowers, keychains, bouquet"
                        value={newSub}
                        onChange={(e) => setNewSub(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Badge / Tag</label>
                      <input
                        type="text"
                        placeholder="e.g. Bestseller, Studio Pick, New"
                        value={newBadge}
                        onChange={(e) => setNewBadge(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Pricing & Margin */}
                <div className="form-sub-section">
                  <span className="section-legend">💰 2. Pricing, Margin &amp; Inventory</span>
                  <div className="form-row-3">
                    <div className="form-group">
                      <label>Selling Price (₹) *</label>
                      <input
                        type="text"
                        placeholder="e.g. 210"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Base Cost (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 95 (defaults ~45%)"
                        value={newCostPrice}
                        onChange={(e) => setNewCostPrice(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Initial Stock</label>
                      <input
                        type="number"
                        value={newStock}
                        onChange={(e) => setNewStock(e.target.value)}
                      />
                    </div>
                  </div>

                  {newPrice && (
                    <div className="profit-margin-calc-bar">
                      <span>
                        Base Cost: ₹{newCostPrice || Math.round((parseInt(String(newPrice).replace(/[^0-9]/g, ''), 10) || 150) * 0.45)}
                      </span>
                      <strong>
                        Estimated Profit: ₹{
                          (parseInt(String(newPrice).replace(/[^0-9]/g, ''), 10) || 0) -
                          (newCostPrice ? parseInt(newCostPrice, 10) : Math.round((parseInt(String(newPrice).replace(/[^0-9]/g, ''), 10) || 0) * 0.45))
                        }{' '}
                        ({Math.round(
                          (((parseInt(String(newPrice).replace(/[^0-9]/g, ''), 10) || 0) -
                            (newCostPrice ? parseInt(newCostPrice, 10) : Math.round((parseInt(String(newPrice).replace(/[^0-9]/g, ''), 10) || 0) * 0.45))) /
                            (parseInt(String(newPrice).replace(/[^0-9]/g, ''), 10) || 1)) * 100
                        )}% Margin)
                      </strong>
                    </div>
                  )}
                </div>

                {/* 3. Color Swatches & Variants Manager */}
                <div className="form-sub-section">
                  <span className="section-legend">🎨 3. Color Options &amp; Variants</span>
                  <label className="info-subtext">Click quick presets or create custom color swatches:</label>
                  <div className="preset-palette-tray">
                    {CRAFT_COLOR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="preset-color-pill"
                        onClick={() => handleAddPresetColor(preset)}
                        title={`Add ${preset.name}`}
                      >
                        <span className="preset-dot" style={{ background: preset.hex }} />
                        {preset.name} +
                      </button>
                    ))}
                  </div>

                  <div className="color-input-controls">
                    <input
                      type="text"
                      placeholder="Color Name (e.g. Blush Pink)"
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                    />
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      title="Choose custom color hex"
                      className="color-picker-wheel"
                    />
                    <input
                      type="text"
                      placeholder="Variant Image (URL or uploaded file)"
                      value={newColorImg}
                      onChange={(e) => setNewColorImg(normalizeImageUrl(e.target.value))}
                    />
                    <label className="admin-file-upload-btn" title="Choose local image file for this color">
                      📁 Photo
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadLocalPhoto(file, (url) => setNewColorImg(url));
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={handleAddNewColorSwatch}
                    >
                      + Add Swatch
                    </button>
                  </div>

                  {newColors.length > 0 && (
                    <div className="color-chips-display">
                      {newColors.map((c, idx) => (
                        <div key={idx} className="swatch-item-chip">
                          <span
                            className="swatch-color-circle"
                            style={{ background: c.style?.replace('background:', '') || '#ccc' }}
                          />
                          <strong>{c.color}</strong>
                          {c.img && c.img !== newImg && (
                            <small className="info-subtext">(Custom Photo)</small>
                          )}
                          <button
                            type="button"
                            className="btn-remove-color"
                            onClick={() => handleRemoveNewColorSwatch(idx)}
                            title="Remove color swatch"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Imagery */}
                <div className="form-sub-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <span className="section-legend" style={{ margin: 0 }}>🖼️ 4. Primary Product Photo</span>
                    <label className="admin-file-upload-btn">
                      📁 Choose File from PC
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadLocalPhoto(file, (url) => setNewImg(url));
                        }}
                      />
                    </label>
                  </div>
                  <div className="form-group">
                    <label>Image URL Path (or choose local file from PC above)</label>
                    <input
                      type="text"
                      placeholder="e.g. /images/flowermain.jpeg, /uploads/..., or https://..."
                      value={newImg}
                      onChange={(e) => setNewImg(normalizeImageUrl(e.target.value))}
                    />
                    {uploadingImage && <small className="info-subtext" style={{ color: 'var(--gold-deep)' }}>Uploading local photo to studio server... ⏳</small>}
                  </div>
                  <div className="sample-img-chips">
                    <span className="info-subtext mr-2">Quick Studio Samples:</span>
                    {[
                      { label: '🌸 Flower Bouquet', url: '/images/flowermain.jpeg' },
                      { label: '💎 Resin Letter', url: '/images/cat-resin.png' },
                      { label: '🪴 Flower Pot', url: '/images/cat-pipe.png' },
                      { label: '📿 Bracelet Set', url: '/images/cat-bracelets.png' }
                    ].map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="sample-img-btn"
                        onClick={() => setNewImg(sample.url)}
                      >
                        {sample.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-100 mt-2 py-3" style={{ fontSize: '1rem' }}>
                  ✨ Publish Handcrafted Piece to Storefront
                </button>
              </form>

              {/* Right Column: Live Storefront Mockup Preview Card */}
              <div className="live-preview-panel">
                <span className="preview-heading-badge">✨ Live Storefront Mockup</span>
                <div className="live-mockup-card">
                  <div className="mockup-img-wrap">
                    <img
                      src={newImg.trim() || '/images/flowermain.jpeg'}
                      alt={newTitle || 'Handcrafted preview'}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/images/flowermain.jpeg';
                      }}
                    />
                    {newBadge && <span className="mockup-badge">{newBadge}</span>}
                  </div>

                  <div className="mockup-body">
                    <span className="mockup-cat-tag">
                      {newCat === 'pipecleaner'
                        ? 'Pipe Cleaner'
                        : newCat === 'resin'
                        ? 'Resin Art'
                        : newCat === 'bracelets'
                        ? 'Handmade Bracelet'
                        : 'Pixel Art'}{' '}
                      {newSub ? `• ${newSub}` : ''}
                    </span>
                    <h4 className="mockup-title">{newTitle || 'Untitled Handcrafted Piece'}</h4>

                    <div className="mockup-price-row">
                      <span className="mockup-price">₹{newPrice || '150'}</span>
                      <span className="mockup-margin-pill">
                        {parseInt(newStock, 10) > 0 ? `${newStock} in stock` : 'Out of Stock'}
                      </span>
                    </div>

                    {newColors.length > 0 && (
                      <div className="mockup-colors-row">
                        <span className="color-label" style={{ fontSize: '0.72rem' }}>
                          Colors ({newColors.length}):
                        </span>
                        {newColors.map((c, idx) => (
                          <span
                            key={idx}
                            className="mockup-color-dot"
                            style={{ background: c.style?.replace('background:', '') || '#ccc' }}
                            title={c.color}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal (Revamped with Split-View Studio UI & Color Swatches Manager) */}
      {editingProduct && (
        <div className="modal-overlay" onClick={() => setEditingProduct(null)}>
          <div className="craft-modal admin-add-piece-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setEditingProduct(null)}>✕</button>

            <div className="auth-header">
              <span className="tag">Catalog &amp; Color Editor</span>
              <h2>Edit Piece: {editingProduct.title} 🌸</h2>
              <p className="auth-sub">Modify details, configure color swatches &amp; preview changes in real time</p>
            </div>

            <div className="piece-modal-body">
              {/* Left Column: Form Editor */}
              <form onSubmit={handleSaveProductEdit} className="admin-form-grid">
                {/* 1. Identity & Category */}
                <div className="form-sub-section">
                  <span className="section-legend">🌸 1. Piece Identity &amp; Category</span>
                  <div className="form-group">
                    <label>Product Title *</label>
                    <input
                      type="text"
                      value={editingProduct.title}
                      onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group mt-2">
                    <label>Category *</label>
                    <div className="cat-btn-group">
                      {[
                        { id: 'pipecleaner', label: '🌸 Pipe Cleaner' },
                        { id: 'resin', label: '💎 Resin Art' },
                        { id: 'bracelets', label: '📿 Bracelets' },
                        { id: 'pixelart', label: '👾 Pixel Art' }
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          className={`cat-select-btn ${editingProduct.cat === cat.id ? 'active' : ''}`}
                          onClick={() => setEditingProduct({ ...editingProduct, cat: cat.id })}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-row-2 mt-2">
                    <div className="form-group">
                      <label>Subcategory</label>
                      <input
                        type="text"
                        placeholder="e.g. flowers, keychains"
                        value={editingProduct.sub || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, sub: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Badge / Tag</label>
                      <input
                        type="text"
                        placeholder="e.g. Bestseller, Studio Pick"
                        value={editingProduct.badge || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value || null })}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Pricing, Cost & Stock */}
                <div className="form-sub-section">
                  <span className="section-legend">💰 2. Pricing, Margin &amp; Inventory</span>
                  <div className="form-row-3">
                    <div className="form-group">
                      <label>Selling Price (₹) *</label>
                      <input
                        type="text"
                        value={editingProduct.price}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Base Cost (₹)</label>
                      <input
                        type="number"
                        value={editingProduct.costPrice || ''}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            costPrice: parseInt(e.target.value, 10) || 0
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Stock Count</label>
                      <input
                        type="number"
                        value={editingProduct.stockCount !== undefined ? editingProduct.stockCount : 10}
                        onChange={(e) => {
                          const count = parseInt(e.target.value, 10) || 0;
                          setEditingProduct({
                            ...editingProduct,
                            stockCount: count,
                            isOutOfStock: count === 0
                          });
                        }}
                      />
                    </div>
                  </div>

                  {editingProduct.price && (
                    <div className="profit-margin-calc-bar">
                      <span>
                        Base Cost: ₹{editingProduct.costPrice || Math.round((parseInt(String(editingProduct.price).replace(/[^0-9]/g, ''), 10) || 150) * 0.45)}
                      </span>
                      <strong>
                        Estimated Profit: ₹{
                          (parseInt(String(editingProduct.price).replace(/[^0-9]/g, ''), 10) || 0) -
                          (editingProduct.costPrice ? parseInt(editingProduct.costPrice, 10) : Math.round((parseInt(String(editingProduct.price).replace(/[^0-9]/g, ''), 10) || 0) * 0.45))
                        }{' '}
                        ({Math.round(
                          (((parseInt(String(editingProduct.price).replace(/[^0-9]/g, ''), 10) || 0) -
                            (editingProduct.costPrice ? parseInt(editingProduct.costPrice, 10) : Math.round((parseInt(String(editingProduct.price).replace(/[^0-9]/g, ''), 10) || 0) * 0.45))) /
                            (parseInt(String(editingProduct.price).replace(/[^0-9]/g, ''), 10) || 1)) * 100
                        )}% Margin)
                      </strong>
                    </div>
                  )}
                </div>

                {/* 3. Color Swatches & Variants */}
                <div className="form-sub-section">
                  <span className="section-legend">🎨 3. Color Options &amp; Swatches</span>
                  <label className="info-subtext">Click quick presets or add custom swatches:</label>
                  <div className="preset-palette-tray">
                    {CRAFT_COLOR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="preset-color-pill"
                        onClick={() => handleAddPresetColorToEdit(preset)}
                        title={`Add ${preset.name}`}
                      >
                        <span className="preset-dot" style={{ background: preset.hex }} />
                        {preset.name} +
                      </button>
                    ))}
                  </div>

                  <div className="color-input-controls">
                    <input
                      type="text"
                      placeholder="Color Name (e.g. Pastel Rose)"
                      value={editColorName}
                      onChange={(e) => setEditColorName(e.target.value)}
                    />
                    <input
                      type="color"
                      value={editColorHex}
                      onChange={(e) => setEditColorHex(e.target.value)}
                      title="Choose custom color hex"
                      className="color-picker-wheel"
                    />
                    <input
                      type="text"
                      placeholder="Variant Image (URL or uploaded file)"
                      value={editColorImg}
                      onChange={(e) => setEditColorImg(normalizeImageUrl(e.target.value))}
                    />
                    <label className="admin-file-upload-btn" title="Choose local image file for this color">
                      📁 Photo
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadLocalPhoto(file, (url) => setEditColorImg(url));
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={handleAddColorSwatch}
                    >
                      + Add Swatch
                    </button>
                  </div>

                  {editingProduct.colors && editingProduct.colors.length > 0 && (
                    <div className="color-chips-display">
                      {editingProduct.colors.map((c, idx) => (
                        <div key={idx} className="swatch-item-chip">
                          <span
                            className="swatch-color-circle"
                            style={{ background: c.style?.replace('background:', '') || '#ccc' }}
                          />
                          <strong>{c.color}</strong>
                          {c.img && c.img !== editingProduct.img && (
                            <small className="info-subtext">(Custom Photo)</small>
                          )}
                          <button
                            type="button"
                            className="btn-remove-color"
                            onClick={() => handleRemoveColorSwatch(idx)}
                            title="Remove color swatch"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Product Image */}
                <div className="form-sub-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <span className="section-legend" style={{ margin: 0 }}>🖼️ 4. Primary Product Photo</span>
                    <label className="admin-file-upload-btn">
                      📁 Choose File from PC
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadLocalPhoto(file, (url) => setEditingProduct({ ...editingProduct, img: url }));
                        }}
                      />
                    </label>
                  </div>
                  <div className="form-group">
                    <label>Image URL Path (or choose local file from PC above)</label>
                    <input
                      type="text"
                      placeholder="e.g. /images/flowermain.jpeg, /uploads/..., or https://..."
                      value={editingProduct.img || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, img: normalizeImageUrl(e.target.value) })}
                    />
                    {uploadingImage && <small className="info-subtext" style={{ color: 'var(--gold-deep)' }}>Uploading local photo... ⏳</small>}
                  </div>
                  <div className="sample-img-chips">
                    <span className="info-subtext mr-2">Quick Studio Samples:</span>
                    {[
                      { label: '🌸 Flower Bouquet', url: '/images/flowermain.jpeg' },
                      { label: '💎 Resin Letter', url: '/images/cat-resin.png' },
                      { label: '🪴 Flower Pot', url: '/images/cat-pipe.png' },
                      { label: '📿 Bracelet Set', url: '/images/cat-bracelets.png' }
                    ].map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="sample-img-btn"
                        onClick={() => setEditingProduct({ ...editingProduct, img: sample.url })}
                      >
                        {sample.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="edit-modal-footer mt-2" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button type="submit" className="btn btn-primary py-3" style={{ flex: 1, fontSize: '1rem' }}>
                    Save Changes ✨
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline py-3"
                    onClick={() => setEditingProduct(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-rose btn-sm"
                    onClick={() => handleDeleteProduct(editingProduct.id, editingProduct.title)}
                    style={{ marginLeft: 'auto' }}
                  >
                    🗑️ Delete Piece
                  </button>
                </div>
              </form>

              {/* Right Column: Live Storefront Mockup Preview Card */}
              <div className="live-preview-panel">
                <span className="preview-heading-badge">✨ Live Storefront Mockup</span>
                <div className="live-mockup-card">
                  <div className="mockup-img-wrap">
                    <img
                      src={editingProduct.img || '/images/flowermain.jpeg'}
                      alt={editingProduct.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/images/flowermain.jpeg';
                      }}
                    />
                    {editingProduct.badge && <span className="mockup-badge">{editingProduct.badge}</span>}
                  </div>

                  <div className="mockup-body">
                    <span className="mockup-cat-tag">
                      {editingProduct.cat === 'pipecleaner'
                        ? 'Pipe Cleaner'
                        : editingProduct.cat === 'resin'
                        ? 'Resin Art'
                        : editingProduct.cat === 'bracelets'
                        ? 'Handmade Bracelet'
                        : 'Pixel Art'}{' '}
                      {editingProduct.sub ? `• ${editingProduct.sub}` : ''}
                    </span>
                    <h4 className="mockup-title">{editingProduct.title || 'Untitled Piece'}</h4>

                    <div className="mockup-price-row">
                      <span className="mockup-price">₹{editingProduct.price || '150'}</span>
                      <span className="mockup-margin-pill">
                        {editingProduct.stockCount > 0 ? `${editingProduct.stockCount} in stock` : 'Out of Stock'}
                      </span>
                    </div>

                    {editingProduct.colors && editingProduct.colors.length > 0 && (
                      <div className="mockup-colors-row">
                        <span className="color-label" style={{ fontSize: '0.72rem' }}>
                          Colors ({editingProduct.colors.length}):
                        </span>
                        {editingProduct.colors.map((c, idx) => (
                          <span
                            key={idx}
                            className="mockup-color-dot"
                            style={{ background: c.style?.replace('background:', '') || '#ccc' }}
                            title={c.color}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
