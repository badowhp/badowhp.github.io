import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITE } from "../src/config.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = path.join(ROOT, "_site");
const errors = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  }));
  return nested.flat();
}

function routeForFile(filename) {
  const relative = path.relative(OUTPUT, filename).split(path.sep).join("/");
  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html")) return `/${relative.slice(0, -"index.html".length)}`;
  return `/${relative}`;
}

function fileForRoute(route) {
  const clean = decodeURIComponent(route).replace(/^\//, "");
  if (!clean || route.endsWith("/")) return path.join(OUTPUT, clean, "index.html");
  return path.join(OUTPUT, clean);
}

function valuesForAttribute(html, attribute) {
  const values = [];
  const expression = new RegExp(`\\b${attribute}="([^"]*)"`, "g");
  for (const match of html.matchAll(expression)) values.push(match[1]);
  return values;
}

function idsForHtml(html) {
  return valuesForAttribute(html, "id");
}

function localTarget(value, route) {
  if (!value || /^(?:https?:|mailto:|tel:|data:)/.test(value)) return null;
  const url = new URL(value, new URL(route, SITE.url));
  return { pathname: url.pathname, hash: url.hash };
}

const files = await walk(OUTPUT);
const fileSet = new Set(files.map((filename) => path.resolve(filename)));
const htmlFiles = files.filter((filename) => filename.endsWith(".html"));
const htmlByRoute = new Map();
const idsByRoute = new Map();
const seoExpectations = {
  "/": {
    title: "DevOps Engineer Vienna | Hipolit Badowski",
    heading: "DevOps Engineer in Vienna.",
    descriptionPhrase: "Vienna-based DevOps engineer",
    visiblePhrase: "Independent DevOps engineer in Vienna",
    offerPhrases: ["Agentic AI infrastructure", "private local LLM systems"],
    lastModified: "2026-07-13",
    alternateLocale: "de_AT",
    city: "Vienna"
  },
  "/de/": {
    title: "DevOps Engineer Wien | Hipolit Badowski",
    heading: "DevOps Engineer in Wien.",
    descriptionPhrase: "DevOps Engineer Hipolit Badowski in Wien",
    visiblePhrase: "Selbstständiger DevOps Engineer in Wien",
    offerPhrases: ["agentische AI-Infrastruktur", "private lokale LLM-Systeme"],
    lastModified: "2026-07-13",
    alternateLocale: "en_GB",
    city: "Vienna"
  }
};

for (const filename of htmlFiles) {
  const route = routeForFile(filename);
  const html = await readFile(filename, "utf8");
  htmlByRoute.set(route, html);
  idsByRoute.set(route, new Set(idsForHtml(html)));
}

const expectedRoutes = ["/", "/404.html", "/de/"];
const actualRoutes = [...htmlByRoute.keys()].sort();
if (JSON.stringify(actualRoutes) !== JSON.stringify(expectedRoutes)) {
  errors.push(`unexpected HTML routes: ${actualRoutes.join(", ")}`);
}

let checkedLinks = 0;

for (const [route, html] of htmlByRoute) {
  if (!/^<!doctype html>/i.test(html)) errors.push(`${route}: missing HTML5 doctype`);
  if (!/<html lang="(?:en-GB|de-AT)">/.test(html)) errors.push(`${route}: missing supported lang attribute`);
  if (!/<meta name="viewport"/.test(html)) errors.push(`${route}: missing viewport metadata`);
  if (!/<meta name="description" content="[^"]+">/.test(html)) errors.push(`${route}: missing meta description`);
  if (!/<meta http-equiv="Content-Security-Policy"/.test(html)) errors.push(`${route}: missing Content Security Policy`);
  if (!/<link rel="canonical" href="https:\/\/hipo\.is-a\.dev\//.test(html)) errors.push(`${route}: missing canonical URL`);
  if (!/<a class="skip-link" href="#main">/.test(html)) errors.push(`${route}: missing skip link`);
  if (route === "/404.html" && !/<meta name="robots" content="noindex, follow">/.test(html)) {
    errors.push(`${route}: 404 page must be noindex`);
  }
  if (route !== "/404.html" && /<meta name="robots" content="[^"]*noindex/.test(html)) {
    errors.push(`${route}: indexable route unexpectedly uses noindex`);
  }

  const h1Count = (html.match(/<h1(?:\s|>)/g) || []).length;
  if (h1Count !== 1) errors.push(`${route}: expected one h1, found ${h1Count}`);
  if (route === "/404.html" && /<link rel="alternate" hreflang=/.test(html)) {
    errors.push(`${route}: noindex page must not advertise language alternates`);
  }

  const seoExpectation = seoExpectations[route];
  if (seoExpectation) {
    const bodyHtml = html.slice(html.indexOf("<body"));
    if (!html.includes(`<title>${seoExpectation.title}</title>`)) {
      errors.push(`${route}: title is not aligned with the local DevOps search target`);
    }
    if (!html.includes(`<h1 id="hero-title">${seoExpectation.heading}</h1>`)) {
      errors.push(`${route}: H1 is not aligned with the local DevOps search target`);
    }
    const description = html.match(/<meta name="description" content="([^"]+)">/)?.[1] || "";
    if (!description.includes(seoExpectation.descriptionPhrase)) {
      errors.push(`${route}: description is missing the local DevOps search target`);
    }
    if (!bodyHtml.includes(seoExpectation.visiblePhrase)) {
      errors.push(`${route}: visible content is missing the local DevOps search target`);
    }
    for (const phrase of seoExpectation.offerPhrases) {
      if (!bodyHtml.includes(phrase)) errors.push(`${route}: visible content is missing AI offer phrase: ${phrase}`);
    }
    const alternateCount = (html.match(/<link rel="alternate" hreflang=/g) || []).length;
    if (alternateCount !== 3) errors.push(`${route}: expected three language alternate links, found ${alternateCount}`);
    if (!html.includes(`<meta property="og:locale:alternate" content="${seoExpectation.alternateLocale}">`)) {
      errors.push(`${route}: missing Open Graph alternate locale`);
    }
    if (!html.includes('<meta property="og:image:type" content="image/png">')) {
      errors.push(`${route}: missing Open Graph image type`);
    }
    if (!/<meta name="twitter:image:alt" content="[^"]+">/.test(html)) {
      errors.push(`${route}: missing Twitter image alt text`);
    }

    const jsonLd = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)?.[1];
    if (!jsonLd) {
      errors.push(`${route}: missing JSON-LD`);
    } else {
      try {
        const schema = JSON.parse(jsonLd);
        const website = schema["@graph"]?.find((entry) => entry["@type"] === "WebSite");
        const profile = schema["@graph"]?.find((entry) => entry["@type"] === "ProfilePage");
        const person = profile?.mainEntity;
        if (website?.alternateName !== "hipo.is-a.dev") {
          errors.push(`${route}: WebSite schema is missing its alternate name`);
        }
        if (
          profile?.dateModified !== seoExpectation.lastModified
          || person?.jobTitle !== "DevOps Engineer"
          || person?.address?.addressLocality !== seoExpectation.city
          || !person?.description?.includes(seoExpectation.descriptionPhrase)
          || !person?.knowsAbout?.includes("Agentic AI infrastructure")
          || !person?.knowsAbout?.includes("Private local LLM systems")
        ) {
          errors.push(`${route}: Person schema is not aligned with the local DevOps search target`);
        }
      } catch {
        errors.push(`${route}: JSON-LD is invalid JSON`);
      }
    }
  }

  const ids = idsForHtml(html);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length) errors.push(`${route}: duplicate ids: ${[...new Set(duplicateIds)].join(", ")}`);

  if (/\sstyle=|<style(?:\s|>)/i.test(html)) errors.push(`${route}: inline styles are not allowed`);
  if (/http:\/\//i.test(html)) errors.push(`${route}: insecure http URL found`);
  if (/localhost|livereload\.js|fonts\.googleapis\.com|fonts\.gstatic\.com/i.test(html)) {
    errors.push(`${route}: development or remote-font resource found`);
  }
  if (/\b(?:blog|notes|rss)\b/i.test(html)) errors.push(`${route}: removed Notes/blog copy or route found`);

  for (const tag of html.match(/<script\b[^>]*>/g) || []) {
    if (!/\bsrc="[^"]+"/.test(tag) && !/type="application\/ld\+json"/.test(tag)) {
      errors.push(`${route}: executable inline script is not allowed`);
    }
  }

  for (const tag of html.match(/<a\b[^>]*target="_blank"[^>]*>/g) || []) {
    if (!/rel="noopener noreferrer"/.test(tag)) errors.push(`${route}: target=_blank link missing safe rel`);
  }

  for (const tag of html.match(/<img\b[^>]*>/g) || []) {
    if (!/\balt="[^"]*"/.test(tag)) errors.push(`${route}: image missing alt attribute`);
    if (!/\bwidth="\d+"/.test(tag) || !/\bheight="\d+"/.test(tag)) {
      errors.push(`${route}: image missing explicit dimensions`);
    }
  }

  for (const value of [...valuesForAttribute(html, "href"), ...valuesForAttribute(html, "src")]) {
    const target = localTarget(value, route);
    if (!target) continue;
    checkedLinks += 1;
    const targetFile = fileForRoute(target.pathname);
    if (!fileSet.has(path.resolve(targetFile))) {
      errors.push(`${route}: missing internal target ${value}`);
      continue;
    }
    if (target.hash && targetFile.endsWith("index.html")) {
      const targetRoute = routeForFile(targetFile);
      const targetIds = idsByRoute.get(targetRoute);
      const id = decodeURIComponent(target.hash.slice(1));
      if (targetIds && !targetIds.has(id)) errors.push(`${route}: missing anchor target ${value}`);
    }
  }
}

for (const [route, html] of htmlByRoute) {
  for (const match of html.matchAll(/<link rel="alternate" hreflang="(en|de)" href="([^"]+)">/g)) {
    const [, language, href] = match;
    const targetRoute = new URL(href).pathname;
    const targetHtml = htmlByRoute.get(targetRoute);
    if (!targetHtml) {
      errors.push(`${route}: hreflang ${language} target does not exist: ${targetRoute}`);
      continue;
    }
    const sourceLanguage = /<html lang="de-AT">/.test(html) ? "de" : "en";
    const sourceUrl = new URL(route, SITE.url).href;
    const escapedUrl = sourceUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const reciprocal = new RegExp(`<link rel="alternate" hreflang="${sourceLanguage}" href="${escapedUrl}">`);
    if (!reciprocal.test(targetHtml)) errors.push(`${route}: hreflang ${language} target is not reciprocal`);
  }
}

for (const required of ["sitemap.xml", "robots.txt", "site.webmanifest", "CNAME", ".nojekyll"]) {
  if (!fileSet.has(path.join(OUTPUT, required))) errors.push(`missing required output: /${required}`);
}

const sitemap = await readFile(path.join(OUTPUT, "sitemap.xml"), "utf8");
for (const [route, expectation] of Object.entries(seoExpectations)) {
  const canonical = new URL(route, SITE.url).href;
  const expectedEntry = `<loc>${canonical}</loc>\n    <lastmod>${expectation.lastModified}</lastmod>`;
  if (!sitemap.includes(expectedEntry)) errors.push(`sitemap.xml: missing accurate lastmod for ${route}`);
}

if (files.some((filename) => filename.includes(`${path.sep}blog${path.sep}`) || filename.endsWith(".xml") && !filename.endsWith("sitemap.xml"))) {
  errors.push("removed blog or feed output is still present");
}

const manifest = JSON.parse(await readFile(path.join(OUTPUT, "site.webmanifest"), "utf8"));
if (
  manifest.start_url !== "/"
  || manifest.theme_color !== "#071521"
  || !manifest.name.includes("DevOps & AI Infrastructure Engineer")
) {
  errors.push("site.webmanifest: invalid identity, start URL, or theme color");
}

const portrait = await stat(path.join(OUTPUT, "assets", "img", "ich.png"));
if (portrait.size < 100_000) errors.push("portrait asset looks unexpectedly small");

if (errors.length) {
  process.stderr.write(`Site checks failed (${errors.length}):\n- ${errors.join("\n- ")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`Checked ${htmlFiles.length} HTML pages and ${checkedLinks} local links/assets with no errors.\n`);
}
