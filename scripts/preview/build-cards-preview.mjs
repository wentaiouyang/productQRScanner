/**
 * Builds a self-contained review page for the printed showroom cards.
 *
 * Like the product-page generator, it lifts the real rendered markup rather than
 * re-creating the design — but cards are much cheaper to inline: the QR codes are already
 * data-URI SVGs and the cards carry no photography, so only the stylesheet and fonts need
 * embedding.
 *
 * Requires the dev server: `npm run dev`, then
 *   node scripts/preview/build-cards-preview.mjs
 */
import { writeFileSync } from "node:fs";

const ORIGIN = "http://localhost:3000";
const OUT = new URL("./cards-preview.html", import.meta.url).pathname;

/**
 * Which cards appear on the review page.
 *
 * The demo dataset is four finishes of one tap plus one other product, so showing every
 * card repeats the same name and reads as a layout fault rather than as fixture data. One
 * card shows the design; add SKUs here to show more.
 */
const PREVIEW_SKUS = ["16243"];

/** Set false to also show the multi-product shelf format. */
const INCLUDE_SHELF_CARDS = false;

async function text(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

/** The chunk name changes between builds, so it is discovered rather than hardcoded. */
async function loadStylesheet(pageHtml) {
  const href = pageHtml.match(/href="([^"]*\.css[^"]*)"/)?.[1];
  if (!href) throw new Error("no stylesheet link found on the page");
  return text(new URL(href, ORIGIN).toString());
}

async function inlineFonts(css) {
  const refs = [...new Set([...css.matchAll(/url\("\.\.\/media\/([^"]+)"\)/g)].map((m) => m[1]))];
  let out = css;

  for (const file of refs) {
    const res = await fetch(`${ORIGIN}/_next/static/media/${file}`);
    if (!res.ok) continue;
    const buffer = Buffer.from(await res.arrayBuffer());
    out = out.replaceAll(
      `url("../media/${file}")`,
      `url("data:font/woff2;base64,${buffer.toString("base64")}")`,
    );
  }

  console.log(`fonts inlined: ${refs.length}`);
  return out;
}

/**
 * next/font declares these on hashed classes placed on <html>, i.e. on :root. Tailwind's
 * theme layer defines --font-sans/--font-display in terms of them on :root too, so if they
 * end up on a deeper element the var() is invalid there and the whole subtree silently
 * loses its fonts.
 */
function extractFontVars(css) {
  const vars = [...css.matchAll(/\.[\w-]*__variable\s*\{([^}]*)\}/g)]
    .flatMap(([, body]) => [...body.matchAll(/(--font-[\w-]+):\s*([^;]+);/g)])
    .map(([, name, value]) => `  ${name}: ${value.trim()};`)
    .join("\n");

  if (!vars) throw new Error("could not extract next/font variables");
  return vars;
}

function extractCards(html, skus) {
  const cards = html.match(/<article class="card[\s\S]*?<\/article>/g) ?? [];
  if (cards.length === 0) throw new Error("no cards found in the rendered page");

  for (const card of cards) {
    // Cards should be fully self-contained by now; a remote src would break offline.
    if (/src="(?!data:)/.test(card)) throw new Error("card contains a non-data-URI src");
  }

  if (!skus) return cards;

  // The SKU opens the card's spec line, either alone or followed by " · WELS …".
  const wanted = cards.filter((card) =>
    skus.some((sku) => new RegExp(`>\\s*${sku}(\\s*<|\\s+·)`).test(card)),
  );
  if (wanted.length === 0) {
    throw new Error(`none of ${skus.join(", ")} matched a rendered card`);
  }
  return wanted;
}

const singleHtml = await text(`${ORIGIN}/labels`);

const appCss = await inlineFonts(await loadStylesheet(singleHtml));
const fontVars = extractFontVars(appCss);

const singleCards = extractCards(singleHtml, PREVIEW_SKUS);

const shelfCards = INCLUDE_SHELF_CARDS
  ? extractCards(await text(`${ORIGIN}/labels?format=shelf`), null)
  : [];

console.log(`cards: ${singleCards.length} single, ${shelfCards.length} shelf`);

const section = (title, note, cards) => `
  <section class="pv-section">
    <div class="pv-head">
      <h2>${title}</h2>
      <p>${note}</p>
    </div>
    <div class="pv-cards">${cards.join("\n")}</div>
  </section>`;

const page = `<title>Showroom cards — print review</title>

<style>
/* ---- The app's own stylesheet, verbatim ---- */
${appCss}
</style>

<style>
:root {
  /* Must sit on :root — see extractFontVars in the generator. */
${fontVars}

  --pv-ground: #17191c;
  --pv-rule: #31353a;
  --pv-text: #e8e7e5;
  --pv-muted: #94918c;
  --pv-brass: #b08950;
}

@media (prefers-color-scheme: light) {
  :root {
    --pv-ground: #e6e5e1;
    --pv-rule: #d2cfca;
    --pv-text: #1d1f22;
    --pv-muted: #6b6862;
    --pv-brass: #86663a;
  }
}

:root[data-theme="dark"] {
  --pv-ground: #17191c; --pv-rule: #31353a; --pv-text: #e8e7e5;
  --pv-muted: #94918c; --pv-brass: #b08950;
}

:root[data-theme="light"] {
  --pv-ground: #e6e5e1; --pv-rule: #d2cfca; --pv-text: #1d1f22;
  --pv-muted: #6b6862; --pv-brass: #86663a;
}

/* Overrides the app stylesheet's body rule, which paints the warm product ground. */
body {
  background-color: var(--pv-ground);
  color: var(--pv-text);
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  line-height: 1.5;
}

.pv-wrap {
  max-width: 62rem;
  margin: 0 auto;
  padding: clamp(2rem, 5vw, 4rem) clamp(1.25rem, 4vw, 2.5rem) 4rem;
  display: flex;
  flex-direction: column;
  gap: 3.5rem;
}

.pv-eyebrow {
  font-size: 0.6875rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--pv-brass);
  font-weight: 600;
}

.pv-intro { display: flex; flex-direction: column; gap: 1rem; }

.pv-intro h1 {
  font-size: clamp(1.75rem, 4vw, 2.375rem);
  line-height: 1.1;
  letter-spacing: -0.02em;
  font-weight: 600;
  text-wrap: balance;
}

.pv-intro p { color: var(--pv-muted); max-width: 62ch; }
.pv-intro b { color: var(--pv-text); font-weight: 600; }

.pv-section { display: flex; flex-direction: column; gap: 1.25rem; }

.pv-head { border-top: 1px solid var(--pv-rule); padding-top: 1rem; }
.pv-head h2 { font-size: 1rem; font-weight: 600; }
.pv-head p { font-size: 0.8125rem; color: var(--pv-muted); max-width: 60ch; margin-top: 0.35rem; }

/* Cards are fixed at 200mm; on a narrow screen they scroll rather than squash, because a
   scaled-down card would misrepresent what comes out of the printer. */
.pv-cards {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.pv-cards .card { flex: none; box-shadow: 0 14px 34px -16px rgb(0 0 0 / 0.45); }

.pv-note { font-size: 0.8125rem; color: var(--pv-muted); }
.pv-note b { color: var(--pv-text); font-weight: 500; }
.pv-note code { font-family: ui-monospace, Menlo, monospace; font-size: 0.8125em; }
</style>

<div class="pv-wrap">
  <header class="pv-intro">
    <p class="pv-eyebrow">ABI Interiors · Showroom QR</p>
    <h1>Printed showroom cards</h1>
    <p>
      The real card, lifted from the running app — same markup, stylesheet and QR code that
      go to the printer. It prints <b>A5 landscape</b> at 200 × 138 mm, and what you see
      below is actual size.
    </p>
  </header>

  ${section(
    "One product per card",
    "The code is a sixth of the card width — large enough to scan from a step back, which is how a customer approaches a display.",
    singleCards,
  )}
  ${
    shelfCards.length > 0
      ? section(
          "Shelf card — up to three products",
          "For a bay holding several finishes or sizes. It carries one code, which currently points at the first product on the card; a range URL covering all of them doesn't exist yet.",
          shelfCards,
        )
      : ""
  }

  <p class="pv-note">
    <b>The finish swatch colours are not data.</b> The gateway carries a finish only as a
    name, with no colour anywhere in the record, so every hex in
    <code>lib/finish-colours.ts</code> is an approximation eyeballed from product
    photography. They need sign-off from whoever owns ABI&rsquo;s colour standards before
    anything is printed. A finish missing from that table prints as a dashed outline rather
    than a guessed colour.
  </p>

  <p class="pv-note">
    <b>Data note.</b> This is SKU 16243, a live gateway record copied verbatim — its price,
    dimensions, warranty and nine sibling finishes are all real. A second format for shelves
    holding several products exists in the app; it is left off this page because the demo
    dataset is mostly one tap in different finishes, which made it read as a layout fault.
  </p>
</div>
`;

writeFileSync(OUT, page);
console.log(`wrote ${OUT} — ${(page.length / 1024).toFixed(0)} KB`);
