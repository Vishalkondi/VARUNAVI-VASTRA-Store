import Link from "next/link";
import { SITE } from "@/lib/data";
import { waLink } from "@/lib/utils";
import { Logo } from "./Bits";
import { WhatsappIcon } from "./Icons";

export default function Footer() {
  return (
    <>
      <footer className="footer">
        <div className="wrap">
          <div className="footer__grid">
            <div className="footer__brand">
              <Link className="footer__logo" href="/"><span className="logo"><Logo /></span></Link>
              <p>{SITE.tagline}</p>
              <address>
                {SITE.address}<br />
                <a href={waLink()} target="_blank" rel="noopener">WhatsApp {SITE.phoneDisplay}</a>
                {SITE.email ? <><br /><a href={"mailto:" + SITE.email}>{SITE.email}</a></> : null}
              </address>
            </div>
            <div>
              <h4>Shop</h4>
              <ul>
                <li><Link href="/shop">All Sarees</Link></li>
                <li><Link href="/shop">Cotton Sarees</Link></li>
                <li><Link href="/shop?new=1">New Arrivals</Link></li>
                <li><Link href="/shop?best=1">Bestsellers</Link></li>
                <li><Link href="/finder">Help Me Choose</Link></li>
                <li><Link href="/custom-order">Custom Order</Link></li>
                <li><Link href="/wishlist">Wishlist</Link></li>
              </ul>
            </div>
            <div>
              <h4>Help</h4>
              <ul>
                <li><Link href="/shipping">Shipping &amp; Delivery</Link></li>
                <li><Link href="/refund">Cancellation &amp; Refund</Link></li>
                <li><Link href="/faq">FAQ</Link></li>
                <li><Link href="/contact">Contact Us</Link></li>
                <li><Link href="/our-story">Our Story</Link></li>
                <li><Link href="/journal">Journal</Link></li>
              </ul>
            </div>
            <div>
              <h4>Follow us</h4>
              <ul>
                <li><a href={SITE.instagram} target="_blank" rel="noopener">Instagram</a></li>
                <li><a href={SITE.facebook} target="_blank" rel="noopener">Facebook</a></li>
                <li><a href={waLink()} target="_blank" rel="noopener">WhatsApp</a></li>
              </ul>
            </div>
          </div>
          <div className="footer__bottom">
            <span>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</span>
            <span><Link href="/privacy">Privacy Policy</Link> · <Link href="/terms">Terms &amp; Conditions</Link></span>
          </div>
        </div>
      </footer>
      <a className="wa-float" href={waLink("Hello Varunavi Vastra, I have a question about your sarees.")} target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
        <span className="wa-float__icon"><WhatsappIcon /></span><span className="wa-float__text">Chat on WhatsApp</span>
      </a>
    </>
  );
}
