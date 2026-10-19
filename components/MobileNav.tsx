"use client";

/* App-style bar along the bottom of the screen on phones. */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart, useHydrated, useWishlist } from "@/lib/store";
import { waLink } from "@/lib/utils";
import { BagIcon, GridIcon, HeartIcon, HomeIcon, WhatsappIcon } from "./Icons";

export default function MobileNav() {
  const path = usePathname();
  const hydrated = useHydrated();
  const { count } = useCart();
  const wish = useWishlist().length;
  const on = (match: boolean) => "mnav__item" + (match ? " is-active" : "");
  const badge = (n: number) => (hydrated && n > 0 ? <span className="mnav__badge">{n}</span> : null);

  return (
    <nav className="mnav" aria-label="Quick links">
      <Link className={on(path === "/")} href="/"><HomeIcon /><span>Home</span></Link>
      <Link className={on(path === "/shop" || path.startsWith("/product/"))} href="/shop"><GridIcon /><span>Shop</span></Link>
      <Link className={on(path === "/wishlist")} href="/wishlist"><span className="mnav__icon"><HeartIcon />{badge(wish)}</span><span>Wishlist</span></Link>
      <Link className={on(path === "/cart")} href="/cart"><span className="mnav__icon"><BagIcon />{badge(count)}</span><span>Cart</span></Link>
      <a className="mnav__item mnav__item--wa" href={waLink("Hello Varunavi Vastra, I have a question about your sarees.")} target="_blank" rel="noopener">
        <WhatsappIcon /><span>WhatsApp</span>
      </a>
    </nav>
  );
}
