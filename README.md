# hipo.is-a.dev

A compact, bilingual portfolio for Hipolit Badowski, a Vienna-based DevOps engineer working across cloud platforms, agentic AI infrastructure, and private local LLM systems.

## Architecture

- `src/data/site.en.json` and `src/data/site.de.json` contain all localized interface copy.
- `src/templates.mjs` owns the shared home, navigation, footer, metadata, structured data, and 404 templates.
- `scripts/build.mjs` validates content and writes the deployable `_site/` artifact.
- `scripts/check.mjs` validates metadata, language alternates, internal links, assets, headings, CSP rules, the deliberately small route set, and publishing files.
- `assets/css/main.css`, `assets/js/main.js`, `assets/logo-hipo.svg`, and `assets/img/ich.png` are the only public design/runtime sources.

There is no runtime framework, blog, content feed, remote font, analytics, third-party script, or client-side translation.

## Local Development

Node.js 20 or newer is required; GitHub Actions uses Node.js 24.

```sh
npm ci --ignore-scripts
npm test
python3 -m http.server 8000 --directory _site
```

Then open `http://127.0.0.1:8000/`. Do not open generated pages directly with `file://`; the production site uses root-relative URLs.

`npm test` always rebuilds the complete site before checking it. `_site/` is generated and ignored by Git.

For reproducible responsive evidence, start Chrome with a temporary profile and a debugging port, then run the dependency-free QA adapter with Node’s WebSocket flag:

```sh
node --experimental-websocket scripts/browser-qa.mjs \
  --port 9333 \
  --url http://127.0.0.1:8000/ \
  --width 390 \
  --height 900 \
  --mobile \
  --screenshot /tmp/hipo-mobile.png \
  --menu-screenshot /tmp/hipo-menu.png \
  --report /tmp/hipo-report.json
```

The adapter checks the real layout viewport, page overflow, console errors, failed requests, mobile-menu state, target height, Escape behavior, and focus return. It can also write a full-page screenshot with `--full-page-screenshot`.

## Publishing Contract

English is the default language; German is a first-class alternate.

| Surface | English | German |
| --- | --- | --- |
| Home | `/` | `/de/` |
| Not found | `/404.html` | — |

The build also emits `sitemap.xml`, `robots.txt`, `site.webmanifest`, `CNAME`, and `.nojekyll`. GitHub Actions uploads only `_site/` and deploys it through the `github-pages` environment.

After a significant public-content change, verify `/`, `/de/`, `robots.txt`, and `sitemap.xml` in production. Submit `https://hipo.is-a.dev/sitemap.xml` in Google Search Console and request recrawling for the two home URLs through URL Inspection. Search Console ownership and indexing requests remain account-controlled operations; they are not automated by this repository.

## Design and Content Rules

- Follow `DESIGN.md` for the visual system and `PLAN.md` for the current architecture decisions.
- Keep claims short, concrete, and supportable; do not add scale, client, availability, or certification claims without evidence.
- Keep email, LinkedIn, GitHub, portrait, canonical domain, and schema identity aligned in `src/config.mjs`.
- Do not add inline styles or executable inline scripts. JSON-LD receives a page-specific CSP hash during the build.
- Keep the public route set intentionally small. A new surface must earn its maintenance cost before it is added.
