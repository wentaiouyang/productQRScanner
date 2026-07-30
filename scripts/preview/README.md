# Review page generator

Builds a single self-contained HTML file showing several states of the customer product
page, for sharing with people who can't run the app.

It does not re-create the page: it fetches the real rendered HTML from a running dev
server, then inlines the stylesheet, fonts and images so the result works with no network
access at all.

```bash
npm run dev                        # in one terminal
node scripts/preview/build-preview.mjs      # fetch + inline -> payload.json
node scripts/preview/assemble-preview.mjs   # payload.json -> preview.html
```

Both scripts write next to themselves. `build-preview.mjs` also needs `app.css`, the
stylesheet the dev server links from `/p/<sku>` — fetch it first:

```bash
curl -s "http://localhost:3000$(curl -s http://localhost:3000/p/16243 \
  | grep -o '/_next/static/chunks/[^"]*\.css' | head -1)" -o scripts/preview/app.css
```

## Four traps this code exists to avoid

- **`srcSet`, not `srcset`.** React 19 serialises it capitalised. A surviving srcset wins
  over the inlined `src` and silently points every image at a dead localhost URL.
- **Next only serves whitelisted image widths and qualities.** Anything outside
  `deviceSizes`/`imageSizes`, or a quality other than 70/75, returns 400. The script
  throws rather than continuing, because a swallowed failure looks like "no images".
- **next/font variables must be declared on `:root`.** Tailwind's theme layer defines
  `--font-sans`/`--font-display` in terms of them on `:root`; if they are declared on a
  deeper wrapper, `:root` evaluates the var() as invalid and the whole subtree inherits
  nothing, falling back to the surrounding page's font.
- **Never assign `src` over an in-flight load.** It aborts, leaving the element at
  `complete = true, naturalWidth = 0` forever. Images ship with no `src` at all.

Media queries are rewritten as container queries so each frame resolves them against its
own 390px width instead of the viewer's viewport.
