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

/**
 * SKU 101671 — live record, near verbatim. Backs the sink hotspot in the panorama.
 *
 * Two things about this record drove real fixes, which is why it is here in full:
 * its `watermark_attribute` is `{ license_number: "NO", standard: "" }` — present but
 * meaning *not certified* — and its FAQ answers are authored HTML, one with an unclosed
 * tag. Its `downloads.dwg` is `null` rather than `""`.
 */
const ONTARIO_DOUBLE_SINK: GatewayProduct = {
  ...SHARED_DEFAULTS,
  id: "AU-4662",
  wooId: 4662,
  sku: "101671",
  name: "Ontario Double Kitchen Sink - Stainless Steel",
  colour: "Stainless Steel",
  status: "publish",
  catalogVisibility: "visible",
  regularPrice: "994.90",
  salePrice: "",
  unitCost: "298.40",
  stockStatus: "instock",
  stockQuantity: 39,
  lowStockAmount: 20,
  bim: {
    product_3d_files: "ontario-double-kitchen-sink",
    collection_3d_files: "",
    range_3d_files: "/bim-library",
  },
  downloads: {
    lowPoly:
      "https://abi-product-downloads.s3-ap-southeast-2.amazonaws.com/ONTARIO+Double+Kitchen+Sink+W+Strainer+-+Low+Polygon.ifc",
    highPoly:
      "https://abi-product-downloads.s3-ap-southeast-2.amazonaws.com/ONTARIO+Double+Kitchen+Sink+W+Strainer+-+High+Polygon.ifc",
    rfa: "https://abi-product-downloads.s3-ap-southeast-2.amazonaws.com/ONTARIO+Double+Kitchen+Sink+W+Strainer+-+RFA.rfa",
    dwg: null,
  },
  images: [
    {
      id: 1489070,
      src: "https://www.abiinteriors.com.au/wp-content/uploads/Ontario_double_sink_strainer_SS-scaled.jpg",
    },
  ],
  brandfolderImages: [
    {
      src: "https://cdn.bfldr.com/8266KQUL/at/p7hqrnpr87m969jgxkf8n5kc/Ontario_double_sink_strainer_SS.png?format=jpg&crop=5978%2C5971%2Cx0%2Cy29&pad=0%2C0%2C29%2C22",
      name: "Ontario double sink strainer SS",
    },
    {
      src: "https://cdn.bfldr.com/8266KQUL/at/gwxq9358skmhtsrg49tngzsv/Portum-48.jpg?format=jpg&crop=4023%2C4024%2Cx0%2Cy1064&pad=0%2C0%2C0%2C1",
      name: "Portum-48",
    },
    {
      src: "https://cdn.bfldr.com/8266KQUL/at/6q3vnzhrwjp8bs7vw9rjvhvz/Ontario-Rack-SS-Web.png?format=jpg&crop=1058%2C1080%2Cx22%2Cy0&pad=0%2C22%2C0%2C0",
      name: "Ontario-Rack-SS-Web",
    },
  ],
  brandfolderSpecImage: [
    {
      src: "https://cdn.bfldr.com/8266KQUL/at/kk9nvmsf8734sqf96smtrp/Ontario_Double_Kitchen_Sink_-_Specifications_1.gif?format=jpg&crop=999%2C1000%2Cx0%2Cy0&pad=0%2C0%2C0%2C1",
      name: "Ontario Double Kitchen Sink - Specifications 1",
    },
  ],
  attributes: [
    { name: "Brand", value: "ABI Interiors", visible: true, position: 1, variation: false },
    { name: "COLOUR", value: "Stainless Steel", visible: true, position: 2, variation: false },
    { name: "Construction", value: "304 Stainless steel", visible: true, position: 3, variation: false },
    { name: "Length", value: "1180mm", visible: true, position: 4, variation: false },
    { name: "Width", value: "450mm", visible: true, position: 5, variation: false },
    { name: "Depth", value: "250mm", visible: true, position: 6, variation: false },
    {
      name: "Capacity",
      value: "Left: 34.4L\nRight: 21.6L",
      visible: true,
      position: 7,
      variation: false,
    },
    {
      name: "Mount Type",
      value: "Under-mount or Top-mount",
      visible: true,
      position: 8,
      variation: false,
    },
    { name: "Bowl type", value: "Double with drainer", visible: true, position: 10, variation: false },
    // Note the HTML entity in the NAME — this is what decodeEntities exists for.
    {
      name: "What&#039;s In The Box",
      value:
        "1 x Ontario Double Kitchen Sink\n2 x Sink Wastes\n2 x Sink Protector Racks\n1 x Underbench Mounting Clips",
      visible: true,
      position: 11,
      variation: false,
    },
  ],
  feature: {
    feature_1: "304 Stainless Steel",
    feature_2: "Ease of Installation",
    feature_3: "WaterSense Cushion System",
  },
  shortDescription:
    "<p>The Ontario is a double bowl stainless steel sink that comes complete with an extended draining tray. It is fitted with ABI’s water-sense cushion system to dampen the sound of water impact during use. Its construction integrates folded drainage points to prevent the build-up of residue.</p>\n<p>The Ontario Double Kitchen Sink would also be suitable for the laundry room and can be mounted either above or below the bench.</p>",
  documents: [
    {
      name: "PRODUCT SPECIFICATION",
      label: "Ontario Double Kitchen Sink - Specification",
      link: "https://info-document-uploads.s3.ap-southeast-2.amazonaws.com/Ontario%20Double%20Kitchen%20Sink%20-%20Specification.pdf",
    },
  ],
  faqs: [
    {
      faq_title: "Can this sink be wall mounted?",
      faq_desc: "<p>No this sink is only designed for top mounting or undermounting to benchtops</p>",
    },
    {
      faq_title: "Do you have a waste to match the colour of the kitchen sink?",
      faq_desc: "<p>Yes all our basket wastes match the sink colour</p>",
    },
    {
      faq_title: "Is the sink suitable to pair with an Insinkerator?",
      faq_desc: "Our stainless steel kitchen sinks are compatible with an Insinkerator.",
    },
  ],
  warrantyResults: [
    {
      name: "Ontario Double Kitchen Sink - Stainless Steel",
      sku: "101671",
      structure: { residential: "Lifetime", non_residential: "10", outdoor: "0" },
      finish: { residential: "5", non_residential: "1", outdoor: "0" },
      other: { residential: "2", non_residential: "1", outdoor: "0" },
    },
  ],
  rainbowFamily: [
    { group_name: "Ontario Double Kitchen Sink", id: null, sku: "101661", name: "Ontario Double Kitchen Sink - Brushed Gunmetal" },
    { group_name: "Ontario Double Kitchen Sink", id: null, sku: "101651", name: "Ontario Double Kitchen Sink - Brushed Copper" },
    { group_name: "Ontario Double Kitchen Sink", id: null, sku: "101671", name: "Ontario Double Kitchen Sink - Stainless Steel" },
    { group_name: "Ontario Double Kitchen Sink", id: null, sku: "10447", name: "Ontario Double Kitchen Sink - Brushed Brass" },
  ],
  awardBadges: [],
  welsRating: "",
  welsLitres: "",
  welsRegistration: "",
  xSell: { name: "", set: [], description: "" },
  infoDoc: {
    install_doc:
      "https://cdn.bfldr.com/8266KQUL/at/j9q8p75g2mmt2qgvt6k8nv/ONTARIO_Double_Kitchen_Sink_INSTALL.pdf",
    spec_image:
      "https://cdn.bfldr.com/8266KQUL/at/ps6z8x9p93vn4vj9n54fqkjj/Ontario_Sink_SPEC-01.svg",
    spec_attribute: [
      { name: "Recommended Use", value: "Domestic/Commercial" },
      { name: "Installation", value: "Undermount, Top Mount" },
      { name: "Overflow", value: "No" },
      { name: "Capacity", value: "Left: 34.4L | Right: 21.6L" },
      // A real padding row: both fields empty. Must not become a spec line.
      { name: "", value: "" },
    ],
    // Present but NOT a certification — "NO" with no standard.
    watermark_attribute: { license_number: "NO", standard: "", watermark_image: "" },
  },
  permalink: "https://www.abiinteriors.com.au/product/ontario-double-kitchen-sink-stainless-steel/",
};

/**
 * SKU 15718 — live record. Backs the cabinetry hotspot.
 *
 * Two caveats worth knowing before this is shown to anyone: ABI's cabinetry range is
 * bathroom vanities, so in a kitchen scene it is a stand-in for the joinery rather than
 * the actual product; and this particular SKU's own description opens with "this product
 * is discontinued". Swap it for a current cabinetry SKU before any real demo.
 *
 * It is still a useful fixture: `manageStock` is false, so it exercises the path where a
 * quantity must not be shown.
 */
const ADDISON_VANITY: GatewayProduct = {
  ...SHARED_DEFAULTS,
  id: "AU-1051446",
  wooId: 1051446,
  sku: "15718",
  name: "Addison 4-Drawer with Shelves 1614mm - White Ash Oak",
  colour: "White Ash Oak",
  status: "publish",
  catalogVisibility: "visible",
  regularPrice: "1984.90",
  salePrice: "",
  unitCost: "742.10",
  stockStatus: "instock",
  stockQuantity: 0,
  lowStockAmount: null,
  manageStock: false,
  bim: {
    product_3d_files: "addison-4-drawer-vanity-with-shelves-1614mm",
    collection_3d_files: "Vanity-Collection",
    range_3d_files: "/bim-library",
  },
  images: [
    {
      id: 1462616,
      src: "https://www.abiinteriors.com.au/wp-content/uploads/Addison-1614mm-Drawer-w-Shelf-White-Ash-Oak-1_web-3-scaled.jpg",
    },
  ],
  brandfolderImages: [
    {
      src: "https://cdn.bfldr.com/8266KQUL/at/rfprm9vp24rpkt2vvjkgt6kr/Addison%204-Drawer%20with%20Shelves%201614mm_V1_White%20Ash%20Oak.jpg?trim=-0.01,0,0.01,-0.01&width=1080&height=1080&format=jpg",
      name: "Addison 4-Drawer with Shelves V1 White Ash Oak",
    },
    {
      src: "https://cdn.bfldr.com/8266KQUL/at/8vxzv8xk7k5kkph77whg4n2s/Addison%204-Drawer%20with%20Shelves%201614mm_V2_White%20Ash%20Oak.jpg?trim=-0.01,0,0.01,-0.01&width=1080&height=1080&format=jpg",
      name: "Addison 4-Drawer with Shelves V2 White Ash Oak",
    },
    {
      src: "https://cdn.bfldr.com/8266KQUL/at/6njtsm3tk54xgp6nv8sb/Addison%204-Drawer%20with%20Shelves%201614mm_V3_White%20Ash%20Oak.jpg?trim=0.01,0.01,0.01,0.01&width=1080&height=1080&format=jpg",
      name: "Addison 4-Drawer with Shelves V3 White Ash Oak",
    },
  ],
  brandfolderSpecImage: [
    {
      src: "https://cdn.bfldr.com/8266KQUL/at/bhnthfkwmqhk3btxh7s3fm/Addison_4-Drawer_with_Shelves_1614mm_-_1_Cut-Out.svg",
      name: "Addison 4-Drawer with Shelves 1614mm - 1 Cut-Out",
    },
  ],
  attributes: [
    { name: "Brand", value: "ABI Interiors", visible: true, position: 1, variation: false },
    { name: "COLOUR", value: "White Ash Oak", visible: true, position: 2, variation: false },
    {
      name: "Construction",
      value: "High Density Moisture Resistant Particle Board Soft Close Drawers",
      visible: true,
      position: 4,
      variation: false,
    },
    {
      name: "Dimensions (mm)",
      value: "Length: 1614mm\nDepth: 450mm\nHeight: 500mm",
      visible: true,
      position: 5,
      variation: false,
    },
    { name: "Mounting", value: "Wall Mounted", visible: true, position: 6, variation: false },
    {
      name: "Lead Time",
      value:
        "10 Working days for cabinetry assembly + allow shipping days between 3-7 business days depending on the state",
      visible: true,
      position: 9,
      variation: false,
    },
  ],
  feature: {
    feature_1: "High Density Moisture Resistant Particle Board",
    feature_2: "Soft Close",
    feature_3: "Wall Mounted",
  },
  shortDescription:
    "<p>Distinguished by its smart drawer configuration with centrally positioned open shelves, our Addison 4-drawer is a double wall mounted bathroom vanity that’s perfect for shared bathrooms. It has integrated cut-outs for plumbing services and for easy installation.</p>\n<p><strong>Please note:</strong> vanities are made to order — allow 10 working days for cabinetry assembly plus 3–7 business days shipping.</p>",
  documents: [
    {
      name: "Specification Sheet",
      label: "Addison 4-Drawer with Shelves 1614mm - 1 Cut Out - Specification",
      link: "https://info-document-uploads.s3.ap-southeast-2.amazonaws.com/Addison%204-Drawer%20with%20Shelves%201614mm%20-%201%20Cut%20Out%20-%20Specification.pdf",
    },
  ],
  faqs: [
    {
      faq_title: "What type of coating is used on this product, is it durable?",
      faq_desc:
        "<p>Made from a dense moisture proof particle board, finished with either a heavy pressed timber laminate grain or a 2PAC finish. The timber laminate is very resistant to damage, 2PAC is a high quality finish however can be damaged if not careful.</p>",
    },
    {
      faq_title: "What hardware is used in your vanity cabinetry?",
      faq_desc:
        "Our vanities are fitted with premium hardware for durability, long term performance and smooth everyday use. All vanity doors use BLUM soft close hinges, and all drawers are fitted with DTC soft close runners.",
    },
  ],
  warrantyResults: [
    {
      name: "Addison 4-Drawer with Shelves 1614mm - White Ash Oak",
      sku: "15718",
      structure: { residential: "10", non_residential: "4", outdoor: "0" },
      finish: { residential: "5", non_residential: "2", outdoor: "0" },
      other: { residential: "3", non_residential: "1", outdoor: "0" },
    },
  ],
  rainbowFamily: [
    { group_name: "Addison 4-Drawer with Shelves 1614mm", id: null, sku: "15719", name: "Addison 4-Drawer with Shelves 1614mm - White" },
    { group_name: "Addison 4-Drawer with Shelves 1614mm", id: null, sku: "15717", name: "Addison 4-Drawer with Shelves 1614mm - Pure Oak" },
    { group_name: "Addison 4-Drawer with Shelves 1614mm", id: null, sku: "15718", name: "Addison 4-Drawer with Shelves 1614mm - White Ash Oak" },
  ],
  awardBadges: [],
  welsRating: "",
  welsLitres: "",
  welsRegistration: "",
  xSell: { name: "", set: [], description: "" },
  infoDoc: {},
  permalink:
    "https://www.abiinteriors.com.au/product/addison-4-drawer-with-shelves-1614mm-white-ash-oak/",
};

export const FIXTURES: GatewayProduct[] = [
  MINI_FILTER_TAP_GUNMETAL,
  MINI_FILTER_TAP_BRASS,
  MINI_FILTER_TAP_STAINLESS,
  ELYSIAN_PULLOUT_BRASS,
  MINI_FILTER_TAP_ANTIQUE_BRONZE,
  ONTARIO_DOUBLE_SINK,
  ADDISON_VANITY,
];

export const FIXTURE_NOTES: Record<string, string> = {
  "16243": "Live gateway record, copied verbatim. In stock, no WELS rating, requires a filter system.",
  "16241": "Low stock (3) and a discounted price — the sale price is invented.",
  "16240": "On backorder, so it renders as made to order.",
  "16149": "Carries a WELS rating; no Brandfolder gallery, so it falls back to the single hero image.",
  "20204": "Status is draft — a customer must not see it, staff must.",
};
