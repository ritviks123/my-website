import { useState } from 'react';
import { FaGithub, FaLinkedin, FaEnvelope, FaLocationDot } from 'react-icons/fa6';
import './Contact.css';

// Swap later
const HEADING = "Let's talk hardware.";
const INTRO =
  'Open to internships, jobs, research, and project collabs. The fastest way to reach me is right here.';
const EMAIL = 'ritvikchandersingh@gmail.com';
const GITHUB_URL = 'https://github.com/ritviks123';
const GITHUB_LABEL = 'github.com/ritviks123';
const LINKEDIN_URL = 'https://www.linkedin.com/in/singhritvik';
const LINKEDIN_LABEL = 'Ritvik Singh';
const LOCATION = 'Irvine, CA';

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
    <section id="contact" className="contact" aria-labelledby="contact-heading">
      <p className="contact-eyebrow">
        <span aria-hidden="true">// </span>get in touch
      </p>
      <h2 id="contact-heading" className="contact-title">{HEADING}</h2>

      <div className="contact-grid">
        {/* Left: intro + ways to reach me */}
        <div className="contact-info">
          <p className="contact-intro">{INTRO}</p>

          <a href={`mailto:${EMAIL}`} className="contact-email">
            <FaEnvelope className="contact-email-icon" aria-hidden="true" />
            {EMAIL}
          </a>

          <ul className="contact-links">
            <li>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="contact-link">
                <FaGithub className="contact-icon" aria-hidden="true" />
                {GITHUB_LABEL}
              </a>
            </li>
            <li>
              <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="contact-link">
                <FaLinkedin className="contact-icon" aria-hidden="true" />
                {LINKEDIN_LABEL}
              </a>
            </li>
            <li className="contact-location">
              <FaLocationDot className="contact-icon" aria-hidden="true" />
              {LOCATION}
            </li>
          </ul>
        </div>

        {/* Right: the form */}
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="contact-row">
            <div className="contact-field">
              <label htmlFor="contact-name">Name</label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                required
              />
            </div>

            <div className="contact-field">
              <label htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                required
              />
            </div>
          </div>

          <div className="contact-field">
            <label htmlFor="contact-message">Message</label>
            <textarea
              id="contact-message"
              name="message"
              rows="5"
              placeholder="Hi Ritvik, I saw your rover project and..."
              required
            />
          </div>

          {/* Spam trap: humans never see or fill this */}
          <input
            type="checkbox"
            name="botcheck"
            className="contact-honeypot"
            tabIndex={-1}
            autoComplete="off"
          />

          <div className="contact-actions">
            <button type="submit" className="contact-submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Send message'}
              <span aria-hidden="true">→</span>
            </button>
          </div>

          <p className={`contact-status is-${status}`} role="status">
            {STATUS_TEXT[status]}
          </p>
        </form>
      </div>
    </section>
  );
}

export default Contact;