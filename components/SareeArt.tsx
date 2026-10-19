/* Illustrated saree shown until real photos are added: the body weave, a woven side border
 * and a zari pallu, drawn in the saree's own colours. `view` picks a gallery angle. */

import { useId } from "react";

export type ArtKind = "ikat" | "checks" | "stripes" | "butti" | "border" | "plain";

const GOLD = "#d9b25c";

// Map a product's weave type ("Ikat", "Zari border", "Mulmul"...) to a drawing style.
export function artKind(weaveType: string): ArtKind {
  const w = weaveType.toLowerCase();
  if (w.includes("ikat")) return "ikat";
  if (w.includes("check")) return "checks";
  if (w.includes("stripe")) return "stripes";
  if (w.includes("butti") || w.includes("polka") || w.includes("print")) return "butti";
  if (w.includes("border")) return "border";
  return "plain";
}

// Full saree, pallu close-up, border close-up, weave close-up.
const VIEWS = [
  "",
  "translate(-150 -380) scale(2)",
  "translate(0 -160) scale(2.6)",
  "translate(-300 -260) scale(3)",
];

function Weave({ kind, c1, c2, id }: { kind: ArtKind; c1: string; c2: string; id: string }) {
  switch (kind) {
    case "ikat":
      return (
        <pattern id={id} width="44" height="52" patternUnits="userSpaceOnUse">
          <path d="M22 4 40 26 22 48 4 26Z" fill="none" stroke={c2} strokeWidth="6" strokeDasharray="7 3" opacity=".85" />
          <path d="M22 17 31 26 22 35 13 26Z" fill={GOLD} opacity=".55" />
        </pattern>
      );
    case "checks":
      return (
        <pattern id={id} width="30" height="30" patternUnits="userSpaceOnUse">
          <rect width="30" height="7" fill={c2} opacity=".55" />
          <rect width="7" height="30" fill={c2} opacity=".55" />
          <rect x="15" width="1.5" height="30" fill="#fff" opacity=".25" />
          <rect y="15" width="30" height="1.5" fill="#fff" opacity=".25" />
        </pattern>
      );
    case "stripes":
      return (
        <pattern id={id} width="26" height="10" patternUnits="userSpaceOnUse">
          <rect width="6" height="10" fill={c2} opacity=".7" />
          <rect x="12" width="1.6" height="10" fill={GOLD} opacity=".8" />
          <rect x="17" width="1" height="10" fill="#fff" opacity=".3" />
        </pattern>
      );
    case "butti":
      return (
        <pattern id={id} width="40" height="40" patternUnits="userSpaceOnUse">
          {[[10, 10], [30, 30]].map(([x, y]) => (
            <g key={x} transform={`translate(${x} ${y})`} fill={GOLD} opacity=".9">
              <ellipse rx="2.2" ry="5" /><ellipse rx="5" ry="2.2" /><circle r="1.6" fill={c2} />
            </g>
          ))}
        </pattern>
      );
    default:
      // Fine handloom texture
      return (
        <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="1" fill="#fff" opacity=".07" />
          <rect width="1" height="6" fill="#000" opacity=".05" />
        </pattern>
      );
  }
}

export default function SareeArt({ c1, c2, kind, view = 0, title }: { c1: string; c2: string; kind: ArtKind; view?: number; title?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (s: string) => s + uid;
  const wideBorder = kind === "border";
  const pallu = wideBorder ? 268 : 292;

  return (
    <svg className="ph art" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <defs>
        <Weave kind={kind} c1={c1} c2={c2} id={id("w")} />
        {/* Temple-triangle border motif */}
        <pattern id={id("t")} width="14" height="14" patternUnits="userSpaceOnUse">
          <path d="M0 14 7 3 14 14Z" fill={GOLD} opacity=".9" />
        </pattern>
        <pattern id={id("tr")} width="14" height="14" patternUnits="userSpaceOnUse">
          <path d="M0 0 7 11 14 0Z" fill={GOLD} opacity=".9" />
        </pattern>
        {/* Pallu motif: small mango (paisley) shapes */}
        <pattern id={id("m")} width="34" height="30" patternUnits="userSpaceOnUse">
          <path d="M17 6c6 0 9 5 8 10-1 6-8 9-11 6-3-3 3-5 1-9-1-3-4-1-4-3 0-2 3-4 6-4z" fill={GOLD} opacity=".85" />
        </pattern>
        {/* Soft folds of the drape */}
        <linearGradient id={id("f")} x1="0" x2="1" y1="0" y2="0">
          {[0, 0.12, 0.24, 0.38, 0.52, 0.66, 0.8, 0.92, 1].map((o, i) => (
            <stop key={o} offset={o} stopColor={i % 2 ? "#fff" : "#000"} stopOpacity={i % 2 ? 0.1 : 0.12} />
          ))}
        </linearGradient>
        <linearGradient id={id("v")} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".12" />
          <stop offset=".55" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".18" />
        </linearGradient>
      </defs>

      <g transform={VIEWS[view % VIEWS.length]}>
        {/* Body */}
        <rect width="300" height="400" fill={c1} />
        <rect width="300" height="400" fill={`url(#${id("w")})`} />

        {/* Side border */}
        <rect width={wideBorder ? 46 : 32} height="400" fill={c2} />
        <rect x="4" width="2" height="400" fill={GOLD} />
        <rect x={wideBorder ? 40 : 26} width="2" height="400" fill={GOLD} />
        {wideBorder ? <rect x="12" width="22" height="400" fill={GOLD} opacity=".35" /> : null}

        {/* Pallu */}
        <rect y={pallu} width="300" height={400 - pallu} fill={c2} />
        <rect y={pallu} width="300" height="3" fill={GOLD} />
        <rect y={pallu + 6} width="300" height="14" fill={`url(#${id("t")})`} />
        <rect y={pallu + 24} width="300" height="1.5" fill={GOLD} />
        <rect y={pallu + 34} width="300" height={400 - pallu - 58} fill={`url(#${id("m")})`} />
        <rect y="376" width="300" height="1.5" fill={GOLD} />
        <rect y="380" width="300" height="14" fill={`url(#${id("tr")})`} />

        {/* Light and folds */}
        <rect width="300" height="400" fill={`url(#${id("f")})`} />
      </g>
      <rect width="300" height="400" fill={`url(#${id("v")})`} />
    </svg>
  );
}
