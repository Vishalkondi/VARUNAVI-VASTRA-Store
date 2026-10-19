import type { Metadata } from "next";
import Link from "next/link";
import { Heading, Placeholder, SitePhotoImg } from "@/components/Bits";
import { sistersPhoto } from "@/lib/site-photos";
import { CheckIcon, LeafIcon, LoomIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Our Story",
  description: "Varunavi Vastra was started by two sisters, Chaitanya and Mansi, to bring their love for tradition to life through handcrafted cotton sarees.",
};

export default function OurStory() {
  const sisters = sistersPhoto();
  return (
    <>
      <section className="banner">
        {/* Replace with: <img src="/assets/images/story-banner.jpg" alt="" /> */}
        <Placeholder c1="#5f6a2b" c2="#8d9744" label="Banner photo: handloom or the sisters at work" />
        <div className="banner__text">
          <p className="eyebrow">Our story</p>
          <h1>Two sisters, one love for tradition</h1>
        </div>
      </section>

      <section className="section">
        <div className="wrap narrow">
          <p className="lead">Varunavi Vastra is a new brand started by two sisters, Chaitanya and Mansi. We bring our love for tradition to life through handcrafted cotton sarees, made for the woman who values grace.</p>
          <p className="todo">[Add 3 to 4 lines here about why you started, what you love about handloom cotton, and who you make these sarees for]</p>
        </div>
        {sisters ? (
          // One photo of both sisters (photos/site/chaitanya-and-mansi.jpg)
          <div className="wrap founders founders--together">
            <div className="founder">
              <div className="media"><SitePhotoImg photo={sisters} alt="Chaitanya and Mansi, the sisters behind Varunavi Vastra" /></div>
              <h3>Chaitanya and Mansi</h3><span>Co-founders</span>
            </div>
          </div>
        ) : (
          <div className="wrap founders">
            <div className="founder">
              <div className="media"><Placeholder c1="#7d8838" c2="#a9b35e" label="Photo: Chaitanya" /></div>
              <h3>Chaitanya</h3><span>Co-founder</span>
            </div>
            <div className="founder">
              <div className="media"><Placeholder c1="#D14C85" c2="#eaa2c1" label="Photo: Mansi" /></div>
              <h3>Mansi</h3><span>Co-founder</span>
            </div>
          </div>
        )}
      </section>

      <section className="section section--cream">
        <div className="wrap">
          <Heading title="What we stand for" />
          <div className="values">
            <div><span className="trust__icon"><LoomIcon width={20} height={20} /></span><h3>Handcrafted</h3><p>Every saree is made by hand, with time and care.</p></div>
            <div><span className="trust__icon"><LeafIcon width={20} height={20} /></span><h3>Honest cotton</h3><p>Soft, breathable and made to be worn again and again.</p></div>
            <div><span className="trust__icon"><CheckIcon width={20} height={20} /></span><h3>Made for grace</h3><p>Simple, elegant drapes for the woman who values grace.</p></div>
          </div>
        </div>
      </section>

      <section className="section center">
        <div className="wrap">
          <h2 style={{ fontSize: 30, marginBottom: 22 }}>Find your saree</h2>
          <Link className="btn btn--pink" href="/shop">Shop cotton sarees</Link>
        </div>
      </section>
    </>
  );
}
