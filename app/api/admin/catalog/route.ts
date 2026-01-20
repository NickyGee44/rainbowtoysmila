import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { promises as fs } from "fs";
import path from "path";

const CATALOG_PATH = path.join(process.cwd(), "data", "catalog.json");

async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value === "true";
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const raw = await fs.readFile(CATALOG_PATH, "utf8");
    const toys = JSON.parse(raw);
    return NextResponse.json({ toys });
  } catch {
    return NextResponse.json({ toys: [] });
  }
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { toys } = await request.json();
    await fs.writeFile(CATALOG_PATH, JSON.stringify(toys, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving catalog:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
