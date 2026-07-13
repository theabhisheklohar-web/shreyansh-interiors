import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge'; 

export async function POST(request) {
  try {
    const db = getRequestContext().env.DB;
    
    if (!db) {
      return Response.json({ error: "Database binding missing!" }, { status: 500 });
    }

    const data = await request.json();

    await db.prepare(`
      INSERT INTO projects (title, project_type, location, description, hero_image, moodboard_images, gallery_images)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.title, 
      data.projectType, 
      data.location, 
      data.description,
      data.hero_image, 
      data.moodboard_images, 
      data.gallery_images
    ).run();

    return Response.json({ success: true, message: "Project safely saved to database!" });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  
}
// GET: Database se saare projects fetch karne ke liye
export async function GET() {
  try {
    const db = getRequestContext().env.DB;
    if (!db) return Response.json({ error: "Database missing!" }, { status: 500 });

    const { results } = await db.prepare("SELECT * FROM projects ORDER BY created_at DESC").all();
    return Response.json({ success: true, projects: results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Project ko database se hatane ke liye
export async function DELETE(request) {
  try {
    const db = getRequestContext().env.DB;
    if (!db) return Response.json({ error: "Database missing!" }, { status: 500 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return Response.json({ error: "Project ID is required" }, { status: 400 });

    await db.prepare("DELETE FROM projects WHERE id = ?").bind(id).run();
    return Response.json({ success: true, message: "Project deleted successfully!" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
// PUT: Purane project ko update (edit) karne ke liye
export async function PUT(request) {
  try {
    const db = getRequestContext().env.DB;
    if (!db) return Response.json({ error: "Database missing!" }, { status: 500 });

    const data = await request.json();

    // Update karne ke liye ID hona zaroori hai
    if (!data.id) {
      return Response.json({ error: "Project ID is missing!" }, { status: 400 });
    }

    // Database mein naya data overwrite kar rahe hain
    await db.prepare(`
      UPDATE projects 
      SET title = ?, project_type = ?, location = ?, description = ?, hero_image = ?, moodboard_images = ?, gallery_images = ?
      WHERE id = ?
    `).bind(
      data.title, 
      data.projectType, 
      data.location, 
      data.description,
      data.hero_image, 
      data.moodboard_images, 
      data.gallery_images,
      data.id
    ).run();

    return Response.json({ success: true, message: "Project safely updated!" });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}