import Link from "next/link";
import type { Metadata } from "next";

import { DownloadList } from "@/components/product/DownloadList";
import { Faqs } from "@/components/product/Faqs";
import { Finishes } from "@/components/product/Finishes";
import { Gallery } from "@/components/product/Gallery";
import { PriceAndStock } from "@/components/product/PriceAndStock";
import { RequiredWith } from "@/components/product/RequiredWith";
import { SpecTable } from "@/components/product/SpecTable";
import { WarrantyTable } from "@/components/product/WarrantyTable";
import { Section } from "@/components/ui/Section";
import { toCustomerProduct } from "@/lib/product/map";
import { productSource } from "@/lib/product/fixture-source";
import { normaliseSku } from "@/lib/product/source";
import { isVisibleTo } from "@/lib/product/visibility";

type PageProps = { params: Promise<{ sku: string }> };

/**
 * The audience is anonymous for now. When staff sign-in lands this reads the session
 * instead — the visibility rule and the staff section are the only things that change.
 */
const AUDIENCE = "customer" as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sku } = await params;
  const normalised = normaliseSku(sku);
  if (!normalised) return { title: "Product not found — ABI Interiors" };

  const result = await productSource.lookupBySku(normalised);
  if (result.kind === "not-found" || !isVisibleTo(result.product, AUDIENCE)) {
    return { title: "Product not found — ABI Interiors" };
  }

  return {
    title: `${result.product.name} — ABI Interiors`,
    description: `SKU ${result.product.sku}. Showroom product details.`,
  };
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12">{children}</main>
  );
}

/** Shown for a code that resolves to nothing, and for a code a customer may not see. */
function Unavailable({
  heading,
  body,
  sku,
  demoSkus,
}: {
  heading: string;
  body: string;
  sku: string;
  demoSkus: string[];
}) {
  return (
    <Shell>
      <div className="mx-auto max-w-md py-10 text-center">
        <p className="eyebrow">SKU {sku}</p>
        <h1 className="font-display mt-3 text-3xl">{heading}</h1>
        <p className="mt-4 text-ink-soft leading-relaxed">{body}</p>

        {demoSkus.length > 0 && (
          <p className="mt-10 border-t border-rule pt-5 text-sm text-ink-faint">
            Demo build — the fixture dataset only contains{" "}
            {demoSkus.map((demoSku, index) => (
              <span key={demoSku}>
                {index > 0 && ", "}
                <Link href={`/p/${demoSku}`} className="underline underline-offset-2">
                  {demoSku}
                </Link>
              </span>
            ))}
            .
          </p>
        )}
      </div>
    </Shell>
  );
}

export default async function ProductPage({ params }: PageProps) {
  const { sku: rawSku } = await params;
  const sku = normaliseSku(rawSku);

  // A mangled code is rejected without a lookup — a bad scan should not cost a
  // round trip to the data source.
  if (!sku) {
    return (
      <Unavailable
        sku={rawSku}
        heading="That code isn't valid"
        body="The scanned label doesn't contain a usable product code. Please ask a showroom consultant for help."
        demoSkus={[]}
      />
    );
  }

  const result = await productSource.lookupBySku(sku);
  const demoSkus = productSource.isFixture ? productSource.availableSkus() : [];

  if (result.kind === "not-found") {
    return (
      <Unavailable
        sku={sku}
        heading="Product not found"
        body="This label may be out of date, or the product may no longer be available. A showroom consultant can find the current details for you."
        demoSkus={demoSkus}
      />
    );
  }

  if (result.matchCount > 1) {
    // Duplicate SKUs in Woo are a data problem someone has to fix; the customer still
    // gets a page, but it should not pass silently.
    console.warn(
      `[showroom-qr] SKU ${sku} matched ${result.matchCount} records in region au; rendering the first.`,
    );
  }

  // Showrooms display pre-launch and hidden products routinely. Staff get to see them;
  // customers must not, because the price and stock on a draft record are not committed to.
  if (!isVisibleTo(result.product, AUDIENCE)) {
    return (
      <Unavailable
        sku={sku}
        heading="Not published yet"
        body="This piece is on display ahead of its release, so the details aren't public. A showroom consultant can tell you about it."
        demoSkus={demoSkus}
      />
    );
  }

  const product = toCustomerProduct(result.product);

  return (
    <Shell>
      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <div className="md:sticky md:top-8 md:self-start">
          <Gallery images={product.images} productName={product.name} />
        </div>

        <div className="space-y-8">
          <header>
            <p className="eyebrow">
              {product.colour ? `${product.colour} · ` : ""}SKU {product.sku}
            </p>
            <h1 className="font-display mt-2 text-3xl leading-tight sm:text-4xl">
              {product.name}
            </h1>
            <div className="mt-5">
              <PriceAndStock product={product} />
            </div>

            {product.badges.length > 0 && (
              <ul className="mt-5 flex items-center gap-3">
                {product.badges.map((badge) => (
                  <li key={badge.url}>
                    {/* Award badge art is arbitrary remote SVG/PNG; not worth routing
                        through the image optimiser. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={badge.url} alt={badge.name} title={badge.name} className="h-10 w-auto" />
                  </li>
                ))}
              </ul>
            )}
          </header>

          {product.features.length > 0 && (
            <ul className="flex flex-wrap gap-x-3 gap-y-2">
              {product.features.map((feature) => (
                <li
                  key={feature}
                  className="border border-rule bg-surface px-3 py-1.5 text-xs text-ink-soft"
                >
                  {feature}
                </li>
              ))}
            </ul>
          )}

          <RequiredWith requires={product.requires} noteHtml={product.requiresNoteHtml} />

          {product.descriptionHtml && (
            <div
              className="rich-text text-[0.9375rem] text-ink-soft"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          )}

          {product.finishes.length > 1 && (
            <Section title={`Available finishes (${product.finishes.length})`}>
              <Finishes finishes={product.finishes} />
            </Section>
          )}

          {product.specs.length > 0 && (
            <Section title="Specifications">
              <SpecTable specs={product.specs} />
            </Section>
          )}

          {(product.wels || product.watermark) && (
            <Section title="Ratings and certification">
              <dl className="grid gap-4 sm:grid-cols-2">
                {product.wels && (
                  <div className="border border-rule bg-surface p-4">
                    <dt className="eyebrow">WELS water rating</dt>
                    <dd className="mt-1">
                      <span className="font-display text-2xl">{product.wels.rating}</span>
                      <span className="text-ink-faint"> / 6 stars</span>
                      {product.wels.litres && (
                        <span className="block text-sm text-ink-soft">
                          {product.wels.litres} litres per minute
                        </span>
                      )}
                      {product.wels.registration && (
                        <span className="block text-xs text-ink-faint">
                          Registration {product.wels.registration}
                        </span>
                      )}
                    </dd>
                  </div>
                )}
                {product.watermark && (
                  <div className="border border-rule bg-surface p-4">
                    <dt className="eyebrow">WaterMark certified</dt>
                    <dd className="mt-1 text-sm text-ink-soft">
                      <span className="block">{product.watermark.standard}</span>
                      <span className="block text-xs text-ink-faint">
                        Licence {product.watermark.licenseNumber}
                      </span>
                    </dd>
                  </div>
                )}
              </dl>
            </Section>
          )}

          {product.warranty.length > 0 && (
            <Section title="Warranty">
              <WarrantyTable warranty={product.warranty} />
            </Section>
          )}

          {product.specImage && (
            <Section title="Dimensions">
              {/* Brandfolder serves these as SVG converted on the fly; the image
                  optimiser has nothing to add and would reject the SVG. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.specImage}
                alt={`Dimension drawing for ${product.name}`}
                loading="lazy"
                className="w-full max-w-md bg-surface border border-rule"
              />
            </Section>
          )}

          {product.documents.length > 0 && (
            <Section title="Documents">
              <DownloadList items={product.documents} />
            </Section>
          )}

          {product.downloads3d.length > 0 && (
            <Section title="CAD and BIM">
              <DownloadList items={product.downloads3d} />
            </Section>
          )}

          {product.faqs.length > 0 && (
            <Section title="Questions">
              <Faqs faqs={product.faqs} />
            </Section>
          )}

          <Section title="Buy this product">
            <a
              href={product.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-ink px-6 py-3 text-sm text-canvas transition-opacity hover:opacity-85"
            >
              View on abiinteriors.com.au
              <span aria-hidden>↗</span>
            </a>
            <p className="mt-3 text-sm text-ink-faint">
              Or ask a showroom consultant — quote SKU {product.sku}.
            </p>
          </Section>

          {productSource.isFixture && (
            <p className="border-t border-rule pt-5 text-xs text-ink-faint">
              Demo build. Rendered from the fixture dataset, not live gateway data.
            </p>
          )}
        </div>
      </div>
    </Shell>
  );
}
