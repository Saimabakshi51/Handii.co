import { useState } from 'react';

export default function Contact() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'info' | 'error', text: string }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || loading) return;
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();

      if (data.success) {
        setEmail('');
        setFeedback({
          type: data.alreadySubscribed ? 'info' : 'success',
          text: data.message || "✨ Welcome to the handii.co family! You'll be the first to know about new craft drops."
        });
        setTimeout(() => setFeedback(null), 6000);
      } else {
        setFeedback({
          type: 'error',
          text: data.message || 'Could not subscribe right now. Please try again.'
        });
      }
    } catch (err) {
      console.error(err);
      setFeedback({
        type: 'error',
        text: 'Network connection error. Please try again in a moment.'
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section" id="contact">
      <div className="cta-band">
        <span className="tag" style={{ background: 'rgba(255,255,255,0.15)', color: 'var(--gold)' }}>
          Direct Contact &amp; Drop Alerts
        </span>
        <h2>Connect With Our Studio 🌸</h2>
        <p>
          Have a custom bouquet request, bulk gifting inquiry, or question about your order? Chat directly with our artisan on Instagram @handii.co or subscribe for early restock alerts!
        </p>

        <div className="contact-action-row" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', margin: '20px 0' }}>
          <a
            href="https://www.instagram.com/handii.co/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '1rem', background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', color: '#fff', border: 'none', boxShadow: '0 6px 20px rgba(225,48,108,0.35)' }}
          >
            🌸 Direct Message on Instagram @handii.co
          </a>
        </div>

        {feedback && (
          <div
            className="newsletter-success-chip"
            style={{
              borderColor: feedback.type === 'error' ? 'var(--rose)' : feedback.type === 'info' ? 'var(--gold-deep)' : 'var(--sage)',
              color: feedback.type === 'error' ? '#c2410c' : 'var(--ink)'
            }}
          >
            {feedback.text}
          </div>
        )}

        <form className="cta-form" onSubmit={handleSubmit} style={{ marginTop: feedback ? '14px' : '0' }}>
          <input
            type="email"
            placeholder="Enter your email for drop alerts (e.g. name@example.com)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
          <button type="submit" className="btn btn-gold" disabled={loading}>
            {loading ? 'Subscribing... ⏳' : 'Subscribe 💌'}
          </button>
        </form>
      </div>
    </section>
  );
}
