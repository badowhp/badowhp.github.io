# Compact Portfolio Plan

## Direction

Turn the existing long-form “operator’s field journal” into an operations brief: bold headline, little copy, no decorative proof machinery. The finished page should communicate the offer and provide credible proof in a short scroll.

## Information Architecture

1. **Masthead:** identity, Work, Open source, Contact, and EN/DE.
2. **Hero:** the role and location as the H1, “Infrastructure should be boring” in the supporting sentence, email action, GitHub path, portrait, and one compact expertise line.
3. **Work:** four numbered rows for platforms, delivery, operations, and private AI infrastructure.
4. **Open source:** one dark Skill Mania band with one verifiable description and repository link.
5. **Method:** one line — understand, simplify, document — instead of three process panels.
6. **Contact:** direct email-led close plus LinkedIn and GitHub.

The fit strip, proof grid, portrait biography, long method section, Notes preview, blog, posts, feeds, and blog-specific routes are removed.

## Implementation

- Reduce localized JSON to copy used by the remaining home and 404 surfaces.
- Simplify shared templates and navigation; remove blog/post renderers and structured-data variants.
- Simplify the static build to emit `/`, `/de/`, `404.html`, sitemap, robots, manifest, assets, and publishing files only.
- Remove Markdown sources and blog/feed validation from the repository checks.
- Replace the CSS with the flatter operations-brief layout while preserving tokens, focus, menu behavior, localization, and 320px resilience.
- Update documentation to match the smaller architecture and publishing contract.

## Responsive and Interaction States

- Desktop uses a two-column hero; mobile keeps copy before portrait.
- Work rows move from a compact multi-column grid to one reading column without changing DOM order.
- Long German words, email, and repository paths wrap safely.
- Navigation closes on Escape, outside click, link selection, and desktop resize; focus returns to the menu button.
- Hover, focus-visible, current-language, menu-open, and reduced-motion states remain visible.

## Verification

1. Run syntax, build, repository checks, and the design-tell scanner.
2. Capture English and German home routes at 1440px, 390px, and 320px.
3. Inspect full-page hierarchy, portrait crop, horizontal overflow, console errors, failed requests, mobile menu, touch target height, Escape behavior, and focus return.
4. Confirm removed blog/post/feed routes and source files are absent from the build and repository.
5. Perform a final design-review gate against `DESIGN.md`; only close on `PASS`.
