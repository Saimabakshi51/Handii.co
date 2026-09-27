import { useState } from 'react';

export default function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = useState(false);
  const phoneNumber = '918847277218';
  const defaultMessage = encodeURIComponent("Hi Handii Studio! 🌸 I'm visiting handii.co and would like to ask a question.");

  return (
    <div className="floating-wa-container">
      {showTooltip && (
        <div className="floating-wa-tooltip">
          <span>Need help or custom craft? Chat on WhatsApp! 🌸</span>
        </div>
      )}
      <a
        href={`https://wa.me/${phoneNumber}?text=${defaultMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-wa-btn"
        title="Chat with Handii Studio on WhatsApp (+91 8847277218)"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <svg
          className="floating-wa-icon"
          viewBox="0 0 24 24"
          width="28"
          height="28"
          fill="currentColor"
        >
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z" />
          <path d="M12.016 2.001C6.49 2.001 2.016 6.475 2.016 12c0 2.22.723 4.27 1.954 5.928L2.016 22l4.205-1.904C7.824 21.26 9.845 22 12.016 22c5.525 0 10-4.475 10-10s-4.475-10.001-10-10.001zm0 18.234c-1.848 0-3.565-.559-4.996-1.517l-.358-.239-2.483 1.124 1.144-2.42-.259-.379c-1.077-1.574-1.648-3.434-1.648-5.403 0-5.093 4.141-9.234 9.234-9.234 5.094 0 9.234 4.141 9.234 9.234 0 5.093-4.14 9.234-9.234 9.234z" />
        </svg>
        <span className="floating-wa-ping" />
      </a>
    </div>
  );
}
