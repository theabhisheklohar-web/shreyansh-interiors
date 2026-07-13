import { v2 as cloudinary } from "cloudinary";

// Cloudinary Configuration (.env.local se keys automatically fetch hongi)
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return Response.json({ error: "Koi image file nahi mili!" }, { status: 400 });
    }

    // File ko buffer mein convert kar rahe hain taaki Cloudinary read kar sake
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Cloudinary upload process (Stream ke through)
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "shreyansh-interiors" }, // Cloudinary par is folder me images jayengi
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    // Upload successful hone par secure URL return karega
    return Response.json({ 
      success: true, 
      url: uploadResult.secure_url 
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}