import sanitizeHtml from "sanitize-html";

import {
  decodeEntities,
  finishLabel,
  humanise,
  parsePrice,
  stockLabel,
  warrantyPeriod,
} from "./format";
import type { CustomerProduct, GatewayProduct, WarrantyPeriods } from "./types";

/**
 * Fields the customer page requests from the gateway.
 *
 * In production this becomes the `source=` query parameter, which is how `unitCost`
 * is kept out — the field is never asked for, so it never enters the server process.
 * That is deliberately stronger than fetching everything and deleting the cost in a
 * template, which only holds until someone edits the template.
 *
 * `id`, `region`, `wooId`, `sku`, `name` and `type` are always returned by the
 * gateway regardless of this list.
 */
export const CUSTOMER_SOURCE_FIELDS = [
  "status",
  "catalogVisibility",
  "colour",
  "regularPrice",
  "salePrice",
  "stockStatus",
  "stockQuantity",
  "lowStockAmount",
  "manageStock",
  "images",
  "brandfolderImageToggle",
  "brandfolderImages",
  "brandfolderSpecImage",
  "attributes",
  "feature",
  "shortDescription",
  "documents",
  "downloads",
  "faqs",
  "warrantyResults",
  "rainbowFamily",
  "awardBadges",
  "welsRating",
  "welsLitres",
  "welsRegistration",
  "xSell",
  "infoDoc",
  "permalink",
] as const;

/** Product copy in Woo is authored HTML, so it is sanitised rather than trusted. */
const RICH_TEXT = {
  allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "a", "sup", "sub"],
  allowedAttributes: { a: ["href"] },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", {
      target: "_blank",
      rel: "noopener noreferrer",
    }),
  },
} satisfies sanitizeHtml.IOptions;

/** Spec table cells carry `<br>` and the occasional link, but never block structure. */
const INLINE_TEXT = {
  allowedTags: ["br", "strong", "b", "em", "i", "a", "sup", "sub"],
  allowedAttributes: { a: ["href"] },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: RICH_TEXT.transformTags,
} satisfies sanitizeHtml.IOptions;

function gallery(product: GatewayProduct): { src: string; alt: string }[] {
  // `images` normally holds a single hero shot; the real gallery is the Brandfolder
  // set, switched on per product by `brandfolderImageToggle`.
  const useBrandfolder =
    product.brandfolderImageToggle === "yes" && product.brandfolderImages.length > 0;

  const chosen = useBrandfolder
    ? product.brandfolderImages.map((image) => ({
        src: image.src,
        alt: image.name || product.name,
      }))
    : product.images.map((image) => ({ src: image.src, alt: product.name }));

  const seen = new Set<string>();
  return chosen.filter(({ src }) => {
    if (!src || seen.has(src)) return false;
    seen.add(src);
    return true;
  });
}

function specs(product: GatewayProduct): { name: string; valueHtml: string }[] {
  const rows: { name: string; valueHtml: string }[] = [];

  // Attributes carry a `visible` flag. "What's In The Box" ships as visible: false on
  // real records, so rendering the whole array would expose content Woo hides.
  for (const attribute of [...product.attributes].sort((a, b) => a.position - b.position)) {
    if (!attribute.visible) continue;
    if (!attribute.value?.trim()) continue;
    // Colour and brand already lead the page; repeating them in the table is noise.
    if (attribute.name === "COLOUR" || attribute.name === "Brand") continue;
    rows.push({
      name: decodeEntities(attribute.name),
      valueHtml: sanitizeHtml(attribute.value.replace(/\n/g, "<br />"), INLINE_TEXT),
    });
  }

  for (const spec of product.infoDoc.spec_attribute ?? []) {
    // Real records carry padding rows with both name and value empty.
    if (!spec.name?.trim() || !spec.value?.trim()) continue;
    const name = decodeEntities(spec.name);
    if (rows.some((row) => row.name === name)) continue;
    rows.push({ name, valueHtml: sanitizeHtml(spec.value, INLINE_TEXT) });
  }

  return rows;
}

function warranty(product: GatewayProduct): CustomerProduct["warranty"] {
  const result = product.warrantyResults[0];
  if (!result) return [];

  const rows: CustomerProduct["warranty"] = [];
  for (const [key, value] of Object.entries(result)) {
    if (key === "name" || key === "sku") continue;
    if (!value || typeof value !== "object") continue;
    const periods = value as WarrantyPeriods;
    rows.push({
      component: humanise(key),
      residential: warrantyPeriod(periods.residential),
      commercial: warrantyPeriod(periods.non_residential),
    });
  }
  return rows;
}

function watermarkOf(product: GatewayProduct): CustomerProduct["watermark"] {
  const attribute = product.infoDoc.watermark_attribute;
  if (!attribute) return null;

  const standard = attribute.standard?.trim();
  const licence = attribute.license_number?.trim();
  if (!standard || !licence || licence.toUpperCase() === "NO") return null;

  return { licenseNumber: licence, standard };
}

function downloads3d(product: GatewayProduct): { label: string; link: string }[] {
  // `bim` holds path fragments rather than URLs, so only `downloads` is linkable.
  const labels: Record<keyof GatewayProduct["downloads"], string> = {
    rfa: "Revit family (.rfa)",
    dwg: "CAD drawing (.dwg)",
    highPoly: "3D model — high poly",
    lowPoly: "3D model — low poly",
  };

  return (Object.keys(labels) as (keyof GatewayProduct["downloads"])[]).flatMap((key) => {
    const link = product.downloads[key];
    return link ? [{ label: labels[key], link }] : [];
  });
}

export function toCustomerProduct(product: GatewayProduct): CustomerProduct {
  const group = product.rainbowFamily[0]?.group_name ?? product.name;

  return {
    sku: product.sku,
    name: product.name,
    colour: product.colour,

    images: gallery(product),
    specImage: product.brandfolderSpecImage[0]?.src ?? product.infoDoc.spec_image ?? null,

    features: [
      product.feature.feature_1,
      product.feature.feature_2,
      product.feature.feature_3,
    ].filter((feature): feature is string => Boolean(feature?.trim())),

    descriptionHtml: sanitizeHtml(product.shortDescription, RICH_TEXT),

    regularPrice: parsePrice(product.regularPrice),
    salePrice: parsePrice(product.salePrice),

    stock: {
      ...stockLabel(product.stockStatus, product.stockQuantity, product.lowStockAmount),
      quantity: product.manageStock ? product.stockQuantity : null,
    },

    specs: specs(product),

    // Empty on products where it does not apply — a filter tap has no WELS rating.
    wels: product.welsRating
      ? {
          rating: product.welsRating,
          litres: product.welsLitres,
          registration: product.welsRegistration,
        }
      : null,

    // The block exists on products that are NOT certified: a real kitchen sink carries
    // `{ license_number: "NO", standard: "" }`. Presence alone is not certification, and
    // rendering a WaterMark badge off it would be a false compliance claim, so both a
    // standard and a real licence number are required.
    watermark: watermarkOf(product),

    warranty: warranty(product),

    documents: [
      ...product.documents
        .filter((document) => Boolean(document.link))
        .map((document) => ({ label: document.label || document.name, link: document.link })),
      ...(product.infoDoc.install_doc
        ? [{ label: "Installation guide", link: product.infoDoc.install_doc }]
        : []),
    ],

    downloads3d: downloads3d(product),

    // Answers are authored HTML on real records — some wrapped in <p>, one with an
    // unclosed tag — so they are sanitised and rendered as markup rather than as text.
    faqs: product.faqs
      .filter((faq) => faq.faq_title?.trim() && faq.faq_desc?.trim())
      .map((faq) => ({
        question: decodeEntities(faq.faq_title),
        answerHtml: sanitizeHtml(faq.faq_desc, RICH_TEXT),
      })),

    finishes: product.rainbowFamily.map((sibling) => ({
      sku: sibling.sku,
      name: sibling.name,
      label: finishLabel(sibling.name, sibling.group_name || group),
      isCurrent: sibling.sku === product.sku,
    })),

    badges: product.awardBadges.filter((badge) => Boolean(badge.url)),

    // A filter tap that cannot run without a separate filtration system is exactly
    // the thing a customer standing in the showroom needs told up front.
    requires: (product.xSell?.set ?? [])
      .filter((item) => item.type?.includes("Req"))
      .map((item) => ({ sku: item.sku, name: item.name })),

    requiresNoteHtml: sanitizeHtml(product.xSell?.description ?? "", RICH_TEXT),

    permalink: product.permalink,
  };
}
