"use client";

/* Compare sarees: a toggle on cards and saree pages, a tray that follows the shopper,
 * and the side-by-side table on /compare. The list is saved in the browser. */

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { COMPARE_MAX, compare, useCompare, useHydrated } from "@/lib/store";
import { PRODUCT_DEFAULTS, SITE, WEAVES, type Product } from "@/lib/data";
import { askPriceLink, avgRating, byId, hasPrice, priceText, productUrl, waLink } from "@/lib/utils";
import { CloseIcon, CompareIcon } from "./Icons";
import { useToast } from "./Toast";
import { IMAGE_SIZES, ProductImage, Stars } from "./Bits";
import { AddToCartButton } from "./Forms";
import { POP } from "./Motion";

export function CompareButton({ p, variant = "icon" }: { p: Product; variant?: "icon" | "text" }) {
  const on = useCompare().includes(p.id);
  const toast = useToast();
  const click = (e: MouseEvent) => {
    e.preventDefault();
    const r = compare.toggle(p.id);
    if (r === "full") toast(<>You can compare up to {COMPARE_MAX} sarees. <Link href="/compare">Open compare</Link></>);
    else if (r === "added") toast(<>Added to compare. <Link href="/compare">Compare now</Link></>);
    else toast("Removed from compare.");
  };
  if (variant === "text") {
    return (
      <button type="button" className={"compare-link" + (on ? " is-on" : "")} aria-pressed={on} onClick={click}>
        <CompareIcon />{on ? "Added to compare" : "Add to compare"}
      </button>
    );
  }
  return (
    <button type="button" className={"card__compare" + (on ? " is-on" : "")} aria-pressed={on} aria-label={(on ? "Remove " : "Compare ") + p.name} title={on ? "Remove from compare" : "Add to compare"} onClick={click}>
      <CompareIcon />
    </button>
  );
}

// Floating tray with the chosen sarees; hidden on the compare page itself.
export function CompareTray() {
  const ids = useCompare();
  const path = usePathname();
  const hydrated = useHydrated();
  const items = ids.map((id) => byId(id)!);
  const show = hydrated && items.length > 0 && !path.startsWith("/compare");
  return (
    <AnimatePresence>
      {show ? (
        <motion.aside
          className={"compare-tray" + (path.startsWith("/product") ? " compare-tray--pdp" : "")} aria-label="Sarees to compare"
          initial={{ opacity: 0, x: "-50%", y: 30 }} animate={{ opacity: 1, x: "-50%", y: 0 }} exit={{ opacity: 0, x: "-50%", y: 30 }}
          transition={POP}
        >
          <ul className="compare-tray__list">
            <AnimatePresence mode="popLayout" initial={false}>
              {items.map((p) => (
                <motion.li key={p.id} layout initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={POP}>
                  <Link href={productUrl(p)} className="compare-tray__thumb" title={p.name}><ProductImage p={p} sizes={IMAGE_SIZES.thumb} /></Link>
                  <button type="button" aria-label={"Remove " + p.name} onClick={() => compare.remove(p.id)}><CloseIcon /></button>
                </motion.li>
              ))}
              {Array.from({ length: COMPARE_MAX - items.length }, (_, i) => (
                <motion.li layout key={"empty" + i} className="compare-tray__empty" aria-hidden="true" transition={POP}>+</motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <div className="compare-tray__actions">
            <Link className="btn btn--pink" href="/compare" aria-disabled={items.length < 2}>Compare {items.length}/{COMPARE_MAX}</Link>
            <button type="button" className="compare-tray__clear" onClick={() => compare.clear()}>Clear</button>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}

const fmtRating = (p: Product) => (p.reviews?.length ? avgRating(p) : 0);

export function CompareTable() {
  const ids = useCompare();
  const hydrated = useHydrated();
  if (!hydrated) return <div className="compare-empty" aria-busy="true" />;
  const items = ids.map((id) => byId(id)!);
  if (!items.length) {
    return (
      <div className="compare-empty">
        <span className="compare-empty__icon"><CompareIcon /></span>
        <h2>Nothing to compare yet</h2>
        <p>Tap the compare icon on any saree to add it here. You can compare up to {COMPARE_MAX} side by side.</p>
        <Link className="btn btn--pink" href="/shop">Browse sarees</Link>
      </div>
    );
  }
  const d = (p: Product) => ({ ...PRODUCT_DEFAULTS, ...p });
  // Rows where the sarees differ get a soft highlight so differences stand out.
  const rows: { label: string; get: (p: Product) => ReactNode; key: (p: Product) => string }[] = [
    { label: "Price", get: (p) => <span className={"price" + (hasPrice(p) ? "" : " price--ask")}>{priceText(p)}</span>, key: (p) => String(p.price) },
    { label: "Weave", get: (p) => WEAVES[p.weave].label, key: (p) => p.weave },
    { label: "Style", get: (p) => p.weaveType, key: (p) => p.weaveType },
    { label: "Colour", get: (p) => <><span className="compare-dot" style={{ background: p.c1 }} />{p.colourName}</>, key: (p) => p.colourName },
    { label: "Occasion", get: (p) => p.occasion, key: (p) => p.occasion },
    { label: "Fabric", get: (p) => (d(p).fabric === PRODUCT_DEFAULTS.fabric ? WEAVES[p.weave].label : d(p).fabric), key: (p) => d(p).fabric + p.weave },
    { label: "Length", get: (p) => d(p).length, key: (p) => d(p).length },
    { label: "Care", get: (p) => d(p).care, key: (p) => d(p).care },
    { label: "Rating", get: (p) => (fmtRating(p) ? <><Stars rating={fmtRating(p)} /> <small>({p.reviews!.length})</small></> : <small>No reviews yet</small>), key: (p) => String(fmtRating(p)) },
    { label: "Availability", get: (p) => (p.soldOut ? <span className="compare-out">Sold out</span> : <span className="compare-in">In stock</span>), key: (p) => String(!!p.soldOut) },
    { label: "Code", get: (p) => p.sku, key: () => "" },
  ];
  const ask = waLink(
    "Hello Varunavi Vastra, I am comparing these sarees and would like your advice:\n" +
    items.map((p) => "• " + p.name + " (" + p.sku + ")\n  " + SITE.url + productUrl(p)).join("\n"),
  );

  return (
    <>
      <div className="compare-top">
        <p>{items.length} of {COMPARE_MAX} sarees{items.length < 2 ? " · add one more to compare side by side" : ""}</p>
        <div className="btn-row">
          <a className="btn btn--whatsapp" href={ask} target="_blank" rel="noopener">Ask us which to pick</a>
          <button type="button" className="btn btn--outline" onClick={() => compare.clear()}>Clear all</button>
        </div>
      </div>
      <div className="compare-scroll">
        <table className="compare" style={{ "--cols": items.length } as CSSProperties}>
          <thead>
            <tr>
              <th scope="row"><span className="sr-only">Saree</span></th>
              {items.map((p) => (
                <th scope="col" key={p.id}>
                  <div className="compare__card">
                    <button type="button" className="compare__remove" aria-label={"Remove " + p.name} onClick={() => compare.remove(p.id)}><CloseIcon /></button>
                    <Link className="compare__media media" href={productUrl(p)}><ProductImage p={p} sizes="(max-width: 820px) 45vw, 280px" /></Link>
                    <Link className="compare__name" href={productUrl(p)}>{p.name}</Link>
                  </div>
                </th>
              ))}
              {items.length < COMPARE_MAX ? (
                <th scope="col" className="compare__add-cell">
                  <Link className="compare__add" href="/shop"><span>+</span>Add a saree</Link>
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const differs = items.length > 1 && new Set(items.map(r.key)).size > 1;
              return (
                <tr key={r.label} className={differs ? "is-diff" : undefined}>
                  <th scope="row">{r.label}</th>
                  {items.map((p) => <td key={p.id}>{r.get(p)}</td>)}
                  {items.length < COMPARE_MAX ? <td className="compare__add-cell" /> : null}
                </tr>
              );
            })}
            <tr className="compare__buy">
              <th scope="row"><span className="sr-only">Buy</span></th>
              {items.map((p) => (
                <td key={p.id}>
                  {p.soldOut
                    ? <Link className="btn btn--outline" href={productUrl(p)}>View saree</Link>
                    : hasPrice(p) ? <AddToCartButton id={p.id} /> : <a className="btn btn--pink" href={askPriceLink(p)} target="_blank" rel="noopener">Ask price</a>}
                </td>
              ))}
              {items.length < COMPARE_MAX ? <td className="compare__add-cell" /> : null}
            </tr>
          </tbody>
        </table>
      </div>
      {items.length > 1 ? <p className="compare-note"><span className="compare-key" /> Highlighted rows are where these sarees differ.</p> : null}
    </>
  );
}
