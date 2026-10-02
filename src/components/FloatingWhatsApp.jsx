import { useState } from 'react';

export default function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = useState(false);
  const instaUrl = 'https://www.instagram.com/handii.co/';

  return (
    <div className="floating-wa-container">
      {showTooltip && (
        <div className="floating-wa-tooltip">
          <span>Need help or custom craft? DM on Instagram @handii.co! 🌸</span>
        </div>
      )}
      <a
        href={instaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-wa-btn"
        title="Chat with Handii Studio on Instagram @handii.co"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{
          background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
          boxShadow: '0 8px 24px rgba(225, 48, 108, 0.45)'
        }}
      >
        <svg
          className="floating-wa-icon"
          viewBox="0 0 24 24"
          width="26"
          height="26"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
        <span className="floating-wa-ping" style={{ background: '#f43f5e' }} />
      </a>
    </div>
  );
}
