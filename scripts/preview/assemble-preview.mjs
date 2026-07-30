/**
 * Emits the final review page.
 *
 * Two things make the embedded screens behave like real phones rather than squeezed
 * desktop layouts:
 *
 *  1. The app's three min-width media queries are rewritten as container queries, so
 *     each 390px frame resolves them against its own width, not the viewer's viewport.
 *  2. Images are substituted at runtime from a shared map, because the sibling-finish
 *     screens reuse the same photography and inlining per screen tripled the payload.
 */
import { readFileSync, writeFileSync } from "node:fs";

const SCRATCH = new URL(".", import.meta.url).pathname;
const { appCss, screens, imageMap, fontVars } = JSON.parse(
  readFileSync(`${SCRATCH}/payload.json`, "utf8"),
);

// Viewport-relative → container-relative. `@media (hover: hover)` is left alone.
const scopedCss = appCss.replace(/@media \(min-width: ([\d.]+rem)\)/g, "@container (min-width: $1)");

const screenMarkup = screens
  .map(({ sku, label, note, html }) => {
    // No placeholder src: assigning a new src over an in-flight load aborts it, which
    // leaves the element permanently at complete=true, naturalWidth=0. An img with no
    // src never starts a load, so the script's assignment is the only one.
    const body = html.replace(/src="#(i\d+)"/g, (_match, id) => `data-img="${id}"`);

    return `
      <li class="pv-card">
        <div class="pv-card-head">
          <p class="pv-label">${label}</p>
          <p class="pv-sku">/p/${sku}</p>
        </div>
        <p class="pv-note">${note}</p>
        <div class="pv-device">
          <div class="pv-screen" data-screen="${sku}" tabindex="0" role="group"
               aria-label="${label} — SKU ${sku}, scrollable">
            <div class="pv-viewport">${body}</div>
          </div>
        </div>
      </li>`;
  })
  .join("");

const page = `<title>Showroom QR — customer page review</title>

<style>
/* ---- The app's own stylesheet, verbatim apart from the container-query rewrite ---- */
${scopedCss}
</style>

<style>
/* ---- Review surround. Deliberately cool and quiet so the warm product page reads
        as the object under review, not part of the chrome. ---- */
:root {
  /* next/font variables. These must sit on :root, not a deeper wrapper: Tailwind's
     theme layer declares --font-sans/--font-display on :root in terms of these, and an
     unresolved var() there computes to nothing for the whole subtree. */
${fontVars}

  --pv-ground: #17191c;
  --pv-panel: #202327;
  --pv-bezel: #0e0f11;
  --pv-rule: #31353a;
  --pv-text: #e8e7e5;
  --pv-muted: #94918c;
  --pv-brass: #b08950;
  --pv-shadow: 0 18px 40px -12px rgb(0 0 0 / 0.6);
}

@media (prefers-color-scheme: light) {
  :root {
    --pv-ground: #e6e5e1;
    --pv-panel: #f6f5f3;
    --pv-bezel: #b9b6b0;
    --pv-rule: #d2cfca;
    --pv-text: #1d1f22;
    --pv-muted: #6b6862;
    --pv-brass: #86663a;
    --pv-shadow: 0 14px 30px -14px rgb(0 0 0 / 0.28);
  }
}

:root[data-theme="dark"] {
  --pv-ground: #17191c;
  --pv-panel: #202327;
  --pv-bezel: #0e0f11;
  --pv-rule: #31353a;
  --pv-text: #e8e7e5;
  --pv-muted: #94918c;
  --pv-brass: #b08950;
  --pv-shadow: 0 18px 40px -12px rgb(0 0 0 / 0.6);
}

:root[data-theme="light"] {
  --pv-ground: #e6e5e1;
  --pv-panel: #f6f5f3;
  --pv-bezel: #b9b6b0;
  --pv-rule: #d2cfca;
  --pv-text: #1d1f22;
  --pv-muted: #6b6862;
  --pv-brass: #86663a;
  --pv-shadow: 0 14px 30px -14px rgb(0 0 0 / 0.28);
}

/* Overrides the app stylesheet's body rule, which paints the warm product ground. */
body {
  background-color: var(--pv-ground);
  color: var(--pv-text);
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  line-height: 1.5;
}

.pv-wrap {
  max-width: 78rem;
  margin: 0 auto;
  padding: clamp(2rem, 5vw, 4.5rem) clamp(1.25rem, 4vw, 3rem) 5rem;
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

.pv-intro { display: flex; flex-direction: column; gap: 1rem; max-width: 46rem; }

.pv-intro h1 {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  line-height: 1.1;
  letter-spacing: -0.02em;
  font-weight: 600;
  text-wrap: balance;
}

.pv-intro p { color: var(--pv-muted); max-width: 62ch; }
.pv-intro strong { color: var(--pv-text); font-weight: 600; }

.pv-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--pv-rule);
  font-size: 0.8125rem;
  color: var(--pv-muted);
}

.pv-meta b { color: var(--pv-text); font-weight: 500; }

.pv-callout {
  background-color: var(--pv-panel);
  border: 1px solid var(--pv-rule);
  border-left: 2px solid var(--pv-brass);
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 62rem;
}

.pv-callout h2 { font-size: 0.9375rem; font-weight: 600; }
.pv-callout p, .pv-callout li { font-size: 0.875rem; color: var(--pv-muted); }
.pv-callout ul { display: flex; flex-direction: column; gap: 0.4rem; padding-left: 1.1rem; }
.pv-callout li { list-style: disc; }
.pv-callout code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.8125em;
  color: var(--pv-text);
}

/* Contact sheet of screens. */
.pv-sheet {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(390px, 1fr));
  gap: 3rem 2rem;
  align-items: start;
}

.pv-card { display: flex; flex-direction: column; gap: 0.75rem; min-width: 0; }

.pv-card-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid var(--pv-rule);
  padding-bottom: 0.5rem;
}

.pv-label { font-size: 0.9375rem; font-weight: 600; }

.pv-sku {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.75rem;
  color: var(--pv-muted);
}

.pv-note { font-size: 0.8125rem; color: var(--pv-muted); max-width: 44ch; }

.pv-device {
  background-color: var(--pv-bezel);
  padding: 9px;
  border-radius: 30px;
  box-shadow: var(--pv-shadow);
  width: max-content;
  max-width: 100%;
}

.pv-screen {
  width: 390px;
  max-width: 100%;
  height: 720px;
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 22px;
  background-color: var(--color-canvas);
  overscroll-behavior: contain;
}

.pv-screen:focus-visible { outline: 2px solid var(--pv-brass); outline-offset: 3px; }

/* The element the container queries resolve against. It also restores the body font
   the app sets via a class on <body>, an element this page doesn't reproduce. */
.pv-viewport {
  container-type: inline-size;
  width: 100%;
  font-family: var(--font-sans);
  color: var(--color-ink);
  line-height: normal;
}

.pv-footer {
  border-top: 1px solid var(--pv-rule);
  padding-top: 1.5rem;
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
  max-width: 62rem;
}

.pv-footer h2 { font-size: 0.6875rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--pv-muted); margin-bottom: 0.6rem; font-weight: 600; }
.pv-footer li { font-size: 0.8125rem; color: var(--pv-muted); padding: 0.3rem 0; }
.pv-footer b { color: var(--pv-text); font-weight: 500; }

@media (prefers-reduced-motion: reduce) {
  * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
}
</style>

<div class="pv-wrap">
  <header class="pv-intro">
    <p class="pv-eyebrow">ABI Interiors · Showroom QR</p>
    <h1>What a customer sees after scanning a showroom label</h1>
    <p>
      Six states of the same page, each embedded live at phone width — scroll any screen,
      tap the gallery thumbnails, open the questions. This is the real page, not a mockup:
      the HTML, stylesheet and photography were lifted straight from the running app.
    </p>
    <div class="pv-meta">
      <span><b>Region</b> Australia (au)</span>
      <span><b>Data</b> fixture dataset, not live</span>
      <span><b>URL per label</b> <code>/p/&lt;SKU&gt;</code></span>
      <span><b>Reviewed</b> 30 July 2026</span>
    </div>
  </header>

  <section class="pv-callout">
    <h2>What&rsquo;s real here, and what isn&rsquo;t</h2>
    <p>
      SKU 16243 is a live ABI Gateway record copied verbatim — its photography, specs,
      warranty matrix, FAQs and required companion product are all genuine. The others
      carry real SKUs, names, colours and prices, but their stock states were adjusted to
      reach states the first record doesn&rsquo;t reach. Two things are invented outright:
    </p>
    <ul>
      <li>
        The <b>sale price</b> on 16241 — every record sampled had none, so whether ABI
        uses that field at all is unverified.
      </li>
      <li>
        <b>Sibling photography</b> — only 16243 and 16149 have real images, so the
        Brushed Brass page shows a gunmetal tap.
      </li>
    </ul>
    <p>
      The page is not connected to live data yet, and that is a permissions question
      rather than a coding one: the gateway only accepts an employee identity, and a
      walk-in customer has none.
    </p>
  </section>

  <ul class="pv-sheet">${screenMarkup}
  </ul>

  <footer class="pv-footer">
    <div>
      <h2>Enforced by the code</h2>
      <ul>
        <li><b>Cost price cannot reach a customer.</b> It is left out of the fields requested from the gateway, and the view model has nowhere to put it.</li>
        <li><b>Hidden attributes stay hidden.</b> Records flag some rows as internal; only visible ones render.</li>
        <li><b>Draft products are blocked</b> for customers and shown to staff, because showrooms display pre-launch stock.</li>
      </ul>
    </div>
    <div>
      <h2>Not built yet</h2>
      <ul>
        <li>Staff view — cost, margin and stock behind Microsoft sign-in.</li>
        <li>Label generation — bulk QR sheets for printing.</li>
        <li>A missing SKU currently returns HTTP 200 where it should return 404.</li>
      </ul>
    </div>
  </footer>
</div>

<script>
  const IMAGES = ${JSON.stringify(imageMap)};

  for (const img of document.querySelectorAll("img[data-img]")) {
    const source = IMAGES[img.dataset.img];
    if (source) img.src = source;
  }

  /* The gallery is a React component in the app; here it is re-wired by hand so the
     thumbnails still work in a static page. */
  for (const screen of document.querySelectorAll("[data-screen]")) {
    const hero = screen.querySelector(".aspect-square img");
    const thumbs = [...screen.querySelectorAll("button")].filter((b) => b.querySelector("img"));
    if (!hero || thumbs.length === 0) continue;

    for (const thumb of thumbs) {
      thumb.addEventListener("click", () => {
        const source = thumb.querySelector("img").src;
        if (source) hero.src = source;
        for (const other of thumbs) {
          const isActive = other === thumb;
          other.classList.toggle("border-brass", isActive);
          other.classList.toggle("border-rule", !isActive);
          other.setAttribute("aria-current", String(isActive));
        }
      });
    }
  }
</script>
`;

writeFileSync(`${SCRATCH}/preview.html`, page);
console.log(`wrote preview.html — ${(page.length / 1024).toFixed(0)} KB`);
