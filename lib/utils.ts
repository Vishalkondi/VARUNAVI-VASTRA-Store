import { PRODUCTS, SITE, WEAVES, type Collection, type Product } from "./data";

export const rupees = (n: number) => "₹ " + Number(n).toLocaleString("en-IN");
export const byId = (id: string | null | undefined) => PRODUCTS.find((p) => p.id === id);
export const productUrl = (p: Product) => "/product/" + encodeURIComponent(p.id);
export const postUrl = (id: string) => "/journal/" + encodeURIComponent(id);
export const waLink = (text?: string) => "https://wa.me/" + SITE.whatsapp + (text ? "?text=" + encodeURIComponent(text) : "");

// Image paths in data.ts may be written as "assets/..." (relative); serve them from the site root.
export const asset = (src: string) => (/^(https?:)?\/\//.test(src) || src.startsWith("/") ? src : "/" + src);

export const avgRating = (p: Product) => {
  const r = p.reviews || [];
  return r.length ? r.reduce((n, x) => n + x.rating, 0) / r.length : 0;
};

export const formatDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

export function searchProducts(q: string) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  return PRODUCTS.filter((p) => {
    const hay = [p.name, p.weaveType, p.colour, p.colourName, p.occasion, WEAVES[p.weave].label, p.description].join(" ").toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}

// Sarees with price 0 have no price yet: customers ask for it on WhatsApp instead of adding to cart.
export const hasPrice = (p: Product) => p.price > 0;
export const priceText = (p: Product) => (hasPrice(p) ? rupees(p.price) : "Ask for price");
export const askPriceLink = (p: Product) =>
  waLink("Hello Varunavi Vastra, could you please share the price of " + p.name + " (" + p.sku + ")?\n" + SITE.url + productUrl(p));

// Sarees in a curated collection (see COLLECTIONS in data.ts), newest first.
export function collectionProducts(c: Collection) {
  const m = c.match;
  return PRODUCTS.filter((p) =>
    (!m.weaveType || p.weaveType.toLowerCase().includes(m.weaveType.toLowerCase())) &&
    (!m.weave || p.weave === m.weave) &&
    (!m.occasion || p.occasion === m.occasion) &&
    (!m.colour || p.colour === m.colour) &&
    (!m.ids || m.ids.includes(p.id)),
  ).sort((a, b) => Number(!!a.soldOut) - Number(!!b.soldOut) || b.added - a.added);
}
export const collectionUrl = (c: Collection) => "/collections/" + c.slug;

// The date `n` working days (Monday to Saturday) after `from`.
export function addWorkingDays(from: Date, n: number) {
  const d = new Date(from);
  while (n > 0) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) n--;
  }
  return d;
}

export const shortDate = (d: Date) => d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
