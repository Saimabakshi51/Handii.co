import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CombosPage() {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    async function loadCombos() {
      try {
        const res = await fetch('/api/combos');
        const data = await res.json();
        if (data.success) {
          setCombos(data.combos || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCombos();
  }, []);

  function handleAddComboToCart(combo) {
    addToCart({
      isCombo: true,
      comboId: combo.id,
      name: combo.title,
      price: String(combo.comboPrice),
      numericPrice: combo.comboPrice,
      img: combo.img || '/images/flowermain.jpeg',
      color: 'Curated Duo Set',
      quantity: 1
    });
    setAddedId(combo.id);
    setTimeout(() => setAddedId(null), 1200);
  }

  return (
    <div className="page-view combos-page wrap">
      <div className="breadcrumb-bar">
        <Link to="/">Home</Link>
        <span>/</span>
        <span className="current-page">Curated Studio Combos</span>
      </div>

      <div className="combos-page-head">
        <span className="tag">Best Value Bundles</span>
        <h1>Curated Handcrafted Combos 🎁</h1>
        <p>
          Carefully paired handmade sets combining our best-selling pipe cleaner bouquets with customized resin alphabets &amp; coasters — bundled together with special studio discounts!
        </p>
      </div>

      {loading ? (
        <p className="loading-txt">Loading studio combo bundles...</p>
      ) : combos.length === 0 ? (
        <div className="empty-state">
          <span className="tag">Combos coming soon</span>
          <p>Check back shortly as our artisans prepare seasonal gift bundles!</p>
        </div>
      ) : (
        <div className="combos-grid-full">
          {combos.map((combo) => (
            <div className="combo-card-detailed" key={combo.id}>
              <div className="combo-img-col">
                <img src={combo.img || '/images/flowermain.jpeg'} alt={combo.title} />
                {combo.badge && <span className="badge combo-badge-pill">{combo.badge}</span>}
              </div>

              <div className="combo-body-col">
                <h3>{combo.title}</h3>
                <p className="combo-desc-txt">{combo.description}</p>

                {combo.items && combo.items.length > 0 && (
                  <div className="combo-included-items">
                    <span className="included-label">What's in this combo:</span>
                    <div className="included-pills">
                      {combo.items.map((item, idx) => (
                        <span key={idx} className="item-pill">
                          🌸 {item.title} (₹{item.price})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="combo-pricing-action-bar">
                  <div className="combo-pricing-stack">
                    <span className="original-strike">Individual Total: ₹{combo.regularPrice}</span>
                    <div className="deal-row">
                      <span className="bundle-price-big">₹{combo.comboPrice}</span>
                      <span className="save-tag">Save ₹{combo.savingsAmount}</span>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary add-combo-btn"
                    onClick={() => handleAddComboToCart(combo)}
                    disabled={addedId === combo.id}
                  >
                    {addedId === combo.id ? 'Added to Bag ✓' : 'Add Bundle to Bag 🧺'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
