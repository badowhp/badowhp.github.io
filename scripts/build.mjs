import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITE, blogPath, homePath, postPath } from "../src/config.mjs";
import { escapeHtml, renderBlog, renderHome, renderNotFound, renderPost } from "../src/templates.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = path.join(ROOT, "_site");
const DATA_DIR = path.join(ROOT, "src", "data");
const POSTS_DIR = path.join(ROOT, "src", "posts");

function parseFrontMatter(source, filename) {
  const normalized = source.replaceAll("\r\n", "\n");
  if (!normalized.startsWith("---\n")) {
    throw new Error(`${filename}: post must start with front matter`);
  }

  const end = normalized.indexOf("\n---\n", 4);
  if (end === -1) {
    throw new Error(`${filename}: front matter is not closed`);
  }

  const metadata = {};
  const header = normalized.slice(4, end);
  for (const [index, line] of header.split("\n").entries()) {
    if (!line.trim()) continue;
    const match = line.match(/^([A-Za-z][A-Za-z0-9]*):\s*(.+)$/);
    if (!match) {
      throw new Error(`${filename}: invalid front matter on line ${index + 2}`);
    }
    const [, key, rawValue] = match;
    try {
      metadata[key] = JSON.parse(rawValue);
    } catch {
      metadata[key] = rawValue.trim();
    }
  }

  return {
    metadata,
    markdown: normalized.slice(end + 5).trim()
  };
}

function validatePost(metadata, filename) {
  const requiredStrings = ["title", "slug", "date", "translationKey", "topic", "description"];
  for (const key of requiredStrings) {
    if (typeof metadata[key] !== "string" || !metadata[key].trim()) {
      throw new Error(`${filename}: ${key} must be a non-empty string`);
    }
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.slug)) {
    throw new Error(`${filename}: slug must be lowercase kebab-case`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(metadata.date) || Number.isNaN(Date.parse(`${metadata.date}T00:00:00Z`))) {
    throw new Error(`${filename}: date must use YYYY-MM-DD`);
  }
  if (!Array.isArray(metadata.tags) || metadata.tags.length === 0 || metadata.tags.some((tag) => typeof tag !== "string")) {
    throw new Error(`${filename}: tags must be a non-empty string array`);
  }
  if (typeof metadata.draft !== "boolean") {
    throw new Error(`${filename}: draft must be true or false`);
  }
}

function inlineMarkdown(value) {
  const tokens = [];
  const keep = (html) => {
    const token = `\u0000${tokens.length}\u0000`;
    tokens.push(html);
    return token;
  };

  let text = String(value)
    .replace(/`([^`\n]+)`/g, (_, code) => keep(`<code>${escapeHtml(code)}</code>`))
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
      const safeHref = /^(?:https:\/\/|mailto:|\/|#)/.test(href) ? href : "#";
      const external = safeHref.startsWith("https://")
        ? ' target="_blank" rel="noopener noreferrer"'
        : "";
      return keep(`<a href="${escapeHtml(safeHref)}"${external}>${escapeHtml(label)}</a>`);
    });

  text = escapeHtml(text).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  return text.replace(/\u0000(\d+)\u0000/g, (_, index) => tokens[Number(index)]);
}

function isBlockStart(line) {
  return !line.trim()
    || /^```/.test(line)
    || /^#{2,4}\s/.test(line)
    || /^>\s?/.test(line)
    || /^[-*]\s+/.test(line)
    || /^\d+\.\s+/.test(line)
    || /^---+$/.test(line.trim());
}

function renderMarkdown(markdown, filename) {
  const lines = markdown.replaceAll("\r\n", "\n").split("\n");
  const html = [];

  for (let index = 0; index < lines.length;) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fence = line.match(/^```([A-Za-z0-9_-]*)\s*$/);
    if (fence) {
      const code = [];
      index += 1;
      while (index < lines.length && !/^```\s*$/.test(lines[index])) {
        code.push(lines[index]);
        index += 1;
      }
      if (index === lines.length) {
        throw new Error(`${filename}: unclosed code fence`);
      }
      index += 1;
      const language = fence[1] ? ` class="language-${escapeHtml(fence[1])}"` : "";
      html.push(`<pre><code${language}>${escapeHtml(code.join("\n"))}</code></pre>`);
      continue;
    }

    const heading = line.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^>\s?/, ""));
        index += 1;
      }
      html.push(`<blockquote><p>${inlineMarkdown(quote.join(" "))}</p></blockquote>`);
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^[-*]\s+/, ""));
        index += 1;
      }
      html.push(`<ul>\n${items.map((item) => `  <li>${inlineMarkdown(item)}</li>`).join("\n")}\n</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      html.push(`<ol>\n${items.map((item) => `  <li>${inlineMarkdown(item)}</li>`).join("\n")}\n</ol>`);
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      html.push("<hr>");
      index += 1;
      continue;
    }

    const paragraph = [line.trim()];
    index += 1;
    while (index < lines.length && !isBlockStart(lines[index])) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    html.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
  }

  return html.join("\n");
}

function countWords(markdown) {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[[^\]]+\]\([^)]+\)/g, " ")
    .replace(/[#>*_`-]/g, " ")
    .trim();
  return plain ? plain.split(/\s+/u).length : 0;
}

async function loadData(locale) {
  const filename = path.join(DATA_DIR, `site.${locale}.json`);
  const data = JSON.parse(await readFile(filename, "utf8"));
  if (data.locale !== locale || !data.languageCode || !data.meta?.homeTitle) {
    throw new Error(`${filename}: invalid locale data contract`);
  }
  return data;
}

async function loadPosts(locale, data) {
  const directory = path.join(POSTS_DIR, locale);
  const filenames = (await readdir(directory)).filter((filename) => filename.endsWith(".md")).sort();
  const posts = [];

  for (const filename of filenames) {
    const fullPath = path.join(directory, filename);
    const source = await readFile(fullPath, "utf8");
    const { metadata, markdown } = parseFrontMatter(source, fullPath);
    validatePost(metadata, fullPath);
    if (metadata.draft) continue;

    const wordCount = countWords(markdown);
    posts.push({
      ...metadata,
      markdown,
      html: renderMarkdown(markdown, fullPath),
      wordCount,
      readingTime: Math.max(1, Math.ceil(wordCount / 210)),
      route: postPath(locale, metadata.slug),
      formattedDate: new Intl.DateTimeFormat(data.languageCode, {
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "UTC"
      }).format(new Date(`${metadata.date}T00:00:00Z`))
    });
  }

  return posts.sort((a, b) => b.date.localeCompare(a.date));
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

function renderFeed(data, posts) {
  const pathName = `${blogPath(data.locale)}index.xml`;
  const items = posts.map((post) => `    <item>
      <title>${xmlEscape(post.title)}</title>
      <link>${xmlEscape(new URL(post.route, SITE.url).href)}</link>
      <guid isPermaLink="true">${xmlEscape(new URL(post.route, SITE.url).href)}</guid>
      <pubDate>${new Date(`${post.date}T12:00:00Z`).toUTCString()}</pubDate>
      <description>${xmlEscape(post.description)}</description>
    </item>`).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(data.meta.blogTitle)}</title>
    <link>${xmlEscape(new URL(blogPath(data.locale), SITE.url).href)}</link>
    <description>${xmlEscape(data.meta.blogDescription)}</description>
    <language>${xmlEscape(data.languageCode)}</language>
    <atom:link href="${xmlEscape(new URL(pathName, SITE.url).href)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}

function renderSitemap(postsByLocale) {
  const entries = [];
  const add = (route, en, de, lastmod = "") => entries.push({ route, en, de, lastmod });
  add("/", "/", "/de/");
  add("/de/", "/", "/de/");
  add("/blog/", "/blog/", "/de/blog/");
  add("/de/blog/", "/blog/", "/de/blog/");

  for (const locale of ["en", "de"]) {
    for (const post of postsByLocale[locale]) {
      const pair = postsByLocale[locale === "en" ? "de" : "en"].find((candidate) => candidate.translationKey === post.translationKey);
      const en = locale === "en" ? post.route : pair?.route;
      const de = locale === "de" ? post.route : pair?.route;
      add(post.route, en, de, post.date);
    }
  }

  const urls = entries.map(({ route, en, de, lastmod }) => `  <url>
    <loc>${xmlEscape(new URL(route, SITE.url).href)}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}
    ${en ? `<xhtml:link rel="alternate" hreflang="en" href="${xmlEscape(new URL(en, SITE.url).href)}" />` : ""}
    ${de ? `<xhtml:link rel="alternate" hreflang="de" href="${xmlEscape(new URL(de, SITE.url).href)}" />` : ""}
    ${en ? `<xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(new URL(en, SITE.url).href)}" />` : ""}
  </url>`).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}

function assertUniquePosts(postsByLocale) {
  for (const locale of ["en", "de"]) {
    const slugs = new Set();
    const keys = new Set();
    for (const post of postsByLocale[locale]) {
      if (slugs.has(post.slug)) throw new Error(`${locale}: duplicate post slug ${post.slug}`);
      if (keys.has(post.translationKey)) throw new Error(`${locale}: duplicate translationKey ${post.translationKey}`);
      slugs.add(post.slug);
      keys.add(post.translationKey);
    }
  }

  for (const post of postsByLocale.en) {
    if (!postsByLocale.de.some((candidate) => candidate.translationKey === post.translationKey)) {
      throw new Error(`Missing German translation for ${post.translationKey}`);
    }
  }
  for (const post of postsByLocale.de) {
    if (!postsByLocale.en.some((candidate) => candidate.translationKey === post.translationKey)) {
      throw new Error(`Missing English translation for ${post.translationKey}`);
    }
  }
}

async function build() {
  const dataByLocale = {
    en: await loadData("en"),
    de: await loadData("de")
  };
  const postsByLocale = {
    en: await loadPosts("en", dataByLocale.en),
    de: await loadPosts("de", dataByLocale.de)
  };
  assertUniquePosts(postsByLocale);

  await rm(OUTPUT, { recursive: true, force: true });
  await mkdir(OUTPUT, { recursive: true });
  await cp(path.join(ROOT, "assets"), path.join(OUTPUT, "assets"), { recursive: true });

  const homeAlternates = { en: homePath("en"), de: homePath("de") };
  const blogAlternates = { en: blogPath("en"), de: blogPath("de") };

  for (const locale of ["en", "de"]) {
    const data = dataByLocale[locale];
    const posts = postsByLocale[locale];
    await writeRoute(homePath(locale), renderHome({ data, posts, alternatePaths: homeAlternates }));
    await writeRoute(blogPath(locale), renderBlog({ data, posts, alternatePaths: blogAlternates }));
    await writeRoute(`${blogPath(locale)}index.xml`, renderFeed(data, posts));

    for (const [index, post] of posts.entries()) {
      const alternateLocale = locale === "en" ? "de" : "en";
      const alternatePost = postsByLocale[alternateLocale].find((candidate) => candidate.translationKey === post.translationKey);
      const alternatePaths = locale === "en"
        ? { en: post.route, de: alternatePost?.route }
        : { en: alternatePost?.route, de: post.route };
      await writeRoute(post.route, renderPost({
        data,
        post,
        alternatePaths,
        previous: posts[index - 1],
        next: posts[index + 1]
      }));
    }
  }

  await writeRoute("/404.html", renderNotFound({
    data: dataByLocale.en,
    alternatePaths: null
  }));
  await writeRoute("/sitemap.xml", renderSitemap(postsByLocale));
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

  const pageCount = 5 + postsByLocale.en.length + postsByLocale.de.length;
  process.stdout.write(`Built ${pageCount} HTML pages, two feeds, and a sitemap in _site/.\n`);
}

await build();
