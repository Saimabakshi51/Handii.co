import { useState, useEffect, useRef } from 'react';

export default function ComboImageSlider({ combo }) {
  // If a custom image is explicitly set by admin, use it as a single photo
  // Otherwise, use the array of product images or items
  const images =
    combo.customImg && combo.customImg.trim()
      ? [combo.customImg.trim()]
      : combo.productImages && combo.productImages.length > 0
      ? combo.productImages
      : combo.items && combo.items.length > 0
      ? combo.items.map((it) => it.img).filter(Boolean)
      : [combo.img || '/images/flowermain.jpeg'];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState('duo'); // 'duo' (1st + 2nd) or 'slide'
  const [isPaused, setIsPaused] = useState(false);
  const [imgFade, setImgFade] = useState(1);
  const touchStartXRef = useRef(0);

  const isDuo = images.length === 2;
  const hasMultiple = images.length > 1;

  // Auto-scrolling slideshow: advances every 3.5s when in 'slide' mode and not hovered
  useEffect(() => {
    if (!hasMultiple || viewMode !== 'slide' || isPaused) return;

    const interval = setInterval(() => {
      setImgFade(0);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        setImgFade(1);
      }, 150);
    }, 3500);

    return () => clearInterval(interval);
  }, [hasMultiple, viewMode, isPaused, images.length]);

  function handlePrev(e) {
    if (e) e.stopPropagation();
    setImgFade(0);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      setImgFade(1);
    }, 150);
  }

  function handleNext(e) {
    if (e) e.stopPropagation();
    setImgFade(0);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      setImgFade(1);
    }, 150);
  }

  function handleDot(e, idx) {
    if (e) e.stopPropagation();
    if (idx === currentIndex) return;
    setImgFade(0);
    setTimeout(() => {
      setCurrentIndex(idx);
      setImgFade(1);
    }, 150);
  }

  // Touch swipe support for mobile devices
  function handleTouchStart(e) {
    touchStartXRef.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e) {
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext(e);
      } else {
        handlePrev(e);
      }
    }
  }

  // Dual Combo layout when 2 images are present
  if (isDuo && viewMode === 'duo') {
    return (
      <div className="combo-slider-container combo-duo-wrapper">
        <div className="combo-duo-viewport">
          <div className="combo-duo-side piece-left" title="Piece 1">
            <img
              src={images[0] || '/images/flowermain.jpeg'}
              alt={`${combo.title} - 1st Piece`}
              className="combo-duo-img"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/images/flowermain.jpeg';
              }}
            />
            <span className="combo-duo-tag">1st Piece</span>
          </div>

          <div className="combo-plus-connector" title="Bundle Pair (+)">
            <span className="combo-plus-symbol">+</span>
          </div>

          <div className="combo-duo-side piece-right" title="Piece 2">
            <img
              src={images[1] || '/images/flowermain.jpeg'}
              alt={`${combo.title} - 2nd Piece`}
              className="combo-duo-img"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/images/flowermain.jpeg';
              }}
            />
            <span className="combo-duo-tag">2nd Piece</span>
          </div>

          {combo.badge && <span className="badge combo-badge-pill">{combo.badge}</span>}

          <button
            type="button"
            className="combo-mode-toggle-btn"
            onClick={(e) => {
              e.stopPropagation();
              setViewMode('slide');
            }}
            title="Switch to full slider view"
          >
            ⇄ Slideshow
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="combo-slider-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="combo-slide-viewport">
        <img
          src={images[currentIndex] || '/images/flowermain.jpeg'}
          alt={`${combo.title} photo ${currentIndex + 1}`}
          className="combo-slide-img"
          style={{ opacity: imgFade }}
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/images/flowermain.jpeg';
          }}
        />

        {combo.badge && <span className="badge combo-badge-pill">{combo.badge}</span>}

        {isDuo && (
          <button
            type="button"
            className="combo-mode-toggle-btn"
            onClick={(e) => {
              e.stopPropagation();
              setViewMode('duo');
            }}
            title="Switch to 1st + 2nd Duo view"
          >
            ✨ 1st + 2nd
          </button>
        )}

        {hasMultiple && (
          <>
            <button
              type="button"
              className="slider-arrow-btn prev"
              onClick={handlePrev}
              title="Previous photo"
            >
              ‹
            </button>
            <button
              type="button"
              className="slider-arrow-btn next"
              onClick={handleNext}
              title="Next photo"
            >
              ›
            </button>

            {/* Slide Dots like Instagram */}
            <div className="slider-dots-bar">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`slider-dot ${idx === currentIndex ? 'active' : ''}`}
                  onClick={(e) => handleDot(e, idx)}
                  title={`Photo ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
