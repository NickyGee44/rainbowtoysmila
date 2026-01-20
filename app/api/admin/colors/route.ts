import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { promises as fs } from "fs";
import path from "path";

const COLORS_PATH = path.join(process.cwd(), "data", "colors.json");

// Default colors if file doesn't exist
const DEFAULT_COLORS = [
  { id: "pink", name: "Pink", hex: "#ec4899", inStock: true },
  { id: "red", name: "Red", hex: "#ef4444", inStock: true },
  { id: "orange", name: "Orange", hex: "#f97316", inStock: true },
  { id: "yellow", name: "Yellow", hex: "#eab308", inStock: true },
  { id: "green", name: "Green", hex: "#22c55e", inStock: true },
  { id: "blue", name: "Blue", hex: "#3b82f6", inStock: true },
  { id: "purple", name: "Purple", hex: "#a855f7", inStock: true },
  { id: "white", name: "White", hex: "#f8fafc", inStock: true },
  { id: "black", name: "Black", hex: "#1e293b", inStock: true },
  { id: "rainbow", name: "Rainbow", hex: "linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #a855f7)", inStock: true },
];

async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value === "true";
}

export async function GET() {
  // Colors can be read without auth (for the main site)
  try {
    const raw = await fs.readFile(COLORS_PATH, "utf8");
    const colors = JSON.parse(raw);
    return NextResponse.json({ colors });
  } catch {
    // Return defaults if file doesn't exist
    return NextResponse.json({ colors: DEFAULT_COLORS });
  }
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { colors } = await request.json();
    
    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), "data");
    await fs.mkdir(dataDir, { recursive: true });
    
    await fs.writeFile(COLORS_PATH, JSON.stringify(colors, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving colors:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
