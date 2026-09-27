import { forwardRef, useMemo, useState, useEffect } from 'react';
import { products as initialStaticProducts } from '../data/products';
import { mainTabs, subcatMap } from '../data/subcategories';
import ProductCard from './ProductCard';

const Shop = forwardRef(function Shop(
  { currentCat, currentSub, onSelectCat, onSelectSub, onOpenReviews },
  ref
) {
  const [productList, setProductList] = useState(initialStaticProducts);
  const [inStockFilter, setInStockFilter] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success && data.products && data.products.length > 0) {
          setProductList(data.products);
        }
      } catch (err) {
        console.warn('Using local catalog fallback for shop.');
      }
    }
    fetchProducts();
  }, []);

  const subTabs = subcatMap[currentCat] || [];

  const visibleProducts = useMemo(() => {
    return productList.filter((p) => {
      const matchCat = currentCat === 'all' || p.cat === currentCat;
      const matchSub = currentSub === 'all' || p.sub === currentSub;
      const matchStock = !inStockFilter || (!p.isOutOfStock && (p.stockCount === undefined || p.stockCount > 0));
      return matchCat && matchSub && matchStock;
    });
  }, [productList, currentCat, currentSub, inStockFilter]);

  return (
    <section className="section" id="shop" style={{ paddingTop: 0 }} ref={ref}>
      <div className="wrap">
        <div className="section-head">
          <span className="tag">pick a craft, then narrow it down</span>
          <h2>Shop handii.co</h2>
          <p>Tap a craft to filter, then use the pills below to zoom into exactly what you're after.</p>
        </div>

        <div className="shop-controls-bar">
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

          <div className="stock-filter-toggle">
            <label>
              <input
                type="checkbox"
                checked={inStockFilter}
                onChange={(e) => setInStockFilter(e.target.checked)}
              />
              <span>In-Stock Only 🌸</span>
            </label>
          </div>
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
            <ProductCard key={p.id} product={p} onOpenReviews={onOpenReviews} />
          ))}
        </div>

        {visibleProducts.length === 0 && (
          <div className="empty-state">
            <span className="tag">nothing here yet</span>
            No pieces in this category just yet — check back soon or DM us for custom orders.
          </div>
        )}
      </div>
    </section>
  );
});

export default Shop;
