import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

type Toy = {
  id: string;
  name: string;
  imageUrl?: string;
  sourceUrl?: string;
  description?: string;
  difficulty?: "easy" | "medium" | "hard";
  printTimeHours?: number;
  filamentGrams?: number;
  tags?: string[];
  licenseStatus?: string;
};

/**
 * ============================================
 * CATALOG API
 * ============================================
 * 
 * Reads toys from data/catalog.json
 * 
 * To add/remove toys:
 *   1. Edit data/catalog.json
 *   2. Run `node scripts/fetch-images.mjs` to download images
 *   3. Images are saved to public/toys/
 * 
 * ============================================
 */

// Cache the catalog in memory for performance
let cachedCatalog: Toy[] | null = null;
let cacheTime = 0;
const CACHE_DURATION = 60 * 1000; // 1 minute cache

async function loadCatalog(): Promise<Toy[]> {
  // Return cached version if fresh
  if (cachedCatalog && Date.now() - cacheTime < CACHE_DURATION) {
    return cachedCatalog;
  }

  try {
    const catalogPath = path.join(process.cwd(), "data", "catalog.json");
    const raw = await fs.readFile(catalogPath, "utf8");
    const toys = JSON.parse(raw) as Toy[];
    
    // Filter out IP-risk items from public display (optional - can be toggled)
    const safeToys = toys.filter(t => t.licenseStatus !== "ip-risk");
    
    cachedCatalog = safeToys;
    cacheTime = Date.now();
    
    return safeToys;
  } catch (error) {
    console.error("Failed to load catalog:", error);
    // Return fallback demo data if file doesn't exist
    return getFallbackCatalog();
  }
}

function getFallbackCatalog(): Toy[] {
  return [
    {
      id: "star-bear",
      name: "Star Bear Buddy",
      description: "A cuddly bear holding a star. Perfect desk buddy!",
      difficulty: "easy",
      printTimeHours: 2,
      tags: ["bear", "cute", "gift"],
    },
    {
      id: "tiny-duck",
      name: "Tiny Duck",
      description: "A tiny duck that makes everyone smile.",
      difficulty: "easy",
      printTimeHours: 1,
      tags: ["duck", "tiny", "fun"],
    },
  ];
}

export async function GET() {
  try {
    const toys = await loadCatalog();
    return NextResponse.json({ toys });
  } catch (error) {
    console.error("Failed to fetch catalog:", error);
    return NextResponse.json(
      { toys: [], error: "Failed to load catalog" },
      { status: 500 }
    );
  }
}
