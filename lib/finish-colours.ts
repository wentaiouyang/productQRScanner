/**
 * Swatch colours for ABI finishes.
 *
 * ⚠️ These are DESIGN VALUES, not data. The gateway carries the finish only as a name —
 * `colour: "Brushed Gunmetal"` — with no hex anywhere in the record, so the dots on a
 * printed card have to come from a table like this one.
 *
 * That makes them a brand decision. Every value below is an approximation eyeballed from
 * product photography and needs sign-off from whoever owns ABI's colour standards before
 * anything goes to print: a card showing the wrong brass is a brand problem, not a bug.
 *
 * Names are matched case-insensitively against the gateway's `colour` field. Anything not
 * listed renders as a dashed outline rather than a guessed colour, so a missing finish is
 * visible on screen before it reaches paper.
 */
const FINISHES: Record<string, string> = {
  // Metals — the core range
  "brushed brass": "#b3925c",
  "brushed nickel": "#a7a9ac",
  "brushed gunmetal": "#4e5052",
  "brushed copper": "#a45f3f",
  "matte black": "#1c1c1c",
  chrome: "#d2d5d8",
  "stainless steel": "#9a9ca0",
  white: "#f1f0ed",

  // Aged and antique finishes
  "antique steel": "#6d6a63",
  "antique bronze": "#6a4a30",
  "antique aurum": "#977a46",
  "antique slate": "#4a4d4b",
  "tumbled aged brass": "#8b7342",

  // Cabinetry timbers
  "white ash oak": "#d7c8ad",
  "pure oak": "#c6a878",
  "dark oak": "#6a4a2f",

  // Basin and sink colourways
  almond: "#ded4c3",
  "matte white": "#f4f3f0",
  "gloss white": "#fafafa",
};

export type Swatch = { hex: string } | { hex: null; name: string };

export function swatchFor(finishName: string): Swatch {
  const hex = FINISHES[finishName.trim().toLowerCase()];
  return hex ? { hex } : { hex: null, name: finishName };
}

/** Every finish name this table knows, for the coverage warning on the labels page. */
export function unmappedFinishes(names: string[]): string[] {
  const missing = names.filter((name) => !FINISHES[name.trim().toLowerCase()]);
  return [...new Set(missing)];
}
