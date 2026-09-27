import { useState } from 'react';

export default function Contact() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  }

  return (
    <section className="section" id="contact">
      <div className="cta-band">
        <span className="tag" style={{ background: 'rgba(255,255,255,0.15)', color: 'var(--gold)' }}>
          Direct Contact &amp; Drop Alerts
        </span>
        <h2>Connect With Our Studio 🌸</h2>
        <p>
          Have a custom bouquet request, bulk gifting inquiry, or question about your order? Chat directly with our artisan on WhatsApp (+91 8847277218) or subscribe for early restock alerts!
        </p>

        <div className="contact-action-row" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', margin: '20px 0' }}>
          <a
            href="https://wa.me/918847277218?text=Hi%20Handii%20Studio!%20%F0%9F%8C%B8%20I'd%20like%20to%20inquire%20about%20your%20handcrafted%20pieces%20or%20custom%20order."
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '1rem', background: '#25D366', color: '#fff', border: 'none', boxShadow: '0 6px 20px rgba(37,211,102,0.35)' }}
          >
            💬 Chat on WhatsApp (+91 8847277218)
          </a>
        </div>

        {subscribed ? (
          <div className="newsletter-success-chip">
            ✨ Welcome to the handii.co family! You'll be the first to know about new craft drops.
          </div>
        ) : (
          <form className="cta-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter your email for drop alerts (e.g. name@example.com)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-gold">
              Subscribe 💌
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
