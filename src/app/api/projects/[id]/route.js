import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET(request, { params }) {
  try {
    const db = getRequestContext().env.DB;
    if (!db) return Response.json({ error: "Database missing!" }, { status: 500 });

    const { id } = await params; // Dynamic URL ID destructuring

    if (!id) {
      return Response.json({ error: "Missing Project ID Parameter" }, { status: 400 });
    }

    const project = await db.prepare("SELECT * FROM projects WHERE id = ?").bind(id).first();

    if (!project) {
      return Response.json({ error: "Project framework not found in database matrix" }, { status: 404 });
    }

    return Response.json({ success: true, project });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}