import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITE, homePath, labPath } from "../src/config.mjs";
import { renderHome, renderLab, renderNotFound } from "../src/templates.mjs";

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
    || !/^\d{4}-\d{2}-\d{2}$/.test(data.meta?.lastModified)
    || data.work?.items?.length !== 4
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

function sitemapEntry(route, lastModified, alternates) {
  const abs = (value) => xmlEscape(new URL(value, SITE.url).href);
  return `  <url>
    <loc>${abs(route)}</loc>
    <lastmod>${xmlEscape(lastModified)}</lastmod>
    <xhtml:link rel="alternate" hreflang="en" href="${abs(alternates.en)}" />
    <xhtml:link rel="alternate" hreflang="de" href="${abs(alternates.de)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(alternates.en)}" />
  </url>`;
}

function renderSitemap(dataByLocale) {
  const homeAlternates = { en: "/", de: "/de/" };
  const labAlternates = { en: "/lab/", de: "/de/lab/" };
  const urls = [
    sitemapEntry("/", dataByLocale.en.meta.lastModified, homeAlternates),
    sitemapEntry("/de/", dataByLocale.de.meta.lastModified, homeAlternates),
    sitemapEntry("/lab/", dataByLocale.en.lab.meta.lastModified, labAlternates),
    sitemapEntry("/de/lab/", dataByLocale.de.lab.meta.lastModified, labAlternates)
  ].join("\n");

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

  const labAlternatePaths = { en: labPath("en"), de: labPath("de") };
  for (const locale of ["en", "de"]) {
    await writeRoute(labPath(locale), renderLab({ data: dataByLocale[locale], alternatePaths: labAlternatePaths }));
  }

  await writeRoute("/404.html", renderNotFound({ data: dataByLocale.en }));
  await writeRoute("/sitemap.xml", renderSitemap(dataByLocale));
  await writeRoute("/robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`);
  await writeRoute("/site.webmanifest", `${JSON.stringify({
    name: `${SITE.name} — DevOps & AI Infrastructure Engineer`,
    short_name: SITE.name,
    start_url: "/",
    display: "standalone",
    background_color: "#edf3f5",
    theme_color: "#071521",
    icons: [{ src: SITE.logo, sizes: "any", type: "image/svg+xml", purpose: "any" }]
  }, null, 2)}\n`);
  await writeRoute("/CNAME", `${new URL(SITE.url).hostname}\n`);
  await writeRoute("/.nojekyll", "");

  process.stdout.write("Built 5 HTML pages and a sitemap in _site/.\n");
}

await build();
