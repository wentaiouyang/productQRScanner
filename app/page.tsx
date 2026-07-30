import Link from "next/link";
import QRCode from "qrcode";

import { FIXTURE_NOTES } from "@/lib/product/fixtures";
import { productSource } from "@/lib/product/fixture-source";

/**
 * Demo launcher. Not part of the customer experience — it exists so the QR codes can
 * be scanned with a real phone and the page states compared side by side.
 *
 * Set NEXT_PUBLIC_BASE_URL to this machine's LAN address (e.g. http://192.168.1.20:3000)
 * for the codes to resolve from a phone; localhost only works on this machine.
 */
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

async function qrDataUrl(target: string): Promise<string> {
  return QRCode.toDataURL(target, {
    margin: 1,
    width: 320,
    color: { dark: "#1b1917", light: "#ffffff" },
  });
}

export default async function DemoIndex() {
  const skus = productSource.availableSkus();

  const entries = await Promise.all(
    skus.map(async (sku) => {
      const result = await productSource.lookupBySku(sku);
      const target = `${BASE_URL}/p/${sku}`;
      return {
        sku,
        target,
        qr: await qrDataUrl(target),
        name: result.kind === "found" ? result.product.name : sku,
        status: result.kind === "found" ? result.product.status : "unknown",
        note: FIXTURE_NOTES[sku] ?? "",
      };
    }),
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
      <header className="max-w-2xl">
        <p className="eyebrow">ABI Interiors · Showroom QR</p>
        <h1 className="font-display mt-2 text-4xl leading-tight">Demo labels</h1>
        <p className="mt-4 leading-relaxed text-ink-soft">
          Each code below points at <code className="font-mono text-sm">/p/&lt;SKU&gt;</code> —
          the same URL a printed showroom label would carry. Scan one with a phone camera,
          or follow the link.
        </p>
        <p className="mt-3 text-sm text-ink-faint">
          Codes resolve to <code className="font-mono">{BASE_URL}</code>. To scan from a
          phone, restart the dev server with{" "}
          <code className="font-mono">NEXT_PUBLIC_BASE_URL</code>{" "}
          set to this machine&rsquo;s LAN address.
        </p>
      </header>

      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <li key={entry.sku} className="border border-rule bg-surface p-5">
            <Link href={`/p/${entry.sku}`} className="group block">
              {/* A data-URI QR code; the image optimiser cannot process these. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={entry.qr}
                alt={`QR code linking to SKU ${entry.sku}`}
                className="w-full max-w-[180px]"
              />
              <p className="eyebrow mt-4">
                SKU {entry.sku}
                {entry.status !== "publish" && (
                  <span className="text-stock-low"> · {entry.status}</span>
                )}
              </p>
              <h2 className="mt-1 text-sm font-medium leading-snug transition-colors group-hover:text-brass">
                {entry.name}
              </h2>
            </Link>
            {entry.note && (
              <p className="mt-2 text-xs leading-relaxed text-ink-faint">{entry.note}</p>
            )}
          </li>
        ))}
      </ul>

      <section className="mt-12 border-t border-rule pt-6">
        <h2 className="eyebrow">Also worth trying</h2>
        <ul className="mt-3 space-y-1.5 text-sm">
          <li>
            <Link href="/p/99999" className="underline underline-offset-2">
              /p/99999
            </Link>
            <span className="text-ink-faint"> — a code with no matching product</span>
          </li>
          <li>
            <Link href="/p/not$a$sku" className="underline underline-offset-2">
              /p/not$a$sku
            </Link>
            <span className="text-ink-faint"> — a mangled scan, rejected before any lookup</span>
          </li>
          <li>
            <Link href="/p/20204" className="underline underline-offset-2">
              /p/20204
            </Link>
            <span className="text-ink-faint"> — a draft product a customer must not see</span>
          </li>
        </ul>
      </section>
    </main>
  );
}
