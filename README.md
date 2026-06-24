# hipo.is-a.dev

Static portfolio and technical notes for Hipolit Badowski.

## Deployed Surface

GitHub Pages deploys only the handcrafted static site:

- `index.html`
- `404.html`
- `blog/`
- `assets/css/main.css`
- `assets/img/`
- `assets/logo-hipo.svg`
- `assets/js/main.js`
- `CNAME`
- `.nojekyll`

The deploy workflow stages this list explicitly in `.github/workflows/deploy-pages.yml`.

## Edit Notes

- Keep reader-facing copy direct and modest.
- Avoid inline styles; the Pages workflow rejects them so the meta CSP can stay strict.
- Do not add third-party scripts or font calls without a clear reason.
- Generated or experimental Hugo output under `public/`, `resources/`, `content/`, and related folders is not part of the deployed static surface unless the workflow is changed.

## Local Check

Open `index.html` directly in a browser for a quick static check. The deployed artifact is assembled by the GitHub Pages workflow on `main`.
