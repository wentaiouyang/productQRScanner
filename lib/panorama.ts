/**
 * Showroom panoramas.
 *
 * The gateway has no panorama field — like the finish swatch colours, this is an asset the
 * app owns rather than data it reads. So the mapping lives here.
 *
 * Images must be **equirectangular** (a 2:1 spherical projection, the format a 360 camera
 * or a render exports). A regular wide photo will look wrong: the viewer maps the image
 * onto the inside of a sphere and expects the full 360° × 180° field.
 */
/**
 * A marker pinned to a point in the scene.
 *
 * Position is spherical and resolution independent: `bearing` is degrees clockwise from
 * the image's left edge, `elevation` is degrees above (+) or below (−) the horizon. That
 * means a hotspot survives the image being re-exported at a different size.
 */
export type Hotspot = {
  sku: string;
  bearing: number;
  elevation: number;
};

export type Panorama = {
  src: string;
  /** Described to screen reader users and shown while the image loads. */
  label: string;
  /** Initial bearing in degrees, so a scene can open facing the product. */
  initialBearing?: number;
  hotspots?: Hotspot[];
};

/** A hotspot with the product details resolved, ready to render. */
export type ResolvedHotspot = Hotspot & {
  name: string;
  finish: string;
  price: string | null;
  availability: string;
  isCurrent: boolean;
};

const DEFAULT_PANORAMA: Panorama = {
  src: "/panorama/showroom-kitchen.jpg",
  label: "Showroom kitchen display",
  // 0° opens facing the dining room; the kitchen bench and tapware sit around 90°, which
  // is what a customer scanning a tap label is there to look at. 92° is the midpoint of
  // the three hotspots below, so all of them are reachable in the opening frame even on a
  // portrait phone, where the horizontal field of view is much narrower.
  initialBearing: 92,
  hotspots: [
    // The gooseneck filter tap on the right of the island.
    //
    // Derived by inverting the projection from a screenshot rather than guessed: read the
    // marker's position as a fraction of the viewport, convert to NDC
    // (nx = 2·fx − 1, ny = 1 − 2·fy), scale by tan(fov/2) — vertical fov is 72°, so
    // horizontal is atan(tan(36°)·aspect) — then rotate into world space and read off
    // bearing = atan2(x, z) and elevation = asin(y / |v|). Back-solving a known marker
    // first confirms the maths before trusting a new number.
    { sku: "16243", bearing: 64, elevation: -9 },
    // The undermount double bowl in the island.
    { sku: "101671", bearing: 107, elevation: -23 },
    // The overhead joinery left of the rangehood. ABI's cabinetry range is bathroom
    // vanities, so this points at a vanity as a stand-in for kitchen joinery.
    { sku: "15718", bearing: 120, elevation: 19 },
  ],
};

/**
 * Per-SKU overrides. Anything not listed falls back to the showroom scene, since a
 * customer scanning a label is standing in that room either way.
 */
const BY_SKU: Record<string, Panorama> = {};

export function panoramaFor(sku: string): Panorama | null {
  return BY_SKU[sku] ?? DEFAULT_PANORAMA;
}
