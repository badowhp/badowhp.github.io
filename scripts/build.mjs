import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITE, homePath } from "../src/config.mjs";
import { renderHome, renderNotFound } from "../src/templates.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = path.join(ROOT, "_site");
const DATA_DIR = path.join(ROOT, "src", "data");

async function loadData(locale) {
  const filename = path.join(DATA_DIR, `site.${locale}.json`);
  const data = JSON.parse(await readFile(filename, "utf8"));
  if (
    data.locale !== locale
    || !data.languageCode
    || !data.meta?.homeTitle
    || data.work?.items?.length !== 3
  ) {
    throw new Error(`${filename}: invalid locale data contract`);
  }
  return data;
}

function outputPath(route) {
  const relative = route.replace(/^\//, "");
  if (!relative || route.endsWith("/")) {
    return path.join(OUTPUT, relative, "index.html");
  }
  return path.join(OUTPUT, relative);
}

async function writeRoute(route, contents) {
  const filename = outputPath(route);
  await mkdir(path.dirname(filename), { recursive: true });
  await writeFile(filename, contents, "utf8");
}

function xmlEscape(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function renderSitemap() {
  const entries = ["/", "/de/"];
  const urls = entries.map((route) => `  <url>
    <loc>${xmlEscape(new URL(route, SITE.url).href)}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${xmlEscape(new URL("/", SITE.url).href)}" />
    <xhtml:link rel="alternate" hreflang="de" href="${xmlEscape(new URL("/de/", SITE.url).href)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(new URL("/", SITE.url).href)}" />
  </url>`).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}

async function build() {
  const dataByLocale = {
    en: await loadData("en"),
    de: await loadData("de")
  };

  await rm(OUTPUT, { recursive: true, force: true });
  await mkdir(OUTPUT, { recursive: true });
  await cp(path.join(ROOT, "assets"), path.join(OUTPUT, "assets"), { recursive: true });

  const alternatePaths = { en: homePath("en"), de: homePath("de") };
  for (const locale of ["en", "de"]) {
    const data = dataByLocale[locale];
    await writeRoute(homePath(locale), renderHome({ data, alternatePaths }));
  }

  await writeRoute("/404.html", renderNotFound({ data: dataByLocale.en }));
  await writeRoute("/sitemap.xml", renderSitemap());
  await writeRoute("/robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`);
  await writeRoute("/site.webmanifest", `${JSON.stringify({
    name: `${SITE.name} — Platform & DevOps Engineer`,
    short_name: SITE.name,
    start_url: "/",
    display: "standalone",
    background_color: "#edf3f5",
    theme_color: "#071521",
    icons: [{ src: SITE.logo, sizes: "any", type: "image/svg+xml", purpose: "any" }]
  }, null, 2)}\n`);
  await writeRoute("/CNAME", `${new URL(SITE.url).hostname}\n`);
  await writeRoute("/.nojekyll", "");

  process.stdout.write("Built 3 HTML pages and a sitemap in _site/.\n");
}

await build();
