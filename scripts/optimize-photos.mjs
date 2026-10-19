// Turns full-size phone photos in photos/ into web-ready product images.
//
//   photos/<saree-id>.jpg  →  public/assets/images/products/<saree-id>.jpg     (1200×1600, product page)
//                             public/assets/images/products/<saree-id>-sm.jpg  (600×800, cards and thumbnails)
//
// Photos are cropped from the centre to the 3:4 shape used across the site and saved as
// high-quality JPEGs (fabric texture stays crisp; files stay small enough for phones).
// Runs automatically before every build; photos already processed are skipped.
// Also writes lib/photos.json so pages know which images have a small version.
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const inDir = join(root, "photos");
const outDir = join(root, "public", "assets", "images", "products");
const SIZES = [{ suffix: "", width: 1200, quality: 80 }, { suffix: "-sm", width: 600, quality: 78 }];

mkdirSync(outDir, { recursive: true });
let made = 0;

async function processFolder(from, to) {
  if (!existsSync(from)) return;
  mkdirSync(to, { recursive: true });
  for (const file of readdirSync(from)) {
    if (!/\.(jpe?g|png|webp|heic)$/i.test(file)) continue;
    const src = join(from, file);
    const id = basename(file, extname(file)).toLowerCase().replace(/[^a-z0-9-]+/g, "-");
    for (const { suffix, width, quality } of SIZES) {
      const out = join(to, id + suffix + ".jpg");
      if (existsSync(out) && statSync(out).mtimeMs >= statSync(src).mtimeMs) continue;
      // Loaded only when a photo needs processing (e.g. not on Netlify, where photos/ is not uploaded).
      const sharp = (await import("sharp")).default;
      await sharp(src)
        .rotate() // respect the phone's orientation
        .resize({ width, height: Math.round((width * 4) / 3), fit: "cover", position: "centre" })
        .jpeg({ quality, mozjpeg: true, progressive: true })
        .toFile(out);
      made++;
    }
  }
}

// Saree photos, plus other site photos (e.g. photos/site/chaitanya-and-mansi.jpg → public/assets/images/).
await processFolder(inDir, outDir);
await processFolder(join(inDir, "site"), join(root, "public", "assets", "images"));

// Index of product images that have a small version (used for responsive srcset).
const photos = {};
for (const file of readdirSync(outDir).sort()) {
  if (!file.endsWith(".jpg") || file.endsWith("-sm.jpg")) continue;
  const sm = file.replace(/\.jpg$/, "-sm.jpg");
  if (existsSync(join(outDir, sm))) photos["assets/images/products/" + file] = "assets/images/products/" + sm;
}
writeFileSync(join(root, "lib", "photos.json"), JSON.stringify(photos, null, 2) + "\n");
console.log(`optimize-photos: ${made} images written, ${Object.keys(photos).length} product photos indexed`);
