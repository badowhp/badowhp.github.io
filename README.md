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

## Local Testing

These commands assume macOS with `tidy`, Node.js, and Google Chrome available.

Open `index.html` directly in a browser for a quick static check:

```sh
open index.html
```

Run the lightweight checks used for this static site:

```sh
tidy -qe index.html 404.html blog/index.html blog/posts/devops-in-2026/index.html blog/posts/kubernetes-at-scale/index.html
node --check assets/js/main.js
git diff --check
```

Mirror the GitHub Pages staging validation locally:

```sh
set -e
tmp="$(mktemp -d)"
mkdir -p "$tmp/_site/assets/css" "$tmp/_site/assets/js"
cp assets/css/main.css "$tmp/_site/assets/css/"
cp -R assets/img "$tmp/_site/assets/"
cp assets/logo-hipo.svg "$tmp/_site/assets/"
cp assets/js/main.js "$tmp/_site/assets/js/"
cp -R blog "$tmp/_site/"
cp 404.html CNAME index.html .nojekyll "$tmp/_site/"
if grep -R -n -E 'localhost:1313|livereload\.js|fonts\.googleapis\.com|fonts\.gstatic\.com|style=' "$tmp/_site"; then
  echo "Found development-only URLs, external font calls, or inline styles."
  exit 1
fi
```

Capture a desktop visual smoke-test screenshot with local Chrome:

```sh
'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' --headless=new --disable-gpu --hide-scrollbars --window-size=1440,1100 --screenshot=/private/tmp/hipo-desktop.png "file://$PWD/index.html"
```

For 390px and 320px mobile checks, use Chrome DevTools device emulation or a DevTools Protocol capture. Plain headless `--window-size` can crop a wider layout viewport instead of testing the intended mobile CSS width.

Optional served check for absolute paths and `404.html` behavior:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8000/`. The deployed artifact is assembled by the GitHub Pages workflow on `main`.
