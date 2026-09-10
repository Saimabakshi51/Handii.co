import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { products as initialStaticProducts } from '../data/products';
import { mainTabs, subcatMap } from '../data/subcategories';
import ProductCard from '../components/ProductCard';
import ProductReviewsModal from '../components/ProductReviewsModal';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCat = searchParams.get('cat') || 'all';
  const currentSub = searchParams.get('sub') || 'all';
  const searchQuery = searchParams.get('q') || '';

  const [productList, setProductList] = useState(initialStaticProducts);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [selectedReviewProduct, setSelectedReviewProduct] = useState(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success && data.products?.length) {
          setProductList(data.products);
        }
      } catch (err) {
        console.warn('Using local products fallback');
      }
    }
    loadProducts();
  }, []);

  function handleSelectCat(cat) {
    setSearchParams({ cat, sub: 'all', ...(searchTerm ? { q: searchTerm } : {}) });
  }

  function handleSelectSub(sub) {
    setSearchParams({ cat: currentCat, sub, ...(searchTerm ? { q: searchTerm } : {}) });
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    setSearchParams({
      cat: currentCat,
      sub: currentSub,
      ...(searchTerm ? { q: searchTerm } : {})
    });
  }

  const subTabs = subcatMap[currentCat] || [];

  const visibleProducts = useMemo(() => {
    return productList.filter((p) => {
      const matchCat = currentCat === 'all' || p.cat === currentCat;
      const matchSub = currentSub === 'all' || p.sub === currentSub;
      const matchStock = !inStockOnly || (!p.isOutOfStock && (p.stockCount === undefined || p.stockCount > 0));
      const matchSearch =
        !searchTerm ||
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.alt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sub?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSub && matchStock && matchSearch;
    });
  }, [productList, currentCat, currentSub, inStockOnly, searchTerm]);

  return (
    <div className="page-view shop-page wrap">
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb-bar">
        <Link to="/">Home</Link>
        <span>/</span>
        <span className="current-page">Shop Catalog</span>
        {currentCat !== 'all' && (
          <>
            <span>/</span>
            <span className="capitalize">{currentCat}</span>
          </>
        )}
      </div>

      <div className="shop-page-head">
        <div>
          <span className="tag">Handcrafted Pieces Catalog</span>
          <h1>Shop the Collection</h1>
          <p>
            Explore our blooming pipe cleaner bouquets, crystal resin keepsakes, alphabet charms, and beaded bracelets.
          </p>
        </div>

        {/* Live Search Input */}
        <form className="shop-search-form" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search flowers, charms, colors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="search-submit-btn">🔍</button>
        </form>
      </div>

      {/* Category Tabs & In-Stock Toggle */}
      <div className="shop-controls-bar">
        <div className="shop-tabs">
          {mainTabs.map((t) => (
            <button
              key={t.cat}
              className={'main-tab' + (currentCat === t.cat ? ' active' : '')}
              onClick={() => handleSelectCat(t.cat)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="stock-filter-toggle">
          <label>
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
            />
            <span>In-Stock Only 🌸</span>
          </label>
        </div>
      </div>

      {/* Subcategory Pills */}
      {currentCat !== 'all' && subTabs.length > 0 && (
        <div className="sub-tabs">
          {subTabs.map((s) => (
            <button
              key={s.key}
              className={'sub-tab' + (currentSub === s.key ? ' active' : '')}
              onClick={() => handleSelectSub(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Product Results Counter */}
      <div className="results-counter-bar">
        <span>Showing <strong>{visibleProducts.length}</strong> handcrafted pieces</span>
      </div>

      {/* Products Grid */}
      <div className="prod-grid">
        {visibleProducts.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onOpenReviews={(prod) => setSelectedReviewProduct(prod)}
          />
        ))}
      </div>

      {visibleProducts.length === 0 && (
        <div className="empty-state">
          <span className="tag">No pieces found</span>
          <p>No products match your current filters or search term.</p>
          <button
            className="btn btn-outline btn-sm mt-3"
            onClick={() => {
              setSearchTerm('');
              setInStockOnly(false);
              setSearchParams({ cat: 'all', sub: 'all' });
            }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Reviews Modal */}
      <ProductReviewsModal
        product={selectedReviewProduct}
        isOpen={!!selectedReviewProduct}
        onClose={() => setSelectedReviewProduct(null)}
      />
    </div>
  );
}
