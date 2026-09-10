import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Customizer3D from '../components/Customizer3D';

const CRAFT_CATEGORIES = [
  { id: 'pipecleaner', name: 'Pipe Cleaner Craft', desc: 'Custom bouquets, blooming lilies, tulip stems & charms', icon: '🌸', sampleImg: '/images/flowermain.jpeg' },
  { id: 'resin', name: 'Resin Art & Coasters', desc: 'Custom alphabet keychains, floral jhumkas & golden coasters', icon: '✨', sampleImg: '/images/alphamain.jpeg' },
  { id: 'bracelets', name: 'Beaded & Disc Bracelets', desc: 'Personalized names, evil eye beads & friendship sets', icon: '📿', sampleImg: '/images/bracelet.jpeg' },
  { id: 'clay', name: 'Polymer Clay Sculpt', desc: 'Mini figurines, charms, badges & cute desk companions', icon: '🧸', sampleImg: '/images/keyflowermain.jpeg' },
  { id: 'hampers', name: 'Curated Gift Hampers', desc: 'Handcrafted combination box with cards and ribbons', icon: '🎁', sampleImg: '/images/coastermain.jpeg' },
];

export default function CustomizePage() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Tab State: '3d' | 'bespoke'
  const [activeStudioTab, setActiveStudioTab] = useState('3d');

  const [selectedCat, setSelectedCat] = useState('pipecleaner');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customText, setCustomText] = useState('');
  const [colorPreferences, setColorPreferences] = useState('Pastel Rose & Sage');
  const [specifications, setSpecifications] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [referencePhotos, setReferencePhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Active DM Chat view
  const [activeCustomOrder, setActiveCustomOrder] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const fileInputRef = useRef(null);

  if (user && !customerName && user.name) {
    setCustomerName(user.name);
    setCustomerEmail(user.email);
    if (user.phone) setCustomerPhone(user.phone);
  }

  async function handlePhotoUpload(e) {
    const files = e.target.files;
    if (!files || !files.length) return;

    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < Math.min(files.length, 3); i++) {
      formData.append('photos', files[i]);
    }

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.urls) {
        setReferencePhotos((prev) => [...prev, ...data.urls]);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmitInquiry(e) {
    e.preventDefault();
    if (!customerName || !customerPhone || !specifications) {
      alert('Please fill in your name, contact phone, and custom design details!');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/custom-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || null,
          customerName,
          customerPhone,
          customerEmail,
          category: selectedCat,
          customText,
          colorPreferences,
          specifications,
          referencePhotos,
          targetDate
        })
      });

      const data = await res.json();
      setSubmitting(false);

      if (data.success && data.customOrder) {
        setActiveCustomOrder(data.customOrder);
        fetchChatMessages(data.customOrder.customOrderId);
      } else {
        alert(data.message || 'Failed to submit inquiry.');
      }
    } catch (err) {
      setSubmitting(false);
      alert('Network error submitting your custom order.');
    }
  }

  async function fetchChatMessages(customOrderId) {
    try {
      const res = await fetch(`/api/custom-orders/${customOrderId}`);
      const data = await res.json();
      if (data.success) {
        setActiveCustomOrder(data.customOrder);
        setChatMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Failed to load chat:', err);
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!replyText.trim() || !activeCustomOrder) return;

    setSendingMessage(true);
    try {
      const res = await fetch(`/api/custom-orders/${activeCustomOrder.customOrderId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'customer',
          senderName: customerName || 'Customer',
          message: replyText.trim(),
          attachments: []
        })
      });
      const data = await res.json();
      setSendingMessage(false);
      if (data.success) {
        setReplyText('');
        fetchChatMessages(activeCustomOrder.customOrderId);
      }
    } catch (err) {
      setSendingMessage(false);
    }
  }

  async function handleAcceptQuote() {
    if (!activeCustomOrder) return;
    try {
      const res = await fetch(`/api/custom-orders/${activeCustomOrder.customOrderId}/accept`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success && data.cartItem) {
        addToCart(data.cartItem);
        fetchChatMessages(activeCustomOrder.customOrderId);
        alert('Quote accepted! Custom piece added to your Bag 🧺');
      }
    } catch (err) {
      alert('Failed to accept quote.');
    }
  }

  return (
    <div className="page-view customize-page wrap">
      <div className="breadcrumb-bar">
        <Link to="/">Home</Link>
        <span>/</span>
        <span className="current-page">Custom Craft Studio</span>
      </div>

      <div className="customize-page-head">
        <span className="tag">Handmade to Your Vision</span>
        <h1>Custom Design Studio &amp; Artisan DM ✨</h1>
        <p>
          Create with our real-time 3D bag customizer, or submit a bespoke 1-on-1 inquiry with your inspiration photos and chat with our artisans!
        </p>

        {/* Studio Mode Switcher */}
        <div className="studio-mode-tabs">
          <button
            className={`studio-tab-btn ${activeStudioTab === '3d' ? 'active' : ''}`}
            onClick={() => setActiveStudioTab('3d')}
          >
            🎮 Interactive 3D Bag Customizer
          </button>
          <button
            className={`studio-tab-btn ${activeStudioTab === 'bespoke' ? 'active' : ''}`}
            onClick={() => setActiveStudioTab('bespoke')}
          >
            💬 1-on-1 Bespoke Request &amp; DM Chat
          </button>
        </div>
      </div>

      {/* Tab 1: 3D Studio */}
      {activeStudioTab === '3d' && (
        <div className="studio-tab-content">
          <Customizer3D />
        </div>
      )}

      {/* Tab 2: Bespoke DM Studio */}
      {activeStudioTab === 'bespoke' && (
        <div className="studio-tab-content">
          {activeCustomOrder ? (
            /* Dedicated Full-Page DM Chat Interface */

        <div className="custom-chat-portal fullpage-chat">
          <div className="chat-portal-header">
            <div>
              <span className="badge">Order ID: {activeCustomOrder.customOrderId}</span>
              <h2>Custom {activeCustomOrder.category} Inquiry</h2>
              <p className="sub-text">
                Status: <strong className={'status-badge ' + activeCustomOrder.status}>{activeCustomOrder.status.toUpperCase()}</strong>
              </p>
            </div>
            <div className="portal-actions">
              <button
                className="btn btn-outline"
                onClick={() => {
                  setActiveCustomOrder(null);
                  setSpecifications('');
                  setCustomText('');
                  setReferencePhotos([]);
                }}
              >
                + New Custom Request
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
                View in My Dashboard 📁
              </button>
            </div>
          </div>

          {/* Quote Card Notification Banner */}
          {activeCustomOrder.status === 'quoted' && (
            <div className="quote-offer-banner">
              <div className="quote-left">
                <span className="quote-icon">✨</span>
                <div>
                  <h4>Official Studio Price Quote Received!</h4>
                  <p>
                    Offer Amount: <strong className="quote-price">₹{activeCustomOrder.quotePrice}</strong> | Estimated Crafting Time: <strong>{activeCustomOrder.estimatedDays || 3} days</strong>
                  </p>
                  {activeCustomOrder.quoteNotes && <p className="quote-notes">Note: "{activeCustomOrder.quoteNotes}"</p>}
                </div>
              </div>
              <button className="btn btn-primary accept-quote-btn" onClick={handleAcceptQuote}>
                Accept Quote &amp; Add to Bag 🧺
              </button>
            </div>
          )}

          {/* DM Messages Thread */}
          <div className="dm-thread-box fullpage-thread">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`dm-message-row ${msg.sender === 'customer' ? 'msg-customer' : 'msg-admin'} ${
                  msg.isSystemMessage ? 'msg-system' : ''
                }`}
              >
                <div className="dm-bubble">
                  <div className="dm-author">
                    <strong>{msg.senderName}</strong>
                    <span className="dm-time">
                      {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="dm-text">{msg.message}</p>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="dm-attachments">
                      {msg.attachments.map((imgUrl, i) => (
                        <img key={i} src={imgUrl} alt="Attachment" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form className="dm-input-bar" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Type a message or question to the artisan..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" disabled={sendingMessage || !replyText.trim()}>
              {sendingMessage ? 'Sending...' : 'Send Message 💬'}
            </button>
          </form>
        </div>
      ) : (
        /* Dedicated Full-Page Custom Request Builder */
        <div className="customize-builder-card fullpage-builder">
          {/* Step 1: Category Picker */}
          <div className="craft-step">
            <span className="step-num">Step 1</span>
            <h3>Choose Craft Medium</h3>
            <div className="cat-selector-grid">
              {CRAFT_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`cat-tile ${selectedCat === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCat(cat.id)}
                >
                  <span className="cat-icon">{cat.icon}</span>
                  <span className="cat-title">{cat.name}</span>
                  <span className="cat-desc">{cat.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Customization Details Form */}
          <form className="custom-spec-form" onSubmit={handleSubmitInquiry}>
            <div className="craft-step">
              <span className="step-num">Step 2</span>
              <h3>Custom Inscription &amp; Details</h3>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Custom Text / Name to Inscribe (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 'Aarav & Maya', Alphabet 'M', or Initial"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Color Palette Preference</label>
                  <input
                    type="text"
                    placeholder="e.g. Pastel Pink, Sage Green & White, Gold Shimmer"
                    value={colorPreferences}
                    onChange={(e) => setColorPreferences(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Describe your vision in detail *</label>
                <textarea
                  rows={4}
                  placeholder="Tell us about the size, flower stems, charm elements, theme, or any specific handmade references you love..."
                  value={specifications}
                  onChange={(e) => setSpecifications(e.target.value)}
                  required
                />
              </div>

              {/* Photo Upload Dropzone */}
              <div className="form-group">
                <label>Upload Reference Photos / Sketches (Max 3)</label>
                <div className="photo-upload-zone" onClick={() => fileInputRef.current?.click()}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                  />
                  <span className="upload-icon">📸</span>
                  <p>{uploading ? 'Uploading your photos...' : 'Click to select reference photos or inspiration screenshots'}</p>
                  <span className="upload-sub">PNG, JPG, WebP supported</span>
                </div>

                {referencePhotos.length > 0 && (
                  <div className="uploaded-previews">
                    {referencePhotos.map((url, i) => (
                      <div key={i} className="preview-thumb">
                        <img src={url} alt={`Upload ${i}`} />
                        <button
                          type="button"
                          className="remove-thumb"
                          onClick={() => setReferencePhotos((prev) => prev.filter((_, idx) => idx !== i))}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Contact Details */}
            <div className="craft-step">
              <span className="step-num">Step 3</span>
              <h3>Your Contact &amp; Timeline</h3>

              <div className="form-row-3">
                <div className="form-group">
                  <label>Your Name *</label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>WhatsApp / Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9812345678"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Target Delivery Date (Optional)</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="custom-form-actions">
                <button type="submit" className="btn btn-primary submit-custom-btn" disabled={submitting}>
                  {submitting ? 'Submitting to Studio...' : 'Submit Request & Open Private Chat 💬'}
                </button>
                <p className="privacy-note">
                  🔒 You will receive direct message updates from our artisans with a quote before anything is charged.
                </p>
              </div>
            </div>
          </form>
        </div>
      )}
        </div>
      )}
    </div>
  );
}

