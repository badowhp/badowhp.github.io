# Design System: Hipolit Badowski

## 1. Overview

- **Creative north star:** The operator's field journal — a precise editorial portfolio that feels like it belongs beside an architecture decision record: calm, legible, and built around evidence. The portrait adds a human counterweight to the technical structure; the interface must never imitate a terminal or fabricated dashboard.
- **Register:** Brand / portfolio. The home page is a conversion surface for an independent DevOps engineer; technical notes and the 404 page are supporting editorial surfaces.
- **Audience and primary job:** Engineering leaders, CTOs, and senior developers with live cloud infrastructure. They need to quickly establish fit, understand the work, and start a well-scoped conversation.
- **Tone and density:** Direct, modest, technically literate, and deliberately edited. The first viewport earns trust with one operating promise, a short proof rail, and one obvious contact action. Tools support a real capability or public build; they are not decorative badges.
- **Provisional assumptions:** The primary audience is engineering leaders and senior developers in Vienna or remote European teams. The desired inquiry is a practical conversation about a production, delivery, or reliability problem. English is the default language and German is a complete first-class alternate.
- **Technology:** A dependency-free Node static build renders localized data and Markdown into HTML. CSS and small progressive-enhancement JavaScript are hand-authored. No third-party fonts, client frameworks, analytics, or runtime content requests. GitHub Actions builds and deploys the `_site/` artifact to GitHub Pages.
- **Source of truth:** `src/data/site.en.json` and `src/data/site.de.json` for interface copy; `src/posts/{en,de}/` for paired Markdown notes; `src/templates.mjs` and `scripts/build.mjs` for rendering; `assets/css/main.css` for tokens/components; `assets/js/main.js` for enhancement; `assets/img/ich.png` and `assets/logo-hipo.svg` for brand media; `README.md` and `.github/workflows/deploy-pages.yml` for the publishing contract.
- **References:** [Niklas Rosenstein](https://www.niklasrosenstein.com/) for outcome-first service framing and concrete open-source evidence; [Janus Chung](https://januschung.github.io/) for a project-led portfolio with current writing; [Robert Andruschow](https://andruschow.de/) for precise operating scope and professional history. Borrow their clarity, proof hierarchy, and direct social paths, not their visual styling. **Anti-references:** neon hacker aesthetics, fake terminal dashboards, logo/tool walls, generic SaaS gradients, stacked feature-card grids, and unverified scale claims.
- **Freshness:** Reviewed 2026-07-10 against the repository, portrait asset, current GitHub Pages constraints, and live 2026 portfolio references.

## 2. Colors

- **Page surface:** frost `#edf3f5` / `--paper`; **raised surface:** `#f8fbfc` / `--surface`; **inset surface:** steel mist `#dfe9ed` / `--surface-cool`. These cool neutrals make long technical copy calm without reading as corporate blue-grey.
- **Primary text / dark field:** midnight `#071521` / `--ink`; **body text:** `#263e4d` / `--text`; **muted text:** `#5f7480` / `--text-soft`; **disabled text:** `#748791` / `--muted`.
- **Primary action:** deep teal `#105e68` / `--teal-dark`; **secondary action and link:** `#1b717a` / `--teal`; **signal accent:** ice teal `#7ad7cf` / `--signal` for rules and indexes. Focus is a visible 3px deep-teal outline on light surfaces and ice-teal outline on dark surfaces.
- **Status accents:** success `#2d7b62`, warning `#a66b24`, danger `#a44848`, and info `#367594`; use only when the content carries that state. No warm accent is a general decoration.
- **Borders and depth:** `#cad8de` / `--line` for structure and `#8ea6b1` / `--line-strong` for interaction. Shadows are cool, soft, and sparse; reserve the strongest shadow for the portrait frame and mobile navigation overlay.

## 3. Typography

- **Body:** local system sans (`--font-sans`), 16px base, 1.62 line height. Avoid remote font dependencies.
- **Headings:** same system sans at a heavy but not black weight; use compact line-height (0.96–1.14) and sentence-case copy. Home H1 uses explicit responsive steps from 5.2rem desktop to 3.1rem narrow mobile; H2 steps from 3rem to 2.05rem. The masthead wordmark is compact; mono metadata may identify the route or locale but must not imitate system status.
- **Technical labels:** local monospace (`--font-mono`), uppercase, 0.76–0.8rem, for labels, dates, status, and compact metadata only; never for paragraphs.
- **Content limits:** paragraph measure is 62–68ch; hero heading measure is 9–11ch; controls retain at least 44px height. German expansion, long tool names, repository paths, and email addresses wrap safely. Blog prose stays near 72ch and code blocks scroll horizontally.

## 4. Elevation

- **Depth model:** default surfaces are flat and divided by 1px rules. Use one raised portrait frame and one dark contact panel; capability rows, project evidence, and article lists remain flat so the page reads as an editorial system instead of a dashboard. Never nest raised cards.
- **Radius:** 6px for controls and media frames, 8px for panels. Avoid pills except for a compact, semantically useful status.
- **Motion:** 160–220ms opacity, color, and small transform transitions only. Hover lift is at most 2px. The menu may fade/translate over 180ms. `prefers-reduced-motion` removes smooth scrolling and transitions.
- **Media:** the portrait uses `assets/img/ich.png`, cropped with the face visible at every breakpoint. Give it an explicit aspect ratio and dimensions to prevent layout shift. Do not hide it under copy, filters, or decorative overlays.

## 5. Components

- **Navigation:** persistent compact masthead with the geometric H mark, name, four short destinations, a visible EN/DE route switch, and one high-contrast contact action. Desktop links expose current/hover state. Mobile uses a labelled menu button with `aria-expanded` and `aria-controls`; Escape, outside click, route selection, and desktop resize close it; focus returns to the trigger. Targets are at least 44px high.
- **Buttons and links:** primary action is filled dark teal; secondary action is bordered. All keyboard focus states are visible. On narrow screens, paired actions become full-width to prevent cramped targets.
- **Hero:** the first viewport states the platform/delivery/operations role, one concrete outcome, Vienna/remote context, two clear actions, and a compact proof rail. The real portrait supplies personality; its caption provides identity and useful context rather than a résumé summary.
- **Work list:** use one bordered board with exactly three numbered outcome rows: platform foundations, dependable delivery, and operable systems. Each row has one concise result, one short explanation, and no more than three supporting capabilities. Rows collapse from three columns to two and then one without changing reading order.
- **Featured build:** place one dark, horizontal “selected build” band after capabilities for [Skill Mania](https://github.com/badowhp/skill-mania). State only repository-verifiable facts and label it as open source, not client work. The GitHub action is obvious and uses `rel="noopener noreferrer"`.
- **Method and writing:** process is a sequential three-step rail, not a second card grid. Home writing preview shows the two newest localized posts with date, topic, title, and summary. The blog index is chronological and post pages include translation, back-navigation, metadata, related/adjacent navigation, and readable code states.
- **Language control:** route-preserving language links use visible `EN` and `DE` labels, native language names in accessible text, `hreflang`, and a current-language state. Never translate code, product names, or personal names. If a post lacks a translation, the alternate links to the other language’s blog index rather than a false equivalent.
- **Contact and social proof:** offer direct email, LinkedIn, and GitHub as equal, clearly named links. External links use `rel="noopener noreferrer"`. No form states are needed because no form is provided.
- **System states:** links, buttons, menu state, card hover, focus, and reduced-motion behavior are required. Empty, loading, validation, selected, error, and permission states do not apply to the current static read-only surface; add them before introducing dynamic UI.
- **Responsive behavior:** use a 1180px max content width with fluid 20–48px gutters. The hero stacks and navigation collapses by 900px, while multi-column content becomes a single reading column by 760px. At 580px, actions stack full-width and social links become full-width rows. Preserve DOM reading order and prevent horizontal scroll at 320px, including long German words and code.

## 6. Do's And Don'ts

- Do use semantic tokens and the real portrait/logo assets; keep the midnight, frost, steel, and signal-teal palette consistent across home, blog, posts, and 404.
- Do write for operators with concrete outcomes: reviewable changes, clear rollback, useful signals, and understandable ownership. Use "DevOps" only when it accurately describes the work; prefer platform, delivery, infrastructure, and operations when more precise.
- Do preserve semantic landmarks, accessible labels, visible focus, resilient wrapping, and `prefers-reduced-motion` behavior.
- Do make every localized route share the same nav, token system, mobile rules, canonical metadata, alternate-language link, and footer social paths.
- Do not use gradients as decoration, gradient text, oversize icon tiles, fake product screenshots, or emoji as UI icons.
- Do not add card-on-card layouts, side accent borders, generic agency language, remote font calls, third-party scripts, inline styles, client-side translation, or runtime content fetching.
- Do not turn every tool into a badge; tooling should support a specific operating outcome. Do not repeat the same promise in the hero, capabilities, and method sections.
- Any exception to these rules must state the user-facing reason in code review or this document.
