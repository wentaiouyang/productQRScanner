import type { GatewayProduct } from "./types";

/**
 * Demo dataset.
 *
 * SKU 16243 is a verbatim copy of a live AU gateway record fetched on 2026-07-30, so
 * the page is exercised against the real field shapes — the visible/invisible attribute
 * mix, the Brandfolder gallery, the warranty matrix, the FAQ list, the required
 * cross-sell, the empty WELS fields, and `unitCost` sitting in the record waiting to
 * be dropped by the mapper.
 *
 * The other four are partly synthesised to cover states the first record does not
 * reach. What is real in each is noted on the fixture. Two things are invented outright
 * and must be re-checked against live data before anyone trusts them:
 *
 *  - `salePrice` on 16241. Every record sampled had `salePrice: ""`, so whether ABI
 *    uses the field at all is unverified.
 *  - the sibling images. Only 16243 and 16149 have real image URLs; the other Mini
 *    Water Filter Tap finishes reuse 16243's photography.
 */

const MINI_FILTER_TAP_FAMILY: GatewayProduct["rainbowFamily"] = [
  { group_name: "Mini Water Filter Tap", id: null, sku: "16243", name: "Mini Water Filter Tap - Brushed Gunmetal" },
  { group_name: "Mini Water Filter Tap", id: null, sku: "16242", name: "Mini Water Filter Tap - Brushed Copper" },
  { group_name: "Mini Water Filter Tap", id: null, sku: "16244", name: "Mini Water Filter Tap - Matte Black" },
  { group_name: "Mini Water Filter Tap", id: null, sku: "16241", name: "Mini Water Filter Tap - Brushed Brass" },
  { group_name: "Mini Water Filter Tap", id: null, sku: "16240", name: "Mini Water Filter Tap - Stainless Steel" },
  { group_name: "Mini Water Filter Tap", id: null, sku: "20318", name: "Mini Water Filter Tap - Antique Aurum" },
  { group_name: "Mini Water Filter Tap", id: null, sku: "20320", name: "Mini Water Filter Tap - Antique Steel" },
  { group_name: "Mini Water Filter Tap", id: null, sku: "20319", name: "Mini Water Filter Tap - Antique Slate" },
  { group_name: "Mini Water Filter Tap", id: null, sku: "20204", name: "Mini Water Filter Tap - Antique Bronze" },
];

const MINI_FILTER_TAP_IMAGES: GatewayProduct["brandfolderImages"] = [
  {
    date_modified: "2024-08-20T04:32:50.298Z",
    src: "https://cdn.bfldr.com/8266KQUL/at/sx95r63r9fgq9893pn3v55tk/Mini_Water_Filter_Tap_GM.png?format=jpg&crop=5156%2C5184%2Cx28%2Cy0&pad=0%2C28%2C0%2C0",
    name: "Mini Water Filter Tap GM",
  },
  {
    date_modified: "2024-08-20T04:45:28.158Z",
    src: "https://cdn.bfldr.com/8266KQUL/at/ngb8qmww5pnt3fs3sfxvh6v/Mini_Water_Filter_Tap_Commercial_V1_BG.jpg?format=png&crop=2200%2C2200%2Cx136%2Cy519",
    name: "Mini Water Filter Tap Commercial V1 BG",
  },
  {
    date_modified: "2024-08-20T05:22:52.122Z",
    src: "https://cdn.bfldr.com/8266KQUL/at/htm78m9jj9c4m82ghs3t/Mini_WaterFilterTap_View02_FINAL_GM_01.jpg?format=png&crop=2100%2C2100%2Cx12%2Cy487",
    name: "Mini WaterFilterTap View02 FINAL GM 01",
  },
  {
    date_modified: "2024-08-20T05:17:34.504Z",
    src: "https://cdn.bfldr.com/8266KQUL/at/qwftqpbm8kprs9b9632fjr4s/Mini_WaterFilterTap_View01_FINAL_GM_01.jpg?format=png&crop=2100%2C2100%2Cx57%2Cy334",
    name: "Mini WaterFilterTap View01 FINAL GM 01",
  },
];

const MINI_FILTER_TAP_DOCUMENTS: GatewayProduct["documents"] = [
  {
    name: "PRODUCT SPECIFICATION",
    label: "Mini Water Filter Tap - Specification",
    link: "https://info-document-uploads.s3.ap-southeast-2.amazonaws.com/Mini%20Filter%20Tap%20-%20Specification.pdf",
  },
  {
    name: "PRODUCT SPECIFICATION",
    label: "Mini Water Filter Tap - Scope of Use",
    link: "https://cdn.bfldr.com/8266KQUL/at/4vh8rwxgj6jsq5fk97x7sp/scope_of_use_-_Lead_Free_-_indoor_use_only.pdf",
  },
];

const MINI_FILTER_TAP_FAQS: GatewayProduct["faqs"] = [
  {
    faq_title: "Can the Mini Filter Tap work with all filter systems?",
    faq_desc:
      "Yes, this tap uses 6mm fridge hose connections and piping that align with the commonly available standard sizes in the market. If your filter system utilises a different-sized connection, adapters are readily accessible for purchase elsewhere for compatibility.",
  },
  {
    faq_title: "Can the tap work with boiling water units?",
    faq_desc:
      "No, connecting this tap to a boiling water unit system is extremely dangerous, as it is incompatible with temperatures exceeding 75 degrees Celsius.",
  },
  {
    faq_title: "What is the hole size for benchtop installation?",
    faq_desc: "We recommend a 30mm diameter hole; however, up to 35mm is acceptable.",
  },
  {
    faq_title: "How do I turn the water on?",
    faq_desc:
      "The side-mounted paddle-style handle of the tap operates by a 90-degree rotation, with the direction dependent on the tap's installation location and the swivel spout's orientation.",
  },
  {
    faq_title: "Is the tap water chilled or ambient?",
    faq_desc:
      "The Mini Water Filter Tap dispenses ambient filtered water as standard. If you prefer chilled filtered water, a compatible under-bench chiller can be installed. Chiller units are sold separately and are not supplied by ABI Interiors. As compatibility varies between systems, we recommend consulting a licensed plumber to ensure the chiller is suitable for your installation.",
  },
];

const MINI_FILTER_TAP_XSELL: GatewayProduct["xSell"] = {
  name: "Mini Water Filter Tap - Filter Unit - X-Sell",
  set: [{ sku: "15911", name: "3 Stage Undersink Water Filter System", type: ["Req"] }],
  description:
    '<p>Our Mini Water Filter Tap requires a <strong>3 Stage Undersink Water Filter System</strong>. This component is sold separately. You can purchase one below.&nbsp;</p>',
};

const MINI_FILTER_TAP_INFO_DOC: GatewayProduct["infoDoc"] = {
  install_doc:
    "https://cdn.bfldr.com/8266KQUL/at/pkk5pkwmmn7gb6xpgznnf7pf/MFFD_Mini_Filter_Tap_Install.pdf",
  spec_image:
    "https://cdn.bfldr.com/8266KQUL/at/2zmh8fnwszfjkkrgm8np8t8/Filter_Tap_GALLERY_SPEC-01.svg",
  spec_attribute: [
    { name: "Material", value: "Stainless Steel 304" },
    {
      name: "Temperature Rating",
      value:
        "Maximum continuous working temperature 75°C<br>If the water temperature exceeds 75°C, an approved tempering valve<br>must be fitted",
    },
    {
      name: "Pressure Rating",
      value:
        "Recommended minimum working pressure 150kPa<br>Recommended maximum working pressure 350kPa",
    },
  ],
  watermark_attribute: {
    license_number: "WM-022852",
    standard: "AS 3718:2021",
    watermark_image: "lead-free",
  },
};

function miniFilterTapAttributes(colour: string, finish: string): GatewayProduct["attributes"] {
  return [
    { name: "Brand", value: "ABI Interiors", visible: true, position: 1, variation: false },
    { name: "COLOUR", value: colour, visible: true, position: 2, variation: false },
    { name: "Construction", value: "304 Stainless Steel", visible: true, position: 3, variation: false },
    { name: "Finish/Coating", value: finish, visible: true, position: 4, variation: false },
    {
      name: "Dimensions",
      value: "Height: 287mm \nReach: 150m\nHole Size: 30-35mm",
      visible: true,
      position: 5,
      variation: false,
    },
    // Deliberately invisible on the real record — the page must not render this.
    {
      name: "What's In The Box",
      value: "1 x Filter Tap\n1 x 2mm Allan Key\n1 x 2.5mm Allan Key\n1 x Aerator Key",
      visible: false,
      position: 6,
      variation: false,
    },
    { name: "Swivel", value: "Yes", visible: true, position: 7, variation: false },
    { name: "Filtration", value: "Filtration System Not Included", visible: true, position: 8, variation: false },
    { name: "ETA", value: "", visible: true, position: 9, variation: false },
    { name: "Mount Type", value: "Bench-mounted", visible: true, position: 10, variation: false },
  ];
}

function miniFilterTapWarranty(name: string, sku: string): GatewayProduct["warrantyResults"] {
  return [
    {
      name,
      sku,
      structure: { residential: "Lifetime", non_residential: "Lifetime", outdoor: "0" },
      finish: { residential: "15", non_residential: "15", outdoor: "0" },
      cartridge: { residential: "Lifetime", non_residential: "Lifetime", outdoor: "0" },
      other: { residential: "2", non_residential: "2", outdoor: "0" },
    },
  ];
}

/**
 * Fields every fixture shares. Each fixture is still typed as a full `GatewayProduct`,
 * so TypeScript catches anything left unset rather than letting it default silently.
 *
 * `dimensions` here is the shipping carton, matching the real record — the page must
 * never present it as the product's size.
 */
const SHARED_DEFAULTS = {
  region: "au",
  type: "simple",
  manageStock: true,
  eta: "",
  brandfolderImageToggle: "yes",
  downloads: { lowPoly: "", highPoly: "", rfa: "", dwg: "" },
  bim: { product_3d_files: "", collection_3d_files: "", range_3d_files: "" },
  wistiaId: "",
  dimensions: { height: "6.5", width: "21", length: "46.5" },
} satisfies Partial<GatewayProduct>;

/** SKU 16243 — verbatim from the live AU gateway record. */
const MINI_FILTER_TAP_GUNMETAL: GatewayProduct = {
  ...SHARED_DEFAULTS,
  id: "AU-1107868",
  wooId: 1107868,
  sku: "16243",
  name: "Mini Water Filter Tap - Brushed Gunmetal",
  colour: "Brushed Gunmetal",
  status: "publish",
  catalogVisibility: "visible",
  regularPrice: "399.90",
  salePrice: "",
  unitCost: "88.79",
  stockStatus: "instock",
  stockQuantity: 22,
  lowStockAmount: null,
  images: [
    {
      id: 1248299,
      src: "https://www.abiinteriors.com.au/wp-content/uploads/Mini_Water_Filter_Tap_GM-scaled.jpg",
    },
  ],
  brandfolderImages: MINI_FILTER_TAP_IMAGES,
  brandfolderSpecImage: [
    {
      date_modified: "2024-08-23T03:27:10.480Z",
      src: "https://cdn.bfldr.com/8266KQUL/at/2zmh8fnwszfjkkrgm8np8t8/MiniFilterTap_GallerySpec-01.svg?format=png&auto=webp&width=960&height=960&canvas=1000,1000,offset-y90,offset-x10&fit=bounds&bg-color=255,255,255",
      name: "MiniFilterTap GallerySpec-01",
    },
  ],
  attributes: miniFilterTapAttributes(
    "Brushed Gunmetal",
    "Brushed Gunmetal - ABI's Heat Shield – Industrial Grade PVD Electro Colouring System",
  ),
  feature: {
    feature_1: "304 Stainless Steel",
    feature_2: "PVD (Physical Vapour Deposition)",
    feature_3: "360 Degree Swivel Spout",
  },
  shortDescription:
    '<p>This Mini Filter Tap offers premium, filtered water without the hassle of installing a new kitchen tap filtration bundle.</p>\n<p>Made from durable, lead-free 304 stainless steel, this tap is suitable for residential and commercial use with its 360-degree rotating spout with 150mm reach to suit a range of bottle sizes for filling convenience.</p>\n<p>The innovative in-line cartridge system used within this tap ensures a minimalist and slender design, pioneering as one of the first options of its kind in the market.</p>\n<p><strong>Please note:</strong> This Mini Filter Tap is compatible with our&nbsp;<a href="https://www.abiinteriors.com.au/product/3-stage-undersink-water-filter-system/"><strong>3-Stage Undersink Water Filter System</strong></a>&nbsp;—&nbsp;sold separately.</p>',
  documents: MINI_FILTER_TAP_DOCUMENTS,
  faqs: MINI_FILTER_TAP_FAQS,
  warrantyResults: miniFilterTapWarranty("Mini Water Filter Tap - Brushed Gunmetal", "16243"),
  rainbowFamily: MINI_FILTER_TAP_FAMILY,
  awardBadges: [
    {
      name: "Good Design Award",
      url: "https://cdn.bfldr.com/8266KQUL/at/nbq87m8gqrbzv3qbhz57jnk/GDA-Winner-icon.png?auto=webp&format=png",
    },
  ],
  welsRating: "",
  welsLitres: "",
  welsRegistration: "",
  xSell: MINI_FILTER_TAP_XSELL,
  infoDoc: MINI_FILTER_TAP_INFO_DOC,
  permalink: "https://www.abiinteriors.com.au/product/mini-water-filter-tap-brushed-gunmetal/",
};

/**
 * SKU 16241 — real SKU, name and family. Stock dropped to 3 to reach the low-stock
 * state, and `salePrice` invented to exercise the discount layout. Images reused.
 */
const MINI_FILTER_TAP_BRASS: GatewayProduct = {
  ...MINI_FILTER_TAP_GUNMETAL,
  id: "AU-1107866",
  wooId: 1107866,
  sku: "16241",
  name: "Mini Water Filter Tap - Brushed Brass",
  colour: "Brushed Brass",
  regularPrice: "399.90",
  salePrice: "349.90",
  unitCost: "88.79",
  stockQuantity: 3,
  attributes: miniFilterTapAttributes(
    "Brushed Brass",
    "Brushed Brass - ABI's Heat Shield – Industrial Grade PVD Electro Colouring System",
  ),
  warrantyResults: miniFilterTapWarranty("Mini Water Filter Tap - Brushed Brass", "16241"),
  permalink: "https://www.abiinteriors.com.au/product/mini-water-filter-tap-brushed-brass/",
};

/** SKU 16240 — real SKU and name, put on backorder to reach the made-to-order state. */
const MINI_FILTER_TAP_STAINLESS: GatewayProduct = {
  ...MINI_FILTER_TAP_GUNMETAL,
  id: "AU-1107865",
  wooId: 1107865,
  sku: "16240",
  name: "Mini Water Filter Tap - Stainless Steel",
  colour: "Stainless Steel",
  stockStatus: "onbackorder",
  stockQuantity: 0,
  attributes: miniFilterTapAttributes("Stainless Steel", "Brushed 304 Stainless Steel"),
  warrantyResults: miniFilterTapWarranty("Mini Water Filter Tap - Stainless Steel", "16240"),
  permalink: "https://www.abiinteriors.com.au/product/mini-water-filter-tap-stainless-steel/",
};

/** SKU 20204 — real SKU and name, forced to draft so the customer block is reachable. */
const MINI_FILTER_TAP_ANTIQUE_BRONZE: GatewayProduct = {
  ...MINI_FILTER_TAP_GUNMETAL,
  id: "AU-1245001",
  wooId: 1245001,
  sku: "20204",
  name: "Mini Water Filter Tap - Antique Bronze",
  colour: "Antique Bronze",
  status: "draft",
  stockQuantity: 6,
  attributes: miniFilterTapAttributes(
    "Antique Bronze",
    "Antique Bronze - ABI's Living Finish, hand-applied",
  ),
  warrantyResults: miniFilterTapWarranty("Mini Water Filter Tap - Antique Bronze", "20204"),
  permalink: "https://www.abiinteriors.com.au/product/mini-water-filter-tap-antique-bronze/",
};

/**
 * SKU 16149 — real SKU, name, colour, price, stock, features, image, permalink and
 * WELS block (rating 5, 6 L/min, registration T43080) from the live record. Specs,
 * documents, FAQs, warranty and family are synthesised.
 */
const ELYSIAN_PULLOUT_BRASS: GatewayProduct = {
  ...SHARED_DEFAULTS,
  id: "AU-1085425",
  wooId: 1085425,
  sku: "16149",
  name: "Elysian Commercial 3-Way Pull-Out Filter Tap - Brushed Brass",
  colour: "Brushed Brass",
  status: "publish",
  catalogVisibility: "visible",
  regularPrice: "884.90",
  salePrice: "",
  unitCost: "241.50",
  stockStatus: "instock",
  stockQuantity: 95,
  lowStockAmount: null,
  images: [
    {
      id: 1155341,
      src: "https://www.abiinteriors.com.au/wp-content/uploads/elysian_3way_filter_pullout_mixer_BB.jpg",
    },
  ],
  brandfolderImageToggle: "no",
  brandfolderImages: [],
  brandfolderSpecImage: [],
  attributes: [
    { name: "Brand", value: "ABI Interiors", visible: true, position: 1, variation: false },
    { name: "COLOUR", value: "Brushed Brass", visible: true, position: 2, variation: false },
    { name: "Construction", value: "304 Stainless Steel", visible: true, position: 3, variation: false },
    {
      name: "Dimensions",
      value: "Height: 465mm\nReach: 220mm\nHole Size: 32-35mm",
      visible: true,
      position: 4,
      variation: false,
    },
    { name: "Mount Type", value: "Bench-mounted", visible: true, position: 5, variation: false },
    { name: "Swivel", value: "Yes", visible: true, position: 6, variation: false },
    {
      name: "Internal Notes",
      value: "Commercial range — confirm lead time with supplier before quoting.",
      visible: false,
      position: 7,
      variation: false,
    },
  ],
  feature: {
    feature_1: "PVD (Physical Vapour Deposition)",
    feature_2: "304 Stainless Steel",
    feature_3: "Precise Temperature Control",
  },
  shortDescription:
    "<p>The Elysian Commercial 3-Way Pull-Out Filter Tap combines hot, cold and filtered water in a single fitting, with a pull-out spray head for commercial kitchen use.</p>\n<p>Finished in Brushed Brass using ABI's HeatShield PVD process for corrosion resistance in high-traffic environments.</p>",
  documents: [
    {
      name: "PRODUCT SPECIFICATION",
      label: "Elysian Commercial 3-Way Pull-Out Filter Tap - Specification",
      link: "https://info-document-uploads.s3.ap-southeast-2.amazonaws.com/Mini%20Filter%20Tap%20-%20Specification.pdf",
    },
  ],
  faqs: [
    {
      faq_title: "Does this tap include a filtration system?",
      faq_desc:
        "No. The filtered water outlet requires a separate undersink filtration system, sold separately.",
    },
  ],
  warrantyResults: [
    {
      name: "Elysian Commercial 3-Way Pull-Out Filter Tap - Brushed Brass",
      sku: "16149",
      structure: { residential: "Lifetime", non_residential: "10", outdoor: "0" },
      finish: { residential: "15", non_residential: "7", outdoor: "0" },
      cartridge: { residential: "Lifetime", non_residential: "5", outdoor: "0" },
    },
  ],
  rainbowFamily: [
    {
      group_name: "Elysian Commercial 3-Way Pull-Out Filter Tap",
      id: null,
      sku: "16149",
      name: "Elysian Commercial 3-Way Pull-Out Filter Tap - Brushed Brass",
    },
  ],
  awardBadges: [],
  welsRating: "5",
  welsLitres: "6",
  welsRegistration: "T43080",
  xSell: { name: "", set: [], description: "" },
  infoDoc: {
    spec_attribute: [
      { name: "Material", value: "Stainless Steel 304" },
      {
        name: "Pressure Rating",
        value:
          "Recommended minimum working pressure 150kPa<br>Recommended maximum working pressure 500kPa",
      },
    ],
  },
  permalink:
    "https://www.abiinteriors.com.au/product/elysian-commercial-3-way-pull-out-filter-tap-brushed-brass/",
};

export const FIXTURES: GatewayProduct[] = [
  MINI_FILTER_TAP_GUNMETAL,
  MINI_FILTER_TAP_BRASS,
  MINI_FILTER_TAP_STAINLESS,
  ELYSIAN_PULLOUT_BRASS,
  MINI_FILTER_TAP_ANTIQUE_BRONZE,
];

export const FIXTURE_NOTES: Record<string, string> = {
  "16243": "Live gateway record, copied verbatim. In stock, no WELS rating, requires a filter system.",
  "16241": "Low stock (3) and a discounted price — the sale price is invented.",
  "16240": "On backorder, so it renders as made to order.",
  "16149": "Carries a WELS rating; no Brandfolder gallery, so it falls back to the single hero image.",
  "20204": "Status is draft — a customer must not see it, staff must.",
};
