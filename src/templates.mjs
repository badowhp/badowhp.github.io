import { createHash } from "node:crypto";
import { SITE, blogPath, homePath } from "./config.mjs";

export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function absolute(path) {
  return new URL(path, SITE.url).href;
}

function safeJson(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

function schemaForHome(data, path) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE.url}/#website`,
        url: `${SITE.url}/`,
        name: SITE.name,
        inLanguage: ["en-GB", "de-AT"]
      },
      {
        "@type": "ProfilePage",
        "@id": `${absolute(path)}#profile`,
        url: absolute(path),
        name: data.meta.homeTitle,
        description: data.meta.homeDescription,
        inLanguage: data.languageCode,
        isPartOf: { "@id": `${SITE.url}/#website` },
        mainEntity: {
          "@type": "Person",
          "@id": `${SITE.url}/#person`,
          name: SITE.name,
          jobTitle: "Platform and DevOps Engineer",
          image: absolute(SITE.image),
          url: `${SITE.url}/`,
          email: SITE.emailHref,
          address: {
            "@type": "PostalAddress",
            addressLocality: "Vienna",
            addressCountry: "AT"
          },
          sameAs: [SITE.github, SITE.linkedin],
          knowsAbout: [
            "Platform engineering",
            "Kubernetes",
            "Cloud infrastructure",
            "Continuous delivery",
            "Infrastructure as code",
            "Production operations"
          ]
        }
      }
    ]
  };
}

function schemaForBlog(data, path, posts) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${absolute(path)}#blog`,
    url: absolute(path),
    name: data.meta.blogTitle,
    description: data.meta.blogDescription,
    inLanguage: data.languageCode,
    author: { "@id": `${SITE.url}/#person` },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: absolute(post.route),
      datePublished: post.date,
      inLanguage: data.languageCode
    }))
  };
}

function schemaForPost(data, post) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${absolute(post.route)}#article`,
    mainEntityOfPage: absolute(post.route),
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: data.languageCode,
    image: absolute(SITE.image),
    author: {
      "@type": "Person",
      "@id": `${SITE.url}/#person`,
      name: SITE.name,
      url: `${SITE.url}/`
    },
    publisher: {
      "@type": "Person",
      "@id": `${SITE.url}/#person`,
      name: SITE.name
    },
    keywords: post.tags.join(", "),
    wordCount: post.wordCount
  };
}

function layout({
  data,
  path,
  alternatePaths,
  title,
  description,
  body,
  pageType = "website",
  schema,
  publishedTime = "",
  current = "",
  bodyClass = "",
  robots = ""
}) {
  const structuredData = safeJson(schema);
  const structuredDataHash = createHash("sha256").update(structuredData).digest("base64");
  const csp = [
    "default-src 'self'",
    "base-uri 'none'",
    "connect-src 'none'",
    "font-src 'self'",
    "form-action 'none'",
    "img-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    `script-src 'self' 'sha256-${structuredDataHash}'`,
    "style-src 'self'",
    "upgrade-insecure-requests"
  ].join("; ");
  const alternateEn = alternatePaths?.en;
  const alternateDe = alternatePaths?.de;
  const xDefault = alternateEn || "/";
  const articleMeta = publishedTime
    ? `\n  <meta property="article:published_time" content="${escapeHtml(publishedTime)}">`
    : "";

  return `<!doctype html>
<html lang="${escapeHtml(data.languageCode)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="author" content="${SITE.name}">
  ${robots ? `<meta name="robots" content="${escapeHtml(robots)}">` : ""}
  <meta name="theme-color" content="${data.meta.themeColor}">
  <meta name="color-scheme" content="light">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <meta http-equiv="Content-Security-Policy" content="${escapeHtml(csp)}">
  <link rel="canonical" href="${absolute(path)}">
  ${alternateEn ? `<link rel="alternate" hreflang="en" href="${absolute(alternateEn)}">` : ""}
  ${alternateDe ? `<link rel="alternate" hreflang="de" href="${absolute(alternateDe)}">` : ""}
  <link rel="alternate" hreflang="x-default" href="${absolute(xDefault)}">
  <link rel="alternate" type="application/rss+xml" title="${escapeHtml(data.meta.blogTitle)}" href="${absolute(`${blogPath(data.locale)}index.xml`)}">
  <meta property="og:site_name" content="${SITE.name}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${absolute(path)}">
  <meta property="og:type" content="${pageType}">
  <meta property="og:locale" content="${data.languageCode.replace("-", "_")}">
  <meta property="og:image" content="${absolute(SITE.image)}">
  <meta property="og:image:width" content="874">
  <meta property="og:image:height" content="952">
  <meta property="og:image:alt" content="${escapeHtml(data.hero.portraitAlt)}">${articleMeta}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${absolute(SITE.image)}">
  <link rel="icon" href="${SITE.logo}" type="image/svg+xml">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="stylesheet" href="/assets/css/main.css">
  <script type="application/ld+json">${structuredData}</script>
  <script src="/assets/js/main.js" defer></script>
</head>
<body class="${escapeHtml(bodyClass)}">
  <a class="skip-link" href="#main">${escapeHtml(data.skip)}</a>
  ${siteHeader(data, path, alternatePaths, current)}
  ${body}
  ${siteFooter(data)}
</body>
</html>
`;
}

function navLinks(data, path, mobile = false, current = "") {
  const home = homePath(data.locale);
  const isHome = path === home;
  const items = [
    ["work", data.nav.work],
    ["build", data.nav.build],
    ["method", data.nav.method],
    ["notes", data.nav.notes]
  ];

  return items.map(([id, label]) => {
    const href = id === "notes" ? blogPath(data.locale) : `${isHome ? "" : home}#${id}`;
    const className = mobile ? "mobile-menu-link" : "site-nav-link";
    const currentAttribute = current === id ? ' aria-current="page"' : "";
    return `<a class="${className}" href="${href}" data-section-link="${id}"${currentAttribute}>${escapeHtml(label)}</a>`;
  }).join("\n          ");
}

function languageSwitch(data, alternatePaths, mobile = false) {
  const enPath = alternatePaths?.en || "/";
  const dePath = alternatePaths?.de || "/de/";
  const className = mobile ? "mobile-language" : "language-switch";
  return `<div class="${className}" aria-label="${escapeHtml(data.nav.language)}">
            <a href="${enPath}" lang="en" hreflang="en"${data.locale === "en" ? ' class="is-current" aria-current="true"' : ""}><span aria-hidden="true">EN</span><span class="sr-only">English</span></a>
            <span aria-hidden="true">/</span>
            <a href="${dePath}" lang="de" hreflang="de"${data.locale === "de" ? ' class="is-current" aria-current="true"' : ""}><span aria-hidden="true">DE</span><span class="sr-only">Deutsch</span></a>
          </div>`;
}

function siteHeader(data, path, alternatePaths, current) {
  const home = homePath(data.locale);
  return `<header class="site-header" id="site-header">
    <div class="container header-inner">
      <a class="brand" href="${home}" aria-label="${escapeHtml(data.nav.homeAria)}">
        <img class="brand-mark" src="${SITE.logo}" alt="" width="44" height="44">
        <span class="brand-copy">
          <strong>${SITE.name}</strong>
          <small>${escapeHtml(data.nav.role)}</small>
        </span>
      </a>
      <nav class="site-nav" aria-label="${escapeHtml(data.nav.aria)}">
        ${navLinks(data, path, false, current)}
      </nav>
      <div class="header-actions">
        ${languageSwitch(data, alternatePaths)}
        <a class="header-contact" href="${SITE.emailHref}">${escapeHtml(data.nav.contact)}</a>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="${escapeHtml(data.nav.menuOpen)}" data-open-label="${escapeHtml(data.nav.menuOpen)}" data-close-label="${escapeHtml(data.nav.menuClose)}">
          <span class="menu-toggle-lines" aria-hidden="true"><span></span><span></span></span>
          <span class="menu-toggle-text">Menu</span>
        </button>
      </div>
    </div>
    <div class="mobile-menu" id="mobile-menu" hidden>
      <nav class="container mobile-menu-inner" aria-label="${escapeHtml(data.nav.aria)}">
        ${navLinks(data, path, true, current)}
        ${languageSwitch(data, alternatePaths, true)}
        <a class="button button-primary mobile-contact" href="${SITE.emailHref}">${escapeHtml(data.nav.contact)}</a>
      </nav>
    </div>
  </header>`;
}

function siteFooter(data) {
  return `<footer class="site-footer">
    <div class="container footer-grid">
      <div>
        <a class="footer-name" href="${homePath(data.locale)}">${SITE.name}</a>
        <p>${escapeHtml(data.footer.strapline)}</p>
      </div>
      <div class="footer-social" aria-label="${escapeHtml(data.contact.eyebrow)}">
        <a href="${SITE.emailHref}">${escapeHtml(data.contact.email)}</a>
        <a href="${SITE.linkedin}" target="_blank" rel="noopener noreferrer">${escapeHtml(data.contact.linkedin)} <span aria-hidden="true">↗</span></a>
        <a href="${SITE.github}" target="_blank" rel="noopener noreferrer">${escapeHtml(data.contact.github)} <span aria-hidden="true">↗</span></a>
      </div>
      <div class="footer-meta">
        <span>${escapeHtml(data.footer.location)}</span>
        <span>© ${new Date().getUTCFullYear()} ${SITE.name}</span>
      </div>
    </div>
  </footer>`;
}

function postPreview(data, post, compact = false) {
  return `<article class="note-row${compact ? " note-row-compact" : ""}">
    <a href="${post.route}" aria-label="${escapeHtml(`${data.blog.open}: ${post.title}`)}">
      <div class="note-meta">
        <time datetime="${post.date}">${escapeHtml(post.formattedDate)}</time>
        <span>${escapeHtml(post.topic)}</span>
      </div>
      <div class="note-copy">
        <h3>${escapeHtml(post.title)}</h3>
        <p>${escapeHtml(post.description)}</p>
      </div>
      <span class="note-arrow" aria-hidden="true">↗</span>
    </a>
  </article>`;
}

export function renderHome({ data, posts, alternatePaths }) {
  const path = homePath(data.locale);
  const proof = data.hero.proof.map((item) => `<div role="listitem">
              <span class="proof-label">${escapeHtml(item.label)}</span>
              <strong>${escapeHtml(item.value)}</strong>
            </div>`).join("\n            ");
  const fit = data.fit.items.map((item) => `<div>
            <span>${escapeHtml(item.label)}</span>
            <strong>${escapeHtml(item.value)}</strong>
          </div>`).join("\n          ");
  const work = data.work.items.map((item) => `<article class="work-row">
            <span class="work-index">${escapeHtml(item.index)}</span>
            <div class="work-copy">
              <p class="work-label">${escapeHtml(item.label)}</p>
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.body)}</p>
            </div>
            <ul class="work-facts">
              ${item.facts.map((fact) => `<li>${escapeHtml(fact)}</li>`).join("\n              ")}
            </ul>
          </article>`).join("\n          ");
  const buildFacts = data.build.facts.map((fact) => `<li>${escapeHtml(fact)}</li>`).join("\n              ");
  const method = data.method.steps.map((step) => `<div class="method-step">
              <span>${escapeHtml(step.index)}</span>
              <strong>${escapeHtml(step.title)}</strong>
              <p>${escapeHtml(step.body)}</p>
            </div>`).join("\n            ");
  const notes = posts.slice(0, 2).map((post) => postPreview(data, post, true)).join("\n          ");

  const body = `<main id="main">
    <section class="hero" id="top" aria-labelledby="hero-title">
      <div class="container hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">${escapeHtml(data.hero.eyebrow)}</p>
          <h1 id="hero-title">${escapeHtml(data.hero.title)}</h1>
          <p class="hero-lede">${escapeHtml(data.hero.lede)}</p>
          <div class="hero-actions">
            <a class="button button-primary" href="${SITE.emailHref}">${escapeHtml(data.hero.primaryAction)}</a>
            <a class="button button-secondary" href="${SITE.github}" target="_blank" rel="noopener noreferrer">${escapeHtml(data.hero.secondaryAction)} <span aria-hidden="true">↗</span></a>
          </div>
          <div class="proof-rail" role="list" aria-label="${escapeHtml(data.hero.proofAria)}">
            ${proof}
          </div>
        </div>
        <figure class="portrait-card">
          <div class="portrait-frame">
            <img src="${SITE.image}" alt="${escapeHtml(data.hero.portraitAlt)}" width="874" height="952" fetchpriority="high">
            <span class="portrait-coordinate" aria-hidden="true">48.2082° N<br>16.3738° E</span>
          </div>
          <figcaption>
            <p class="portrait-kicker">${escapeHtml(data.hero.portraitKicker)}</p>
            <h2>${escapeHtml(data.hero.portraitName)}</h2>
            <p>${escapeHtml(data.hero.portraitBody)}</p>
            <dl>
              <dt>${escapeHtml(data.hero.portraitMetaLabel)}</dt>
              <dd>${escapeHtml(data.hero.portraitMetaValue)}</dd>
            </dl>
          </figcaption>
        </figure>
      </div>
    </section>

    <section class="fit-strip" aria-label="${escapeHtml(data.fit.aria)}">
      <div class="container fit-grid">
        ${fit}
      </div>
    </section>

    <section class="section work-section" id="work" aria-labelledby="work-title">
      <div class="container">
        <div class="section-heading">
          <div>
            <p class="eyebrow">${escapeHtml(data.work.eyebrow)}</p>
            <h2 id="work-title">${escapeHtml(data.work.title)}</h2>
          </div>
          <p>${escapeHtml(data.work.intro)}</p>
        </div>
        <div class="work-board">
          ${work}
        </div>
      </div>
    </section>

    <section class="section build-section" id="build" aria-labelledby="build-title">
      <div class="container build-grid">
        <div class="build-copy">
          <p class="eyebrow">${escapeHtml(data.build.eyebrow)}</p>
          <h2 id="build-title">${escapeHtml(data.build.title)}</h2>
          <p>${escapeHtml(data.build.body)}</p>
          <ul class="build-facts">
            ${buildFacts}
          </ul>
        </div>
        <a class="build-action" href="${SITE.project}" target="_blank" rel="noopener noreferrer">
          <span>${escapeHtml(data.build.actionKicker)}</span>
          <strong>${escapeHtml(data.build.action)} <span aria-hidden="true">↗</span></strong>
          <small>${escapeHtml(data.build.actionPath)}</small>
        </a>
      </div>
    </section>

    <section class="section method-section" id="method" aria-labelledby="method-title">
      <div class="container method-grid">
        <div class="method-copy">
          <p class="eyebrow">${escapeHtml(data.method.eyebrow)}</p>
          <h2 id="method-title">${escapeHtml(data.method.title)}</h2>
          <p>${escapeHtml(data.method.body)}</p>
        </div>
        <div class="method-steps" aria-label="${escapeHtml(data.method.stepsAria)}">
          ${method}
        </div>
      </div>
    </section>

    <section class="section notes-section" id="notes" aria-labelledby="notes-title">
      <div class="container">
        <div class="section-heading notes-heading">
          <div>
            <p class="eyebrow">${escapeHtml(data.notes.eyebrow)}</p>
            <h2 id="notes-title">${escapeHtml(data.notes.title)}</h2>
          </div>
          <div>
            <p>${escapeHtml(data.notes.intro)}</p>
            <a class="text-link" href="${blogPath(data.locale)}">${escapeHtml(data.notes.allAction)} <span aria-hidden="true">→</span></a>
          </div>
        </div>
        <div class="note-list">
          ${notes}
        </div>
      </div>
    </section>

    <section class="section contact-section" id="contact" aria-labelledby="contact-title">
      <div class="container contact-grid">
        <div class="contact-copy">
          <p class="eyebrow">${escapeHtml(data.contact.eyebrow)}</p>
          <h2 id="contact-title">${escapeHtml(data.contact.title)}</h2>
          <p>${escapeHtml(data.contact.body)}</p>
        </div>
        <div class="contact-panel">
          <dl>
            <dt>${escapeHtml(data.contact.contextLabel)}</dt>
            <dd>${escapeHtml(data.contact.contextValue)}</dd>
            <dt>${escapeHtml(data.contact.terrainLabel)}</dt>
            <dd>${escapeHtml(data.contact.terrainValue)}</dd>
          </dl>
          <div class="contact-links">
            <a href="${SITE.emailHref}"><span>${escapeHtml(data.contact.email)}</span><strong>${SITE.email}</strong></a>
            <a href="${SITE.linkedin}" target="_blank" rel="noopener noreferrer"><span>${escapeHtml(data.contact.linkedin)}</span><strong>hipolit-badowski ↗</strong></a>
            <a href="${SITE.github}" target="_blank" rel="noopener noreferrer"><span>${escapeHtml(data.contact.github)}</span><strong>badowhp ↗</strong></a>
          </div>
        </div>
      </div>
    </section>
  </main>`;

  return layout({
    data,
    path,
    alternatePaths,
    title: data.meta.homeTitle,
    description: data.meta.homeDescription,
    body,
    schema: schemaForHome(data, path),
    current: "home",
    bodyClass: "home-page"
  });
}

export function renderBlog({ data, posts, alternatePaths }) {
  const path = blogPath(data.locale);
  const list = posts.map((post) => postPreview(data, post)).join("\n        ");
  const body = `<main id="main">
    <header class="page-hero">
      <div class="container page-hero-grid">
        <div>
          <p class="eyebrow">${escapeHtml(data.blog.eyebrow)}</p>
          <h1>${escapeHtml(data.blog.title)}</h1>
        </div>
        <div>
          <p>${escapeHtml(data.blog.intro)}</p>
          <a class="feed-link" href="${path}index.xml">${escapeHtml(data.blog.feed)} <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </header>
    <section class="section blog-index" aria-label="${escapeHtml(data.blog.eyebrow)}">
      <div class="container note-list">
        ${list}
      </div>
    </section>
  </main>`;

  return layout({
    data,
    path,
    alternatePaths,
    title: data.meta.blogTitle,
    description: data.meta.blogDescription,
    body,
    schema: schemaForBlog(data, path, posts),
    current: "notes",
    bodyClass: "blog-page"
  });
}

function adjacentLink(label, post, direction) {
  if (!post) return "";
  return `<a class="adjacent-link adjacent-${direction}" href="${post.route}">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(post.title)}</strong>
        </a>`;
}

export function renderPost({ data, post, alternatePaths, previous, next }) {
  const tags = post.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("\n            ");
  const body = `<main id="main">
    <article>
      <header class="post-hero">
        <div class="container post-hero-inner">
          <a class="back-link" href="${blogPath(data.locale)}">← ${escapeHtml(data.blog.backNotes)}</a>
          <div class="post-meta">
            <time datetime="${post.date}">${escapeHtml(post.formattedDate)}</time>
            <span>${post.readingTime} ${escapeHtml(data.blog.readTime)}</span>
            <span>${escapeHtml(post.topic)}</span>
          </div>
          <h1>${escapeHtml(post.title)}</h1>
          <p>${escapeHtml(post.description)}</p>
        </div>
      </header>
      <div class="post-layout container">
        <aside class="post-aside" aria-label="${escapeHtml(data.blog.eyebrow)}">
          <span>${escapeHtml(data.blog.eyebrow)}</span>
          <ul>${tags}</ul>
        </aside>
        <div class="post-content">
          ${post.html}
        </div>
      </div>
    </article>
    <nav class="adjacent-notes container" aria-label="${escapeHtml(data.blog.eyebrow)}">
      ${adjacentLink(data.blog.previous, previous, "previous")}
      ${adjacentLink(data.blog.next, next, "next")}
    </nav>
  </main>`;

  return layout({
    data,
    path: post.route,
    alternatePaths,
    title: `${post.title} | ${SITE.name}`,
    description: post.description,
    body,
    pageType: "article",
    schema: schemaForPost(data, post),
    publishedTime: post.date,
    current: "notes",
    bodyClass: "post-page"
  });
}

export function renderNotFound({ data, alternatePaths }) {
  const path = "/404.html";
  const body = `<main class="not-found" id="main">
    <section class="not-found-panel" aria-labelledby="not-found-title">
      <p class="eyebrow">${escapeHtml(data.notFound.eyebrow)}</p>
      <h1 id="not-found-title">${escapeHtml(data.notFound.title)}</h1>
      <p>${escapeHtml(data.notFound.body)}</p>
      <div class="not-found-actions">
        <a class="button button-primary" href="/">${escapeHtml(data.notFound.home)}</a>
        <a class="button button-secondary" href="/blog/">${escapeHtml(data.notFound.notes)}</a>
        <a class="text-link" href="/de/" lang="de">${escapeHtml(data.notFound.german)} →</a>
      </div>
    </section>
  </main>`;

  return layout({
    data,
    path,
    alternatePaths,
    title: `Page not found | ${SITE.name}`,
    description: data.notFound.body,
    body,
    schema: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Page not found",
      url: absolute(path),
      isPartOf: { "@id": `${SITE.url}/#website` }
    },
    bodyClass: "not-found-page",
    robots: "noindex, follow"
  });
}
