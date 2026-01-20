import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseClient, getSupabaseAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET - fetch all toys for admin
export async function GET() {
  try {
    // Check admin session
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");
    if (session?.value !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseClient();

    const { data: toys, error } = await supabase
      .from("toys")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching toys:", error);
      return NextResponse.json({ toys: [] }, { status: 500 });
    }

    // Transform to match frontend expected format
    const formattedToys = toys.map((toy) => ({
      id: toy.id,
      name: toy.name,
      description: toy.description,
      imageUrl: toy.image_url,
      sourceUrl: toy.source_url,
      tags: toy.tags,
    }));

    return NextResponse.json({ toys: formattedToys });
  } catch (error) {
    console.error("Admin catalog API error:", error);
    return NextResponse.json({ toys: [] }, { status: 500 });
  }
}

// POST - update toys OR create a new toy
export async function POST(request: Request) {
  try {
    // Check admin session
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");
    if (session?.value !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const supabase = getSupabaseAdminClient();

    // If it's a single toy with action: "create", create new toy
    if (body.action === "create" && body.toy) {
      const toy = body.toy;
      const { data, error } = await supabase
        .from("toys")
        .insert({
          id: toy.id || `toy-${Date.now()}`,
          name: toy.name || "New Toy",
          description: toy.description || "",
          image_url: toy.imageUrl || null,
          tags: toy.tags || [],
          difficulty: "easy",
          print_time_hours: 2,
          license_status: "unknown",
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating toy:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        toy: {
          id: data.id,
          name: data.name,
          description: data.description,
          imageUrl: data.image_url,
        }
      });
    }

    // Otherwise, update multiple toys
    const { toys } = body;

    if (!Array.isArray(toys)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Update each toy
    for (const toy of toys) {
      const { error } = await supabase
        .from("toys")
        .update({
          name: toy.name,
          description: toy.description,
          image_url: toy.imageUrl,
        })
        .eq("id", toy.id);

      if (error) {
        console.error(`Error updating toy ${toy.id}:`, error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Catalog save error:", error);
    return NextResponse.json({ error: "Failed to save catalog" }, { status: 500 });
  }
}

// PUT - update toys
export async function PUT(request: Request) {
  try {
    // Check admin session
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");
    if (session?.value !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { toys } = await request.json();

    if (!Array.isArray(toys)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    // Update each toy
    for (const toy of toys) {
      const { error } = await supabase
        .from("toys")
        .update({
          name: toy.name,
          description: toy.description,
          image_url: toy.imageUrl,
        })
        .eq("id", toy.id);

      if (error) {
        console.error(`Error updating toy ${toy.id}:`, error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Catalog save error:", error);
    return NextResponse.json({ error: "Failed to save catalog" }, { status: 500 });
  }
}

// DELETE - remove a toy
export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");
    if (session?.value !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: "Toy ID required" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("toys").delete().eq("id", id);

    if (error) {
      console.error("Error deleting toy:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Failed to delete toy" }, { status: 500 });
  }
}
