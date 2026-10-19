import type { Metadata } from "next";
import Link from "next/link";
import { Heading, IMAGE_SIZES, Placeholder, PostCard, ProductCard, ProductImage, SitePhotoImg, TrustStrip } from "@/components/Bits";
import { sistersPhoto } from "@/lib/site-photos";
import { AddToCartButton, NewsletterForm } from "@/components/Forms";
import SareeArt, { artKind } from "@/components/SareeArt";
import { OCCASION_TITLES, OCCASIONS, POSTS, PRODUCTS, SITE, WEAVES } from "@/lib/data";
import { askPriceLink, byId, hasPrice, priceText, productUrl } from "@/lib/utils";

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
  const heroSaree =PRODUCTS.find((p) => p.bestseller && p.id !== spot.id) || spot;

  return (
    <>
      <section className="hero">
        <div className="hero__text">
          <p className="eyebrow">{SITE.heroEyebrow}</p>
          <h1>Six yards.<br />A thousand years<br />of hands.</h1>
          <p>Handcrafted cotton sarees for the woman who values grace.</p>
          <div className="btn-row">
            <Link className="btn btn--pink" href="/shop">Shop sarees</Link>
            <Link className="btn btn--outline" href="/our-story">Our story</Link>
          </div>
          <ul className="hero__points">
            <li>Handwoven cotton</li>
            <li>Ships from Solapur</li>
            <li>WhatsApp support</li>
          </ul>
        </div>
        <div className="hero__art">
          <div className="hero__arch">
            {/* Replace with: <img src="/assets/images/hero.jpg" alt="Woman wearing a Varunavi cotton saree" /> */}
            <ProductImage p={heroSaree} eager sizes={IMAGE_SIZES.large} />
          </div>
          <Link className="hero__card" href={productUrl(spot)}>
            <span className="hero__card-img media"><ProductImage p={spot} sizes={IMAGE_SIZES.thumb} /></span>
            <span>
              <small>Saree of the week</small>
              <strong>{spot.name}</strong>
              <em>View saree →</em>
            </span>
          </Link>
        </div>
      </section>

      {/* Brand promises, drifting slowly across the page (still for visitors who prefer less motion) */}
      <div className="ribbon" role="region" aria-label="Why shop with us">
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

      <section className="split">
        <div className="media">
          {/* Shows photos/site/chaitanya-and-mansi.jpg once it has been added */}
          {sisters ? <SitePhotoImg photo={sisters} alt="Chaitanya and Mansi, the sisters behind Varunavi Vastra" sizes="(max-width: 820px) 100vw, 50vw" /> : <Placeholder c1="#8d9744" c2="#b4bd70" label="Photo: Chaitanya and Mansi" />}
        </div>
        <div className="split__text">
          <p className="eyebrow">Our story</p>
          <h2>Two sisters, one love for tradition</h2>
          <p>Chaitanya and Mansi started Varunavi Vastra to bring their love for tradition to life, through handcrafted cotton sarees made for the woman who values grace.</p>
          <div><Link className="btn btn--olive" href="/our-story">Read our story</Link></div>
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

      <section className="newsletter">
        <div className="wrap">
          <h2>Be the first to know about new weaves</h2>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}
