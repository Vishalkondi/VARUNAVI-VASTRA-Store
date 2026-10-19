"use client";

/* "Help me choose": three quick questions, then the sarees that match best. */

import { useState } from "react";
import { OCCASION_TITLES, OCCASIONS, PRODUCTS, WEAVES, type Product, type WeaveKey } from "@/lib/data";
import { waLink } from "@/lib/utils";
import { ProductCard } from "./Bits";

const COLOURS = [...new Set(PRODUCTS.map((p) => p.colour))].sort();
const COLOUR_DOT = Object.fromEntries(COLOURS.map((c) => [c, PRODUCTS.find((p) => p.colour === c)!.c1]));
const ANY = "";

type Answers = { occasion: string; colour: string; weave: string };
type Step = { key: keyof Answers; question: string; options: [string, string][]; anyLabel: string };

const STEPS: Step[] = [
  { key: "occasion", question: "What is the saree for?", options: OCCASIONS.map((o) => [o, OCCASION_TITLES[o].replace(" Sarees", "")]), anyLabel: "Not sure yet" },
  { key: "colour", question: "Which colour do you love?", options: COLOURS.map((c) => [c, c]), anyLabel: "Surprise me" },
  { key: "weave", question: "Which style do you prefer?", options: Object.entries(WEAVES).map(([k, w]) => [k, w.label]), anyLabel: "Show me all" },
];

// Higher score = closer match. Sold-out sarees go last.
function score(p: Product, a: Answers) {
  return (a.occasion && p.occasion === a.occasion ? 3 : 0) +
    (a.colour && p.colour === a.colour ? 3 : 0) +
    (a.weave && p.weave === (a.weave as WeaveKey) ? 2 : 0) +
    (p.bestseller ? 0.5 : 0) + (p.isNew ? 0.2 : 0) - (p.soldOut ? 10 : 0);
}

export default function Finder() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({ occasion: ANY, colour: ANY, weave: ANY });

  function choose(value: string) {
    setAnswers((a) => ({ ...a, [STEPS[step].key]: value }));
    setStep((s) => s + 1);
  }
  const restart = () => { setAnswers({ occasion: ANY, colour: ANY, weave: ANY }); setStep(0); };

  if (step < STEPS.length) {
    const s = STEPS[step];
    return (
      <div className="finder">
        <div className="finder__progress" aria-label={"Question " + (step + 1) + " of " + STEPS.length}>
          {STEPS.map((_, i) => <span key={i} className={i <= step ? "is-on" : ""} />)}
        </div>
        <p className="eyebrow">Question {step + 1} of {STEPS.length}</p>
        <h2>{s.question}</h2>
        <div className="finder__options">
          {s.options.map(([value, label]) => (
            <button key={value} type="button" className="finder__option" onClick={() => choose(value)}>
              {s.key === "colour" ? <span className="chip__dot" style={{ background: COLOUR_DOT[value] }} /> : null}
              {label}
            </button>
          ))}
          <button type="button" className="finder__option finder__option--any" onClick={() => choose(ANY)}>{s.anyLabel}</button>
        </div>
        {step > 0 ? <button type="button" className="link-btn" onClick={() => setStep((n) => n - 1)}>← Back</button> : null}
      </div>
    );
  }

  const chosen = (Object.keys(answers) as (keyof Answers)[]).filter((k) => answers[k]);
  const ranked = PRODUCTS.map((p) => ({ p, s: score(p, answers) })).sort((a, b) => b.s - a.s || b.p.added - a.p.added);
  const perfect = chosen.length ? ranked.filter((r) => chosen.every((k) => (k === "weave" ? r.p.weave : r.p[k]) === answers[k])) : [];
  const shown = (perfect.length ? perfect : ranked).slice(0, 8);
  const summary = [
    answers.occasion && OCCASION_TITLES[answers.occasion].replace(" Sarees", "").toLowerCase(),
    answers.colour && answers.colour.toLowerCase(),
    answers.weave && WEAVES[answers.weave as WeaveKey].label.toLowerCase(),
  ].filter(Boolean).join(", ");

  return (
    <div className="finder finder--done">
      <p className="eyebrow">Your matches</p>
      <h2>{perfect.length ? (perfect.length === 1 ? "We found your saree" : "We found " + perfect.length + " sarees for you") : chosen.length ? "No exact match, but you may love these" : "Our sarees, best first"}</h2>
      {summary ? <p className="hint">You chose: {summary}.</p> : null}
      <div className="grid finder__grid">
        {shown.map(({ p }, i) => (
          <div key={p.id} className="finder__result">
            {perfect.length && i === 0 ? <span className="finder__tag">Best match</span> : null}
            <ProductCard p={p} />
          </div>
        ))}
      </div>
      <div className="finder__foot">
        <a className="btn btn--whatsapp" target="_blank" rel="noopener"
          href={waLink("Hello Varunavi Vastra, I am looking for a saree" + (summary ? ": " + summary : "") + ". Can you suggest some options?")}>
          Not quite right? Ask us on WhatsApp
        </a>
        <button type="button" className="btn btn--outline" onClick={restart}>Start again</button>
      </div>
    </div>
  );
}
