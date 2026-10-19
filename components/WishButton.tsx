"use client";

import Link from "next/link";
import { useWishlist, wishlist } from "@/lib/store";
import { HeartIcon } from "./Icons";
import { useToast } from "./Toast";

export default function WishButton({ id, className, label }: { id: string; className: string; label: string }) {
  const on = useWishlist().includes(id);
  const toast = useToast();
  return (
    <button
      type="button"
      className={className + (on ? " is-on" : "")}
      aria-pressed={on}
      aria-label={label}
      onClick={(e) => {
        e.preventDefault();
        const nowOn = wishlist.toggle(id);
        toast(nowOn ? <>Saved to your wishlist. <Link href="/wishlist">View wishlist</Link></> : "Removed from your wishlist.");
      }}
    >
      <HeartIcon />
    </button>
  );
}
