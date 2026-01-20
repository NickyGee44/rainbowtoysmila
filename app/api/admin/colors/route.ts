import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseClient, getSupabaseAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET - anyone can read colors (for the color picker)
export async function GET() {
  try {
    const supabase = getSupabaseClient();

    const { data: colors, error } = await supabase
      .from("colors")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching colors:", error);
      return NextResponse.json({ colors: [] }, { status: 500 });
    }

    // Transform to match frontend expected format
    const formattedColors = colors.map((color) => ({
      id: color.id,
      name: color.name,
      hex: color.hex,
      inStock: color.in_stock,
    }));

    return NextResponse.json({ colors: formattedColors });
  } catch (error) {
    console.error("Colors API error:", error);
    return NextResponse.json({ colors: [] }, { status: 500 });
  }
}

// POST/PUT - admin only, update colors
export async function POST(request: Request) {
  return updateColors(request);
}

export async function PUT(request: Request) {
  return updateColors(request);
}

async function updateColors(request: Request) {
  try {
    // Check admin session
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");
    if (session?.value !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { colors } = await request.json();

    if (!Array.isArray(colors)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    // Delete all existing colors and insert new ones
    await supabase.from("colors").delete().neq("id", "");

    // Insert new colors
    const colorsToInsert = colors.map((color: { id: string; name: string; hex: string; inStock?: boolean }) => ({
      id: color.id,
      name: color.name,
      hex: color.hex,
      in_stock: color.inStock ?? true,
    }));

    const { error } = await supabase.from("colors").insert(colorsToInsert);

    if (error) {
      console.error("Error saving colors:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Colors save error:", error);
    return NextResponse.json({ error: "Failed to save colors" }, { status: 500 });
  }
}
