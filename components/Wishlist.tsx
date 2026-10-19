"use client";

import Link from "next/link";
import { ProductCard } from "@/components/Bits";
import { WishlistActions } from "@/components/Extras";
import { useHydrated, useWishlist } from "@/lib/store";
import { byId } from "@/lib/utils";

export default function WishlistView() {
  const list = useWishlist().map((id) => byId(id)!);
  if (!useHydrated()) return null;
  return (
    <section className="wrap section">
      {list.length ? (
        <>
          <WishlistActions list={list} />
          <div className="grid">{list.map((p) => <ProductCard p={p} key={p.id} />)}</div>
        </>
      ) : (
        <div className="empty">
          <h2>Your wishlist is empty</h2>
          <p>Tap the heart on any saree to save it here.</p>
          <Link className="btn btn--pink" href="/shop">Shop sarees</Link>
        </div>
      )}
    </section>
  );
}
