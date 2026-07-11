(function () {
  "use strict";

  const header = document.getElementById("site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const desktopMedia = window.matchMedia("(min-width: 901px)");

  if (header && menuToggle && mobileMenu) {
    const openLabel = menuToggle.dataset.openLabel || "Open navigation";
    const closeLabel = menuToggle.dataset.closeLabel || "Close navigation";

    function isOpen() {
      return menuToggle.getAttribute("aria-expanded") === "true";
    }

    function openMenu() {
      mobileMenu.hidden = false;
      menuToggle.setAttribute("aria-expanded", "true");
      menuToggle.setAttribute("aria-label", closeLabel);
      document.body.classList.add("menu-open");
    }

    function closeMenu(options = {}) {
      if (!isOpen() && mobileMenu.hidden) return;
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", openLabel);
      mobileMenu.hidden = true;
      document.body.classList.remove("menu-open");
      if (options.restoreFocus) menuToggle.focus();
    }

    menuToggle.addEventListener("click", function () {
      if (isOpen()) closeMenu();
      else openMenu();
    });

    mobileMenu.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("click", function (event) {
      if (isOpen() && !header.contains(event.target)) closeMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isOpen()) {
        event.preventDefault();
        closeMenu({ restoreFocus: true });
      }
    });

    desktopMedia.addEventListener("change", function (event) {
      if (event.matches) closeMenu();
    });
  }

  const observedSections = Array.from(document.querySelectorAll("main section[id]"));
  const sectionLinks = Array.from(document.querySelectorAll(".site-nav-link[data-section-link]"));

  if (observedSections.length && sectionLinks.length && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(function (entries) {
      const visible = entries
        .filter(function (entry) { return entry.isIntersecting; })
        .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });

      if (!visible.length) return;
      const activeId = visible[0].target.id;
      sectionLinks.forEach(function (link) {
        link.classList.toggle("is-active", link.dataset.sectionLink === activeId);
      });
    }, {
      rootMargin: "-30% 0px -60% 0px",
      threshold: [0, .2, .5]
    });

    observedSections.forEach(function (section) { observer.observe(section); });
  }
})();
