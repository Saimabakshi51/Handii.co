import { forwardRef, useMemo } from 'react';
import { products } from '../data/products';
import { mainTabs, subcatMap } from '../data/subcategories';
import ProductCard from './ProductCard';

const Shop = forwardRef(function Shop({ currentCat, currentSub, onSelectCat, onSelectSub }, ref) {
  const subTabs = subcatMap[currentCat] || [];

  const visibleProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = currentCat === 'all' || p.cat === currentCat;
      const matchSub = currentSub === 'all' || p.sub === currentSub;
      return matchCat && matchSub;
    });
  }, [currentCat, currentSub]);

  return (
    <section className="section" id="shop" style={{ paddingTop: 0 }} ref={ref}>
      <div className="wrap">
        <div className="section-head">
          <span className="tag">pick a craft, then narrow it down</span>
          <h2>Shop handii.co</h2>
          <p>Tap a craft to filter, then use the pills below to zoom into exactly what you're after.</p>
        </div>

        <div className="shop-tabs">
          {mainTabs.map((t) => (
            <button
              key={t.cat}
              className={'main-tab' + (currentCat === t.cat ? ' active' : '')}
              onClick={() => onSelectCat(t.cat)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="sub-tabs">
          {currentCat !== 'all' &&
            subTabs.map((s) => (
              <button
                key={s.key}
                className={'sub-tab' + (currentSub === s.key ? ' active' : '')}
                onClick={() => onSelectSub(s.key)}
              >
                {s.label}
              </button>
            ))}
        </div>

        <div className="prod-grid">
          {visibleProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {visibleProducts.length === 0 && (
          <div className="empty-state">
            <span className="tag">nothing here yet</span>
            No pieces in this category just yet — check back soon or DM us on Instagram for custom orders.
          </div>
        )}
      </div>
    </section>
  );
});

export default Shop;
