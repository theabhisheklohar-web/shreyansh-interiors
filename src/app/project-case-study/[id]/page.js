"use client";

export const runtime = 'edge';
import { useState, useEffect, use } from "react";

export default function ProjectCaseStudy({ params }) {
  const resolvedParams = use(params);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const [moodboard, setMoodboard] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [isContactHubOpen, setContactHubOpen] = useState(false);

  useEffect(() => {
    async function getDetails() {
      try {
        const res = await fetch(`/api/projects/${resolvedParams.id}`);
        const data = await res.json();
        if (data.success) {
          setProject(data.project);
          if (data.project.moodboard_images) {
            setMoodboard(JSON.parse(data.project.moodboard_images));
          }
          if (data.project.gallery_images) {
            setGallery(JSON.parse(data.project.gallery_images));
          }
        }
      } catch (err) {
        console.error("Failed loading data frame:", err);
      } finally {
        setLoading(false);
      }
    }
    getDetails();
  }, [resolvedParams.id]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setContactHubOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    if (isContactHubOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isContactHubOpen]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--color-bg-pure)", color: "var(--color-gold-primary)", letterSpacing: "0.2em" }}>
        STRUCTURING CASE STUDY...
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "var(--color-bg-pure)", gap: "1rem" }}>
        <h2 style={{ color: "red" }}>404 FRAME ERROR</h2>
        <p style={{ color: "var(--color-text-muted)" }}>Requested architectural case study could not be matched.</p>
        <a href="/" style={{ borderBottom: "1px solid var(--color-gold-primary)", color: "var(--color-gold-primary)" }}>Return to Homepage</a>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--color-bg-pure)", minHeight: "100vh", paddingBottom: "8rem", color: "white", position: "relative" }}>
      
      {/* ==========================================
          CSS for Responsive Moodboard Grid
         ========================================== */}
      <style dangerouslySetInnerHTML={{__html: `
        .moodboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 2rem;
        }
        .moodboard-card {
          display: flex;
          flex-direction: column;
          background: rgba(10,10,10,0.4);
          padding: 0.5rem;
          border: 1px solid rgba(255,255,255,0.02);
        }
        .moodboard-img {
          width: 100%;
          aspect-ratio: 1 / 1;
          object-fit: cover;
          margin-bottom: 0.75rem;
        }
        .moodboard-label {
          font-size: 0.8rem;
          color: var(--color-gold-primary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border-left: 2px solid var(--color-gold-primary);
          padding-left: 10px;
        }
        
        /* Mobile specific adjustments */
        @media (max-width: 768px) {
          .moodboard-grid {
            grid-template-columns: repeat(2, 1fr); /* 2 items per row */
            gap: 1rem; /* slightly tighter spacing on mobile */
          }
          .moodboard-card {
            padding: 0.35rem; /* smaller card padding */
          }
          .moodboard-img {
            margin-bottom: 0.5rem;
          }
          .moodboard-label {
            font-size: 0.65rem; /* smaller text */
            padding-left: 6px;
            letter-spacing: 0.05em;
          }
        }
      `}} />

      {/* Hero Cover */}
      <div style={{ width: "100%", aspectRatio: "1/1", backgroundColor: "#0f0f0f", marginBottom: "4rem", position: "relative", maxHeight: "80vh", borderBottom: "1px solid var(--glass-border)", marginTop: "90px" }}>
        <img src={project.hero_image} alt={project.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      {/* Core Details */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
        <div style={{ marginBottom: "5rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--color-gold-primary)", textTransform: "uppercase", letterSpacing: "0.2em" }}>
            {project.project_type} // {project.location}
          </span>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(2.5rem, 6vw, 4.5rem)", marginTop: "1rem", marginBottom: "2rem", fontWeight: "400", lineHeight: "1.1" }}>
            {project.title}
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "1.15rem", maxWidth: "850px", lineHeight: "1.9", whiteSpace: "pre-wrap" }}>
            {project.description}
          </p>
        </div>

        {/* Moodboard Laboratory (UPDATED WITH CSS CLASSES) */}
        {moodboard.length > 0 && (
          <div style={{ marginBottom: "6rem" }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", marginBottom: "2.5rem", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "1rem" }}>
              The Moodboard
            </h3>
            <div className="moodboard-grid">
              {moodboard.map((img, idx) => (
                <div key={idx} className="moodboard-card">
                  <img src={img.url} alt="Material Profile" className="moodboard-img" />
                  <span className="moodboard-label">
                    {img.name || "RAW TEXTURE MATRIX"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Realized Space Gallery */}
        {gallery.length > 0 && (
          <div>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", marginBottom: "2.5rem", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "1rem" }}>
              Realized Space
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2.5rem" }}>
              {gallery.map((url, idx) => (
                <img key={idx} src={url} alt={`Realized View ${idx + 1}`} style={{ width: "100%", height: "auto", objectFit: "contain", border: "1px solid rgba(255,255,255,0.05)" }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contact Hub Modal */}
      <div className={`contact-hub-modal ${isContactHubOpen ? "active" : ""}`}>
        <div className="contact-hub-overlay" onClick={() => setContactHubOpen(false)}></div>
        <div className="contact-hub-card">
          <button className="close-hub-btn" onClick={() => setContactHubOpen(false)}>&times;</button>
          <h3 className="hub-title" style={{ color: 'white' }}>Connect with Shreyansh</h3>
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
            <a href="sms:+919999999999" className="hub-channel-link message-channel">
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

      <div className="mobile-sticky-hub-anchor">
        <button className="mobile-sticky-action-btn trigger-contact-hub" onClick={() => setContactHubOpen(true)}>CONTACT</button>
      </div>

    </div>
  );
}