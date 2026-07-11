export const SITE = Object.freeze({
  name: "Hipolit Badowski",
  url: "https://hipo.is-a.dev",
  email: "badowhp@gmail.com",
  emailHref: "mailto:badowhp@gmail.com",
  github: "https://github.com/badowhp",
  linkedin: "https://www.linkedin.com/in/hipolit-badowski",
  project: "https://github.com/badowhp/skill-mania",
  image: "/assets/img/ich.png",
  logo: "/assets/logo-hipo.svg"
});

export const LOCALES = Object.freeze(["en", "de"]);

export function homePath(locale) {
  return locale === "de" ? "/de/" : "/";
}

export function blogPath(locale) {
  return locale === "de" ? "/de/blog/" : "/blog/";
}

export function postPath(locale, slug) {
  return `${blogPath(locale)}posts/${slug}/`;
}

