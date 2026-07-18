export const SITE = Object.freeze({
  name: "Hipolit Badowski",
  url: "https://hipo.is-a.dev",
  email: "badowhp@gmail.com",
  emailHref: "mailto:badowhp@gmail.com",
  github: "https://github.com/badowhp",
  linkedin: "https://www.linkedin.com/in/hipolitb/",
  project: "https://github.com/badowhp/skill-mania",
  image: "/assets/img/ich.jpg",
  logo: "/assets/logo-hipo.svg"
});

export const LOCALES = Object.freeze(["en", "de"]);

export function homePath(locale) {
  return locale === "de" ? "/de/" : "/";
}

export function labPath(locale) {
  return locale === "de" ? "/de/lab/" : "/lab/";
}
