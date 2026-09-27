import { Link } from 'react-router-dom';

export default function Hero({ onExploreShop, onCustomize }) {
  return (
    <section className="hero" id="top">
      <div className="wrap">
        <div>
          <span className="eyebrow">Handmade Factory ✂️🧵</span>
          <h1>
            Little things,
            <br />
            <em>stitched</em> with love.
          </h1>
          <p className="lede">
            Pipe cleaner blooms, resin charms, oxidised jhumkas and beaded bracelets — every piece made by hand at
            handii.co, one coil, one pour, one knot at a time.
          </p>
          <div className="hero-ctas">
            <Link to="/shop" className="btn btn-primary">Explore the shop →</Link>
            <Link to="/customize" className="btn btn-outline">✨ Custom 3D &amp; DM Studio</Link>
          </div>
        </div>
        <div className="hero-collage">
          <div className="poly p1">
            <img src="/images/Buket kawat bulu.jpg.jpeg" alt="Resin flower keychains" />
          </div>
          <div className="poly p2">
            <img src="/images/disctop.jpg" alt="Beaded bracelets on wrist" />
          </div>
          <div className="poly p3">
            <img src="/images/alphatop.jpeg" alt="Pipe cleaner star keychain" />
          </div>
          <div className="sticker s1">handmade ✨</div>
        </div>
      </div>
    </section>
  );
}
