"use client";

import { useState, useEffect } from "react";

// ==========================================
// STATIC PAGE DATA (Replaces SQL Tables)
// ==========================================
const PAGE_CONTENT = {
  hero: {
    title: "Refined Architecture. Structural Harmony.",
    tagline: "We craft bold, functional, and ultra-premium spaces designed to elevate the human experience through pure, minimalist geometry.",
    imageUrl: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiLxv0GklM5DxVIMQOmI3xUeOSALPOHdzT3VE4LQT3aMwla5eJw4T7zJXOwqNrYfx3xhR0fSXPOqBV0HCgljrA2-UUQQFIYRYAKVMha9CWwgBFvOB2w4crDd6XZi91mEK_kAMujYO7ZhXYDe_h2-avNPlMd_2YneQfZPrRKkN_eRJjhi2mwmweVr5eWl-Y/s1200/a10.jpg"
  },
  about: {
    subtitle: "The Visionary",
    name: "Shreyansh Tailor",
    location: "Raisingnagar, Rajasthan & Pan India",
    bioPara1: "We approach spaces as living sculptures. Driven by a bold, structural philosophy, our studio seamlessly balances raw architectural honesty with pure, sophisticated comfort.",
    bioPara2: "From our creative hub in Raisingnagar, Rajasthan, we design customized residential and commercial environments throughout India. Every line is intentional; every texture is carefully chosen to create an elegant, uncluttered lifestyle.",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600"
  },
  services: [
    {
      id: "01",
      title: "High-End Residential Architecture",
      description: "We design bespoke luxury homes, layouts, and custom floor plans that naturally complement your lifestyle."
    },
    {
      id: "02",
      title: "Executive Commercial Spaces",
      description: "We build clean corporate headquarters, striking retail spaces, and workspaces that increase focus and team productivity."
    },
    {
      id: "03",
      title: "Custom Furniture & Materialization",
      description: "We craft structural furniture items and select rare, durable materials tailored to your project."
    },
    {
      id: "04",
      title: "Turnkey Project Management",
      description: "Enjoy a stress-free transition as we manage everything from the initial design concept to the final site reveal."
    }
  ],
  finale: {
    eyebrow: "Ready to Begin?",
    title: "Let's build your dream space together.",
    description: "Step into a world of architectural clarity and premium structural execution. Our team handles every design element perfectly."
  }
};

export default function Home() {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [isContactHubOpen, setContactHubOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // ==========================================
  // EFFECTS & HANDLERS
  // ==========================================
  
  useEffect(() => {
    async function loadHomepageProjects() {
      try {
        const res = await fetch(`/api/projects?page=1`);
        const data = await res.json();
        if (data.success) {
          setProjects(data.projects);
          setHasMore(data.hasMore);
        }
      } catch (error) {
        console.error("Error loading portfolio projects:", error);
      } finally {
        setLoading(false);
      }
    }
    loadHomepageProjects();
  }, []);

  useEffect(() => {
    const monitorScrollPhysics = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", monitorScrollPhysics, { passive: true });
    return () => window.removeEventListener("scroll", monitorScrollPhysics);
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setContactHubOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    if (isContactHubOpen || isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isContactHubOpen, isMobileMenuOpen]);

  const handleLoadMore = async () => {
    if (!hasMore || loadingMore) return;
    
    setLoadingMore(true);
    const nextPage = page + 1;
    
    try {
      const res = await fetch(`/api/projects?page=${nextPage}`);
      const data = await res.json();
      
      if (data.success) {
        setProjects((prev) => [...prev, ...data.projects]);
        setHasMore(data.hasMore);
        setPage(nextPage);
      }
    } catch (error) {
      console.error("Error loading more projects:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <>
      {/* Mobile Navigation Overlay */}
      <div 
        className={`mobile-nav-overlay ${isMobileMenuOpen ? 'active' : ''}`} 
        id="mobileNavigation" 
        aria-hidden={!isMobileMenuOpen}
      >
        <nav className="mobile-nav" aria-label="Main Mobile Navigation">
          <ul className="mobile-nav-list">
            <li><a href="/about" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>About Us</a></li>
            <li><a href="/services" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Services</a></li>
            <li><a href="/portfolio" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Portfolio</a></li>
            <li>
              <button 
                className="btn btn-primary btn-large trigger-contact-hub" 
                onClick={() => { setMobileMenuOpen(false); setContactHubOpen(true); }}
              >
                Contact Us
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <main id="main-content" style={{ paddingTop: 'var(--header-height)' }}>
        
        {/* HERO SECTION */}
        <section id="home" className="hero-section" aria-label="Introduction" style={{ paddingTop: 0 }}>
          <div className="hero-container">
            <div className="hero-text-block">
              <h1 className="hero-title">{PAGE_CONTENT.hero.title}</h1>
              <p className="hero-tagline">{PAGE_CONTENT.hero.tagline}</p>
              <div className="hero-cta-group">
                <a href="#portfolio" className="btn btn-primary">View Projects</a>
                <a href="#about" className="btn btn-secondary">Learn More</a>
              </div>
            </div>
            <div className="hero-image-block">
              <img src={PAGE_CONTENT.hero.imageUrl} alt="Massive Minimalist Luxury Living Space Architecture" className="hero-img" loading="eager" />
            </div>
          </div>
        </section>

        {/* CONTACT HUB MODAL */}
        <div 
          className={`contact-hub-modal ${isContactHubOpen ? "active" : ""}`} 
          id="contactHub" 
          aria-hidden={!isContactHubOpen} 
          role="dialog" 
          aria-labelledby="hubTitle"
        >
          <div className="contact-hub-overlay" onClick={() => setContactHubOpen(false)}></div>
          <div className="contact-hub-card">
            <button className="close-hub-btn" onClick={() => setContactHubOpen(false)} aria-label="Close Contact Hub">&times;</button>
            <h3 id="hubTitle" className="hub-title">Connect with Shreyansh</h3>
            <p className="hub-subtitle">Select your preferred channel to discuss your upcoming space project.</p>
            <div className="hub-channels">
              <a href="https://wa.me/919999999999" className="hub-channel-link whatsapp-channel" target="_blank" rel="noopener noreferrer">
                <span className="channel-name">WhatsApp</span>
                <span className="channel-action">Start Chat</span>
              </a>
              <a href="tel:+919999999999" className="hub-channel-link phone-channel">
                <span className="channel-name">Direct Call</span>
                <span className="channel-action">Dial Now</span>
              </a>
              <a href="sms:+919999999999?body=Hello%20Shreyansh%20Interiors,%20I%20am%20interested%20in%20your%20services." className="hub-channel-link message-channel">
                <span className="channel-name">SMS Message</span>
                <span className="channel-action">Send Text</span>
              </a>
              <a href="mailto:info@shreyanshinteriors.com" className="hub-channel-link email-channel">
                <span className="channel-name">Official Email</span>
                <span className="channel-action">Write Us</span>
              </a>
            </div>
          </div>
        </div>

        {/* ABOUT US SECTION */}
        <section id="about" className="about-section" aria-labelledby="about-heading">
          <div className="about-container">
            <div className="about-image-wrapper">
              <img src={PAGE_CONTENT.about.imageUrl} alt="Lead Designer Portrait" className="designer-portrait" loading="lazy" />
            </div>
            <div className="about-content-wrapper">
              <span className="section-subtitle">{PAGE_CONTENT.about.subtitle}</span>
              <h2 id="about-heading" className="about-name">{PAGE_CONTENT.about.name}</h2>
              <p className="about-location">Location: {PAGE_CONTENT.about.location}</p>
              <div className="about-biography">
                <p>{PAGE_CONTENT.about.bioPara1}</p>
                <p>{PAGE_CONTENT.about.bioPara2}</p>
              </div>
              <a href="/about" className="btn btn-outline">Read More</a>
            </div>
          </div>
        </section>

        {/* OUR SERVICES SECTION */}
        <section id="services" className="services-section" aria-labelledby="services-heading">
          <div className="services-container">
            <header className="section-header">
              <span className="section-subtitle">Expertise</span>
              <h2 id="services-heading" className="section-title">Our Premium Services</h2>
            </header>
            <ul className="services-interactive-list">
              {PAGE_CONTENT.services.map((service) => (
                <li className="service-item" key={service.id}>
                  <div className="service-meta">
                    <span className="service-number">{service.id}</span>
                    <h3 className="service-title">{service.title}</h3>
                  </div>
                  <p className="service-description">{service.description}</p>
                </li>
              ))}
            </ul>
            <div className="services-footer-cta">
              <a href="/services" className="btn btn-outline">View All Services</a>
            </div>
          </div>
        </section>

        {/* PORTFOLIO GRID */}
        <section id="portfolio" className="portfolio-section" aria-labelledby="portfolio-heading">
          <div className="portfolio-container">
            <header className="section-header">
              <span className="section-subtitle">Realized Spaces</span>
              <h2 id="portfolio-heading" className="section-title">Selected Works</h2>
            </header>

            {loading ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-muted)", letterSpacing: "0.1em" }}>
                LOADING REALIZED SPACES...
              </div>
            ) : projects.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-muted)" }}>
                No projects uploaded yet. Check back soon!
              </div>
            ) : (
              <div className="portfolio-structural-grid">
                {projects.map((project) => (
                  <a href={`/project-case-study/${project.id}`} className="portfolio-card" key={project.id}>
                    <div className="card-image-container">
                      <img 
                        src={project.hero_image} 
                        alt={project.title} 
                        className="portfolio-img" 
                        loading="lazy" 
                      />
                    </div>
                    <div className="card-meta">
                      <h3 className="project-name">{project.title}</h3>
                      <p className="project-location">{project.location}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
            
            {!loading && hasMore && (
              <div className="concepts-footer-cta" style={{ marginTop: '3rem' }}>
                <button 
                  onClick={handleLoadMore} 
                  className="btn btn-outline"
                  disabled={loadingMore}
                >
                  {loadingMore ? "LOADING..." : "EXPLORE MORE PROJECTS"}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* THE GRAPHIC FINALE */}
        <section id="contact" className="finale-section" aria-labelledby="finale-heading">
          <div className="finale-container">
            <div className="dark-frosted-glass-card">
              <span className="finale-eyebrow">{PAGE_CONTENT.finale.eyebrow}</span>
              <h2 id="finale-heading" className="finale-title">{PAGE_CONTENT.finale.title}</h2>
              <p className="finale-text">{PAGE_CONTENT.finale.description}</p>
              <button className="btn btn-primary btn-large trigger-contact-hub" onClick={() => setContactHubOpen(true)}>CONTACT</button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="main-footer">
        <div className="footer-container">
          <p className="footer-copyright">&copy; 2026 Shreyansh Interior Designer. All Rights Reserved.</p>
          <div className="footer-meta-links">
            <a href="#about" className="footer-anchor">Raisingnagar</a>
            <span className="footer-separator">•</span>
            <a href="#portfolio" className="footer-anchor">Pan India Portfolio</a>
          </div>
          <div className="footer-socials">
            <a href="https://instagram.com" className="social-anchor" target="_blank" rel="noopener noreferrer">Instagram</a>
            <span className="footer-separator" style={{ color: 'var(--color-text-dark)' }}>•</span>
            <a href="https://linkedin.com" className="social-anchor" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
        </div>
      </footer>

      {/* MOBILE LAYOUT */}
      <div className="mobile-sticky-hub-anchor">
        <button className="mobile-sticky-action-btn trigger-contact-hub" onClick={() => setContactHubOpen(true)}>
          CONTACT
        </button>
      </div>
    </>
  );
}