# Varunavi Vastra website (Next.js)

Online store for Varunavi Vastra handcrafted cotton sarees, built with Next.js and React. `npm run build` turns it into plain static files in `out/`, so it can be hosted on Netlify without a server, the same way as the old site.

## Run locally

Open a terminal in this folder (`D:\varunavi-vastra`), then:

| Command | What it does |
| --- | --- |
| `npm install` | First time only: downloads the libraries the site needs |
| `npm run dev` | Starts the site at http://localhost:3000 and reloads as you edit. Stop it with Ctrl+C |
| `npm run build` | Makes the finished site in `out/` (also prepares new photos) |
| `npm start` | Shows the finished `out/` site at http://localhost:3000, exactly as it will be published |
| `npm run photos` | Only prepares new photos from `photos/` |

## Vercel

`vercel.json` holds the Vercel settings (build command, `out` folder, redirects for old links). To publish there the first time:

```
npx vercel login
npx vercel deploy --prod
```

Answer the questions with the defaults (team "vishalkondi-team", project name "varunavi-vastra").

## Publish

Live at https://varunavi-vastra.netlify.app (Netlify project "varunavi-vastra"). To publish changes, ask Claude to redeploy: Netlify uploads this folder, runs the build and publishes `out/`, using the settings in `netlify.toml`.

To build by hand instead, run `npm run build`, then drag the `out` folder (not the whole project) onto https://app.netlify.com/projects/varunavi-vastra/deploys.

The previous plain-HTML version of the site is kept in `old-html-site/` for reference. It is not used or published.

`netlify.toml` also redirects old links such as `product.html?id=indigo-ikat` to the new `/product/indigo-ikat`, so links people have already shared keep working.

## Everyday edits — `lib/data.ts`

Everything that used to be in `assets/js/products.js` is now in this file. It works the same way:

- **Contact details, Instagram/Facebook links, logo, saree of the week, UPI, discount codes, fall and picot price, top bar message:** the `SITE` block at the top.
- **Add or edit a saree:** copy one entry in `PRODUCTS` and change its fields. Use a unique `id`, which becomes the product page address (`/product/<id>`).
- **Photos:** put the full-size phone photo in `photos/`, named after the saree's `id` (for example `photos/rust-floral-block-print.jpg`), and list it in that saree's `images: [...]` as `"assets/images/products/rust-floral-block-print.jpg"`. The build makes a 1200×1600 copy for the product page and a 600×800 copy for cards in `public/assets/images/products/`, cropped from the centre to the 3:4 shape (run `npm run photos` to make them without building). Keep the saree in the middle of the shot. Your original photos stay in `photos/` and are never uploaded.
- **Real logo:** save it as `public/assets/images/logo.png` and set `logoImage: "assets/images/logo.png"`.
- **Journal:** add articles to `POSTS`.

After an edit, run `npm run build` again and publish the new `out/` folder.

Placeholder photos for the hero, the story section and the founders are marked in the page files with `Replace with: ...` comments.

## Page addresses

| Old address | New address |
| --- | --- |
| `index.html` | `/` |
| `shop.html?weave=…&new=1&q=…` | `/shop?weave=…&new=1&q=…` |
| `product.html?id=…` | `/product/…` |
| `post.html?id=…` | `/journal/…` |
| `our-story.html`, `contact.html`, etc. | `/our-story`, `/contact`, etc. |

Every saree and journal post now gets its own pre-built page with its own title, description and product data for search engines. The old site filled these in with JavaScript after the page loaded.

## Files

```
app/                     One folder per page (page.tsx)
  layout.tsx             Fonts, header, footer, page titles
  globals.css            All styles (brand colours at the top)
  product/[id]/page.tsx  One page per saree
  journal/[id]/page.tsx  One page per article
components/
  Header.tsx, Footer.tsx Site header (menu, search, cart count) and footer
  Bits.tsx               Product cards, images, breadcrumbs, trust strip...
  Shop.tsx               Shop grid with filters and sorting
  Cart.tsx               Cart, discount codes, WhatsApp/UPI checkout
  ProductParts.tsx       Gallery, add to cart, share, recently viewed
  Forms.tsx              WhatsApp forms, newsletter, add-to-cart button
lib/
  data.ts                Store settings + catalogue  ← edit this
  store.ts               Cart, wishlist and recently viewed (saved in the browser)
  utils.ts               Prices, links, search
scripts/flatten-prefetch.mjs  Runs after build; fixes Next.js link-prefetch files for static hosting
```

## Before going live

- Fill in everything in `[brackets]` on the Our Story page and the policy pages.
- The newsletter form shows a thank-you message but doesn't save emails yet. Connect it to Mailchimp, Brevo or Formspree (see `NewsletterForm` in `components/Forms.tsx`).
