import fs from "node:fs/promises";
import path from "node:path";

const CATALOG_PATH = path.join(process.cwd(), "data", "catalog.json");
const OUT_DIR = path.join(process.cwd(), "public", "toys");

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function getOgImage(url) {
  try {
    const res = await fetch(url, { 
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });
    if (!res.ok) throw new Error(`Failed to fetch page: ${url} (${res.status})`);
    const html = await res.text();

    // Find og:image meta tag
    const match =
      html.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/content=["']([^"']+)["'][^>]*property=["']og:image["']/i);

    if (!match) return null;
    return match[1];
  } catch (err) {
    console.error(`Error fetching ${url}:`, err.message);
    return null;
  }
}

async function download(url, filepath) {
  try {
    const res = await fetch(url, { 
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });
    if (!res.ok) throw new Error(`Failed image: ${url} (${res.status})`);
    const buf = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(filepath, buf);
    return true;
  } catch (err) {
    console.error(`Error downloading ${url}:`, err.message);
    return false;
  }
}

async function main() {
  console.log("🌈 Rainbow Toys Image Fetcher\n");
  console.log("Creating output directory...");
  await fs.mkdir(OUT_DIR, { recursive: true });

  console.log("Reading catalog...\n");
  const raw = await fs.readFile(CATALOG_PATH, "utf8");
  const items = JSON.parse(raw);

  const updated = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    console.log(`[${i + 1}/${items.length}] Processing: ${item.name}`);
    
    const page = item.imagePageUrl || item.sourceUrl;
    const og = await getOgImage(page);

    let imageUrl = item.imageUrl;
    
    if (og) {
      // Extract extension from URL or default to jpg
      const urlPath = new URL(og).pathname;
      const ext = urlPath.split(".").pop()?.toLowerCase() || "jpg";
      const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
      
      const filename = `${slugify(item.id || item.name)}.${safeExt}`;
      const outPath = path.join(OUT_DIR, filename);

      const success = await download(og, outPath);
      if (success) {
        imageUrl = `/toys/${filename}`;
        console.log(`   ✅ Saved: ${imageUrl}`);
        successCount++;
      } else {
        console.log(`   ❌ Failed to download image`);
        failCount++;
      }
    } else {
      console.log(`   ⚠️ No og:image found`);
      failCount++;
    }

    updated.push({ ...item, imageUrl });
    
    // Small delay to be nice to the server
    await new Promise(r => setTimeout(r, 500));
  }

  console.log("\nWriting updated catalog...");
  await fs.writeFile(CATALOG_PATH, JSON.stringify(updated, null, 2));
  
  console.log("\n========================================");
  console.log(`🎉 Done! ${successCount} images saved, ${failCount} failed`);
  console.log("========================================\n");
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
