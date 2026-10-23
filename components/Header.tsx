"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { COLLECTIONS, OCCASION_TITLES, OCCASIONS, SITE, WEAVES } from "@/lib/data";
import { useCart, useStored, useWishlist, write } from "@/lib/store";
import { collectionProducts, collectionUrl, priceText, productUrl, searchProducts, waLink } from "@/lib/utils";
import { IMAGE_SIZES, Logo, ProductImage } from "./Bits";
import { BagIcon, CloseIcon, HeartIcon, MenuIcon, SearchIcon } from "./Icons";
import { scrim, SPRING } from "./Motion";

const MotionLink = motion.create(Link);
// Drawer links slide in one after another.
const drawerList = { open: { transition: { staggerChildren: 0.035, delayChildren: 0.08 } } };
const drawerItem = { closed: { opacity: 0, x: -14 }, open: { opacity: 1, x: 0 } };

// Suggested in the search panel; only terms that find at least one saree are shown.
const POPULAR = ["Block print", "Zari", "Temple border", "Handloom", "Office", "Festive", "Red", "Blue"].filter((t) => searchProducts(t).length);
const NO_SEARCHES: string[] = [];

type NavItem = { label: string; key: string; href: string; children?: { label: string; href: string }[] };

const NAV: NavItem[] = [
  {
    label: "Shop", key: "shop", href: "/shop",
    // On phones these appear as a simple list; on computers Shop opens the larger menu (MegaMenu below).
    children: [
      { label: "All Sarees", href: "/shop" },
      ...Object.entries(WEAVES).map(([k, w]) => ({ label: w.label, href: "/shop?weave=" + k })),
      { label: "New Arrivals", href: "/shop?new=1" },
      { label: "Bestsellers", href: "/shop?best=1" },
      { label: "Help me choose", href: "/finder" },
      { label: "Gift Cards", href: "/gift-card" },
    ],
  },
  {
    label: "Collections", key: "collections", href: "/collections",
    children: [
      ...COLLECTIONS.filter((c) => collectionProducts(c).length).map((c) => ({ label: c.name, href: collectionUrl(c) })),
      { label: "All Collections", href: "/collections" },
    ],
  },
  { label: "New Arrivals", key: "new", href: "/shop?new=1" },
  { label: "Bestsellers", key: "best", href: "/shop?best=1" },
  { label: "Our Story", key: "story", href: "/our-story" },
  { label: "Journal", key: "journal", href: "/journal" },
  { label: "Custom Order", key: "custom", href: "/custom-order" },
  { label: "Contact", key: "contact", href: "/contact" },
];

// The larger Shop menu on computers: four columns of links and two picture tiles.
const MEGA_COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  { title: "Shop by weave", links: [{ label: "All Sarees", href: "/shop" }, ...Object.entries(WEAVES).map(([k, w]) => ({ label: w.label, href: "/shop?weave=" + k }))] },
  { title: "Shop by occasion", links: OCCASIONS.map((o) => ({ label: OCCASION_TITLES[o].replace(" Sarees", ""), href: "/shop?occasion=" + encodeURIComponent(o) })) },
  { title: "Collections", links: COLLECTIONS.filter((c) => collectionProducts(c).length).map((c) => ({ label: c.name, href: collectionUrl(c) })) },
  { title: "More", links: [
    { label: "New Arrivals", href: "/shop?new=1" }, { label: "Bestsellers", href: "/shop?best=1" }, { label: "Help me choose", href: "/finder" },
    { label: "Gift Cards", href: "/gift-card" }, { label: "Catalogue (PDF)", href: "/catalogue" }, { label: "Custom Order", href: "/custom-order" },
  ] },
];
const MEGA_TILES = COLLECTIONS.map((c) => ({ c, p: collectionProducts(c)[0] })).filter((t) => t.p).slice(0, 2);

function MegaMenu() {
  return (
    <div className="mega">
      <div className="mega__cols">
        {MEGA_COLUMNS.map((col) => (
          <div key={col.title}>
            <h4>{col.title}</h4>
            <ul>{col.links.map((l) => <li key={l.href + l.label}><Link href={l.href}>{l.label}</Link></li>)}</ul>
          </div>
        ))}
      </div>
      <div className="mega__tiles">
        {MEGA_TILES.map(({ c, p }) => (
          <Link className="mega__tile" href={collectionUrl(c)} key={c.slug}>
            <span className="media"><ProductImage p={p} sizes={IMAGE_SIZES.thumb} /></span>
            <strong>{c.name}</strong>
            <small>{c.tagline}</small>
          </Link>
        ))}
      </div>
    </div>
  );
}

function activeKey(path: string, query: URLSearchParams | null) {
  if (path === "/shop") {
    if (query?.get("new") === "1") return "new";
    if (query?.get("best") === "1") return "best";
    return "shop";
  }
  if (path.startsWith("/product/") || path === "/finder" || path === "/gift-card" || path === "/catalogue") return "shop";
  if (path.startsWith("/collections")) return "collections";
  if (path.startsWith("/journal")) return "journal";
  return ({ "/our-story": "story", "/custom-order": "custom", "/contact": "contact" } as Record<string, string>)[path] || "";
}

// The query string is only known in the browser, so the header first renders without it.
export default function Header() {
  return (
    <Suspense fallback={<HeaderView query={null} />}>
      <HeaderWithQuery />
    </Suspense>
  );
}

function HeaderWithQuery() {
  return <HeaderView query={useSearchParams()} />;
}

function HeaderView({ query }: { query: URLSearchParams | null }) {
  const path = usePathname();
  const router = useRouter();
  const active = activeKey(path, query);
  const { count } = useCart();
  const wishCount = useWishlist().length;
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState(false);
  const [q, setQ] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);

  // Close panels whenever the page changes.
  const queryString = query?.toString();
  useEffect(() => { setDrawer(false); setSearch(false); }, [path, queryString]);

  useEffect(() => {
    if (search) searchInput.current?.focus();
    document.body.style.overflow = drawer || search ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setDrawer(false); setSearch(false); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawer, search]);

  // On computers the header shrinks to a slim bar once the page scrolls. Two thresholds stop it
  // flickering when shrinking the header itself moves the page.
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const check = () => setCompact((on) => (on ? window.scrollY > 60 : window.scrollY > 160));
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);

  const results = q.trim() ? searchProducts(q.trim()).slice(0, 6) : [];

  // Recent searches, saved in this browser (newest first).
  const recent = useStored<string[]>("vv_searches", NO_SEARCHES);
  const remember = (term: string) => write("vv_searches", [term, ...recent.filter((t) => t.toLowerCase() !== term.toLowerCase())].slice(0, 5));
  function runSearch(term: string) {
    remember(term);
    setQ("");
    router.push("/shop?q=" + encodeURIComponent(term));
  }

  return (
    <>
      <a className="sr-only" href="#main">Skip to content</a>
      <div className="announce">
        {SITE.announcement || (
          <>Handcrafted cotton sarees · <a href={waLink()} target="_blank" rel="noopener"><span className="hide-m">Chat with us on </span>WhatsApp {SITE.phoneDisplay}</a></>
        )}
      </div>
      <header className={"header" + (compact ? " is-compact" : "")}>
        <div className="wrap">
          <div className="header__bar">
            <div className="header__left">
              <button className="icon-btn menu-btn" aria-label="Open menu" onClick={() => setDrawer(true)}><MenuIcon /></button>
              <button className="icon-btn" aria-label="Search" onClick={() => setSearch(true)}><SearchIcon /><span className="search-label">Search</span></button>
            </div>
            <Link className="logo" href="/" aria-label={SITE.name + " home"}><Logo /></Link>
            <div className="header__right">
              <Link className="icon-btn wish-link" href="/wishlist" aria-label="Wishlist"><HeartIcon /><span className="count" hidden={wishCount === 0}>{wishCount}</span></Link>
              <Link className="icon-btn" href="/cart" aria-label="Cart"><BagIcon /><span className="count" hidden={count === 0}>{count}</span></Link>
            </div>
          </div>
          <nav aria-label="Main">
            <ul className="nav">
              {NAV.map((n) => (
                <li key={n.key} className={n.key === "shop" ? "nav__item--mega" : undefined}>
                  <Link className={"nav__link" + (n.key === active ? " is-active" : "")} href={n.href} aria-haspopup={n.children ? "true" : undefined}>{n.label}</Link>
                  {n.key === "shop" ? <MegaMenu /> : n.children ? (
                    <ul className="nav__drop">
                      {n.children.map((c) => <li key={c.href + c.label}><Link href={c.href}>{c.label}</Link></li>)}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <AnimatePresence>
        {drawer ? (
          <motion.div className="drawer" key="drawer" exit={{ pointerEvents: "none" }}>
            <motion.div className="drawer__scrim" onClick={() => setDrawer(false)} {...scrim} />
            <motion.div
              className="drawer__panel" role="dialog" aria-modal="true" aria-label="Menu"
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={SPRING}
            >
              <div className="drawer__head">
                <Link className="logo" href="/"><Logo /></Link>
                <button className="icon-btn" aria-label="Close menu" onClick={() => setDrawer(false)}><CloseIcon /></button>
              </div>
              <motion.ul variants={drawerList} initial="closed" animate="open">
                {NAV.map((n) => (
                  <motion.li key={n.key} variants={drawerItem}>
                    {n.children ? (
                      <details>
                        <summary>{n.label}</summary>
                        <ul>{n.children.map((c) => <li key={c.href + c.label}><Link href={c.href}>{c.label}</Link></li>)}</ul>
                      </details>
                    ) : <Link href={n.href}>{n.label}</Link>}
                  </motion.li>
                ))}
                <motion.li variants={drawerItem}><Link href="/finder">Help me choose</Link></motion.li>
                <motion.li variants={drawerItem}><Link href="/catalogue">Catalogue (PDF)</Link></motion.li>
                <motion.li variants={drawerItem}><Link href="/track-order">Track your order</Link></motion.li>
                <motion.li variants={drawerItem}><Link href="/wishlist">Wishlist</Link></motion.li>
                <motion.li variants={drawerItem}><Link href="/faq">FAQ</Link></motion.li>
              </motion.ul>
              <div className="drawer__foot">
                <p>{SITE.address}</p>
                <a className="btn btn--whatsapp btn--block" href={waLink()} target="_blank" rel="noopener">Chat on WhatsApp</a>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {search ? (
          <motion.div className="search" key="search" exit={{ pointerEvents: "none" }}>
            <motion.div className="search__scrim" onClick={() => setSearch(false)} {...scrim} />
            <motion.div
              className="search__panel" role="dialog" aria-modal="true" aria-label="Search"
              initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16, transition: { duration: 0.16 } }} transition={SPRING}
            >
              <div className="wrap">
                <form
                  className="search__form"
                  role="search"
                  onSubmit={(e) => { e.preventDefault(); if (q.trim()) runSearch(q.trim()); }}
                >
                  <SearchIcon width={22} height={22} />
                  <label className="sr-only" htmlFor="search-input">Search sarees</label>
                  <input
                    id="search-input" name="q" type="search" placeholder="Search sarees, colours, weaves" autoComplete="off"
                    value={q} onChange={(e) => setQ(e.target.value)} ref={searchInput}
                  />
                  <button type="button" className="icon-btn" aria-label="Close search" onClick={() => setSearch(false)}><CloseIcon /></button>
                </form>
                <div className="search__results">
                  {!q.trim() ? (
                    <div className="search__suggest">
                      {recent.length ? (
                        <div>
                          <h3>Recent searches <button type="button" className="link-btn" onClick={() => write("vv_searches", [])}>Clear</button></h3>
                          <div className="chips">{recent.map((t) => <button type="button" className="chip" key={t} onClick={() => runSearch(t)}>{t}</button>)}</div>
                        </div>
                  ) : null}
                  <div>
                    <h3>Popular searches</h3>
                    <div className="chips">{POPULAR.map((t) => <button type="button" className="chip" key={t} onClick={() => runSearch(t)}>{t}</button>)}</div>
                  </div>
                  <p className="hint">Not sure what you want? <Link href="/finder">Let us help you choose</Link>.</p>
                </div>
              ) : results.length ? results.map((p, i) => (
                <MotionLink
                  className="search__item" href={productUrl(p)} key={p.id} onClick={() => remember(q.trim())}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.25 }}
                >
                  <span className="media"><ProductImage p={p} sizes={IMAGE_SIZES.thumb} /></span>
                  <span>{p.name}<small>{WEAVES[p.weave].label} · {priceText(p)}</small></span>
                </MotionLink>
              )) : <p className="hint">No sarees match &quot;{q.trim()}&quot;. Try a colour like &quot;blue&quot; or a weave like &quot;ikat&quot;.</p>}
            </div>
          </div>
        </motion.div>
      </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
