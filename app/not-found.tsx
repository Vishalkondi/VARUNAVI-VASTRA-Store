import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page could not be found.",
};

export default function NotFound() {
  return (
    <section className="section">
      <div className="wrap empty">
        <h2>We could not find that page</h2>
        <p>The link may be old, or the saree may have moved.</p>
        <div className="btn-row" style={{ justifyContent: "center" }}>
          <Link className="btn btn--pink" href="/shop">Shop sarees</Link>
          <Link className="btn btn--outline" href="/">Go to homepage</Link>
        </div>
      </div>
    </section>
  );
}
