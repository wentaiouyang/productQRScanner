/**
 * Product types.
 *
 * `GatewayProduct` mirrors the real shape returned by
 * `GET /tyche/wooproducts/search/advanced` on the ABI Gateway, verified against a
 * live AU record (SKU 16243) on 2026-07-30. Only the fields this app actually reads
 * are declared — the real record has many more.
 *
 * `CustomerProduct` is the view model rendered to anonymous showroom customers.
 * It deliberately has NO cost field of any kind: `unitCost` cannot reach a customer
 * because there is nowhere in this type to put it.
 */

export type StockStatus = "instock" | "outofstock" | "onbackorder";

export type WarrantyPeriods = {
  residential: string;
  non_residential: string;
  outdoor: string;
};

/** Keys vary by product category (`cartridge` exists on tapware, not on cabinetry). */
export type WarrantyResult = {
  name: string;
  sku: string;
} & Record<string, WarrantyPeriods | string>;

export type GatewayProduct = {
  id: string;
  region: string;
  wooId: number;
  sku: string;
  name: string;
  type: string;

  status: string;
  catalogVisibility: string;

  colour: string;

  /** Keyword strings, not numbers. Never range-filter these in a gateway query. */
  regularPrice: string;
  salePrice: string;
  /**
   * Staff-only. In production this is excluded at the query layer via `source=`,
   * so it never enters the server process for a customer request. It is present in
   * the fixtures precisely so the mapper can be seen dropping it.
   */
  unitCost?: string;

  stockStatus: StockStatus | string;
  stockQuantity: number | null;
  lowStockAmount: number | null;
  manageStock: boolean;
  /** Restock date as free text. Empty on most records. */
  eta: string;

  /** Usually a single hero image. The gallery lives in `brandfolderImages`. */
  images: { id: number; src: string }[];
  brandfolderImageToggle: string;
  brandfolderImages: { src: string; name: string; date_modified?: string }[];
  brandfolderSpecImage: { src: string; name: string; date_modified?: string }[];

  /** `visible: false` entries are internal and must not be shown to customers. */
  attributes: {
    name: string;
    value: string;
    visible: boolean;
    position: number;
    variation: boolean;
  }[];

  feature: { feature_1?: string; feature_2?: string; feature_3?: string };
  shortDescription: string;

  documents: { name: string; label: string; link: string }[];
  downloads: { lowPoly: string; highPoly: string; rfa: string; dwg: string };
  /**
   * Path fragments and library slugs, not URLs — `{ product_3d_files: "mini-water-filter-tap" }`.
   * Declared so it is clear this cannot be linked directly; `downloads` is the linkable one.
   */
  bim: { product_3d_files: string; collection_3d_files: string; range_3d_files: string };

  faqs: { faq_title: string; faq_desc: string }[];
  warrantyResults: WarrantyResult[];

  rainbowFamily: {
    group_name: string;
    id: string | null;
    sku: string;
    name: string;
  }[];

  awardBadges: { name: string; url: string }[];

  welsRating: string;
  welsLitres: string;
  welsRegistration: string;

  xSell: {
    name: string;
    description: string;
    set: { sku: string; name: string; type: string[] }[];
  };

  infoDoc: {
    install_doc?: string;
    spec_image?: string;
    spec_attribute?: { name: string; value: string }[];
    watermark_attribute?: {
      license_number: string;
      standard: string;
      watermark_image: string;
    };
  };

  permalink: string;
  wistiaId: string;

  /**
   * Shipping carton dimensions, NOT product dimensions. Declared so nobody
   * mistakes it for something displayable — product size lives in `attributes`.
   */
  dimensions: { height: string; width: string; length: string };
};

export type StockTone = "good" | "low" | "made-to-order" | "unavailable";

export type CustomerProduct = {
  sku: string;
  name: string;
  colour: string;

  images: { src: string; alt: string }[];
  specImage: string | null;

  features: string[];
  descriptionHtml: string;

  regularPrice: number | null;
  salePrice: number | null;

  stock: {
    label: string;
    tone: StockTone;
    quantity: number | null;
  };

  specs: { name: string; valueHtml: string }[];

  wels: { rating: string; litres: string; registration: string } | null;
  watermark: { licenseNumber: string; standard: string } | null;

  warranty: { component: string; residential: string; commercial: string }[];

  documents: { label: string; link: string }[];
  downloads3d: { label: string; link: string }[];

  faqs: { question: string; answer: string }[];

  finishes: { sku: string; name: string; label: string; isCurrent: boolean }[];

  badges: { name: string; url: string }[];

  requires: { sku: string; name: string }[];
  requiresNoteHtml: string;

  permalink: string;
};
