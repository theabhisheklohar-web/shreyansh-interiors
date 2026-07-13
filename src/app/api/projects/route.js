import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET(request) {
  try {
    const db = getRequestContext().env.DB;
    if (!db) return Response.json({ error: "Database missing!" }, { status: 500 });

    // URL se page number nikalenge (default: 1)
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    
    // Ek baar me kitne projects dikhane hain
    const limit = 5; 
    const offset = (page - 1) * limit;

    // Database query with LIMIT and OFFSET
    const { results } = await db.prepare(`
      SELECT id, title, project_type, location, hero_image 
      FROM projects 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all();
    
    // Check karenge ki kya aage aur projects hain (Taki hum Load More button hide/show kar sakein)
    const hasMore = results.length === limit;

    return Response.json({ success: true, projects: results, hasMore });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}