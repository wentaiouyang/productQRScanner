# ShowRoomQR

Scan a QR label on a showroom product, get that product's details on your phone.

**Status: demo.** The customer-facing page is built and works, but it runs on a fixture
dataset, not live data. See [Why it isn't live](#why-it-isnt-live).

Design spec: [`docs/superpowers/specs/2026-07-30-showroom-qr-design.md`](docs/superpowers/specs/2026-07-30-showroom-qr-design.md).

## Running it

```bash
npm run dev
```

Then open <http://localhost:3000> — a demo index with a scannable QR code per fixture
product.

To scan the codes with a real phone, they need to point at this machine's LAN address
rather than localhost:

```bash
NEXT_PUBLIC_BASE_URL=http://192.168.1.20:3000 npm run dev
```

## What a QR code contains

Just a URL: `https://<host>/p/<SKU>`, e.g. `/p/16243`. Nothing else — no token, no
parameters.

Because the URL derives from the SKU alone, labels can be generated for any set of SKUs
and reprinted at any time without touching a database. Real ABI SKUs are short numeric
strings.

## Demo dataset

| SKU | What it exercises |
|---|---|
| `16243` | A verbatim copy of a live AU gateway record — in stock, no WELS rating, requires a separate filter system, nine sibling finishes |
| `16241` | Discounted price and low stock |
| `16240` | On backorder, renders as made to order |
| `16149` | Carries a WELS rating; no Brandfolder gallery, so it falls back to the single hero image |
| `20204` | Draft status — a customer must not see it |

Also worth visiting: `/p/99999` (no such product) and `/p/not$a$sku` (a mangled scan,
rejected before any lookup).

**What is real and what isn't.** SKU 16243 is real data throughout. The others have real
SKUs, names, colours and prices, but their stock states, documents, FAQs and warranty rows
are synthesised to reach states the first record doesn't reach. Two things are invented
outright and should not be trusted:

- `salePrice` on 16241 — every record sampled had `salePrice: ""`, so whether ABI uses the
  field at all is unverified.
- Sibling photography — only 16243 and 16149 have real image URLs. The other finishes
  reuse 16243's gunmetal photos, so the Brushed Brass page shows a gunmetal tap.

## Structure

```
lib/product/
  types.ts           GatewayProduct (the real record shape) and CustomerProduct (the view model)
  map.ts             GatewayProduct → CustomerProduct, plus CUSTOMER_SOURCE_FIELDS
  visibility.ts      who is allowed to see a draft or hidden product
  format.ts          price parsing, stock wording, warranty periods
  source.ts          the ProductSource interface and SKU validation
  fixture-source.ts  the demo implementation
  fixtures.ts        the demo dataset
app/
  page.tsx           demo index — not part of the customer experience
  p/[sku]/page.tsx   the customer product page
```

Every page reads through `ProductSource`. Swapping the fixture source for a
gateway-backed one is the only change needed once access is granted.

## Two rules the code enforces

**Cost price cannot reach a customer.** `CUSTOMER_SOURCE_FIELDS` in `lib/product/map.ts`
is the list of fields requested from the gateway, and `unitCost` is not on it — so in
production the field never enters the server process. `CustomerProduct` also has nowhere
to put a cost, so the type system blocks it a second time. The fixtures deliberately
*include* `unitCost` so this can be verified rather than assumed.

**Hidden product data stays hidden.** Product attributes carry a `visible` flag, and real
records use it — SKU 16243 marks "What's In The Box" as `visible: false`. The spec table
renders only visible attributes. Draft and hidden products render a "not published yet"
page for customers while remaining fully visible to staff, because showrooms display
pre-launch stock as a matter of course.

## Why it isn't live

The page needs product data for an anonymous visitor. The ABI Gateway only accepts an
Entra identity, and a showroom customer has no Microsoft account — so the server has to
call the gateway as an *application* (client credentials). That requires:

1. Confirmation that the gateway's `entra` authorizer branch accepts an application-only
   token. It may need a change on the gateway side.
2. `products.read` assigned to that application's service principal.
3. The production origin registered as a redirect URI (needed for staff sign-in later).

Details and a draft access request are in section 12 of the design spec. An admin account
does **not** solve this — an admin is still a user, and no user token can be obtained
without someone present to sign in.

`lib/product/source.ts` exists so this uncertainty stays in one file.

## Known gaps

- **Staff view not built.** Cost, margin and stock detail behind Microsoft sign-in. Needs
  `products.read` on a department security group — the faster of the two access requests,
  and the one currently unblocked.
- **Label generation (`/labels`) not built.** Bulk QR sheets for printing.
- **Not-found returns HTTP 200.** The page content is right, but a genuinely missing SKU
  should return 404 so broken labels show up in monitoring. Next.js only sets 404 via
  `notFound()`, which cannot receive the scanned SKU, so this needs a small refactor.
- **No tests yet.** The spec's test plan (section 10) lists the ones that matter, chiefly
  a contract test asserting the gateway record still carries the fields this app reads.
- **Light theme only**, deliberately — the product photography is all shot on white.
- **Spec is partly out of date.** It was written before a live record was inspected; the
  field corrections live in the code comments, not yet folded back into the spec.
