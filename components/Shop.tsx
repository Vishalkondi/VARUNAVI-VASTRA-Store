"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { OCCASION_SUBS, OCCASION_TITLES, OCCASIONS, PRODUCTS, SITE, WEAVES, type Product, type WeaveKey } from "@/lib/data";
import { hasPrice, searchProducts, waLink } from "@/lib/utils";
import { Crumbs, PageHead, ProductCard } from "./Bits";
import { CloseIcon, FilterIcon } from "./Icons";

const PAGE_SIZE = 12;
const FILTERS = ["weave", "colour", "occasion", "price"] as const;
const COLOURS = [...new Set(PRODUCTS.map((p) => p.colour))].sort();
const PRICES: [string, string][] = [["0-2500", "Under ₹ 2,500"], ["2500-3000", "₹ 2,500 to ₹ 3,000"], ["3000-99999", "Above ₹ 3,000"]];
// Sarees without a price yet go after priced ones when sorting by price.
const unpriced = (a: Product, b: Product) => Number(!hasPrice(a)) - Number(!hasPrice(b));
const SORTERS: Record<string, (a: Product, b: Product) => number> = {
  newest: (a, b) => b.added - a.added,
  // Bestsellers first, then sarees with the most reviews, then newest.
  popular: (a, b) => Number(!!b.bestseller) - Number(!!a.bestseller) || (b.reviews?.length || 0) - (a.reviews?.length || 0) || b.added - a.added,
  "price-asc": (a, b) => unpriced(a, b) || a.price - b.price,
  "price-desc": (a, b) => unpriced(a, b) || b.price - a.price,
};
// A colour dot for each colour chip, taken from a saree of that colour.
const COLOUR_DOT = Object.fromEntries(COLOURS.map((c) => [c, PRODUCTS.find((p) => p.colour === c)!.c1]));
// Price filter and price sorting only appear once at least one saree has a price.
const ANY_PRICES = PRODUCTS.some(hasPrice);

function heading(sp: URLSearchParams) {
  const q = (sp.get("q") || "").trim();
  const weave = sp.get("weave") as WeaveKey | null;
  if (q) return { title: "Search results", sub: 'Showing sarees matching "' + q + '"' };
  if (sp.get("new") === "1") return { title: "New Arrivals", sub: "Fresh from the loom" };
  if (sp.get("best") === "1") return { title: "Bestsellers", sub: "The sarees our customers love most" };
  const occasion = sp.get("occasion");
  if (occasion && OCCASIONS.includes(occasion) && !weave) return { title: OCCASION_TITLES[occasion] || occasion + " Sarees", sub: OCCASION_SUBS[occasion] || "" };
  const sub = "Handcrafted, breathable and made to be worn again and again";
  return { title: weave && WEAVES[weave] ? WEAVES[weave].label + " Sarees" : "Cotton Sarees", sub };
}

function Select({ id, label, value, all, options, onChange }: {
  id: string; label: string; value: string; all?: string; options: [string, string][]; onChange: (v: string) => void;
}) {
  return (
    <>
      <label className="sr-only" htmlFor={id}>{label}</label>
      <select className="select" id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {all ? <option value="">{all}</option> : null}
        {options.map(([v, l]) => <option value={v} key={v}>{l}</option>)}
      </select>
    </>
  );
}

export default function Shop() {
  const sp = useSearchParams();
  const [sheet, setSheet] = useState(false);
  // Remount on every URL change so "Load more" starts again, as the old site did.
  return <ShopView key={sp.toString()} sp={sp} sheet={sheet} setSheet={setSheet} />;
}

function ShopView({ sp, sheet = false, setSheet = () => {} }: { sp: URLSearchParams; sheet?: boolean; setSheet?: (on: boolean) => void }) {
  const router = useRouter();
  const path = usePathname();
  const [shown, setShown] = useState(PAGE_SIZE);
  const { title, sub } = heading(sp);
  const q = (sp.get("q") || "").trim();
  const isNew = sp.get("new") === "1";
  const isBest = sp.get("best") === "1";
  const f = Object.fromEntries(FILTERS.map((k) => [k, sp.get(k) || ""])) as Record<(typeof FILTERS)[number], string>;
  const sort = sp.get("sort") || "newest";

  useEffect(() => { document.title = title + " · " + SITE.name; }, [title]);

  function set(key: string, value: string) {
    const next = new URLSearchParams(sp);
    if (value && !(key === "sort" && value === "newest")) next.set(key, value); else next.delete(key);
    router.replace(path + (next.size ? "?" + next : ""), { scroll: false });
  }
  function clear() {
    const next = new URLSearchParams(sp);
    FILTERS.forEach((k) => next.delete(k));
    router.replace(path + (next.size ? "?" + next : ""), { scroll: false });
  }

  let list = q ? searchProducts(q) : PRODUCTS.slice();
  if (isNew) list = list.filter((p) => p.isNew);
  if (isBest) list = list.filter((p) => p.bestseller);
  if (f.weave) list = list.filter((p) => p.weave === f.weave);
  if (f.colour) list = list.filter((p) => p.colour === f.colour);
  if (f.occasion) list = list.filter((p) => p.occasion === f.occasion);
  if (f.price) {
    const [lo, hi] = f.price.split("-").map(Number);
    list = list.filter((p) => hasPrice(p) && p.price >= lo && p.price < hi);
  }
  // Sold-out sarees always go to the end.
  list.sort((a, b) => Number(!!a.soldOut) - Number(!!b.soldOut) || (SORTERS[sort] || SORTERS.newest)(a, b));
  const active = FILTERS.some((k) => f[k]);
  const activeCount = FILTERS.filter((k) => f[k]).length;
  const toggle = (key: (typeof FILTERS)[number], value: string) => set(key, f[key] === value ? "" : value);

  useEffect(() => {
    if (!sheet) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSheet(false); };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", onKey); };
  }, [sheet, setSheet]);

  const chips = (key: (typeof FILTERS)[number], options: [string, string][], dots?: Record<string, string>) => (
    <div className="chips">
      {options.map(([v, l]) => (
        <button key={v} type="button" className={"chip" + (f[key] === v ? " is-on" : "")} aria-pressed={f[key] === v} onClick={() => toggle(key, v)}>
          {dots ? <span className="chip__dot" style={{ background: dots[v] }} /> : null}{l}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <Crumbs items={[title]} />
      <PageHead title={title} sub={sub} />
      <section className="wrap">
        <div className="toolbar">
          <button className="filter-btn" type="button" onClick={() => setSheet(true)} aria-haspopup="dialog">
            <FilterIcon /> Filters{activeCount ? <span className="filter-btn__count">{activeCount}</span> : null}
          </button>
          <div className="toolbar__filters">
            <span className="toolbar__label">FILTER</span>
            <Select id="f-weave" label="Weave" all="Weave" value={f.weave} onChange={(v) => set("weave", v)}
              options={Object.entries(WEAVES).map(([k, w]) => [k, w.short])} />
            <Select id="f-colour" label="Colour" all="Colour" value={f.colour} onChange={(v) => set("colour", v)} options={COLOURS.map((c) => [c, c])} />
            <Select id="f-occasion" label="Occasion" all="Occasion" value={f.occasion} onChange={(v) => set("occasion", v)} options={OCCASIONS.map((o) => [o, o])} />
            {ANY_PRICES ? <Select id="f-price" label="Price" all="Price" value={f.price} onChange={(v) => set("price", v)} options={PRICES} /> : null}
            <button className="link-btn" type="button" hidden={!active} onClick={clear}>Clear filters</button>
          </div>
          <div className="toolbar__right">
            <span aria-live="polite">{list.length + (list.length === 1 ? " saree" : " sarees")}</span>
            <Select id="f-sort" label="Sort by" value={sort} onChange={(v) => set("sort", v)}
              options={[["newest", "Sort: Newest"], ["popular", "Sort: Popular"], ...(ANY_PRICES ? [["price-asc", "Price: Low to high"], ["price-desc", "Price: High to low"]] as [string, string][] : [])]} />
          </div>
        </div>
        <p className="finder-hint">Not sure where to start? <Link href="/finder">Answer three quick questions</Link> and we will suggest sarees for you.</p>

        {/* Phones: filters in a panel that slides up from the bottom */}
        <div className={"sheet" + (sheet ? " is-open" : "")} aria-hidden={!sheet}>
          <div className="sheet__scrim" onClick={() => setSheet(false)} />
          <div className="sheet__panel" role="dialog" aria-modal="true" aria-label="Filter sarees">
            <div className="sheet__head">
              <h2>Filters</h2>
              <button type="button" className="icon-btn" aria-label="Close filters" onClick={() => setSheet(false)}><CloseIcon /></button>
            </div>
            <div className="sheet__body">
              <h3>Collection</h3>
              {chips("weave", Object.entries(WEAVES).map(([k, w]) => [k, w.label]))}
              <h3>Colour</h3>
              {chips("colour", COLOURS.map((c) => [c, c]), COLOUR_DOT)}
              <h3>Occasion</h3>
              {chips("occasion", OCCASIONS.map((o) => [o, o]))}
              {ANY_PRICES ? <><h3>Price</h3>{chips("price", PRICES)}</> : null}
            </div>
            <div className="sheet__foot">
              <button className="btn btn--outline" type="button" disabled={!active} onClick={clear}>Clear all</button>
              <button className="btn btn--pink" type="button" onClick={() => setSheet(false)}>Show {list.length} {list.length === 1 ? "saree" : "sarees"}</button>
            </div>
          </div>
        </div>

        {list.length ? (
          <div className="grid">{list.slice(0, shown).map((p) => <ProductCard p={p} key={p.id} />)}</div>
        ) : (
          <div className="empty">
            <h2>No sarees match these filters</h2>
            <p>Try removing a filter, or tell us what you are looking for and we can help.</p>
            <a className="btn btn--whatsapp" href={waLink("Hello Varunavi Vastra, I am looking for a saree and could not find it on the website.")} target="_blank" rel="noopener">Ask us on WhatsApp</a>
          </div>
        )}
        <div className="view-all" style={{ marginBottom: 72 }}>
          <button className="btn btn--outline" type="button" hidden={list.length <= shown} onClick={() => setShown((n) => n + PAGE_SIZE)}>Load more</button>
        </div>
      </section>
    </>
  );
}

// Shown in the static HTML before the browser reads the URL: the full catalogue, newest first.
export function ShopFallback() {
  return <ShopView sp={new URLSearchParams()} />;
}
