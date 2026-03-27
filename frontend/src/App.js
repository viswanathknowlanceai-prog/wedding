import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Menu, X, Heart, MapPin, Calendar, Phone, Mail, Share2 } from 'lucide-react';
import '@/App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', guests: '1', message: '' });

  // Wedding date - Set to 3 months from now
  const weddingDate = new Date();
  weddingDate.setMonth(weddingDate.getMonth() + 3);
  weddingDate.setHours(10, 30, 0, 0);

  // Preloader effect
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = weddingDate.getTime() - now;

      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Parallax scroll effect
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 300]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const handleRSVPSubmit = async (e) => {
    e.preventDefault();
    
    // Fire confetti
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#B22222', '#FFB300', '#2E8B57']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#B22222', '#FFB300', '#2E8B57']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    setRsvpSuccess(true);
    setTimeout(() => setRsvpSuccess(false), 5000);
    setFormData({ name: '', email: '', phone: '', guests: '1', message: '' });
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const shareOnWhatsApp = () => {
    const text = `Join us for the wedding celebration of D. Gayathri & D. Mano Vikas! ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="preloader" data-testid="preloader">
        <div className="diya-container">
          <img 
            src="https://static.prod-images.emergentagent.com/jobs/36ee2e43-7cbe-481e-898a-e1b6f5037474/images/340bbb4511f890e7d276554d4ffcb0f90b0da979e4167818790c3be4e40cc094.png" 
            alt="Diya" 
            className="diya-image"
          />
          <p className="loading-text">शुभ विवाह</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App" data-testid="wedding-website">
      {/* Floating Decorations */}
      <div className="floating-flowers">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flower" style={{ left: `${(i + 1) * 12}%`, animationDelay: `${i * 0.5}s` }} />
        ))}
      </div>

      {/* Navigation */}
      <nav className="navbar" data-testid="navbar">
        <div className="nav-content">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="nav-logo"
          >
            <Heart className="heart-icon" fill="#B22222" stroke="#B22222" />
            <span>G & M</span>
          </motion.div>

          {/* Desktop Menu */}
          <div className="nav-links-desktop">
            <button onClick={() => scrollToSection('home')} data-testid="nav-link-home">Home</button>
            <button onClick={() => scrollToSection('story')} data-testid="nav-link-story">Our Story</button>
            <button onClick={() => scrollToSection('rituals')} data-testid="nav-link-rituals">Rituals</button>
            <button onClick={() => scrollToSection('venue')} data-testid="nav-link-venue">Venue</button>
            <button onClick={() => scrollToSection('rsvp')} data-testid="nav-link-rsvp">RSVP</button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mobile-menu"
            data-testid="mobile-menu"
          >
            <button onClick={() => scrollToSection('home')}>Home</button>
            <button onClick={() => scrollToSection('story')}>Our Story</button>
            <button onClick={() => scrollToSection('rituals')}>Rituals</button>
            <button onClick={() => scrollToSection('venue')}>Venue</button>
            <button onClick={() => scrollToSection('rsvp')}>RSVP</button>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero-section" data-testid="hero-section">
        <motion.div 
          className="hero-bg"
          style={{ y: y1 }}
        >
          <img 
            src="https://static.prod-images.emergentagent.com/jobs/36ee2e43-7cbe-481e-898a-e1b6f5037474/images/345bf000d52534060c0515110a74ea698ec0a4fce514981296dbf78891890931.png" 
            alt="Temple Background"
          />
        </motion.div>

        <motion.div 
          className="hero-content"
          style={{ y: y2, opacity }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="hero-text"
          >
            <p className="subtitle-telugu" data-testid="subtitle-telugu">शुभ विवाह</p>
            <h1 className="couple-names" data-testid="couple-names">
              <span className="bride-name">D. Gayathri</span>
              <span className="and-symbol">&</span>
              <span className="groom-name">D. Mano Vikas</span>
            </h1>
            <p className="subtitle-english" data-testid="subtitle-english">We are getting married</p>
            
            {/* Countdown Timer */}
            <div className="countdown-timer" data-testid="countdown-timer">
              <div className="countdown-item">
                <span className="countdown-number">{countdown.days}</span>
                <span className="countdown-label">Days</span>
              </div>
              <div className="countdown-item">
                <span className="countdown-number">{countdown.hours}</span>
                <span className="countdown-label">Hours</span>
              </div>
              <div className="countdown-item">
                <span className="countdown-number">{countdown.minutes}</span>
                <span className="countdown-label">Minutes</span>
              </div>
              <div className="countdown-item">
                <span className="countdown-number">{countdown.seconds}</span>
                <span className="countdown-label">Seconds</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="scroll-indicator">
          <div className="scroll-line"></div>
        </div>
      </section>

      {/* Our Story Section */}
      <section id="story" className="story-section" data-testid="story-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">Our Story</h2>
            <p className="section-subtitle">Two hearts, one journey</p>
          </motion.div>

          <div className="story-grid">
            <StoryCard
              title="The Bride"
              name="D. Gayathri"
              description="A beautiful soul with grace and elegance, bringing joy and light to everyone around her. Her warmth and kindness make her truly special."
              image="https://images.unsplash.com/photo-1767333586238-5fe2e8e62b0e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzl8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3ZWRkaW5nJTIwY291cGxlJTIwcG9ydHJhaXR8ZW58MHx8fHwxNzc0NjMyMzgzfDA&ixlib=rb-4.1.0&q=85"
              delay={0.2}
            />
            <StoryCard
              title="The Groom"
              name="D. Mano Vikas"
              description="A man of integrity and strength, with a heart full of dreams and determination. His love and devotion know no bounds."
              image="https://images.unsplash.com/photo-1767790693955-bb886f16dce9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzl8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjB3ZWRkaW5nJTIwY291cGxlJTIwcG9ydHJhaXR8ZW58MHx8fHwxNzc0NjMyMzgzfDA&ixlib=rb-4.1.0&q=85"
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* Wedding Rituals Timeline */}
      <section id="rituals" className="rituals-section" data-testid="rituals-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">Wedding Rituals</h2>
            <p className="section-subtitle">Join us in our celebrations</p>
          </motion.div>

          <div className="timeline">
            <TimelineItem
              title="Haldi Ceremony"
              date={`${weddingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - 9:00 AM`}
              description="A traditional pre-wedding ceremony where turmeric paste is applied to the bride and groom for radiant skin and blessings."
              icon="🌼"
              side="left"
            />
            <TimelineItem
              title="Mehendi Ceremony"
              date={`${weddingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - 2:00 PM`}
              description="An artistic celebration where intricate henna designs are applied to the bride's hands and feet, symbolizing joy and beauty."
              icon="🎨"
              side="right"
            />
            <TimelineItem
              title="Sangeet Night"
              date={`${weddingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - 7:00 PM`}
              description="A night filled with music, dance, and celebration as families come together to perform and enjoy."
              icon="🎵"
              side="left"
            />
            <TimelineItem
              title="Muhurtham (Wedding Ceremony)"
              date={`${weddingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - 10:30 AM`}
              description="The sacred wedding ceremony where two souls unite in the presence of fire, family, and divine blessings."
              icon="💍"
              side="right"
              highlight
            />
            <TimelineItem
              title="Reception"
              date={`${weddingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - 7:00 PM`}
              description="Join us for an evening of dinner, dance, and celebration as we begin our new journey together."
              icon="🎉"
              side="left"
            />
          </div>
        </div>
      </section>

      {/* Venue & Map Section */}
      <section id="venue" className="venue-section" data-testid="venue-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">Venue</h2>
            <p className="section-subtitle">Where we celebrate our union</p>
          </motion.div>

          <div className="venue-grid">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="venue-details"
            >
              <div className="venue-card">
                <div className="venue-icon">
                  <MapPin size={32} />
                </div>
                <h3>Grand Wedding Hall</h3>
                <p className="venue-address">
                  123 Temple Street<br />
                  Hyderabad, Telangana 500001<br />
                  India
                </p>
                <div className="venue-contacts">
                  <div className="contact-item">
                    <Phone size={18} />
                    <span>+91 98765 43210</span>
                  </div>
                  <div className="contact-item">
                    <Mail size={18} />
                    <span>contact@weddingvenue.com</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="venue-map"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d243647.87651653782!2d78.2430056!3d17.4123487!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb99daeaebd2c7%3A0xae93b78392bafbc2!2sHyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Venue Location"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* RSVP Section */}
      <section id="rsvp" className="rsvp-section" data-testid="rsvp-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">RSVP</h2>
            <p className="section-subtitle">Please confirm your presence</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="rsvp-form-container"
          >
            {rsvpSuccess && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="rsvp-success"
                data-testid="rsvp-success-message"
              >
                <div className="success-icon">✓</div>
                <h3>Thank You!</h3>
                <p>We can't wait to celebrate with you!</p>
              </motion.div>
            )}

            <form onSubmit={handleRSVPSubmit} className="rsvp-form" data-testid="rsvp-form">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="rsvp-input-name"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    data-testid="rsvp-input-email"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    data-testid="rsvp-input-phone"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="guests">Number of Guests *</label>
                <select
                  id="guests"
                  value={formData.guests}
                  onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                  data-testid="rsvp-select-guests"
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests</option>
                  <option value="5">5+ Guests</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Special Message (Optional)</label>
                <textarea
                  id="message"
                  rows="4"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  data-testid="rsvp-input-message"
                />
              </div>

              <button type="submit" className="rsvp-submit-btn" data-testid="rsvp-submit-button">
                Confirm Attendance
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" data-testid="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <Heart size={32} fill="#FFB300" stroke="#FFB300" />
              <h3>Gayathri & Mano Vikas</h3>
              <p>{weddingDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <div className="footer-share">
              <p>Share the joy</p>
              <div className="share-buttons">
                <button onClick={shareOnWhatsApp} data-testid="share-whatsapp" title="Share on WhatsApp">
                  <Share2 size={20} />
                  <span>WhatsApp</span>
                </button>
                <button onClick={copyLink} data-testid="share-copy-link" title="Copy Link">
                  <Share2 size={20} />
                  <span>Copy Link</span>
                </button>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>Made with love and blessings ❤️</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StoryCard({ title, name, description, image, delay }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, rotateY: -15 }}
      animate={isInView ? { opacity: 1, y: 0, rotateY: 0 } : {}}
      transition={{ duration: 0.8, delay }}
      className="story-card"
      data-testid={`story-card-${title.toLowerCase().replace(' ', '-')}`}
    >
      <div className="story-image">
        <img src={image} alt={name} />
        <div className="image-overlay" />
      </div>
      <div className="story-content">
        <h3>{title}</h3>
        <h4>{name}</h4>
        <p>{description}</p>
      </div>
    </motion.div>
  );
}

function TimelineItem({ title, date, description, icon, side, highlight }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: side === 'left' ? -50 : 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6 }}
      className={`timeline-item ${side} ${highlight ? 'highlight' : ''}`}
      data-testid={`timeline-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="timeline-content">
        <div className="timeline-icon">{icon}</div>
        <h3>{title}</h3>
        <p className="timeline-date">
          <Calendar size={16} />
          {date}
        </p>
        <p className="timeline-description">{description}</p>
      </div>
      <div className="timeline-dot" />
    </motion.div>
  );
}

export default App;