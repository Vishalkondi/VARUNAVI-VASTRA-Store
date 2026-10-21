import type { Metadata } from "next";
import Link from "next/link";
import { Heading, IMAGE_SIZES, Placeholder, PostCard, ProductCard, ProductImage, SitePhotoImg, Stars, TrustStrip } from "@/components/Bits";
import { sistersPhoto } from "@/lib/site-photos";
import { AddToCartButton, UpdatesForm } from "@/components/Forms";
import { RecentlyViewed } from "@/components/ProductParts";
import SareeArt, { artKind } from "@/components/SareeArt";
import { LotusIcon } from "@/components/Icons";
import { CountUp, Hotspot, PhotoDrift, RotatingWord, ScrollCue } from "@/components/HeroMotion";
import { OpenStatus } from "@/components/Extras";
import { COLLECTIONS, OCCASION_TITLES, OCCASIONS, POSTS, PRODUCTS, SITE, WEAVES } from "@/lib/data";
import { askPriceLink, byId, waLink, collectionProducts, collectionUrl, hasPrice, priceText, productUrl } from "@/lib/utils";

export const metadata: Metadata = { title: { absolute: SITE.name + " · Handcrafted Cotton Sarees" } };

const RIBBON = ["Handwoven pure cotton", "Quality checked before it ships", "Custom and bulk orders", "Fall and picot on request", "Ships across India", "Talk to a real person on WhatsApp"];

export default function Home() {
  const arrivals = PRODUCTS.filter((p) => p.isNew).sort((a, b) => b.added - a.added).slice(0, 4);
  // Each tile shows a saree from that collection.
  const tiles = [
    ...(["handloom", "festive", "print"] as const).map((k) => ({ label: WEAVES[k].label, href: "/shop?weave=" + k, p: PRODUCTS.find((p) => p.weave === k)! })),
    { label: "New Arrivals", href: "/shop?new=1", p: arrivals[arrivals.length - 1] || PRODUCTS[0] },
  ];
  const bestsellers = PRODUCTS.filter((p) => p.bestseller).slice(0, 4);
  const spot = byId(SITE.sareeOfTheWeek) || PRODUCTS[0];
  const sisters = sistersPhoto();
  const lookPink = PRODUCTS.find((p) => p.colour === "Pink");
  const lookPrint = PRODUCTS.find((p) => p.weave === "print");
  // One saree photo per occasion, each a different saree where possible.
  const used = new Set<string>();
  const occasions = OCCASIONS.map((name) => {
    const matches = PRODUCTS.filter((x) => x.occasion === name);
    const p = matches.find((x) => !used.has(x.id) && x.bestseller) || matches.find((x) => !used.has(x.id)) || matches[0] || PRODUCTS[0];
    used.add(p.id);
    return { name, p, count: matches.length };
  });
  // Every colour in the catalogue, most sarees first, with a dot taken from one of its sarees.
  const colours = [...new Set(PRODUCTS.map((p) => p.colour))]
    .map((name) => {
      const matches = PRODUCTS.filter((p) => p.colour === name);
      return { name, dot: matches[0].c1, count: matches.length };
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  const collections = COLLECTIONS.map((c) => ({ c, items: collectionProducts(c) })).filter((x) => x.items.length);
  // Every real review on every saree, newest first.
  const reviews = PRODUCTS.flatMap((p) => (p.reviews || []).map((r) => ({ r, p })))
    .sort((a, b) => (b.r.date || "").localeCompare(a.r.date || ""));
  const reviewAvg = reviews.length ? reviews.reduce((n, x) => n + x.r.rating, 0) / reviews.length : 0;

  return (
    <>
      {/* Opening banner: the sisters behind Varunavi Vastra (photos/site/chaitanya-and-mansi.jpg) */}
      <section className="hero">
        <div className="hero__media">
          {sisters ? <SitePhotoImg photo={sisters} alt="Chaitanya and Mansi, the sisters behind Varunavi Vastra" sizes="(max-width: 820px) 100vw, 52vw" eager /> : <Placeholder c1="#8d9744" c2="#b4bd70" label="Photo: Chaitanya and Mansi" />}
          <PhotoDrift />
          {/* Shop the look: pins sit on the sarees in the photo and lead to similar sarees */}
          {sisters ? (
            <>
              <Hotspot x={36} y={60} label="Shop the look" title="Pink cotton sarees" href={"/shop?colour=Pink"}>
                {lookPink ? <ProductImage p={lookPink} sizes={IMAGE_SIZES.thumb} /> : null}
              </Hotspot>
              <Hotspot x={60} y={72} label="Shop the look" title="Block print cotton" href={"/shop?weave=print"}>
                {lookPrint ? <ProductImage p={lookPrint} sizes={IMAGE_SIZES.thumb} /> : null}
              </Hotspot>
            </>
          ) : null}
          <span className="hero__stamp"><LotusIcon />Handwoven with love</span>
          <Link className="hero__peek" href="/our-story">Meet the founders <span aria-hidden="true">→</span></Link>
        </div>
        <div className="hero__text">
          <p className="eyebrow">Our story</p>
          <h1>Two sisters, one love for <RotatingWord words={["tradition", "handloom", "cotton", "grace"]} /></h1>
          <p className="hero__lead">Chaitanya and Mansi started Varunavi Vastra to bring their love for tradition to life, through handcrafted cotton sarees made for the woman who values grace.</p>
          <p className="hero__sign">Chaitanya &amp; Mansi</p>
          <div className="btn-row">
            <Link className="btn btn--pink" href="/shop">Shop sarees</Link>
            <Link className="btn btn--outline" href="/our-story">Read our story</Link>
          </div>
          <a className="hero__chat" href={waLink("Hello Varunavi Vastra, I would like help choosing a saree.")} target="_blank" rel="noopener">
            or chat with us on WhatsApp <span aria-hidden="true">→</span>
          </a>
          <div className="hero__status"><OpenStatus /></div>
          <dl className="hero__stats">
            <div><dt><CountUp value={PRODUCTS.length} /></dt><dd>Handpicked sarees</dd></div>
            <div><dt><CountUp value={Object.keys(WEAVES).length} /></dt><dd>Signature weaves</dd></div>
            {reviews.length
              ? <div><dt><CountUp value={reviewAvg} decimals={1} /><span className="hero__star">★</span></dt><dd>From {reviews.length} {reviews.length === 1 ? "review" : "reviews"}</dd></div>
              : <div><dt><CountUp value={100} suffix="%" /></dt><dd>Pure cotton</dd></div>}
          </dl>
          <nav className="hero__explore" aria-label="Explore sarees">
            <span>Explore</span>
            {(Object.keys(WEAVES) as (keyof typeof WEAVES)[]).map((k) => <Link href={"/shop?weave=" + k} key={k}>{WEAVES[k].short}</Link>)}
            <Link href="/shop?new=1">New arrivals</Link>
          </nav>
          <ScrollCue target="#after-hero" />
        </div>
      </section>

      {/* Brand promises, drifting slowly across the page (still for visitors who prefer less motion) */}
      <div className="ribbon" id="after-hero" role="region" aria-label="Why shop with us">
        <div className="ribbon__track">
          {[0, 1].map((copy) => (
            <ul className="ribbon__list" key={copy} aria-hidden={copy === 1 ? true : undefined}>
              {RIBBON.map((t) => <li key={t}>{t}</li>)}
            </ul>
          ))}
        </div>
      </div>

      <section className="section">
        <div className="wrap">
          <Heading title="Shop by weave" sub="Soft, breathable cotton for every day and every occasion" />
          <div className="tiles">
            {tiles.map((t) => (
              <Link className="tile" href={t.href} key={t.href}>
                <ProductImage p={t.p} sizes={IMAGE_SIZES.card} />
                <div className="tile__text"><h3>{t.label}</h3><span>SHOP NOW</span></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Heading title="New arrivals" />
          <div className="grid">{arrivals.map((p) => <ProductCard p={p} key={p.id} />)}</div>
          <div className="view-all"><Link className="btn btn--outline" href="/shop">View all sarees</Link></div>
        </div>
      </section>

      {collections.length ? (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <Heading title="Our collections" sub="Sarees grouped by the stories they tell" />
            <div className="collections">
              {collections.map(({ c, items }) => (
                <Link className="collection-card" href={collectionUrl(c)} key={c.slug}>
                  <span className="collection-card__media media"><ProductImage p={items[0]} sizes={IMAGE_SIZES.card} /></span>
                  <span className="collection-card__text">
                    <small>{items.length} {items.length === 1 ? "saree" : "sarees"}</small>
                    <strong>{c.name}</strong>
                    <span>{c.tagline}</span>
                    <em>View collection →</em>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section section--cream">
        <div className="wrap">
          <Heading title="Shop by occasion" sub="A saree for every day, and for the days that matter" />
          <div className="occasions">
            {occasions.map(({ name, p, count }) => (
              <Link className="occasion" href={"/shop?occasion=" + encodeURIComponent(name)} key={name}>
                <div className="occasion__media"><ProductImage p={p} sizes={IMAGE_SIZES.card} /></div>
                <h3>{OCCASION_TITLES[name].replace(" Sarees", "")}</h3>
                <span>{count} {count === 1 ? "saree" : "sarees"}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Heading title="Shop by colour" sub="Find your shade" />
          <div className="colours">
            {colours.map(({ name, dot, count }) => (
              <Link className="colour" href={"/shop?colour=" + encodeURIComponent(name)} key={name}>
                <span className="colour__dot" style={{ background: dot }} />
                <strong>{name}</strong>
                <small>{count} {count === 1 ? "saree" : "sarees"}</small>
              </Link>
            ))}
          </div>
          <div className="finder-cta">
            <div>
              <strong>Not sure which saree to pick?</strong>
              <span>Answer three quick questions and we will show you the best matches.</span>
            </div>
            <Link className="btn btn--olive" href="/finder">Help me choose</Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Heading title="Bestsellers" sub="The sarees our customers love most" />
          <div className="grid">{bestsellers.map((p) => <ProductCard p={p} key={p.id} />)}</div>
          <div className="view-all"><Link className="btn btn--outline" href="/shop?best=1">Shop bestsellers</Link></div>
        </div>
      </section>

      <section className="section section--cream">
        <div className="wrap spotlight">
          <Link className="media" href={productUrl(spot)}><ProductImage p={spot} sizes={IMAGE_SIZES.large} /></Link>
          <div>
            <p className="eyebrow">Saree of the week</p>
            <h2>{spot.name}</h2>
            <div className="card__sub">{WEAVES[spot.weave].label} saree</div>
            <span className={"price" + (hasPrice(spot) ? "" : " price--ask")}>{priceText(spot)}</span>
            <p>{spot.description}</p>
            <div className="btn-row">
              {hasPrice(spot) ? <AddToCartButton id={spot.id} /> : <a className="btn btn--pink" href={askPriceLink(spot)} target="_blank" rel="noopener">Ask price on WhatsApp</a>}
              <Link className="btn btn--outline" href={productUrl(spot)}>View details</Link>
            </div>
          </div>
        </div>
      </section>

      <TrustStrip />

      <section className="band">
        <div className="wrap">
          <h2>Looking for something special?</h2>
          <p>Tell us the colour, fabric or occasion you have in mind. We take custom and bulk orders for weddings, festivals and events.</p>
          <Link className="btn btn--white" href="/custom-order">Send an enquiry</Link>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Heading title="Follow us on Instagram" sub="See new weaves and how to drape them" />
          <div className="insta">
            {PRODUCTS.filter((_, i) => i % 2 === 0).slice(0, 6).map((p, i) => (
              <a href={SITE.instagram} target="_blank" rel="noopener" aria-label="Instagram post" key={p.id}>
                {p.images[0] ? <ProductImage p={p} sizes="(max-width: 820px) 33vw, 200px" /> : <SareeArt c1={p.c1} c2={p.c2} kind={artKind(p.weaveType)} view={(i % 3) + 1} />}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--cream">
        <div className="wrap">
          <Heading title="From our journal" sub="Care guides, draping tips and stories from the loom" />
          <div className="posts">{POSTS.slice(0, 3).map((post) => <PostCard post={post} key={post.id} />)}</div>
          <div className="view-all"><Link className="btn btn--outline" href="/journal">Read the journal</Link></div>
        </div>
      </section>

      {/* Customer reviews: appears only once real reviews have been added to sarees in data.ts */}
      {reviews.length ? (
        <section className="section section--cream">
          <div className="wrap">
            <Heading title="What our customers say" sub={"Rated " + reviewAvg.toFixed(1) + " out of 5 from " + reviews.length + (reviews.length === 1 ? " review" : " reviews")} />
            <div className="testimonials">
              {reviews.slice(0, 3).map(({ r, p }, i) => (
                <figure className="testimonial" key={i}>
                  <Stars rating={r.rating} />
                  <blockquote>{r.text}</blockquote>
                  <figcaption>{r.name}{r.city ? ", " + r.city : ""} · <Link href={productUrl(p)}>{p.name}</Link></figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <RecentlyViewed />

      <section className="newsletter" id="updates">
        <div className="wrap">
          <h2>Be the first to know about new weaves</h2>
          <p className="newsletter__sub">Get new arrivals straight to your WhatsApp.</p>
          <UpdatesForm />
        </div>
      </section>
    </>
  );
}
