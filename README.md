# hipo.is-a.dev

Localized portfolio and technical notes for Hipolit Badowski, built as a small dependency-free static site for GitHub Pages.

## Architecture

- `src/data/site.en.json` and `src/data/site.de.json` contain localized interface copy.
- `src/posts/en/` and `src/posts/de/` contain paired Markdown posts.
- `src/templates.mjs` owns the shared home, blog, post, navigation, footer, metadata, and structured-data templates.
- `scripts/build.mjs` validates content and writes the deployable `_site/` artifact.
- `scripts/check.mjs` validates metadata, language alternates, internal links, assets, headings, CSP rules, and publishing files.
- `assets/css/main.css`, `assets/js/main.js`, `assets/logo-hipo.svg`, and `assets/img/ich.png` are the only public design/runtime sources.

There is no Hugo theme, committed generated output, runtime framework, client-side translation, remote font, or third-party script.

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
| Notes | `/blog/` | `/de/blog/` |
| Post | `/blog/posts/<slug>/` | `/de/blog/posts/<slug>/` |
| Feed | `/blog/index.xml` | `/de/blog/index.xml` |

The build also emits `404.html`, `sitemap.xml`, `robots.txt`, `site.webmanifest`, `CNAME`, and `.nojekyll`. GitHub Actions uploads only `_site/` and deploys it through the `github-pages` environment.

## Add a Post

Create a Markdown file in each locale directory. Paired posts use the same `translationKey`; slugs may differ, although keeping them aligned makes maintenance easier.

```markdown
---
title: "A clear, specific title"
slug: "clear-specific-title"
date: "2026-07-10"
translationKey: "clear-specific-title"
topic: "Platform engineering"
description: "One useful sentence for listings and search previews."
tags: ["Kubernetes", "Delivery"]
draft: false
---

Opening paragraph.

## Section heading

Body copy with **strong text**, `inline code`, lists, links, blockquotes, and fenced code blocks.
```

The intentionally small Markdown renderer supports paragraphs, H2–H4 headings, ordered and unordered lists, blockquotes, fenced code, strong text, inline code, and safe links. The build escapes raw HTML.

Run `npm test` after adding or translating content. Missing translation pairs, duplicate keys/slugs, invalid front matter, broken routes, and missing assets fail the build.

## Design and Content Rules

- Follow `DESIGN.md` for the visual system and `PLAN.md` for the current architecture decisions.
- Use concrete operating outcomes; avoid unsupported scale, client, availability, or certification claims.
- Keep email, LinkedIn, GitHub, portrait, canonical domain, and schema identity aligned in `src/config.mjs`.
- Do not add inline styles or executable inline scripts. JSON-LD receives a page-specific CSP hash during the build.
- Preserve the existing post paths unless a migration and redirect strategy is added first.
