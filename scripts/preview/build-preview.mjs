/**
 * Assembles a self-contained review page from the real rendered app.
 *
 * Nothing here re-creates the product page — it fetches the actual HTML the app
 * serves, then inlines the stylesheet, the fonts and every image as data URIs so the
 * result survives the Artifact CSP, which blocks all external requests.
 *
 * Images are deduplicated across screens: the sibling-finish fixtures reuse the same
 * photography, so embedding per screen tripled the payload.
 */
import { writeFileSync, readFileSync } from "node:fs";

const ORIGIN = "http://localhost:3000";
const SCRATCH = new URL(".", import.meta.url).pathname;

const SCREENS = [
  { sku: "16243", label: "In stock", note: "A verbatim live gateway record. No WELS rating — a filter tap has none — and a required companion product called out up front." },
  { sku: "16241", label: "Discounted, low stock", note: "Sale price struck through against RRP, and stock at 3 flips the label to Low stock. The sale price is invented; every record sampled had none." },
  { sku: "16240", label: "Made to order", note: "Backorder status reads as Made to order rather than a bare “out of stock”." },
  { sku: "16149", label: "WELS rated", note: "Carries a real WELS block — 5 stars, 6 L/min, registration T43080. No Brandfolder gallery, so it falls back to the single hero image." },
  { sku: "20204", label: "Draft — blocked", note: "Status is draft. Staff see the full page; a customer gets this, because a pre-launch price is not committed to." },
  { sku: "99999", label: "No such product", note: "A label that no longer resolves. Plain language, no error code, and a route to a human." },
];

async function text(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

/** Route every image through Next's own optimiser to get a resized WebP. */
async function optimised(rawSrc, width) {
  const target = rawSrc.startsWith("/_next/image")
    ? (() => {
        const parsed = new URL(rawSrc, ORIGIN);
        parsed.searchParams.set("w", String(width));
        parsed.searchParams.set("q", "70");
        return parsed.toString();
      })()
    : `${ORIGIN}/_next/image?url=${encodeURIComponent(rawSrc)}&w=${width}&q=70`;

  const res = await fetch(target);
  // Next only serves widths listed in deviceSizes/imageSizes; anything else 400s.
  // Failing loudly here, because a swallowed error looks exactly like "no images".
  if (!res.ok) throw new Error(`image ${res.status} at w=${width}: ${rawSrc.slice(0, 80)}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const type = res.headers.get("content-type") ?? "image/webp";
  return `data:${type};base64,${buffer.toString("base64")}`;
}

/**
 * Geist Mono only appears in the demo index's inline code spans, never in a product
 * screen, so its faces are dead weight here.
 */
function dropMonoFaces(css) {
  return css.replace(/@font-face\s*\{[^}]*\}/g, (block) =>
    /font-family:\s*['"]?Geist Mono/i.test(block) ? "" : block,
  );
}

async function inlineFonts(css) {
  const refs = [...new Set([...css.matchAll(/url\("\.\.\/media\/([^"]+)"\)/g)].map((m) => m[1]))];
  let out = css;
  let bytes = 0;

  for (const file of refs) {
    const res = await fetch(`${ORIGIN}/_next/static/media/${file}`);
    if (!res.ok) continue;
    const buffer = Buffer.from(await res.arrayBuffer());
    bytes += buffer.length;
    out = out.replaceAll(
      `url("../media/${file}")`,
      `url("data:font/woff2;base64,${buffer.toString("base64")}")`,
    );
  }

  console.log(`fonts: ${refs.length} files, ${(bytes / 1024).toFixed(0)} KB raw`);
  return out;
}

// Shared across screens: decoded source URL → { id, dataUri }
const images = new Map();

async function buildScreen({ sku }) {
  const html = await text(`${ORIGIN}/p/${sku}`);
  const main = html.match(/<main[\s\S]*?<\/main>/)?.[0];
  if (!main) throw new Error(`no <main> for ${sku}`);

  // Strip responsive machinery — the artifact has exactly one source per image.
  //
  // Case-insensitive on purpose: React 19 serialises the attribute as `srcSet`, and a
  // surviving srcset silently wins over the data-URI src, leaving every next/image
  // element pointing at a localhost URL that does not exist in a standalone file.
  let out = main.replace(/\ssrcset="[^"]*"/gi, "").replace(/\ssizes="[^"]*"/gi, "");

  if (/src[sS]et=/.test(out)) throw new Error(`srcset survived stripping in ${sku}`);

  const srcs = [...new Set([...out.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]))];

  for (const [index, src] of srcs.entries()) {
    const decoded = src.replaceAll("&amp;", "&");

    if (!images.has(decoded)) {
      // The hero is the one image seen at full size on load. Thumbnails can be
      // promoted to hero by tapping, so they still need more than 64px.
      const width = index === 0 ? 640 : 384;
      const dataUri = await optimised(decoded, width);
      if (!dataUri) continue;
      images.set(decoded, { id: `i${images.size}`, dataUri });
    }

    out = out.replaceAll(src, `#${images.get(decoded).id}`);
  }

  return out;
}

const appCss = await inlineFonts(dropMonoFaces(readFileSync(`${SCRATCH}/app.css`, "utf8")));

/**
 * next/font declares --font-geist-sans and --font-instrument-serif on hashed classes
 * that the app puts on <html> — i.e. on :root itself. That placement matters: Tailwind's
 * theme layer declares `--font-sans: var(--font-geist-sans), …` on :root, so if the
 * hashed class sits on any deeper element, :root evaluates that var() as invalid, the
 * whole declaration computes to nothing, and every descendant inherits the emptiness.
 * The result is a silent fallback to the surrounding page's font.
 *
 * So the raw font variables are extracted and re-declared at :root in the review page.
 */
const fontVars = [...appCss.matchAll(/\.[\w-]*__variable\s*\{([^}]*)\}/g)]
  .flatMap(([, body]) => [...body.matchAll(/(--font-[\w-]+):\s*([^;]+);/g)])
  .map(([, name, value]) => `  ${name}: ${value.trim()};`)
  .join("\n");

if (!fontVars) throw new Error("could not extract next/font variables from the stylesheet");
console.log(`font vars:\n${fontVars}`);

const screens = [];
for (const screen of SCREENS) {
  screens.push({ ...screen, html: await buildScreen(screen) });
}

const imageMap = Object.fromEntries(
  [...images.values()].map(({ id, dataUri }) => [id, dataUri]),
);

const imageBytes = Object.values(imageMap).reduce((sum, uri) => sum + uri.length, 0);
console.log(`images: ${images.size} unique, ${(imageBytes / 1024).toFixed(0)} KB base64`);
console.log(`css: ${(appCss.length / 1024).toFixed(0)} KB`);

writeFileSync(`${SCRATCH}/payload.json`, JSON.stringify({ appCss, screens, imageMap, fontVars }));
console.log("wrote payload.json");
