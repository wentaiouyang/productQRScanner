/**
 * The origin every QR code points at.
 *
 * This is the single most consequential value in the project: once a label is printed,
 * the URL on it cannot be changed. Moving to a different origin later means reprinting
 * every label in every showroom.
 *
 * That is why it lives here alone rather than being read from the environment in each
 * place that needs it — switching origins should be one edit, reviewable in one diff.
 *
 * Overridable via NEXT_PUBLIC_BASE_URL for local testing, e.g. pointing the codes at
 * this machine's LAN address so they can be scanned with a real phone.
 */
const DEFAULT_BASE_URL = "https://product-qr-scanner.vercel.app";

/** Normalised without a trailing slash, so joins never produce `//p/16243`. */
export const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || DEFAULT_BASE_URL).replace(
  /\/+$/,
  "",
);

/** The URL encoded into a product's QR label. */
export function productUrl(sku: string): string {
  return `${BASE_URL}/p/${sku}`;
}

/** True when codes point somewhere only reachable from this machine. */
export const IS_LOCAL_BASE_URL = /^https?:\/\/(localhost|127\.0\.0\.1)(:|$)/.test(BASE_URL);
