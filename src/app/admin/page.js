"use client";

import { useState, useEffect } from "react";

export default function AdminDashboard() {
  // ==========================================
  // 1. SECURITY & LOADING STATES
  // ==========================================
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [password, setPassword] = useState("");
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [captchaInput, setCaptchaInput] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0); 
  const [errorMsg, setErrorMsg] = useState("");

  // ==========================================
  // 2. PROJECT DATA STATES
  // ==========================================
  const [activeTab, setActiveTab] = useState("add"); 
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // EDIT STATE (Naya)
  const [editingId, setEditingId] = useState(null); 

  // Text Data
  const [title, setTitle] = useState("");
  const [projectType, setProjectType] = useState(""); 
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  
  // Image Data
  const [heroImage, setHeroImage] = useState(null); 
  const [moodboardImages, setMoodboardImages] = useState([]); 
  const [galleryImages, setGalleryImages] = useState([]); 

  // ==========================================
  // 3. DATABASE RECORDS STATES
  // ==========================================
  const [projectsList, setProjectsList] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  // ==========================================
  // SECURITY & LOGIN LOGIC
  // ==========================================
  const generateCaptcha = () => {
    setNum1(Math.floor(Math.random() * 10) + 1);
    setNum2(Math.floor(Math.random() * 10) + 1);
    setCaptchaInput("");
  };

  useEffect(() => { generateCaptcha(); }, []);

  useEffect(() => {
    if (lockoutTimer > 0) {
      const timer = setTimeout(() => setLockoutTimer(lockoutTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [lockoutTimer]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;
    
    if (parseInt(captchaInput) !== num1 + num2) {
      setErrorMsg("Galat CAPTCHA! Kripya sahi math answer likhein.");
      generateCaptcha();
      return;
    }

    setIsLoggingIn(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (data.success) {
        setIsLoggedIn(true);
        setFailedAttempts(0);
      } else {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts); 
        generateCaptcha(); 
        setPassword("");

        if (newAttempts >= 3) {
          setLockoutTimer(300); 
          setErrorMsg("3 baar galat password! Ab 5 minute wait karein.");
        } else {
          setErrorMsg(`${data.error || "Galat Password!"} (Attempts: ${newAttempts}/3)`);
        }
      }
    } catch (error) {
      setErrorMsg("Server se connect nahi ho paya. Kripya baad mein try karein.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // ==========================================
  // FETCH, DELETE & EDIT LOGIC
  // ==========================================
  const fetchProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const res = await fetch("/api/admin/projects");
      const data = await res.json();
      if (data.success) {
        setProjectsList(data.projects);
      } else {
        alert("Projects fetch karne mein error: " + data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Network error. Projects load nahi huye.");
    } finally {
      setIsLoadingProjects(false);
    }
  };

  useEffect(() => {
    if (activeTab === "manage") {
      fetchProjects();
      setEditingId(null); // Clear edit mode if returning to manage
    }
  }, [activeTab]);

  const handleDeleteProject = async (id, projectTitle) => {
    const confirmDelete = window.confirm(`Kya aap sach mein "${projectTitle}" ko delete karna chahte hain? Yeh wapas nahi aayega.`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/admin/projects?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      
      if (data.success) {
        setProjectsList(projectsList.filter((p) => p.id !== id));
        alert("✅ Project delete ho gaya!");
      } else {
        alert("❌ Error: " + data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Delete request fail ho gayi.");
    }
  };

  // NAYA: Edit Button Logic
  const handleEditClick = (project) => {
    setEditingId(project.id);
    setTitle(project.title);
    setProjectType(project.project_type);
    setLocation(project.location);
    setDescription(project.description);
    
    // Purani URL ko as a "file" state mein dalna
    setHeroImage({ file: project.hero_image, previewUrl: project.hero_image });
    
    // Moodboard load karna
    try {
      const parsedMoods = JSON.parse(project.moodboard_images || "[]");
      setMoodboardImages(parsedMoods.map(m => ({ file: m.url, previewUrl: m.url, name: m.name })));
    } catch(e) { setMoodboardImages([]); }
    
    // Gallery load karna
    try {
      const parsedGallery = JSON.parse(project.gallery_images || "[]");
      setGalleryImages(parsedGallery.map(url => ({ file: url, previewUrl: url })));
    } catch(e) { setGalleryImages([]); }
    
    setActiveTab("add"); // Wapas form tab par le jana
  };

  const clearForm = () => {
    setEditingId(null);
    setTitle(""); setProjectType(""); setLocation(""); setDescription("");
    setHeroImage(null); setMoodboardImages([]); setGalleryImages([]);
  };

  // ==========================================
  // SUPER FAST CLIENT-SIDE IMAGE COMPRESSOR
  // ==========================================
  const compressAndConvertImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1080;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (!blob) {
              canvas.toBlob((jpegBlob) => {
                const compressedFile = new File([jpegBlob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: "image/jpeg" });
                resolve({ file: compressedFile, previewUrl: URL.createObjectURL(compressedFile) });
              }, "image/jpeg", 0.8);
              return;
            }

            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", { type: "image/webp" });
            resolve({ file: compressedFile, previewUrl: URL.createObjectURL(compressedFile) });
          }, "image/webp", 0.8); 
        };
      };
    });
  };

  // ==========================================
  // IMAGE HANDLERS
  // ==========================================
  const handleHeroImage = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const compressed = await compressAndConvertImage(e.target.files[0]);
      setHeroImage(compressed);
    }
  };

  const handleMoodboardSelect = async (e) => {
    const files = Array.from(e.target.files);
    const compressedPromises = files.map(file => compressAndConvertImage(file));
    const compressedImages = await Promise.all(compressedPromises);
    
    const newMoods = compressedImages.map(img => ({
      file: img.file,
      previewUrl: img.previewUrl,
      name: "" 
    }));
    setMoodboardImages(prev => [...prev, ...newMoods]);
  };

  const updateMoodboardName = (index, newName) => {
    const updated = [...moodboardImages];
    updated[index].name = newName;
    setMoodboardImages(updated);
  };

  const removeMoodboardImage = (index) => {
    setMoodboardImages(moodboardImages.filter((_, i) => i !== index));
  };

  const handleGallerySelect = async (e) => {
    const files = Array.from(e.target.files);
    const compressedPromises = files.map(file => compressAndConvertImage(file));
    const compressedImages = await Promise.all(compressedPromises);
    setGalleryImages(prev => [...prev, ...compressedImages]);
  };

  const moveGalleryImage = (index, direction) => {
    const newImages = [...galleryImages];
    if (direction === "up" && index > 0) {
      [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    } else if (direction === "down" && index < newImages.length - 1) {
      [newImages[index + 1], newImages[index]] = [newImages[index], newImages[index + 1]];
    }
    setGalleryImages(newImages);
  };

  const removeGalleryImage = (index) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  // ==========================================
  // FINAL SUBMIT (POST or PUT)
  // ==========================================
  const uploadImageToCloudinary = async (fileOrUrl) => {
    // Agar file pehle se URL hai (purani image), toh naya upload mat karo
    if (typeof fileOrUrl === 'string' && fileOrUrl.startsWith('http')) {
      return fileOrUrl;
    }
    
    const formData = new FormData();
    formData.append("file", fileOrUrl);
    
    const res = await fetch("/api/upload", { 
      method: "POST", 
      body: formData 
    });
    
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.url; 
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    if (!heroImage) { alert("Please upload a Main Hero Image!"); return; }

    setIsSubmitting(true);
    try {
      const heroUrl = await uploadImageToCloudinary(heroImage.file);

      const moodboardData = await Promise.all(
        moodboardImages.map(async (img) => {
          const url = await uploadImageToCloudinary(img.file);
          return { url, name: img.name }; 
        })
      );

      const galleryUrls = await Promise.all(
        galleryImages.map(async (img) => {
          return await uploadImageToCloudinary(img.file);
        })
      );

      const projectData = {
        id: editingId, // Naya field edit ke liye
        title,
        projectType,
        location,
        description,
        hero_image: heroUrl,
        moodboard_images: JSON.stringify(moodboardData), 
        gallery_images: JSON.stringify(galleryUrls)
      };

      // Decide karein ki naya banana hai (POST) ya update karna hai (PUT)
      const dbRes = await fetch("/api/admin/projects", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData)
      });

      const dbData = await dbRes.json();
      
      if (dbData.success) {
        alert(editingId ? "✅ Project updated successfully!" : "✅ Project successfully published to Database!");
        clearForm();
        setActiveTab("manage");
      } else {
        alert("❌ Database Error: " + dbData.error);
      }

    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // VIEW: MAIN RENDER
  // ==========================================
  if (isLoggedIn) {
    return (
      <section className="hero-section" style={{ paddingTop: "120px", minHeight: "100vh", backgroundColor: "var(--color-bg-pure)", position: "relative" }}>
        
        {/* --- LIVE PREVIEW MODAL --- */}
        {showPreview && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "var(--color-bg-pure)", zIndex: 9999, overflowY: "auto", paddingBottom: "5rem" }}>
            <button onClick={() => setShowPreview(false)} style={{ position: "fixed", top: "1rem", right: "1rem", backgroundColor: "var(--color-gold-primary)", color: "black", padding: "0.8rem 1.2rem", fontWeight: "bold", zIndex: 10000, cursor: "pointer", border: "none" }}>
              ✕ CLOSE
            </button>
            
            <div style={{ width: "100%", aspectRatio: "16/9", backgroundColor: "#111", marginBottom: "3rem", position: "relative", maxHeight: "80vh" }}>
               {heroImage ? (
                  <img src={heroImage.previewUrl} alt="Hero" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.7)" }} />
               ) : (
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", color:"gray" }}>NO HERO IMAGE UPLOADED</div>
               )}
            </div>

            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
              <div style={{ marginBottom: "4rem" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--color-gold-primary)", textTransform: "uppercase", letterSpacing: "0.2em" }}>{projectType || "Project Type"} // {location || "Location"}</span>
                <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(2rem, 5vw, 4rem)", marginTop: "1rem", marginBottom: "1.5rem", fontWeight: "400" }}>{title || "Project Title Here"}</h1>
                <p style={{ color: "var(--color-text-muted)", fontSize: "1.1rem", maxWidth: "800px", lineHeight: "1.8" }}>{description || "Detailed project description will appear here."}</p>
              </div>

              {moodboardImages.length > 0 && (
                <div style={{ marginBottom: "5rem" }}>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", marginBottom: "2rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1rem" }}>The Moodboard</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "1.5rem" }}>
                    {moodboardImages.map((img, idx) => (
                      <div key={idx} style={{ display: "flex", flexDirection: "column" }}>
                        <img src={img.previewUrl} alt="Mood" style={{ width: "100%", height: "auto", objectFit: "contain", marginBottom: "0.5rem", maxHeight: "300px" }} />
                        <span style={{ fontSize: "0.8rem", color: "var(--color-gold-primary)", textTransform: "uppercase", letterSpacing: "0.1em", borderLeft: "2px solid var(--color-gold-primary)", paddingLeft: "10px" }}>
                          {img.name || "UNNAMED TEXTURE"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {galleryImages.length > 0 && (
                <div>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", marginBottom: "2rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1rem" }}>Realized Space</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
                    {galleryImages.map((img, idx) => (
                      <img key={idx} src={img.previewUrl} alt="Gallery" style={{ width: "100%", height: "auto", objectFit: "contain" }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- MAIN ADMIN FORM --- */}
        <div className="hero-container" style={{ flexDirection: "column", maxWidth: "1200px", margin: "0 auto", padding: "0 1rem" }}>
          
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid var(--glass-border)", paddingBottom: "1rem" }}>
            <h1 className="hero-title" style={{ fontSize: "2rem", margin: 0 }}>Command Center</h1>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button onClick={() => { clearForm(); setActiveTab("add"); }} className="btn" style={{ padding: "0.8rem 1.5rem", border: activeTab === "add" ? "1px solid var(--color-gold-primary)" : "1px solid transparent", color: activeTab === "add" ? "var(--color-gold-primary)" : "white" }}>
                {editingId ? "✏️ Edit Project" : "+ Add Project"}
              </button>
              <button onClick={() => setActiveTab("manage")} className="btn" style={{ padding: "0.8rem 1.5rem", border: activeTab === "manage" ? "1px solid var(--color-gold-primary)" : "1px solid transparent", color: activeTab === "manage" ? "var(--color-gold-primary)" : "white" }}>⚙️ Manage / Delete</button>
            </div>
          </div>
          
          {activeTab === "add" ? (
            <form onSubmit={handleProjectSubmit} style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", backgroundColor: "var(--color-bg-charcoal)", padding: "2.5rem", border: "1px solid var(--glass-border)" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <h3 style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.5rem", color: "var(--color-gold-primary)" }}>1. CORE DETAILS</h3>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", letterSpacing: "0.1em", color:"gray" }}>PROJECT TITLE</label>
                    <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. The Obsidian Estate" style={{ width: "100%", padding: "1rem", backgroundColor: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }} disabled={isSubmitting}/>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", letterSpacing: "0.1em", color:"gray" }}>PROJECT TYPE</label>
                      <input type="text" required value={projectType} onChange={(e) => setProjectType(e.target.value)} placeholder="e.g. Luxury Villa" style={{ width: "100%", padding: "1rem", backgroundColor: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }} disabled={isSubmitting} />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", letterSpacing: "0.1em", color:"gray" }}>LOCATION</label>
                      <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Jaipur, RJ" style={{ width: "100%", padding: "1rem", backgroundColor: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }} disabled={isSubmitting} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", letterSpacing: "0.1em", color:"gray" }}>DESCRIPTION</label>
                    <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows="5" placeholder="Write the architectural narrative..." style={{ width: "100%", padding: "1rem", backgroundColor: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }} disabled={isSubmitting}></textarea>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <h3 style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.5rem", color: "var(--color-gold-primary)" }}>2. MAIN HERO IMAGE</h3>
                  <p style={{ fontSize: "0.85rem", color: "gray" }}>This image will be displayed at the very top of the project case study (16:9 Aspect Ratio).</p>
                  <input type="file" accept="image/*" onChange={handleHeroImage} required={!editingId} style={{ width: "100%", padding: "1rem", backgroundColor: "rgba(0,0,0,0.3)", border: "1px dashed var(--color-gold-primary)", color: "white", cursor: "pointer" }} disabled={isSubmitting}/>
                  {heroImage && (
                    <div style={{ marginTop: "1rem", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <img src={heroImage.previewUrl} alt="Hero Preview" style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover" }} />
                    </div>
                  )}
                </div>
              </div>

              <div style={{ backgroundColor: "var(--color-bg-charcoal)", padding: "2.5rem", border: "1px solid var(--glass-border)" }}>
                <h3 style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.5rem", color: "var(--color-gold-primary)", marginBottom: "1.5rem" }}>3. MOODBOARD LABORATORY</h3>
                <input type="file" multiple accept="image/*" onChange={handleMoodboardSelect} style={{ width: "100%", padding: "1rem", backgroundColor: "rgba(0,0,0,0.3)", border: "1px dashed var(--color-gold-primary)", color: "white", cursor: "pointer", marginBottom: "2rem" }} disabled={isSubmitting}/>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1.5rem" }}>
                  {moodboardImages.map((img, index) => (
                    <div key={index} style={{ backgroundColor: "rgba(0,0,0,0.5)", padding: "1rem", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ position: "relative" }}>
                        <img src={img.previewUrl} alt="Mood" style={{ width: "100%", height: "auto", maxHeight: "200px", objectFit: "contain", marginBottom: "1rem" }} />
                        <button type="button" onClick={() => removeMoodboardImage(index)} style={{ position: "absolute", top: "5px", right: "5px", backgroundColor: "red", color: "white", border: "none", width: "25px", height: "25px", cursor: "pointer" }} disabled={isSubmitting}>✕</button>
                      </div>
                      <input type="text" placeholder="Material Name..." value={img.name} onChange={(e) => updateMoodboardName(index, e.target.value)} style={{ width: "100%", padding: "0.8rem", backgroundColor: "black", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontSize: "0.85rem", outline: "none" }} disabled={isSubmitting}/>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ backgroundColor: "var(--color-bg-charcoal)", padding: "2.5rem", border: "1px solid var(--glass-border)" }}>
                <h3 style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.5rem", color: "var(--color-gold-primary)", marginBottom: "1.5rem" }}>4. GALLERY EXECUTION (Arrange Images)</h3>
                <input type="file" multiple accept="image/*" onChange={handleGallerySelect} style={{ width: "100%", padding: "1rem", backgroundColor: "rgba(0,0,0,0.3)", border: "1px dashed var(--color-gold-primary)", color: "white", cursor: "pointer", marginBottom: "2rem" }} disabled={isSubmitting}/>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {galleryImages.map((img, index) => (
                    <div key={index} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1.5rem", backgroundColor: "rgba(0,0,0,0.5)", padding: "1rem", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ color: "var(--color-gold-primary)", fontWeight: "bold", minWidth: "30px" }}>{index + 1}.</span>
                      <img src={img.previewUrl} alt="Gallery" style={{ width: "150px", height: "auto", objectFit: "contain" }} />
                      <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <button type="button" onClick={() => moveGalleryImage(index, "up")} disabled={index === 0 || isSubmitting} style={{ padding: "0.8rem 1.2rem", backgroundColor: "#222", border: "none", color: "white", cursor: (index === 0 || isSubmitting) ? "not-allowed" : "pointer", opacity: (index === 0 || isSubmitting) ? 0.3 : 1 }}>Move UP 🔼</button>
                        <button type="button" onClick={() => moveGalleryImage(index, "down")} disabled={index === galleryImages.length - 1 || isSubmitting} style={{ padding: "0.8rem 1.2rem", backgroundColor: "#222", border: "none", color: "white", cursor: (index === galleryImages.length - 1 || isSubmitting) ? "not-allowed" : "pointer", opacity: (index === galleryImages.length - 1 || isSubmitting) ? 0.3 : 1 }}>Move DOWN 🔽</button>
                        <button type="button" onClick={() => removeGalleryImage(index)} style={{ padding: "0.8rem 1.2rem", backgroundColor: "rgba(255,0,0,0.2)", border: "1px solid red", color: "red", cursor: "pointer" }} disabled={isSubmitting}>DELETE ✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", marginTop: "1rem", position: "sticky", bottom: "20px", zIndex: 100 }}>
                {editingId && (
                  <button type="button" onClick={clearForm} className="btn btn-secondary" style={{ flex: "1 1 100px", padding: "1.5rem", backgroundColor: "red", color: "white", border: "none" }} disabled={isSubmitting}>
                    ✕ CANCEL EDIT
                  </button>
                )}
                <button type="button" onClick={() => setShowPreview(true)} className="btn btn-secondary" style={{ flex: "1 1 200px", padding: "1.5rem", backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)", color: "white", border: "1px solid var(--color-gold-primary)" }} disabled={isSubmitting}>👀 FULL PAGE PREVIEW</button>
                <button type="submit" className="btn btn-primary" style={{ flex: "2 1 300px", padding: "1.5rem", boxShadow: "0 10px 30px rgba(203, 178, 129, 0.2)", backgroundColor: "var(--color-gold-primary)", color: "black", fontWeight: "bold", opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? "not-allowed" : "pointer" }} disabled={isSubmitting}>
                  {isSubmitting ? "⏳ UPLOADING TO CLOUDINARY & DB..." : (editingId ? "💾 UPDATE PROJECT IN DATABASE" : "🚀 PUBLISH PROJECT TO DATABASE")}
                </button>
              </div>

            </form>
          ) : (
            <div style={{ backgroundColor: "var(--color-bg-charcoal)", padding: "3rem", border: "1px solid var(--glass-border)" }}>
               <h3 style={{ marginBottom: "2rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1rem", color: "var(--color-gold-primary)" }}>
                 Database Records ({projectsList.length})
               </h3>
               
               {isLoadingProjects ? (
                 <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>
                   Fetching projects securely...
                 </div>
               ) : projectsList.length === 0 ? (
                 <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>
                   Koi projects database mein nahi hain. Kripya naya project add karein.
                 </div>
               ) : (
                 <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                   {projectsList.map((project) => (
                     <div key={project.id} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "2rem", backgroundColor: "rgba(0,0,0,0.5)", padding: "1.5rem", border: "1px solid rgba(255,255,255,0.05)" }}>
                       
                       <div style={{ width: "160px", height: "90px", flexShrink: 0, backgroundColor: "#111" }}>
                         <img src={project.hero_image} alt={project.title} style={{ width: "100%", height: "100%", objectFit: "cover", border: "1px solid var(--color-gold-primary)" }} />
                       </div>
                       
                       <div style={{ flex: 1, minWidth: "250px" }}>
                         <h4 style={{ fontSize: "1.2rem", margin: "0 0 0.5rem 0", fontFamily: "var(--font-heading)" }}>{project.title}</h4>
                         <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: "0.85rem", letterSpacing: "0.05em" }}>
                           <span style={{ color: "var(--color-gold-primary)" }}>{project.project_type}</span> // {project.location}
                         </p>
                       </div>
                       
                       <div style={{ display: "flex", gap: "1rem" }}>
                         <button onClick={() => handleEditClick(project)} style={{ padding: "0.8rem 1.5rem", backgroundColor: "rgba(203, 178, 129, 0.1)", border: "1px solid var(--color-gold-primary)", color: "var(--color-gold-primary)", cursor: "pointer", fontWeight: "bold", transition: "var(--transition-smooth)" }}>
                           EDIT ✏️
                         </button>
                         <button onClick={() => handleDeleteProject(project.id, project.title)} style={{ padding: "0.8rem 1.5rem", backgroundColor: "rgba(255,0,0,0.1)", border: "1px solid red", color: "red", cursor: "pointer", fontWeight: "bold", transition: "var(--transition-smooth)" }}>
                           DELETE ✕
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          )}
        </div>
      </section>
    );
  }

  // ==========================================
  // VIEW: LOGIN SCREEN
  // ==========================================
  return (
    <section className="finale-section" style={{ paddingTop: "80px", minHeight: "100vh", display: "flex", alignItems: "center" }}>
      <div className="finale-container" style={{ display: "flex", justifyContent: "center", width: "100%", padding: "1rem" }}>
        <div className="dark-frosted-glass-card" style={{ maxWidth: "450px", width: "100%" }}>
          <span className="finale-eyebrow">Restricted Area</span>
          <h2 className="finale-title" style={{ fontSize: "2.5rem", marginBottom: "2rem" }}>Admin Gateway</h2>
          {errorMsg && <div style={{ backgroundColor: "rgba(255,0,0,0.1)", border: "1px solid red", padding: "15px", color: "#ff4d4d", marginBottom: "1.5rem", fontSize: "0.9rem", textAlign: "left" }}>{errorMsg}</div>}
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.5rem", textAlign: "left" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.75rem", color: "var(--color-text-muted)" }}>Master Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={lockoutTimer > 0 || isLoggingIn} style={{ width: "100%", padding: "1.2rem", backgroundColor: "rgba(0,0,0,0.7)", border: "1px solid var(--glass-border)", color: "white", outline: "none", fontSize: "1rem" }} placeholder="Enter password..." required />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.75rem", color: "var(--color-text-muted)" }}>Security Check: {num1} + {num2} = ?</label>
              <input type="number" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} disabled={lockoutTimer > 0 || isLoggingIn} style={{ width: "100%", padding: "1.2rem", backgroundColor: "rgba(0,0,0,0.7)", border: "1px solid var(--glass-border)", color: "white", outline: "none", fontSize: "1rem" }} placeholder="Type your answer..." required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "1.2rem", marginTop: "1rem", opacity: (lockoutTimer > 0 || isLoggingIn) ? 0.5 : 1, cursor: (lockoutTimer > 0 || isLoggingIn) ? "not-allowed" : "pointer", backgroundColor: "var(--color-gold-primary)", color: "black", fontWeight: "bold" }} disabled={lockoutTimer > 0 || isLoggingIn}>
              {isLoggingIn ? "VERIFYING..." : (lockoutTimer > 0 ? `LOCKED (${Math.floor(lockoutTimer / 60)}:${('0' + (lockoutTimer % 60)).slice(-2)})` : "AUTHENTICATE")}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}