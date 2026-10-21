import type { Metadata } from "next";
import Link from "next/link";
import { Heading, IMAGE_SIZES, Placeholder, ProductImage, SitePhotoImg } from "@/components/Bits";
import { sistersPhoto } from "@/lib/site-photos";
import { ChatIcon, CheckIcon, LeafIcon, LoomIcon, LotusIcon } from "@/components/Icons";
import { CountUp, RotatingWord } from "@/components/HeroMotion";
import { OpenStatus } from "@/components/Extras";
import { OCCASIONS, PRODUCTS, SITE, WEAVES, type WeaveKey } from "@/lib/data";
import { waLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Our Story",
  description: "Varunavi Vastra was started by two sisters, Chaitanya and Mansi, to bring their love for tradition to life through handcrafted cotton sarees.",
};

const range = ([a, b]: [number, number]) => (a === b ? String(a) : a + " to " + b);

export default function OurStory() {
  const sisters = sistersPhoto();
  // Four different sarees for the banner collage, one from each weave first.
  const collage = [...new Set([
    ...(Object.keys(WEAVES) as WeaveKey[]).map((k) => PRODUCTS.find((p) => p.weave === k && p.images[0])),
    ...PRODUCTS.filter((p) => p.bestseller && p.images[0]),
  ])].filter((p) => p !== undefined).slice(0, 4);
  const weaves = (Object.keys(WEAVES) as WeaveKey[]).map((k) => {
    const items = PRODUCTS.filter((p) => p.weave === k);
    return { k, label: WEAVES[k].label, items, p: items.find((p) => p.bestseller) || items[0] };
  }).filter((w) => w.items.length);
  const colours = new Set(PRODUCTS.map((p) => p.colour)).size;
  const d = SITE.delivery;
  // How a saree gets from us to you, using the real dispatch and delivery times.
  const journey = [
    { icon: <LoomIcon />, title: "Chosen by hand", text: "Every saree is picked for its weave, colour and feel of the cotton." },
    { icon: <CheckIcon />, title: "Checked before it ships", text: "We look over each saree for flaws so it reaches you just right." },
    { icon: <LeafIcon />, title: "Finished for you", text: "Fall and picot on request, so it is ready to wear when it arrives." },
    { icon: <LotusIcon />, title: "Packed with care", text: "Dispatched from Solapur in " + range(d.dispatch) + " working days." },
    { icon: <ChatIcon />, title: "At your door", text: "Delivered across India in " + range(d.india) + " working days, with WhatsApp help all the way." },
  ];

  return (
    <>
      {/* Banner: title beside a collage of real saree photos */}
      <section className="story-hero">
        <div className="story-hero__text">
          <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span>Our story</span></nav>
          <p className="eyebrow">Our story</p>
          <h1>Two sisters, one love for <RotatingWord words={["tradition", "handloom", "cotton", "grace"]} /></h1>
          <p className="story-hero__lead">A small Solapur label making handcrafted cotton sarees for the woman who values grace.</p>
          <a className="story-hero__down" href="#story">Read our story <span aria-hidden="true">↓</span></a>
        </div>
        <div className="story-hero__collage" aria-hidden="true">
          {collage.map((p, i) => <div className={"story-hero__tile story-hero__tile--" + (i + 1)} key={p.id}><ProductImage p={p} eager={i < 2} sizes="(max-width: 820px) 45vw, 22vw" /></div>)}
        </div>
      </section>

      {/* The sisters */}
      <section className="section" id="story">
        <div className="wrap story-intro">
          <div className="story-intro__photo">
            <div className="story-intro__frame">
              {sisters
                ? <SitePhotoImg photo={sisters} alt="Chaitanya and Mansi, the sisters behind Varunavi Vastra" sizes="(max-width: 820px) 90vw, 440px" />
                : <Placeholder c1="#7d8838" c2="#a9b35e" label="Photo: Chaitanya and Mansi" />}
            </div>
            <span className="story-intro__badge"><LotusIcon />Co-founders</span>
          </div>
          <div className="story-intro__text">
            <p className="eyebrow">Meet the founders</p>
            <h2>Chaitanya &amp; Mansi</h2>
            <p className="story-intro__lead">Varunavi Vastra is a new brand started by two sisters, Chaitanya and Mansi. We bring our love for tradition to life through handcrafted cotton sarees, made for the woman who values grace.</p>
            <p className="todo">[Add 3 to 4 lines here about why you started, what you love about handloom cotton, and who you make these sarees for]</p>
            <blockquote className="story-quote">
              <p>Handcrafted cotton sarees, made for the woman who values grace.</p>
              <footer>Chaitanya &amp; Mansi</footer>
            </blockquote>
            <div className="btn-row">
              <Link className="btn btn--pink" href="/shop">Shop sarees</Link>
              <a className="btn btn--outline" href={waLink("Hello Chaitanya and Mansi, I would love to know more about Varunavi Vastra.")} target="_blank" rel="noopener">Say hello on WhatsApp</a>
            </div>
          </div>
        </div>
      </section>

      {/* Numbers, all counted from the catalogue */}
      <section className="story-stats" aria-label="Varunavi Vastra in numbers">
        <div className="wrap">
          <dl>
            <div><dt><CountUp value={PRODUCTS.length} /></dt><dd>Handpicked sarees</dd></div>
            <div><dt><CountUp value={weaves.length} /></dt><dd>Signature weaves</dd></div>
            <div><dt><CountUp value={colours} /></dt><dd>Colours to choose from</dd></div>
            <div><dt><CountUp value={OCCASIONS.length} /></dt><dd>Occasions dressed</dd></div>
          </dl>
        </div>
      </section>

      {/* What we stand for */}
      <section className="section section--cream">
        <div className="wrap">
          <Heading title="What we stand for" sub="Three promises behind every saree we send out" />
          <div className="values values--cards">
            <div><span className="trust__icon"><LoomIcon width={20} height={20} /></span><h3>Handcrafted</h3><p>Every saree is made by hand, with time and care.</p></div>
            <div><span className="trust__icon"><LeafIcon width={20} height={20} /></span><h3>Honest cotton</h3><p>Soft, breathable and made to be worn again and again.</p></div>
            <div><span className="trust__icon"><CheckIcon width={20} height={20} /></span><h3>Made for grace</h3><p>Simple, elegant drapes for the woman who values grace.</p></div>
          </div>
        </div>
      </section>

      {/* From us to you */}
      <section className="section">
        <div className="wrap">
          <Heading title="From our hands to yours" sub="How a Varunavi saree reaches you" />
          <ol className="journey">
            {journey.map((s, i) => (
              <li key={s.title}>
                <span className="journey__icon">{s.icon}<b>{i + 1}</b></span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Our weaves */}
      <section className="section section--cream">
        <div className="wrap">
          <Heading title="The weaves we love" sub="Three kinds of cotton, each with its own character" />
          <div className="weave-cards">
            {weaves.map((w) => (
              <Link className="weave-card" href={"/shop?weave=" + w.k} key={w.k}>
                <span className="weave-card__media media"><ProductImage p={w.p} sizes={IMAGE_SIZES.card} /></span>
                <span className="weave-card__text">
                  <small>{w.items.length} {w.items.length === 1 ? "saree" : "sarees"}</small>
                  <strong>{w.label}</strong>
                  <em>Explore →</em>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Visit / talk to us */}
      <section className="section">
        <div className="wrap story-visit">
          <div>
            <p className="eyebrow">Come say hello</p>
            <h2>From Solapur, with love</h2>
            <address>{SITE.address}</address>
            <p className="story-visit__hours">{SITE.hours}</p>
            <OpenStatus />
          </div>
          <div className="story-visit__actions">
            <a className="btn btn--pink" href={waLink("Hello Varunavi Vastra, I have a question.")} target="_blank" rel="noopener">Chat on WhatsApp</a>
            <Link className="btn btn--outline" href="/custom-order">Custom &amp; bulk orders</Link>
            <Link className="btn btn--outline" href="/contact">Contact &amp; directions</Link>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <h2>Find your saree</h2>
          <p>Browse the collection, or answer three quick questions and we will show you the best matches.</p>
          <div className="btn-row" style={{ justifyContent: "center" }}>
            <Link className="btn btn--white" href="/shop">Shop cotton sarees</Link>
            <Link className="btn btn--white-outline" href="/finder">Help me choose</Link>
          </div>
        </div>
      </section>
    </>
  );
}
