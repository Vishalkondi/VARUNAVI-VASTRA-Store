import type { Metadata, Viewport } from "next";
import { Lora, Poppins, Yatra_One } from "next/font/google";
import type { ReactNode } from "react";
import { BackToTop } from "@/components/Extras";
import { CompareTray } from "@/components/Compare";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import { MotionProvider } from "@/components/Motion";
import RevealOnScroll from "@/components/RevealOnScroll";
import { ToastProvider } from "@/components/Toast";
import { SITE } from "@/lib/data";
import "./globals.css";

const lora = Lora({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-lora" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-poppins" });
const yatra = Yatra_One({ subsets: ["latin"], weight: "400", variable: "--font-yatra" });

const description = "Handcrafted cotton sarees from Solapur, made for the woman who values grace. Shop handloom, festive zari and block print cotton sarees.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  // Every page sets its own title. (The shop page renders its title itself, since it depends on the filters.)
  title: { absolute: "", template: "%s · " + SITE.name },
  description,
  // Browser tab, phone home screen and "install app" icons (the lotus from the logo)
  icons: {
    icon: [
      { url: "/assets/images/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-48.png", type: "image/png", sizes: "48x48" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: { title: "Varunavi", statusBarStyle: "default" },
  openGraph: { type: "website", siteName: SITE.name, description },
};

export const viewport: Viewport = { themeColor: "#6C7632" };

// Development only. Bitdefender marks every element with `bis_skin_checked` (and similar) before React starts,
// which floods the dev overlay with hydration warnings. This keeps removing those marks for the whole visit,
// because parts of the page (like the header, which waits for the address bar) hydrate later than the rest.
// Production builds skip it: React ignores extra attributes there, so customers never see a problem.
const STRIP_EXTENSION_ATTRS = `(function () {
  function clean(el) {
    if (!el.attributes) return;
    for (var i = el.attributes.length - 1; i >= 0; i--) {
      var n = el.attributes[i].name;
      if (n.indexOf("bis_") === 0 || n.indexOf("__processed_") === 0) el.removeAttribute(n);
    }
  }
  new MutationObserver(function (list) {
    list.forEach(function (m) {
      if (m.type === "attributes") return clean(m.target);
      m.addedNodes.forEach(function (node) {
        if (node.nodeType !== 1) return;
        clean(node);
        node.querySelectorAll("*").forEach(clean);
      });
    });
  }).observe(document.documentElement, { attributes: true, childList: true, subtree: true });
})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: browser extensions (dark mode, translators, Grammarly, Bitdefender) often
    // add their own attributes to <html> and <body> before the page loads; this stops React warning about it.
    <html lang="en" className={[lora.variable, poppins.variable, yatra.variable].join(" ")} suppressHydrationWarning>
      <head>
        {process.env.NODE_ENV === "development" ? <script dangerouslySetInnerHTML={{ __html: STRIP_EXTENSION_ATTRS }} /> : null}
      </head>
      <body suppressHydrationWarning>
        <MotionProvider>
          <ToastProvider>
            <Header />
            <main id="main">{children}</main>
            <Footer />
            <MobileNav />
            <BackToTop />
            <CompareTray />
            <RevealOnScroll />
          </ToastProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
