import { useEffect, useRef, useState } from 'react';
import './Contact.css';

/* ===== Swap these later ===== */
const HEADING = 'Contact me.';
const MESSAGE_HINT = 'Internships, full-time roles, research, or just to talk hardware.';
const EMAIL = 'ritvikchandersingh@gmail.com';
/* ============================ */

// Public by design: this key can only send messages to your inbox
const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY;
const ENDPOINT = 'https://api.web3forms.com/submit';

const STATUS_TEXT = {
  idle: 'Messages go straight to my inbox.',
  sending: 'Sending…',
  success: "Thanks! Your message is on its way. I'll reply soon.",
  error: `Something went wrong. Please email me at ${EMAIL}.`,
};

function Contact() {
  const [status, setStatus] = useState('idle');
  const [powered, setPowered] = useState(false);
  const sectionRef = useRef(null);

  // Power on once, the first time the section scrolls into view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPowered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!ACCESS_KEY) {
      console.error('Missing VITE_WEB3FORMS_KEY in .env.local');
      setStatus('error');
      return;
    }

    setStatus('sending');

    const formData = new FormData(form);
    formData.append('access_key', ACCESS_KEY);
    formData.append('subject', 'New message from your website');
    formData.append('from_name', 'Portfolio contact form');

    try {
      const response = await fetch(ENDPOINT, { method: 'POST', body: formData });
      const data = await response.json();

      if (data.success) {
        form.reset();
        setStatus('success');
      } else {
        console.error(data.message);
        setStatus('error');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  }

  return (
    <section
      id="contact"
      ref={sectionRef}
      className={`contact${powered ? ' is-on' : ''}`}
      aria-labelledby="contact-heading"
    >
      {/* One centered box, wired like a chip: both buses plug into its sides */}
      <form className="contact-form" data-wire="contact-form" onSubmit={handleSubmit}>
        {/* Status LEDs (decorative; the status line below says the same in words) */}
        <div className="contact-leds" aria-hidden="true">
          <span className="contact-led contact-led-pwr">PWR</span>
          <span className={`contact-led${status === 'sending' ? ' is-blink' : ''}`}>TX</span>
          <span className={`contact-led${status === 'success' ? ' is-on' : ''}`}>RX</span>
          <span className={`contact-led${status === 'error' ? ' is-err' : ''}`}>ERR</span>
        </div>

        <h2 id="contact-heading" className="contact-title">{HEADING}</h2>

        <div className="contact-field">
          <label htmlFor="contact-name">Name</label>
          <div className="contact-input-wrap">
            <input id="contact-name" name="name" type="text" autoComplete="name" placeholder="Your name" required />
            <span className="contact-pin" aria-hidden="true" />
          </div>
        </div>

        <div className="contact-field">
          <label htmlFor="contact-email">Email</label>
          <div className="contact-input-wrap">
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              required
            />
            <span className="contact-pin" aria-hidden="true" />
          </div>
        </div>

        <div className="contact-field">
          <label htmlFor="contact-message">Message</label>
          <div className="contact-input-wrap">
            <textarea id="contact-message" name="message" rows="5" placeholder={MESSAGE_HINT} required />
            <span className="contact-pin" aria-hidden="true" />
          </div>
        </div>

        {/* Spam trap: humans never see or fill this */}
        <input type="checkbox" name="botcheck" className="contact-honeypot" tabIndex={-1} autoComplete="off" />

        <button type="submit" className="contact-submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </button>

        <p className={`contact-status is-${status}`} role="status">
          {STATUS_TEXT[status]}
        </p>
      </form>
    </section>
  );
}

export default Contact;