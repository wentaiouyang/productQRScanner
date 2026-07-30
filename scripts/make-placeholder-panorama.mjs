/**
 * Generates a graticule test panorama for the 3D viewer.
 *
 * A grid rather than a photograph on purpose: it makes projection errors visible. In a
 * correct equirectangular render the meridians stay vertical, the horizon stays level as
 * you pan, and the bearing labels pass the centre in order. A photograph hides all three.
 *
 * Delete this script once real panoramas are in place.
 *
 *   node scripts/make-placeholder-panorama.mjs
 */
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const WIDTH = 2048;
const HEIGHT = 1024;
const STEP_DEGREES = 15;
/**
 * Deliberately NOT the path any real panorama uses — this script used to write to
 * showroom-kitchen.jpg, which meant running it would silently destroy a real asset.
 * Point `lib/panorama.ts` here temporarily if you want to test the viewer with the grid.
 */
const OUT = "public/panorama/_test-graticule.jpg";

const pxPerDegreeX = WIDTH / 360;
const pxPerDegreeY = HEIGHT / 180;

const lines = [];
const labels = [];

for (let bearing = 0; bearing < 360; bearing += STEP_DEGREES) {
  const x = bearing * pxPerDegreeX;
  const major = bearing % 90 === 0;
  lines.push(
    `<line x1="${x}" y1="0" x2="${x}" y2="${HEIGHT}" stroke="${
      major ? "#8a7350" : "#b6ac9c"
    }" stroke-width="${major ? 3 : 1}" />`,
  );
  labels.push(
    `<text x="${x + 8}" y="${HEIGHT / 2 - 14}" font-family="monospace" font-size="${
      major ? 30 : 20
    }" fill="${major ? "#6f5b3c" : "#9a9081"}">${bearing}°</text>`,
  );
}

// Parallels: elevation from +90 (zenith) at the top to -90 (nadir) at the bottom.
for (let elevation = -90 + STEP_DEGREES; elevation < 90; elevation += STEP_DEGREES) {
  const y = (90 - elevation) * pxPerDegreeY;
  const horizon = elevation === 0;
  lines.push(
    `<line x1="0" y1="${y}" x2="${WIDTH}" y2="${y}" stroke="${
      horizon ? "#8a7350" : "#b6ac9c"
    }" stroke-width="${horizon ? 3 : 1}" />`,
  );
  if (!horizon) {
    labels.push(
      `<text x="10" y="${y - 8}" font-family="monospace" font-size="18" fill="#9a9081">${
        elevation > 0 ? "+" : ""
      }${elevation}°</text>`,
    );
  }
}

const cardinals = [
  [0, "FRONT"],
  [90, "RIGHT"],
  [180, "BEHIND"],
  [270, "LEFT"],
];

for (const [bearing, name] of cardinals) {
  labels.push(
    `<text x="${bearing * pxPerDegreeX + 14}" y="${
      HEIGHT / 2 + 52
    }" font-family="monospace" font-size="44" letter-spacing="6" fill="#6f5b3c">${name}</text>`,
  );
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <defs>
    <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#efece6" />
      <stop offset="0.5" stop-color="#e4dfd6" />
      <stop offset="1" stop-color="#cfc3ad" />
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#ground)" />
  ${lines.join("\n  ")}
  ${labels.join("\n  ")}
  <text x="${WIDTH / 2}" y="${
    HEIGHT / 2 - 150
  }" text-anchor="middle" font-family="monospace" font-size="34" letter-spacing="4" fill="#8a7350">PLACEHOLDER PANORAMA</text>
  <text x="${WIDTH / 2}" y="${
    HEIGHT / 2 - 104
  }" text-anchor="middle" font-family="monospace" font-size="22" fill="#9a9081">replace with public/panorama/showroom-kitchen.jpg</text>
</svg>`;

mkdirSync("public/panorama", { recursive: true });
const info = await sharp(Buffer.from(svg)).jpeg({ quality: 82 }).toFile(OUT);
console.log(`wrote ${OUT} — ${info.width}×${info.height}, ${(info.size / 1024).toFixed(0)} KB`);
