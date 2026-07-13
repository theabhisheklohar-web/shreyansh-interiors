export const runtime = 'edge';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return Response.json({ success: false, error: "File nahi mili!" }, { status: 400 });
    }

    // File ko ArrayBuffer me convert karna Edge compatibility ke liye
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Cloudflare dashboard se variables uthana
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      return Response.json({ success: false, error: "Cloudinary credentials missing in dashboard!" }, { status: 500 });
    }

    // Cloudinary REST API Form Data taiyar karna
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", new Blob([buffer], { type: file.type }));
    cloudinaryFormData.append("upload_preset", uploadPreset);

    // Direct HTTP Request bhejna bina kisi external SDK ke
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: cloudinaryFormData,
    });

    const data = await res.json();

    if (data.secure_url) {
      return Response.json({ success: true, url: data.secure_url });
    } else {
      return Response.json({ success: false, error: data.error?.message || "Upload failed" }, { status: 500 });
    }
  } catch (error) {
    return Response.json({ success: false, error: "Upload Crash: " + error.message }, { status: 500 });
  }
}