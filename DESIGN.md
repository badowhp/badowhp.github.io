# Design System: Hipolit Badowski

## 1. Overview

- **Creative north star:** The operations brief — sparse, blunt, and credible. The page should feel like a senior engineer wrote down only what a technical lead needs to know before starting a conversation. The real portrait is the only decorative asset; everything else earns its place through hierarchy or proof.
- **Register:** Brand / portfolio. The home page is the product. The German route is an equal localized version. The Lab (`/lab/`, `/de/lab/`) is a secondary long-form surface for AI experiments; the 404 page is the only other supporting surface.
- **Audience and primary job:** Engineering leaders, CTOs, and senior developers responsible for live cloud systems. In one short scroll they should understand what Hipolit does, see one verifiable public build, and know how to contact him.
- **Tone and density:** Confident, concise, practical, and lightly irreverent. Prefer short assertions over consulting language. The first viewport names the role and location, carries one memorable position — infrastructure should be boring — plus one explanation and one contact action.
- **Provisional assumptions:** The main audience is based in Vienna or works with remote European teams. The desired inquiry concerns cloud platforms, delivery, infrastructure as code, or production operations. English is the default language and German is a complete alternate.
- **Technology:** A dependency-free Node static build renders localized JSON into HTML. CSS and small progressive-enhancement JavaScript are hand-authored. No third-party fonts, client frameworks, analytics, blog engine, feeds, Markdown, or runtime content requests. GitHub Actions builds and deploys the `_site/` artifact to GitHub Pages.
- **Source of truth:** `src/data/site.en.json` and `src/data/site.de.json` for localized copy; `src/templates.mjs` and `scripts/build.mjs` for rendering; `assets/css/main.css` for tokens/components; `assets/js/main.js` for enhancement; `assets/img/ich.jpg` and `assets/logo-hipo.svg` for brand media; `README.md` and `.github/workflows/deploy-pages.yml` for publishing.
- **Reference direction:** editorial engineering portfolios with the restraint of a printed technical brief. Borrow strong type, evidence, and direct contact paths—not terminal styling, fabricated metrics, or a résumé timeline. **Anti-references:** neon hacker aesthetics, fake dashboards, logo/tool walls, generic agency gradients, card grids, padded case studies, and unsupported scale claims.
- **Freshness:** Revised 2026-07-18 for the warmed Lab voice (passion-project tone), trimmed Lab meta descriptions, and an inline `skill-mania` link; 2026-07-17 for the hook-first meta description, the "Building" nav label, the added `SoftwareSourceCode` / `knowsLanguage` structured data, and the new bilingual Lab surface; 2026-07-16 for the cleaned portrait asset (`ich.jpg`) and hero eyebrow wrap rule; 2026-07-13 for the compact portfolio direction.

## 2. Colors

- **Page surface:** frost `#edf3f5` / `--paper`; **primary surface:** `#f8fbfc` / `--surface`; **quiet structure:** steel mist `#dfe9ed` / `--surface-cool`.
- **Primary text / inverse field:** midnight `#071521` / `--ink`; **body text:** `#263e4d` / `--text`; **muted text:** `#5f7480` / `--text-soft`.
- **Primary action and link:** deep teal `#105e68` / `--teal-dark`; **hover:** `#0b4c55`; **signal:** ice teal `#7ad7cf` / `--signal`. Focus is a visible 3px deep-teal outline on light surfaces and ice-teal on dark surfaces.
- **Borders:** `#cad8de` / `--line` and `#8ea6b1` / `--line-strong`. Use rules for structure; do not use shadow as a substitute for hierarchy.

## 3. Typography

- **Body and headings:** local system sans (`--font-sans`), 16px base, body line-height 1.55. No remote fonts.
- **Hero:** heavy, tight, and sentence case. Desktop H1 is 5.5–6.6rem with a 0.88–0.94 line-height; narrow mobile is 3.25rem. The role-and-location H1 stays below six words. Headings use short lines and no ornamental emphasis.
- **Technical labels:** local monospace (`--font-mono`), uppercase, 0.7–0.76rem, used only for section labels, numbers, and compact metadata.
- **Content limits:** body copy stays below 60ch; the hero heading stays below 32 characters and six words; hero lede stays below 52ch. Controls are at least 44px high. German expansion, email addresses, and repository paths wrap safely.

## 4. Spacing, Depth, and Motion

- **Layout:** one 1180px max-width container with fluid 20–48px gutters. Use generous section space and few components instead of many small gaps.
- **Depth:** flat surfaces divided by 1px rules. The portrait has a narrow border and small radius. The open-source band and closing contact area are the only inverse surfaces. No cards, nested panels, or decorative shadows.
- **Radius:** 4px for controls and portrait. Avoid pills.
- **Motion:** 160ms color, opacity, and small arrow movement only. No scroll reveals, background animation, or hover lift. `prefers-reduced-motion` removes smooth scrolling and transitions.
- **Media:** show `assets/img/ich.jpg` (cropped clean of source letterbox bars, optimized JPEG) without filters, coordinate overlays, or résumé caption cards. Keep the face visible at every breakpoint and reserve dimensions to prevent layout shift.

## 5. Components and Content

- **Navigation:** compact masthead with mark/name, four destinations — Work, Building (the open-source section), Lab (the experiments page), Contact — EN/DE switch, and no separate header CTA. Mobile uses a labelled button with `aria-expanded` and `aria-controls`; Escape, outside click, link selection, and desktop resize close it; focus returns to the trigger. Targets are at least 44px.
- **Hero:** eyebrow, “DevOps Engineer in Vienna.” / “DevOps Engineer in Wien.” as the H1, the line “Infrastructure should be boring.” / “Infrastruktur sollte langweilig sein.” in one short explanation, one email action, one GitHub text link, and the real portrait. A single compact expertise line may follow; do not add a proof grid or portrait biography.
- **Work:** exactly four flat numbered rows: Platforms, Delivery, Operations, and AI Infrastructure. Each uses one short result, one sentence, and a compact tool line. The AI row covers agent runtimes and private local LLM systems without implying model training or unsupported scale. No bullets, badges, or repeated benefit copy.
- **Open source:** one full-width dark band for Skill Mania. Describe only repository-verifiable scope in one sentence and provide one GitHub action. Do not imply client work.
- **Method:** one compact line — understand, simplify, document — with one sentence of support. It is not a separate case-study section or three-card process.
- **Contact:** a direct closing statement, one short expectation-setting sentence, email, LinkedIn, and GitHub. Do not ask for a stack inventory or mimic a form.
- **Language control:** route-preserving links show `EN` and `DE`, native names in accessible text, `hreflang`, and a current state. Product and personal names are not translated.
- **Lab:** a single curated long-form page at `/lab/` (and `/de/lab/`), reached from the masthead. One page H1, dated entries as `article` blocks with `h2` titles, monospace date, tag chips, and `h3` subheads inside a ≤64ch reading column on the light surface. Each entry carries `Article` structured data authored by the site Person. No feed, RSS, per-entry routes, comments, or pagination. Entries stay first-hand and specific; claims about the book, game, or 3D work must be true and unembellished.
- **Removed surfaces:** no feed/RSS, per-post routes, Markdown content, adjacent-post controls, home post-preview, or blog engine. The Lab is a single hand-authored page, not a reintroduced blog; old public post URLs may still return the branded 404.
- **System states:** visible hover, focus, open-menu, current-language, and reduced-motion states are required. Loading, empty, validation, selected, error, and permission states do not apply to the static portfolio.
- **Responsive behavior:** hero is two-column above 900px and one column below it. At mobile widths, copy appears before the portrait, actions remain easy to tap, work rows collapse to one column, and contact links become full-width rows. Prevent horizontal scroll at 320px.

## 6. Do's and Don'ts

- Do use semantic tokens, the real portrait/logo, short concrete copy, one visible H1, useful alt text, and visible focus.
- Do make the first viewport say what the site stands for before it lists technologies.
- Do keep tooling subordinate to outcomes and claims verifiable from the public repository or professional scope.
- Do preserve canonical metadata, localized alternates, semantic landmarks, resilient wrapping, and reduced-motion behavior.
- Do not use gradients, gradient text, icon tiles, fake screenshots, terminal chrome, emoji UI, pills, card grids, side-accent panels, or generic “transform your business” language.
- Do not repeat reliability, ownership, rollback, or operational-context claims in multiple sections.
- Do not reintroduce a blog, content feed, form, résumé timeline, testimonial, tool wall, or framework without a user-facing need.
- Any exception must state the user-facing reason in this document.
