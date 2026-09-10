import { reels } from '../data/reels';

export default function Reels() {
  return (
    <section className="section" id="reels">
      <div className="wrap">
        <div className="section-head">
          <span className="tag">fresh off the reel</span>
          <h2>Our Instagram Reels</h2>
          <p>Watch the coiling, pouring and knotting in real time — tap a reel to open it on Instagram.</p>
        </div>
        <div className="reels-strip">
          {reels.map((r, i) => (
            <a className="reel-card" href={r.href} target="_blank" rel="noopener noreferrer" key={i}>
              {r.isFallback ? (
                <div className="reel-fallback">
                  <div className="play">＋</div>
                  <span>{r.fallbackText}</span>
                </div>
              ) : (
                <>
                  <img src={r.img} alt={r.alt} className="reel-cover" />
                  <div className="reel-overlay">
                    <div className="play">▶</div>
                    <span>Watch on Instagram</span>
                  </div>
                </>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
