import { createHash } from "node:crypto";
import { SITE, homePath } from "./config.mjs";

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
        alternateName: "hipo.is-a.dev",
        inLanguage: ["en-GB", "de-AT"]
      },
      {
        "@type": "ProfilePage",
        "@id": `${absolute(path)}#profile`,
        url: absolute(path),
        name: data.meta.homeTitle,
        description: data.meta.homeDescription,
        dateModified: data.meta.lastModified,
        inLanguage: data.languageCode,
        isPartOf: { "@id": `${SITE.url}/#website` },
        mainEntity: {
          "@type": "Person",
          "@id": `${SITE.url}/#person`,
          name: SITE.name,
          jobTitle: "DevOps Engineer",
          description: data.meta.homeDescription,
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
            "DevOps engineering",
            "Platform engineering",
            "Agentic AI infrastructure",
            "Private local LLM systems",
            "Local LLM deployment",
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

function layout({
  data,
  path,
  alternatePaths,
  title,
  description,
  body,
  schema,
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
  const xDefault = alternateEn;
  const alternateLocale = data.locale === "de" ? "en_GB" : "de_AT";

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
  ${xDefault ? `<link rel="alternate" hreflang="x-default" href="${absolute(xDefault)}">` : ""}
  <meta property="og:site_name" content="${SITE.name}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${absolute(path)}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="${data.languageCode.replace("-", "_")}">
  ${alternatePaths ? `<meta property="og:locale:alternate" content="${alternateLocale}">` : ""}
  <meta property="og:image" content="${absolute(SITE.image)}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="874">
  <meta property="og:image:height" content="952">
  <meta property="og:image:alt" content="${escapeHtml(data.hero.portraitAlt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${absolute(SITE.image)}">
  <meta name="twitter:image:alt" content="${escapeHtml(data.hero.portraitAlt)}">
  <link rel="icon" href="${SITE.logo}" type="image/svg+xml">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="stylesheet" href="/assets/css/main.css">
  <script type="application/ld+json">${structuredData}</script>
  <script src="/assets/js/main.js" defer></script>
</head>
<body class="${escapeHtml(bodyClass)}">
  <a class="skip-link" href="#main">${escapeHtml(data.skip)}</a>
  ${siteHeader(data, path, alternatePaths)}
  ${body}
  ${siteFooter(data)}
</body>
</html>
`;
}

function navLinks(data, path, mobile = false) {
  const home = homePath(data.locale);
  const isHome = path === home;
  const items = [
    ["work", data.nav.work],
    ["project", data.nav.project],
    ["contact", data.nav.contact]
  ];

  return items.map(([id, label]) => {
    const className = mobile ? "mobile-menu-link" : "site-nav-link";
    return `<a class="${className}" href="${isHome ? "" : home}#${id}" data-section-link="${id}">${escapeHtml(label)}</a>`;
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

function siteHeader(data, path, alternatePaths) {
  const home = homePath(data.locale);
  return `<header class="site-header" id="site-header">
    <div class="container header-inner">
      <a class="brand" href="${home}" aria-label="${escapeHtml(data.nav.homeAria)}">
        <img class="brand-mark" src="${SITE.logo}" alt="" width="40" height="40">
        <span class="brand-copy">
          <strong>${SITE.name}</strong>
          <small>${escapeHtml(data.nav.role)}</small>
        </span>
      </a>
      <nav class="site-nav" aria-label="${escapeHtml(data.nav.aria)}">
        ${navLinks(data, path)}
      </nav>
      <div class="header-actions">
        ${languageSwitch(data, alternatePaths)}
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="${escapeHtml(data.nav.menuOpen)}" data-open-label="${escapeHtml(data.nav.menuOpen)}" data-close-label="${escapeHtml(data.nav.menuClose)}">
          <span class="menu-toggle-lines" aria-hidden="true"><span></span><span></span></span>
          <span class="sr-only">Menu</span>
        </button>
      </div>
    </div>
    <div class="mobile-menu" id="mobile-menu" hidden>
      <nav class="container mobile-menu-inner" aria-label="${escapeHtml(data.nav.aria)}">
        ${navLinks(data, path, true)}
        ${languageSwitch(data, alternatePaths, true)}
      </nav>
    </div>
  </header>`;
}

function siteFooter(data) {
  return `<footer class="site-footer">
    <div class="container footer-row">
      <div>
        <a class="footer-name" href="${homePath(data.locale)}">${SITE.name}</a>
        <span>${escapeHtml(data.footer.strapline)}</span>
      </div>
      <div>
        <span>${escapeHtml(data.footer.location)}</span>
        <span>© ${new Date().getUTCFullYear()}</span>
      </div>
    </div>
  </footer>`;
}

export function renderHome({ data, alternatePaths }) {
  const path = homePath(data.locale);
  const work = data.work.items.map((item) => `<article class="work-row">
          <span class="work-index">${escapeHtml(item.index)}</span>
          <div class="work-name">
            <p>${escapeHtml(item.label)}</p>
            <h3>${escapeHtml(item.title)}</h3>
          </div>
          <p class="work-body">${escapeHtml(item.body)}</p>
          <p class="work-tools">${escapeHtml(item.tools)}</p>
        </article>`).join("\n        ");

  const body = `<main id="main">
    <section class="hero" aria-labelledby="hero-title">
      <div class="container hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">${escapeHtml(data.hero.eyebrow)}</p>
          <h1 id="hero-title">${escapeHtml(data.hero.title)}</h1>
          <p class="hero-lede">${escapeHtml(data.hero.lede)}</p>
          <div class="hero-actions">
            <a class="button button-primary" href="${SITE.emailHref}">${escapeHtml(data.hero.primaryAction)}</a>
            <a class="text-link" href="${SITE.github}" target="_blank" rel="noopener noreferrer">${escapeHtml(data.hero.secondaryAction)} <span aria-hidden="true">↗</span></a>
          </div>
          <p class="hero-expertise">
            <span>${escapeHtml(data.hero.expertiseLabel)}</span>
            <strong>${escapeHtml(data.hero.expertise)}</strong>
          </p>
        </div>
        <figure class="hero-portrait">
          <img src="${SITE.image}" alt="${escapeHtml(data.hero.portraitAlt)}" width="874" height="952" fetchpriority="high">
          <figcaption>${escapeHtml(data.hero.portraitCaption)}</figcaption>
        </figure>
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
        <div class="work-list">
          ${work}
        </div>
      </div>
    </section>

    <section class="section project-section" id="project" aria-labelledby="project-title">
      <div class="container project-grid">
        <div>
          <p class="eyebrow">${escapeHtml(data.project.eyebrow)}</p>
          <h2 id="project-title">${escapeHtml(data.project.title)}</h2>
        </div>
        <div class="project-copy">
          <p>${escapeHtml(data.project.body)}</p>
          <a class="project-link" href="${SITE.project}" target="_blank" rel="noopener noreferrer">
            <span>${escapeHtml(data.project.action)}</span>
            <strong aria-hidden="true">↗</strong>
            <small>${escapeHtml(data.project.path)}</small>
          </a>
        </div>
      </div>
    </section>

    <section class="method-strip" aria-labelledby="method-title">
      <div class="container method-grid">
        <p class="eyebrow">${escapeHtml(data.method.eyebrow)}</p>
        <h2 id="method-title">${escapeHtml(data.method.title)}</h2>
        <p>${escapeHtml(data.method.body)}</p>
      </div>
    </section>

    <section class="section contact-section" id="contact" aria-labelledby="contact-title">
      <div class="container contact-grid">
        <div>
          <p class="eyebrow">${escapeHtml(data.contact.eyebrow)}</p>
          <h2 id="contact-title">${escapeHtml(data.contact.title)}</h2>
          <p class="contact-body">${escapeHtml(data.contact.body)}</p>
        </div>
        <div class="contact-links">
          <a href="${SITE.emailHref}"><span>${escapeHtml(data.contact.email)}</span><strong>${SITE.email}</strong><i aria-hidden="true">→</i></a>
          <a href="${SITE.linkedin}" target="_blank" rel="noopener noreferrer"><span>${escapeHtml(data.contact.linkedin)}</span><strong>hipolit-badowski</strong><i aria-hidden="true">↗</i></a>
          <a href="${SITE.github}" target="_blank" rel="noopener noreferrer"><span>${escapeHtml(data.contact.github)}</span><strong>badowhp</strong><i aria-hidden="true">↗</i></a>
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
    bodyClass: "home-page"
  });
}

export function renderNotFound({ data }) {
  const path = "/404.html";
  const body = `<main class="not-found" id="main">
    <section class="not-found-panel" aria-labelledby="not-found-title">
      <p class="eyebrow">${escapeHtml(data.notFound.eyebrow)}</p>
      <h1 id="not-found-title">${escapeHtml(data.notFound.title)}</h1>
      <p>${escapeHtml(data.notFound.body)}</p>
      <div class="not-found-actions">
        <a class="button button-primary" href="/">${escapeHtml(data.notFound.home)}</a>
        <a class="text-link" href="/de/" lang="de">${escapeHtml(data.notFound.german)} →</a>
      </div>
    </section>
  </main>`;

  return layout({
    data,
    path,
    alternatePaths: null,
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
