DROP TABLE IF EXISTS hero_section;
DROP TABLE IF EXISTS about_section;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS contact_section;


DROP TABLE IF EXISTS projects;
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  project_type TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  hero_image TEXT NOT NULL,       -- Single Cloudinary URL (Main Cover)
  moodboard_images TEXT NOT NULL, -- JSON Array of objects [{url, name}]
  gallery_images TEXT NOT NULL,   -- JSON Array of Cloudinary URLs
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);