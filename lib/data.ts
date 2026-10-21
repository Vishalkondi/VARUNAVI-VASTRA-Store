/*
 * Varunavi Vastra — store settings and product catalogue.
 * Edit this file to change contact details, add sarees, or change prices.
 *
 * Product photos: put the full-size phone photo in photos/, named after the saree's id
 * (e.g. photos/rust-floral-block-print.jpg). The build makes web-sized copies in
 * public/assets/images/products/. List them in `images`, e.g.
 * images: ["assets/images/products/rust-floral-block-print.jpg"].
 * While `images` is empty, an illustration of the saree is shown instead.
 */

export type Coupon = { code: string; percent?: number; amount?: number; minOrder?: number; note?: string };

export const SITE = {
  name: "Varunavi Vastra",
  url: "https://varunavi-vastra.netlify.app", // live address, used for share links and search engines
  tagline: "Handcrafted cotton sarees, made for the woman who values grace.",
  whatsapp: "919359211246",            // country code + number, digits only
  phoneDisplay: "+91 93592 11246",
  email: "",                            // e.g. "hello@varunavivastra.in"
  address: "267/38, Raviwar Peth, Bhadrawati Chowk, Kuchan High School Road, Solapur",
  hours: "Mon to Sat, 10 am to 7 pm",   // [check and update]
  // Drives the "Open now / Closed" sign on the Contact page (Indian time). Keep in step with `hours`.
  openDays: [1, 2, 3, 4, 5, 6],         // 0 = Sunday, 1 = Monday ... 6 = Saturday
  openTime: "10:00",
  closeTime: "19:00",

  // Delivery estimate on product pages, in working days (Sundays skipped). [confirm with your courier]
  // dispatch = days to pack and hand over; then courier time to Solapur district, the rest of Maharashtra, and the rest of India.
  delivery: { dispatch: [1, 2], local: [1, 2], state: [2, 4], india: [3, 7] } as Record<string, [number, number]>,
  instagram: "https://www.instagram.com/",  // [replace with your Instagram link]
  facebook: "https://www.facebook.com/",    // [replace with your Facebook link]
  logoImage: "assets/images/logo.png",   // your real logo (set to "" to fall back to the drawn lotus + wordmark)
  heroEyebrow: "The Autumn Weave Edit",
  sareeOfTheWeek: "royal-blue-zari-polka",
  shippingNote: "Free shipping across India on all orders.", // [confirm]

  // Top bar message. Leave "" to show the default WhatsApp line.
  announcement: "",

  // Online payment by UPI. Leave upiId "" to hide the "Pay now with UPI" option.
  upiId: "",                            // e.g. "varunavivastra@okicici"  [add your real UPI ID]
  upiName: "Varunavi Vastra",

  // Fall and picot service offered on every saree. Set to 0 to hide the option.
  fallPicotPrice: 150,                  // [confirm your price]

  // Discount codes. Leave the list empty to hide the coupon box in the cart.
  // Examples:
  //   { code: "WELCOME5", percent: 5, note: "5% off your first order" },
  //   { code: "FESTIVE200", amount: 200, minOrder: 3000, note: "₹ 200 off orders above ₹ 3,000" },
  coupons: [] as Coupon[],
};

// Collections. Each saree belongs to one (its `weave`).
export const WEAVES = {
  handloom: { label: "Handloom Cotton",     short: "Handloom",     c1: "#6f7a32", c2: "#a9b35e" },
  festive:  { label: "Festive Zari Cotton", short: "Festive zari", c1: "#7d2836", c2: "#b5556a" },
  print:    { label: "Block Print Cotton",  short: "Block print",  c1: "#a8432c", c2: "#e9e0cf" },
};

export type WeaveKey = keyof typeof WEAVES;

export const OCCASIONS = ["Everyday", "Office", "Festive", "Wedding guest"];

// Page titles and descriptions for each occasion (shop page and homepage).
export const OCCASION_TITLES: Record<string, string> = { Everyday: "Everyday Sarees", Office: "Office Wear Sarees", Festive: "Festive Sarees", "Wedding guest": "Wedding Guest Sarees" };
export const OCCASION_SUBS: Record<string, string> = {
  Everyday: "Easy, breathable cotton for daily grace",
  Office: "Neat, elegant drapes for the working day",
  Festive: "Rich borders and zari for poojas and celebrations",
  "Wedding guest": "Statement sarees for weddings and receptions",
};

// Curated collections ("edits"), each with its own page at /collections/<slug>.
// A saree joins a collection when it matches ALL the rules given: `weaveType` (part of the weave name,
// any case), `weave`, `occasion`, `colour`, or a fixed list of `ids`. New sarees join automatically.
// Names and descriptions are suggestions: rename them freely, but keep each `slug` once shared.
export type Collection = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  match: { weaveType?: string; weave?: WeaveKey; occasion?: string; colour?: string; ids?: string[] };
};

export const COLLECTIONS: Collection[] = [
  {
    slug: "temple-edit", name: "The Temple Edit", tagline: "Borders inspired by temple spires",
    description: "Cotton sarees with the classic temple border: rows of woven spires framing the drape, as worn for generations to poojas and family gatherings.",
    match: { weaveType: "temple" },
  },
  {
    slug: "zari-and-gold", name: "Zari & Gold", tagline: "A touch of gold for festive days",
    description: "Zari buttis, polka dots and borders woven in gold on soft cotton. Light enough to wear all day, rich enough for the festival season.",
    match: { weaveType: "zari" },
  },
  {
    slug: "block-print-stories", name: "Block Print Stories", tagline: "Printed by hand, one block at a time",
    description: "Florals and paisleys printed by hand with carved wooden blocks. Every saree carries the small variations of the printer's hand.",
    match: { weave: "print" },
  },
  {
    slug: "desk-to-dinner", name: "Desk to Dinner", tagline: "Neat, easy drapes for the working day",
    description: "Breathable cotton sarees in calm colours that look crisp at the office and stay comfortable into the evening.",
    match: { occasion: "Office" },
  },
];

export type Review ={ name: string; city?: string; rating: number; text: string; date?: string };

export type Product = {
  id: string;
  sku: string; // product code shown to customers; never change it once a saree is listed
  name: string;
  weave: WeaveKey;
  weaveType: string;
  colour: string;
  colourName: string;
  occasion: string;
  price: number; // in rupees; 0 = ask on WhatsApp
  isNew: boolean;
  added: number;
  group?: string;
  c1: string;
  c2: string;
  description: string;
  images: string[];
  bestseller?: boolean;
  soldOut?: boolean;
  reviews?: Review[];
  fabric?: string;
  length?: string;
  care?: string;
  details?: string;
  shipping?: string;
  returns?: string;
};

// `sku`: the saree's product code. Give a new saree the next number (VV-016, VV-017...) and never reuse one.
// `added`: higher number = newer (used for "Sort: Newest").
// `group`: sarees in the same group appear as colour swatches on each other's page.
// Optional flags: `bestseller: true`, `soldOut: true`.
// Optional `reviews`: [{ name: "Priya", city: "Pune", rating: 5, text: "...", date: "2026-10-01" }]
// Only add real reviews from real customers.
export const PRODUCTS: Product[] = [
  // price: 0 means not set yet. The saree shows "Ask price on WhatsApp" instead of a price and Add to cart.
  {
    id: "maroon-navy-temple-border", sku: "VV-001", name: "Maroon Temple Border", weave: "handloom", weaveType: "Temple border",
    colour: "Red", colourName: "Wine maroon with navy", occasion: "Everyday", price: 0,
    isNew: false, added: 10, group: "temple", c1: "#7a2c3c", c2: "#1f2440",
    description: "Wine maroon cotton with small navy buttis and a navy temple border finished in antique gold zari.",
    images: ["assets/images/products/maroon-navy-temple-border.jpg"],
  },
  {
    id: "sand-rust-border", sku: "VV-002", name: "Sand and Rust Border", weave: "handloom", weaveType: "Woven border",
    colour: "Beige", colourName: "Sand with rust", occasion: "Office", price: 0,
    isNew: false, added: 9, group: "border", c1: "#c9a77c", c2: "#8e2f1d",
    description: "A calm sand-coloured body with a deep rust border woven in rows of traditional motifs.",
    images: ["assets/images/products/sand-rust-border.jpg"],
  },
  {
    id: "red-green-temple-border", sku: "VV-003", name: "Red and Green Temple Border", bestseller: true, weave: "handloom", weaveType: "Temple border",
    colour: "Red", colourName: "Red with bottle green", occasion: "Festive", price: 0,
    isNew: false, added: 8, group: "temple", c1: "#b3181d", c2: "#1d5233",
    description: "Classic red cotton with a bottle green temple border and a rich gold zari band, made for festivals and poojas.",
    images: ["assets/images/products/red-green-temple-border.jpg"],
  },
  {
    id: "peach-maroon-border", sku: "VV-004", name: "Peach and Maroon Border", weave: "handloom", weaveType: "Woven border",
    colour: "Pink", colourName: "Dusty peach with maroon", occasion: "Everyday", price: 0,
    isNew: false, added: 7, group: "border", c1: "#d6a08c", c2: "#8c1a1d",
    description: "Soft dusty peach cotton with tiny red buttis and a maroon border lined with bright orange stripes.",
    images: ["assets/images/products/peach-maroon-border.jpg"],
  },
  {
    id: "royal-blue-zari-polka", sku: "VV-005", name: "Royal Blue Zari Polka", bestseller: true, weave: "festive", weaveType: "Zari polka",
    colour: "Blue", colourName: "Royal blue with wine", occasion: "Wedding guest", price: 0,
    isNew: false, added: 6, group: "zari", c1: "#2a2c9c", c2: "#6e1745",
    description: "Royal blue with large gold zari polka buttis and a wine border edged in zari, finished with tassels.",
    images: ["assets/images/products/royal-blue-zari-polka.jpg"],
  },
  {
    id: "mehendi-maroon-border", sku: "VV-006", name: "Mehendi and Maroon Border", weave: "handloom", weaveType: "Woven border",
    colour: "Green", colourName: "Mehendi green with maroon", occasion: "Festive", price: 0,
    isNew: false, added: 5, group: "border", c1: "#7c8a27", c2: "#a3141f",
    description: "Mehendi green cotton paired with a wide maroon border woven with fine gold motifs.",
    images: ["assets/images/products/mehendi-maroon-border.jpg"],
  },
  {
    id: "bottle-green-zari-butti", sku: "VV-007", name: "Bottle Green Zari Butti", weave: "festive", weaveType: "Zari butti",
    colour: "Green", colourName: "Bottle green", occasion: "Festive", price: 0,
    isNew: false, added: 4, group: "zari", c1: "#1f6b2a", c2: "#c9b046",
    description: "Deep bottle green with small gold buttis and a woven gold zari border, finished with tassels.",
    images: ["assets/images/products/bottle-green-zari-butti.jpg"],
  },
  {
    id: "black-rani-leaf-butti", sku: "VV-008", name: "Black and Rani Leaf Butti", bestseller: true, weave: "festive", weaveType: "Zari leaf butti",
    colour: "Black", colourName: "Black with rani pink", occasion: "Wedding guest", price: 0,
    isNew: false, added: 3, group: "leaf", c1: "#18181a", c2: "#a3195b",
    description: "Black cotton with large gold zari leaf buttis, a gold band and a rani pink border with tassels.",
    images: ["assets/images/products/black-rani-leaf-butti.jpg"],
  },
  {
    id: "black-red-leaf-butti", sku: "VV-009", name: "Black and Red Leaf Butti", weave: "festive", weaveType: "Zari leaf butti",
    colour: "Black", colourName: "Black with red", occasion: "Festive", price: 0,
    isNew: false, added: 2, group: "leaf", c1: "#141416", c2: "#9c1c22",
    description: "Black with rows of gold zari leaf buttis, a broad gold border and a red edge.",
    images: ["assets/images/products/black-red-leaf-butti.jpg"],
  },
  {
    id: "black-gold-zari-border", sku: "VV-010", name: "Black and Gold Zari Border", weave: "festive", weaveType: "Zari butti",
    colour: "Black", colourName: "Black with gold", occasion: "Office", price: 0,
    isNew: false, added: 1, group: "zari", c1: "#111113", c2: "#b89a3a",
    description: "Elegant black with small gold buttis and a woven gold zari border, finished with tassels.",
    images: ["assets/images/products/black-gold-zari-border.jpg"],
  },
  {
    id: "rust-floral-block-print", sku: "VV-011", name: "Rust Floral Block Print", bestseller: true, weave: "print", weaveType: "Block print",
    colour: "Red", colourName: "Rust with ivory", occasion: "Everyday", price: 0,
    isNew: true, added: 15, group: "print", c1: "#a8432c", c2: "#e9e0cf",
    description: "Hand block-printed ivory florals on rust, with a black printed border and a silver-toned edge.",
    images: ["assets/images/products/rust-floral-block-print.jpg"],
  },
  {
    id: "beige-indigo-block-print", sku: "VV-012", name: "Beige and Indigo Block Print", weave: "print", weaveType: "Block print",
    colour: "Beige", colourName: "Beige with indigo", occasion: "Office", price: 0,
    isNew: true, added: 14, group: "print", c1: "#cfc6a4", c2: "#27325c",
    description: "Small indigo flower buttas block-printed on beige, with a striped black border and a silver-toned edge.",
    images: ["assets/images/products/beige-indigo-block-print.jpg"],
  },
  {
    id: "blush-floral-block-print", sku: "VV-013", name: "Blush Floral Block Print", weave: "print", weaveType: "Block print",
    colour: "Pink", colourName: "Blush with pink and green", occasion: "Everyday", price: 0,
    isNew: true, added: 13, group: "print", c1: "#f4dfdc", c2: "#cf4f6e",
    description: "Pink and green flower buttas block-printed on soft blush, with a floral pink border and a silver-toned edge.",
    images: ["assets/images/products/blush-floral-block-print.jpg"],
  },
  {
    id: "teal-paisley-block-print", sku: "VV-014", name: "Teal Paisley Block Print", weave: "print", weaveType: "Block print",
    colour: "Green", colourName: "Teal with ivory", occasion: "Office", price: 0,
    isNew: true, added: 12, group: "print", c1: "#2f6e5c", c2: "#e8e2d4",
    description: "Ivory paisleys and flowers block-printed on teal, with a black printed border and a silver-toned edge.",
    images: ["assets/images/products/teal-paisley-block-print.jpg"],
  },
  {
    id: "mustard-floral-block-print", sku: "VV-015", name: "Mustard Floral Block Print", weave: "print", weaveType: "Block print",
    colour: "Yellow", colourName: "Mustard with ivory", occasion: "Everyday", price: 0,
    isNew: true, added: 11, group: "print", c1: "#e0b021", c2: "#2f4fa8",
    description: "A sunny mustard floral vine block print with a black flower border, blue edge and silver-toned finish.",
    images: ["assets/images/products/mustard-floral-block-print.jpg"],
  },
];

// Shared details shown on every product page unless a product sets its own.
export const PRODUCT_DEFAULTS = {
  fabric: "Pure cotton",
  length: "6.5 m with blouse piece",
  care: "Gentle hand wash, dry in shade",
  details: "Each saree is handcrafted, so small irregularities in the weave are part of its character. Colours may look slightly different on your screen.",
  shipping: "Ready-to-ship sarees are dispatched within 1 to 2 working days. Delivery usually takes 3 to 7 working days within India.",
  returns: "If something is not right, message us on WhatsApp within 48 hours of delivery with photos and we will help with an exchange. See our Cancellation & Refund policy for details.",
};

export type Post = { id: string; title: string; date: string; excerpt: string; c1: string; c2: string; image: string; body: string };

// Journal (blog) posts. Newest first. `body` is HTML.
export const POSTS: Post[] = [
  {
    id: "caring-for-cotton-sarees",
    title: "How to care for your cotton saree",
    date: "2026-10-10",
    excerpt: "A few simple habits keep a handcrafted cotton saree soft, bright and crisp for years.",
    c1: "#6f7a32", c2: "#a9b35e", image: "",
    body: `
<p>Cotton gets softer and more comfortable with every wear, as long as it is looked after gently. These are the habits we follow with our own sarees.</p>
<h2>The first wash</h2>
<p>Handcrafted cotton often uses natural or deep dyes, and some colour can run in the first few washes. Wash your new saree on its own in cold water, or give it a dry clean the first time.</p>
<h2>Everyday washing</h2>
<ul>
  <li>Use cold water and a mild liquid detergent.</li>
  <li>Hand wash gently. Do not scrub, wring or twist the fabric.</li>
  <li>Wash dark and light sarees separately.</li>
  <li>Rinse well so no soap stays in the weave.</li>
</ul>
<h2>Drying</h2>
<p>Dry in the shade, not in direct sun, which fades colour. Hang the saree folded over a line instead of pegging the edges.</p>
<h2>Starch and ironing</h2>
<p>For a crisp drape, dip in a light rice or ready-made starch and iron on medium heat while slightly damp. Iron zari borders from the reverse side.</p>
<h2>Storing</h2>
<p>Store sarees folded in a cotton or muslin bag, away from damp. Refold along different lines every few months so the folds do not weaken the fabric.</p>
`,
  },
  {
    id: "handloom-or-powerloom",
    title: "Handloom or powerloom: how to tell the difference",
    date: "2026-09-26",
    excerpt: "Handloom sarees carry the marks of the hands that made them. Here is what to look for.",
    c1: "#7d2836", c2: "#b5556a", image: "",
    body: `
<p>A handloom saree is woven on a loom worked entirely by hand and foot. A powerloom saree is woven by machine. Both have their place, but handloom carries something a machine cannot copy.</p>
<h2>Look at the reverse side</h2>
<p>Handloom sarees usually look almost the same on both sides. Machine-made prints and some powerloom designs look clearly different on the back.</p>
<h2>Small irregularities</h2>
<p>Hold the fabric up to the light. A handloom weave often shows tiny variations in thread thickness and spacing. These are not defects; they are the signature of a person at the loom.</p>
<h2>The border and the selvedge</h2>
<p>On handloom sarees the edges can be slightly uneven, and borders are woven in rather than printed on.</p>
<h2>The feel</h2>
<p>Handloom cotton tends to feel softer and more breathable, because the threads are not pulled as tightly as on a machine.</p>
<p>When you buy handloom, you support weavers and keep a craft of thousands of years alive.</p>
`,
  },
  {
    id: "draping-your-first-cotton-saree",
    title: "Draping your first cotton saree",
    date: "2026-09-12",
    excerpt: "Cotton holds pleats beautifully. A simple step-by-step for the classic Nivi drape.",
    c1: "#2f7d72", c2: "#69ada2", image: "",
    body: `
<p>Cotton is one of the easiest fabrics to drape, because it holds its pleats. Starch it lightly and it will stay neat all day.</p>
<h2>What you need</h2>
<ul>
  <li>A fitted blouse and a petticoat tied firmly at the waist</li>
  <li>The footwear you will wear, so the length is right</li>
  <li>Three or four safety pins</li>
</ul>
<h2>The Nivi drape, step by step</h2>
<ol>
  <li>Tuck the plain end of the saree into the petticoat at your right hip and wrap it once around your waist, keeping the hem just touching the floor.</li>
  <li>Make 5 to 7 even pleats of about five inches each, hold them together and tuck them in at your navel, facing left.</li>
  <li>Take the rest of the saree around your back and bring it up across your chest over the left shoulder.</li>
  <li>Pleat the pallu if you like, and pin it to your blouse at the shoulder.</li>
  <li>Pin the pleats together just below the tuck so they fall straight.</li>
</ol>
<p>Want to see it done? Follow us on Instagram for draping videos, or message us on WhatsApp for help.</p>
`,
  },
];
