# Design System: Hipolit Badowski

## 1. Overview

- **Creative north star:** The operator's desk — calm, precise, and immediately useful rather than theatrical. The page should feel like a trustworthy technical partner who reduces uncertainty in production systems.
- **Register:** Brand / portfolio. The home page is a conversion surface for an independent DevOps engineer; technical notes and the 404 page are supporting editorial surfaces.
- **Audience and primary job:** Engineering leaders, CTOs, and senior developers with live cloud infrastructure. They need to quickly establish fit, understand the work, and start a well-scoped conversation.
- **Tone and density:** Direct, modest, technically literate, and medium density. Lead with outcomes and operating practice; tools support credibility but do not become decoration.
- **Provisional assumptions:** The primary audience is English-speaking teams in Vienna or working remotely, and the desired inquiry is a practical conversation about a production, delivery, or reliability problem. No competitor/reference was provided.
- **Technology:** Handcrafted static HTML, CSS, and vanilla JavaScript. No third-party fonts, scripts, or component library; GitHub Pages deploys only the root static surface and `blog/`.
- **Source of truth:** `index.html` for page structure/copy, `assets/css/main.css` for the system, `assets/js/main.js` for interaction, `assets/img/ich.png` and `assets/logo-hipo.svg` for media, and `README.md` / `.github/workflows/deploy-pages.yml` for deploy constraints.
- **References:** Operational interfaces that make status and next actions legible; restrained editorial portfolios. **Anti-references:** neon "hacker" aesthetics, fake terminal dashboards, generic SaaS gradients, stacked feature-card grids, or vague transformation claims.
- **Freshness:** Seeded 2026-07-09 from repository and rendered-page inspection.

## 2. Colors

- **Page surface:** `#f4f7f8` / `--paper`; **raised surface:** `#fcfdfd` / `--surface`; **inset surface:** `#e6edf1` / `--surface-cool`. These cool, low-saturation neutrals keep long technical copy calm and legible.
- **Primary text:** `#101824` / `--ink`; **body text:** `#2d3d51` / `--text`; **muted text:** `#647184` / `--text-soft`; **disabled text:** `#7b8795` / `--muted`.
- **Primary action / dark field:** `#0f3042` / `--teal-dark`; **secondary action and information accent:** `#24566f` / `--teal`; **focus:** a visible teal outline with a minimum 3px width.
- **Signal accents:** clay `#a95f28` for editorial labels, ochre `#c28a2f` for secondary status, and success `#2c7a5b` only for positive operational state. Accents identify information; they must not compete with the primary action.
- **Borders and depth:** `#d4dde3` / `--line` for structure, `#a8b8c3` / `--line-strong` for interaction. Shadows are soft and low contrast, reserved for the hero operational panel and prominent calls to action.

## 3. Typography

- **Body:** local system sans (`--font-sans`), 16px base, 1.62 line height. Avoid remote font dependencies.
- **Headings:** same system sans at a heavy but not black weight; use compact line-height (0.98–1.14) and clear sentence-case copy. Home H1 is 4.7rem desktop / 3.05rem narrow mobile; H2 is 2.85rem / 2.1rem.
- **Technical labels:** local monospace (`--font-mono`), uppercase, 0.76–0.8rem, for labels, dates, status, and compact metadata only; never for paragraphs.
- **Content limits:** paragraph measure up to 66ch; heading measure 10–15ch; controls retain at least 46px height. Long tool names and email addresses wrap safely rather than overflow.

## 4. Elevation

- **Depth model:** default surfaces are flat with a 1px border. Raised cards use `--shadow-tight`; one hero operations panel may use `--shadow`. Do not stack raised cards inside another raised card.
- **Radius:** 6px for controls and media frames, 8px for panels. Avoid pills except for a compact, semantically useful status.
- **Motion:** 200ms opacity/color/transform transitions only. Hover lift is at most 1px. Respect `prefers-reduced-motion` by removing smooth scrolling and transitions.
- **Media:** the portrait must use the real supplied image, be cropped with the face visible, and include useful supporting context rather than decorative overlay text.

## 5. Components

- **Navigation:** persistent compact header; one clear word per destination. Desktop links expose current/hover state; mobile uses an accessible labelled menu button, Escape closes it, and the menu links are at least 44px tall.
- **Buttons and links:** primary action is filled dark teal; secondary action is bordered. All keyboard focus states are visible. On narrow screens, paired actions become full-width to prevent cramped targets.
- **Hero:** first viewport must state role, work outcome, location, fit signals, one primary inquiry action, and a credible, non-interactive operations summary. It must not make a fabricated product UI the central visual.
- **Work list:** use a single bordered board with numbered rows, concise outcome heading, explanatory copy, and a short three-item capability list. Rows collapse from three columns to two and then one without changing reading order.
- **Process and notes:** process steps use modest framed blocks with a named step and practical rationale. Article cards expose date, topic, title, and a short description; hover changes must not be required to understand them.
- **Contact:** repeat the inquiry expectation and offer direct email plus GitHub. External links use `rel="noopener"`. No form states are needed because no form is provided.
- **System states:** links, buttons, menu state, card hover, focus, and reduced-motion behavior are required. Empty, loading, validation, selected, error, and permission states do not apply to the current static read-only surface; add them before introducing dynamic UI.
- **Responsive behavior:** use a 1180px max content width, 48px gutters on desktop and 40px on narrow screens. The hero stacks by 1080px, nav collapses by 820px, and multi-column cards stack by 820px. Preserve reading order and avoid horizontal scroll at 320px.

## 6. Do's And Don'ts

- Do use the existing semantic tokens and real portrait/logo assets; keep the calm navy, blue-grey, clay, and ochre palette.
- Do write for operators with concrete outcomes: reviewable changes, clear rollback, usable signals, and understandable ownership.
- Do preserve semantic landmarks, accessible labels, visible focus, resilient wrapping, and `prefers-reduced-motion` behavior.
- Do make any new static route share the same nav, token system, and mobile rules.
- Do not use gradients as decoration, gradient text, oversize icon tiles, fake product screenshots, or emoji as UI icons.
- Do not add card-on-card layouts, side accent borders, generic agency language, remote font calls, third-party scripts, or inline styles.
- Do not turn every tool into a badge; tooling should support a specific operating outcome.
- Any exception to these rules must state the user-facing reason in code review or this document.
