import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import Divider from '../components/Divider';
import CategoryGrid from '../components/CategoryGrid';
import Reels from '../components/Reels';
import About from '../components/About';
import Contact from '../components/Contact';

export default function HomePage() {
  const navigate = useNavigate();

  function handleGoToShop(cat, sub) {
    navigate(`/shop?cat=${cat}&sub=${sub || 'all'}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="page-view home-page">
      <Hero onExploreShop={() => navigate('/shop')} onCustomize={() => navigate('/customize')} />

      <Divider text="Where your vibe becomes handcrafted aesthetically!" />

      <CategoryGrid onGoToShop={handleGoToShop} />

      {/* Quick Spotlight Banners for Combos & Customize */}
      <section className="spotlight-banners wrap">
        <div className="spotlight-card combo-spotlight" onClick={() => navigate('/combos')}>
          <div className="spotlight-content">
            <span className="tag">Handcrafted Value Packs</span>
            <h3>Curated Studio Combos 🎁</h3>
            <p>Pair blooming pipe cleaner bouquets with custom resin keychains with special bundle savings!</p>
            <span className="spotlight-btn">Explore Combos →</span>
          </div>
          <img src="/images/flowermain.jpeg" alt="Combos" className="spotlight-img" />
        </div>

        <div className="spotlight-card custom-spotlight" onClick={() => navigate('/customize')}>
          <div className="spotlight-content">
            <span className="tag">Handmade to Your Vision</span>
            <h3>Custom Orders &amp; Private DM ✨</h3>
            <p>Upload your inspiration photos, custom text &amp; discuss directly with our artisans for a custom quote.</p>
            <span className="spotlight-btn">Start Custom Piece →</span>
          </div>
          <img src="/images/alphamain.jpeg" alt="Customize" className="spotlight-img" />
        </div>
      </section>

      <Divider text="See it come together" />

      <Reels />

      <Divider text="Who's behind the thread" />

      <About />

      <Contact />
    </div>
  );
}
