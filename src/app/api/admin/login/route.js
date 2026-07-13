export const runtime = 'edge';

export async function POST(request) {
  try {
    const { password } = await request.json();
    
    // Cloudflare environment variables ko direct access karna
    const correctPassword = process.env.ADMIN_PASSWORD;

    // Debugging ke liye check kar rahe hain ki kya password mil raha hai
    if (!correctPassword) {
      return Response.json({ 
        error: "Server Error: ADMIN_PASSWORD variable nahi mil raha!" 
      }, { status: 500 });
    }

    if (password === correctPassword) {
      return Response.json({ success: true, message: "Welcome Admin!" });
    } else {
      return Response.json({ success: false, error: "Galat Password!" }, { status: 401 });
    }
  } catch (error) {
    return Response.json({ error: "Code Crash: " + error.message }, { status: 500 });
  }
}