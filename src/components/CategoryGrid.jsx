import { categoryGrid } from '../data/categories';

export default function CategoryGrid({ onGoToShop }) {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="cat-grid">
          {categoryGrid.map((c, i) => (
            <button key={i} className="cat-card" onClick={() => onGoToShop(c.cat, c.sub)}>
              <div className="thumb">
                <img src={c.img} alt={c.alt} />
              </div>
              <h3>{c.title}</h3>
              <p>{c.subtitle}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
