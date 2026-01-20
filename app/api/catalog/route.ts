import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    const { data: toys, error } = await supabase
      .from("toys")
      .select("*")
      .neq("license_status", "ip-risk")
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
      difficulty: toy.difficulty,
      printTimeHours: toy.print_time_hours,
    }));

    return NextResponse.json({ toys: formattedToys });
  } catch (error) {
    console.error("Catalog API error:", error);
    return NextResponse.json({ toys: [] }, { status: 500 });
  }
}
