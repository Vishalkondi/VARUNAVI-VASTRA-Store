// Next 16 static export writes route prefetch data as nested folders
// (e.g. out/cart/__next.cart/__PAGE__.txt), but the browser requests dotted
// file names (out/cart/__next.cart.__PAGE__.txt). Copy each file to the name
// that is requested so link prefetching doesn't 404 on a static host.
import { cpSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const out = new URL("../out", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
let copied = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (!statSync(path).isDirectory()) continue;
    if (name.startsWith("__next.")) flatten(path, dir);
    else walk(path);
  }
}

function flatten(segDir, parent) {
  for (const name of readdirSync(segDir, { recursive: true })) {
    const file = join(segDir, name);
    if (statSync(file).isDirectory()) continue;
    const dotted = relative(parent, file).split(sep).join(".");
    cpSync(file, join(parent, dotted));
    copied++;
  }
}

walk(out);
console.log(`flatten-prefetch: copied ${copied} prefetch files`);
