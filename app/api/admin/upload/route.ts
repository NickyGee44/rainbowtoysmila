import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

// Create Supabase client lazily to avoid build-time errors
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    throw new Error("Supabase credentials not configured");
  }
  
  return createClient(url, key);
}

async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value === "true";
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if Supabase is configured
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!url || !key) {
      console.error("Missing Supabase config:", { url: !!url, key: !!key });
      return NextResponse.json(
        { error: "Supabase not configured. Check environment variables." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const toyId = formData.get("toyId") as string;

    if (!file || !toyId) {
      return NextResponse.json(
        { error: "File and toyId are required" },
        { status: 400 }
      );
    }

    console.log(`📤 Uploading image for toy: ${toyId}, file: ${file.name}, size: ${file.size}`);

    // Generate unique filename
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${toyId}-${Date.now()}.${ext}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get Supabase client
    const supabase = getSupabaseClient();

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("toy-images")
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("toy-images")
      .getPublicUrl(data.path);

    console.log(`✅ Uploaded image for ${toyId}: ${urlData.publicUrl}`);

    return NextResponse.json({ 
      success: true, 
      imageUrl: urlData.publicUrl,
      path: data.path 
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
