// Site photos (not sarees) that appear once their file exists in public/assets/images/.
// Made from photos/site/<name>.jpg by scripts/optimize-photos.mjs. Checked at build time,
// so only import this from server components (pages without "use client").
import { existsSync } from "node:fs";
import { join } from "node:path";

export type SitePhoto = { src: string; small: string };

export function sitePhoto(name: string): SitePhoto | null {
  const file = join(process.cwd(), "public", "assets", "images", name + ".jpg");
  return existsSync(file) ? { src: "/assets/images/" + name + ".jpg", small: "/assets/images/" + name + "-sm.jpg" } : null;
}

// Photo of the two founders together, used on the homepage and the Our Story page.
export const sistersPhoto = () => sitePhoto("chaitanya-and-mansi");
