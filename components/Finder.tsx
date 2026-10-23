"use client";

/* "Help me choose": three quick questions, then the sarees that match best. */

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { OCCASION_TITLES, OCCASIONS, PRODUCTS, WEAVES, type Product, type WeaveKey } from "@/lib/data";
import { waLink } from "@/lib/utils";
import { ProductCard } from "./Bits";
import { EASE } from "./Motion";

// Each question slides in from the side it is coming from: forward from the right, "Back" from the left.
const slide = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 40 }),
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: EASE, staggerChildren: 0.04, delayChildren: 0.08 } },
  leave: (dir: number) => ({ opacity: 0, x: dir * -40, transition: { duration: 0.2 } }),
};
const pop = { enter: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

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
  const [dir, setDir] = useState(1);
  const [answers, setAnswers] = useState<Answers>({ occasion: ANY, colour: ANY, weave: ANY });

  function choose(value: string) {
    setAnswers((a) => ({ ...a, [STEPS[step].key]: value }));
    setDir(1);
    setStep((s) => s + 1);
  }
  const back = () => { setDir(-1); setStep((n) => n - 1); };
  const restart = () => { setAnswers({ occasion: ANY, colour: ANY, weave: ANY }); setDir(-1); setStep(0); };

  return (
    <AnimatePresence mode="wait" custom={dir} initial={false}>
      <motion.div key={step} custom={dir} variants={slide} initial="enter" animate="show" exit="leave">
        {step < STEPS.length ? <Question step={step} onChoose={choose} onBack={back} /> : <Results answers={answers} onRestart={restart} />}
      </motion.div>
    </AnimatePresence>
  );
}

function Question({ step, onChoose, onBack }: { step: number; onChoose: (value: string) => void; onBack: () => void }) {
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
          <motion.button key={value} type="button" className="finder__option" variants={pop} onClick={() => onChoose(value)}>
            {s.key === "colour" ? <span className="chip__dot" style={{ background: COLOUR_DOT[value] }} /> : null}
            {label}
          </motion.button>
        ))}
        <motion.button type="button" className="finder__option finder__option--any" variants={pop} onClick={() => onChoose(ANY)}>{s.anyLabel}</motion.button>
      </div>
      {step > 0 ? <button type="button" className="link-btn" onClick={onBack}>← Back</button> : null}
    </div>
  );
}

function Results({ answers, onRestart }: { answers: Answers; onRestart: () => void }) {
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
          <motion.div key={p.id} className="finder__result" variants={pop}>
            {perfect.length && i === 0 ? <span className="finder__tag">Best match</span> : null}
            <ProductCard p={p} />
          </motion.div>
        ))}
      </div>
      <div className="finder__foot">
        <a className="btn btn--whatsapp" target="_blank" rel="noopener"
          href={waLink("Hello Varunavi Vastra, I am looking for a saree" + (summary ? ": " + summary : "") + ". Can you suggest some options?")}>
          Not quite right? Ask us on WhatsApp
        </a>
        <button type="button" className="btn btn--outline" onClick={onRestart}>Start again</button>
      </div>
    </div>
  );
}
