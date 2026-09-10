export default function Contact() {
  function handleSubmit(e) {
    e.preventDefault();
    e.target.reset();
    // eslint-disable-next-line no-alert
    alert('Thanks for subscribing!');
  }

  return (
    <section className="section" id="contact">
      <div className="cta-band">
        <h2>Get first look at new drops</h2>
        <p>
          Join the list for restock alerts, new bouquet colours and behind-the-scenes reels — no spam, just thread
          and resin.
        </p>
        <form className="cta-form" onSubmit={handleSubmit}>
          <input type="email" placeholder="you@email.com" required />
          <button type="submit">Subscribe</button>
        </form>
      </div>
    </section>
  );
}
