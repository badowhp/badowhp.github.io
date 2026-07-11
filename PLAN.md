# Portfolio Redesign Plan

## Direction

Build the portfolio as an “operator’s field journal”: a cool, editorial technical surface that communicates judgment and reliability without a fake terminal, tool wall, or generic agency language. The real portrait is the visual anchor. English and German are equal publishing surfaces; English remains the default route.

## Information Architecture

1. **Persistent masthead:** identity, Work, Build, Method, Notes, EN/DE switch, and one contact action.
2. **First viewport:** platform/delivery/operations role, one outcome-led headline, Vienna/remote context, primary email action, GitHub action, three short proof signals, and the portrait.
3. **Capabilities:** three numbered rows for platform foundations, dependable delivery, and operable systems.
4. **Selected build:** one verifiable open-source project, Skill Mania, with a direct GitHub path and no implied client claim.
5. **Method:** three sequential steps—understand, reduce risk, leave context.
6. **Notes:** the two newest localized posts plus a path to the full blog.
7. **Contact:** expectation-setting copy with email, LinkedIn, and GitHub presented at equal visual weight.

## Source and Build Architecture

- Replace the mixed handcrafted/Hugo/generated tree with one dependency-free Node build.
- Keep localized interface copy in `src/data/site.en.json` and `src/data/site.de.json`.
- Keep paired Markdown posts in `src/posts/en/` and `src/posts/de/`, using a small documented front matter contract.
- Render shared templates from `src/templates.mjs`; parse content and write routes from `scripts/build.mjs`.
- Treat `assets/` as the source for CSS, JavaScript, logo, and portrait; copy it into the build artifact.
- Generate `_site/` locally and in GitHub Actions, but do not commit it.
- Remove orphaned Hugo configuration, layouts, translation files, content, generated `public/`, generated `resources/`, legacy static copies, and the stale multilingual guide after their useful content has been migrated.

## Routes and Localization

| Surface | English | German |
| --- | --- | --- |
| Home | `/` | `/de/` |
| Notes index | `/blog/` | `/de/blog/` |
| Post | `/blog/posts/<slug>/` | `/de/blog/posts/<slug>/` |
| Feed | `/blog/index.xml` | `/de/blog/index.xml` |

- Language controls preserve the equivalent route by `translationKey`; missing post translations fall back to the alternate notes index.
- Every indexable HTML route gets the correct `lang`, canonical URL, `hreflang` alternates, localized title/description, Open Graph data, and visible language control.
- Generate a root sitemap, `robots.txt`, localized feeds, Person/ProfilePage schema on home, Blog schema on indexes, and BlogPosting schema on posts.

## Layout and Components

- Use one 1180px container, fluid 20–48px gutters, and a consistent 8px spacing rhythm.
- Implement midnight, frost, steel, and signal-teal semantic tokens before component styles.
- Keep the hero two-column above 980px and stack in DOM reading order below it.
- Keep capability content in bordered rows, not repeated floating cards.
- Use a dark selected-build band and dark contact panel as the only large inverse surfaces.
- Use stable button/menu/media dimensions and explicit image width, height, and aspect ratio.
- Keep blog prose near 72ch; let code scroll within its own block.

## Interaction and States

- Mobile navigation uses a real button with `aria-expanded` and `aria-controls`.
- Close the menu on Escape, outside click, selected route, and resize to desktop; return focus to the trigger after Escape.
- Provide visible hover, focus-visible, active/current-language, and open-menu states.
- Ensure the site remains readable without animation and remove transitions/smooth scrolling under `prefers-reduced-motion`.
- This static site has no loading, empty, validation, permission, or destructive action states. If dynamic features are added later, those states must be designed before release.

## Accessibility and Resilience

- Use one H1, semantic landmarks, useful alt text, a skip link, labelled navigation, and non-color-only current states.
- Keep interactive targets at least 44px, and use separate high-contrast focus colors on light and dark surfaces.
- Verify English and German at 1440px, 390px, and 320px, including long headings, repository paths, email addresses, and code blocks.
- Reject accidental horizontal page overflow, clipped actions, focus hidden behind the sticky masthead, console errors, and failed local asset requests.

## Publishing and Verification

1. Build into `_site/` with `node scripts/build.mjs`.
2. Run a repository check that validates front matter, paired routes, internal links/assets, required metadata, and unsafe inline/external resources.
3. Validate JavaScript syntax, HTML structure, the design-tell scanner, and extracted SEO signals.
4. Serve `_site/` locally and use `scripts/browser-qa.mjs` with Chrome DevTools emulation to capture desktop plus true narrow-mobile evidence for home, German home, blog index, and a post.
5. Exercise the mobile menu and keyboard focus; inspect overflow, console output, and failed requests.
6. Deploy only the built `_site/` artifact through the existing GitHub Pages Actions model.

## Delivery Sequence

1. Establish the build/content contracts and migrate the two current notes into safer, localized editorial posts.
2. Implement shared templates and the complete responsive visual system.
3. Add metadata, feeds, sitemap, route pairing, and publishing validation.
4. Remove the obsolete Hugo/generated surface and update repository documentation.
5. Run the full build, browser evidence matrix, and final design review; fix any `PASS WITH FIXES` or `FAIL` finding before handoff.
