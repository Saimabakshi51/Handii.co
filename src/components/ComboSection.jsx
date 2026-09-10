import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

export default function ComboSection() {
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
        console.error('Failed to load combos:', err);
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

  if (loading || combos.length === 0) return null;

  return (
    <section id="combos" className="combos-section">
      <div className="wrap">
        <div className="section-head">
          <span className="tag">Handcrafted Value Bundles</span>
          <h2>Curated Studio Combos</h2>
          <p>
            Pair our best-selling pipe cleaner bouquets with personalized resin keepsakes — bundled with special savings!
          </p>
        </div>

        <div className="combos-grid">
          {combos.map((combo) => (
            <div className="combo-card" key={combo.id}>
              {combo.badge && <span className="badge combo-badge">{combo.badge}</span>}
              <div className="combo-img-wrap">
                <img src={combo.img || '/images/flowermain.jpeg'} alt={combo.title} />
              </div>

              <div className="combo-content">
                <h3>{combo.title}</h3>
                <p className="combo-desc">{combo.description}</p>

                <div className="combo-price-bar">
                  <div className="prices">
                    <span className="strike-price">₹{combo.regularPrice}</span>
                    <span className="bundle-price">₹{combo.comboPrice}</span>
                  </div>
                  <span className="save-pill">Save ₹{combo.savingsAmount}</span>
                </div>

                <button
                  className="btn btn-primary w-100 add-combo-btn"
                  onClick={() => handleAddComboToCart(combo)}
                  disabled={addedId === combo.id}
                >
                  {addedId === combo.id ? 'Added Bundle ✓' : 'Add Bundle to Bag 🧺'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
