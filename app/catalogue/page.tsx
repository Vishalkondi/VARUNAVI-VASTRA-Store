import type { Metadata } from "next";
import Link from "next/link";
import { Crumbs, Logo, ProductImage } from "@/components/Bits";
import { CatalogueActions } from "@/components/Extras";
import { PRODUCTS, SITE, WEAVES, type WeaveKey } from "@/lib/data";
import { priceText, productUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Catalogue",
  description: "The full Varunavi Vastra catalogue of handcrafted cotton sarees. Save it as a PDF or share it on WhatsApp.",
};

// Every saree on one page, grouped by collection. Laid out to print or save as a PDF cleanly.
export default function Catalogue() {
  const today = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const groups = (Object.keys(WEAVES) as WeaveKey[])
    .map((k) => ({ key: k, label: WEAVES[k].label, items: PRODUCTS.filter((p) => p.weave === k && !p.soldOut).sort((a, b) => b.added - a.added) }))
    .filter((g) => g.items.length);
  const count = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <>
      <Crumbs items={["Catalogue"]} />
      <section className="wrap section catalogue">
        <header className="catalogue__head">
          <span className="logo catalogue__logo"><Logo /></span>
          <h1>Handcrafted cotton sarees</h1>
          <p>{count} sarees · {today}</p>
          <CatalogueActions url={SITE.url + "/catalogue"} />
        </header>

        {groups.map((g) => (
          <section className="catalogue__group" key={g.key}>
            <h2>{g.label}</h2>
            <div className="catalogue__grid">
              {g.items.map((p) => (
                <Link className="catalogue__item" href={productUrl(p)} key={p.id}>
                  <span className="catalogue__img media"><ProductImage p={p} eager sizes="(max-width: 820px) 45vw, 260px" /></span>
                  <strong>{p.name}</strong>
                  <span>{p.weaveType} · {p.colourName}</span>
                  <em>{priceText(p)}</em>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <footer className="catalogue__foot">
          <p><strong>To order or ask a price, message us on WhatsApp {SITE.phoneDisplay}</strong></p>
          <p>{SITE.address}</p>
          <p>{SITE.url.replace(/^https?:\/\//, "")}</p>
        </footer>
      </section>
    </>
  );
}
