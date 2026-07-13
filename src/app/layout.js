"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link"; // Added Next.js Link
import "./globals.css";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isCaseStudyPage = pathname.startsWith("/project-case-study/");

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isContactHubOpen, setContactHubOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <html lang="en">
      <body className="dark-theme">
        
        {/* STICKY GLASSMORPHIC HEADER */}
        <header 
          className="main-header" 
          id="header"
          style={isScrolled ? {
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            background: 'rgba(5, 5, 5, 0.9)'
          } : {
            boxShadow: 'none',
            background: 'rgba(10, 10, 10, 0.75)'
          }}
        >
          <div className="header-container">
            
            {/* BRAND ASSET / BACK ARROW WITH NEXT.JS LINK */}
            {isCaseStudyPage ? (
              <Link href="/#portfolio" className="brand-asset" aria-label="Back to Portfolio Grid" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <span style={{ 
                  fontSize: "1.5rem", 
                  color: "var(--color-gold-primary)", 
                  marginRight: "8px", 
                  transform: "translateY(-1px)"
                }}>
                  ←
                </span>
                <span className="brand-name" style={{ letterSpacing: '0.15em' }}>
                  BACK<span className="brand-subtext" style={{ letterSpacing: '0.2em' }}>TO SELECTED WORKS</span>
                </span>
              </Link>
            ) : (
              <Link href="/" className="brand-asset" aria-label="Shreyansh Interiors Home">
                <img src="/llogo.jpg" alt="Shreyansh Interiors Logo" className="brand-logo" width="45" height="45" />
                <span className="brand-name">
                  SHREYANSH<span className="brand-subtext">INTERIOR DESIGNER</span>
                </span>
              </Link>
            )}

            {/* Desktop Navigation Links */}
            <nav className="desktop-nav" aria-label="Main Desktop Navigation">
              <ul className="nav-list">
                <li><Link href={isCaseStudyPage ? "/#about" : "#about"} className="nav-link">About Us</Link></li>
                <li><Link href={isCaseStudyPage ? "/#services" : "#services"} className="nav-link">Services</Link></li>
                <li><Link href={isCaseStudyPage ? "/#portfolio" : "#portfolio"} className="nav-link">Portfolio</Link></li>
                <li>
                  <button 
                    onClick={() => setContactHubOpen(true)} 
                    className="nav-link btn-large trigger-contact-hub" 
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  >
                    Contact Us
                  </button>
                </li>
              </ul>
            </nav>

            {/* Mobile Menu Toggle Button */}
            <button 
              className={`mobile-menu-trigger ${isMobileMenuOpen ? 'open' : ''}`} 
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="trigger-line"></span>
              <span className="trigger-line"></span>
            </button>
          </div>

          {/* MOBILE NAVIGATION MENU */}
          <div className={`mobile-navigation ${isMobileMenuOpen ? 'active' : ''}`} style={{ 
            display: 'flex', flexDirection: 'column', padding: '2rem', gap: '1.5rem', 
            background: 'rgba(10,10,10,0.95)', position: 'absolute', top: '100%', left: 0, 
            width: '100%', borderBottom: '1px solid var(--color-gold-primary)', 
            visibility: isMobileMenuOpen ? 'visible' : 'hidden', 
            opacity: isMobileMenuOpen ? 1 : 0, transition: 'all 0.3s ease' 
          }}>
            <Link href={isCaseStudyPage ? "/#about" : "#about"} className="nav-link" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
            <Link href={isCaseStudyPage ? "/#services" : "#services"} className="nav-link" onClick={() => setMobileMenuOpen(false)}>Services</Link>
            <Link href={isCaseStudyPage ? "/#portfolio" : "#portfolio"} className="nav-link" onClick={() => setMobileMenuOpen(false)}>Portfolio</Link>
            <button 
              onClick={() => { setMobileMenuOpen(false); setContactHubOpen(true); }} 
              className="nav-link btn-large" 
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', color: 'var(--color-gold-primary)' }}
            >
              Contact Us
            </button>
          </div>
        </header>

        <main id="main-content">{children}</main>

        <footer className="main-footer">
          <div className="footer-container">
            <p className="footer-copyright">&copy; 2026 Shreyansh Interior Designer. All Rights Reserved.</p>
            <div className="footer-meta-links">
              <Link href={isCaseStudyPage ? "/#about" : "#about"} className="footer-anchor">Raisingnagar</Link>
              <span className="footer-separator">•</span>
              <Link href={isCaseStudyPage ? "/#portfolio" : "#portfolio"} className="footer-anchor">Pan India Portfolio</Link>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}