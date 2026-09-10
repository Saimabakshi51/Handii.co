import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProductReviewsModal({ product, isOpen, onClose, onReviewSubmitted }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [ratingData, setRatingData] = useState({ averageRating: '5.0', totalCount: 0, breakdown: {} });
  const [loading, setLoading] = useState(true);

  // Write review form state
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [authorName, setAuthorName] = useState(user?.name || '');
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewPhotos, setReviewPhotos] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      loadProductReviews();
    }
  }, [isOpen, product]);

  async function loadProductReviews() {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews/product/${product.id}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
        setRatingData({
          averageRating: data.averageRating || '5.0',
          totalCount: data.totalCount || 0,
          breakdown: data.breakdown || {}
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handlePhotoUpload(e) {
    const files = e.target.files;
    if (!files || !files.length) return;
    setUploadingPhoto(true);

    const formData = new FormData();
    for (let i = 0; i < Math.min(files.length, 2); i++) {
      formData.append('photos', files[i]);
    }

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.urls) {
        setReviewPhotos((prev) => [...prev, ...data.urls]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleSubmitReview(e) {
    e.preventDefault();
    if (!authorName || !reviewComment) return;

    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          userId: user?.id || null,
          customerName: authorName,
          rating,
          title: reviewTitle,
          comment: reviewComment,
          photos: reviewPhotos
        })
      });
      const data = await res.json();
      setSubmittingReview(false);

      if (data.success) {
        setShowWriteForm(false);
        setReviewTitle('');
        setReviewComment('');
        setReviewPhotos([]);
        loadProductReviews();
        if (onReviewSubmitted) onReviewSubmitted();
      }
    } catch (err) {
      setSubmittingReview(false);
      alert('Failed to submit review');
    }
  }

  if (!isOpen || !product) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="craft-modal reviews-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>

        <div className="reviews-head">
          <span className="tag">Handmade Love &amp; Feedback</span>
          <h2>Reviews for {product.title} 🌸</h2>
        </div>

        {/* Rating Summary Scorecard */}
        <div className="rating-scorecard">
          <div className="big-score">
            <span className="score-num">{ratingData.averageRating}</span>
            <div className="stars-row">
              {'★'.repeat(Math.round(parseFloat(ratingData.averageRating) || 5))}
              {'☆'.repeat(5 - Math.round(parseFloat(ratingData.averageRating) || 5))}
            </div>
            <span className="score-count">{ratingData.totalCount} Verified Reviews</span>
          </div>

          <div className="rating-bars-column">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingData.breakdown[star] || 0;
              const pct = ratingData.totalCount > 0 ? (count / ratingData.totalCount) * 100 : 0;
              return (
                <div key={star} className="rating-bar-row">
                  <span className="bar-star">{star}★</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="bar-count">({count})</span>
                </div>
              );
            })}
          </div>

          <div className="write-review-trigger">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowWriteForm((v) => !v)}
            >
              {showWriteForm ? 'Cancel Review' : '✍️ Write a Review'}
            </button>
          </div>
        </div>

        {/* Write Review Form */}
        {showWriteForm && (
          <form className="write-review-form" onSubmit={handleSubmitReview}>
            <h4>Share Your Experience</h4>

            <div className="form-group">
              <label>Rating:</label>
              <div className="interactive-star-picker">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`star-btn ${s <= rating ? 'active' : ''}`}
                    onClick={() => setRating(s)}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Your Name *</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Riya S."
                  required
                />
              </div>
              <div className="form-group">
                <label>Review Headline (Optional)</label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Stunning craftsmanship!"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Your Review Comments *</label>
              <textarea
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="How did the handmade colors, packaging, and texture feel in person?"
                required
              />
            </div>

            <div className="form-group">
              <label>Add Photo of your Piece (Optional)</label>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} />
              {uploadingPhoto && <span className="upload-txt">Uploading image...</span>}
            </div>

            <button type="submit" className="btn btn-primary" disabled={submittingReview}>
              {submittingReview ? 'Submitting...' : 'Post Review ✨'}
            </button>
          </form>
        )}

        {/* Customer Reviews Feed */}
        <div className="reviews-feed">
          {loading ? (
            <p className="loading-txt">Loading craft reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="empty-reviews">Be the first to review this handmade creation! 🌸</p>
          ) : (
            reviews.map((rev) => (
              <div className="review-item-card" key={rev.id}>
                <div className="rev-head-row">
                  <div>
                    <strong>{rev.customerName}</strong>
                    {rev.isVerifiedBuyer && <span className="verified-chip">✓ Verified Buyer</span>}
                  </div>
                  <span className="rev-date">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="rev-stars">
                  {'★'.repeat(rev.rating)}
                  {'☆'.repeat(5 - rev.rating)}
                  {rev.title && <strong className="rev-title-txt"> — {rev.title}</strong>}
                </div>

                <p className="rev-comment">{rev.comment}</p>

                {rev.photos && rev.photos.length > 0 && (
                  <div className="rev-photos">
                    {rev.photos.map((photo, i) => (
                      <img key={i} src={photo} alt="Customer review photo" />
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
