(function () {
  "use strict";

  var ORDER_APP_URL = "https://order.thaisweets.nl";

  document.documentElement.classList.add("js");

  function safeStorage(fn) {
    try {
      return fn();
    } catch (e) {
      return null;
    }
  }

  function getPreferredTheme() {
    var stored = safeStorage(function () {
      return localStorage.getItem("thaisweets_theme");
    });
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var btn = document.querySelector("[data-theme-toggle]");
    if (btn) {
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      btn.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      );
    }
  }

  applyTheme(getPreferredTheme());

  document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next =
        document.documentElement.getAttribute("data-theme") === "dark"
          ? "light"
          : "dark";
      applyTheme(next);
      safeStorage(function () {
        localStorage.setItem("thaisweets_theme", next);
      });
    });
  });

  /* Language switcher placeholder — EN active */
  document.querySelectorAll(".lang-switch button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".lang-switch button").forEach(function (b) {
        b.removeAttribute("aria-current");
      });
      btn.setAttribute("aria-current", "true");
    });
  });

  /* Sticky header shrink */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Mobile menu */
  var toggle = document.querySelector("[data-menu-toggle]");
  var panel = document.getElementById("mobile-nav");
  var lastFocus = null;

  function getFocusable(container) {
    return Array.prototype.slice.call(
      container.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
    );
  }

  function closeMenu() {
    if (!toggle || !panel) return;
    panel.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  function openMenu() {
    if (!toggle || !panel) return;
    lastFocus = document.activeElement;
    panel.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    var focusables = getFocusable(panel);
    if (focusables[0]) focusables[0].focus();
  }

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      if (panel.classList.contains("is-open")) closeMenu();
      else openMenu();
    });

    panel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel.classList.contains("is-open")) {
        closeMenu();
      }
      if (e.key === "Tab" && panel.classList.contains("is-open")) {
        var focusables = getFocusable(panel);
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  /* Cookie settings footer links */
  document.querySelectorAll('[href="#cookie-settings"], [data-cookie-settings]').forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      if (window.CookieConsent && window.CookieConsent.showPreferences) {
        window.CookieConsent.showPreferences();
      }
    });
  });

  /* Scroll reveal */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll("[data-reveal]").forEach(function (el, i) {
      el.style.transitionDelay = (i % 6) * 70 + "ms";
      observer.observe(el);
    });

    document.querySelectorAll(".hero-animate, .hero-visual-animate").forEach(function (el, i) {
      el.style.transitionDelay = i * 80 + "ms";
      requestAnimationFrame(function () {
        el.classList.add("is-visible");
      });
    });

    document.querySelectorAll(".star-animate").forEach(function (el, i) {
      el.style.transitionDelay = i * 80 + "ms";
      observer.observe(el);
    });
  } else {
    document
      .querySelectorAll("[data-reveal], .hero-animate, .hero-visual-animate, .star-animate")
      .forEach(function (el) {
        el.classList.add("is-visible");
      });
  }

  /* Menu chips: highlight section in view */
  var chips = document.querySelectorAll(".menu-chips a[href^='#']");
  var sections = [];
  chips.forEach(function (chip) {
    var id = chip.getAttribute("href").slice(1);
    var section = document.getElementById(id);
    if (section) sections.push({ chip: chip, section: section });
  });

  if (sections.length && "IntersectionObserver" in window) {
    var chipObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          chips.forEach(function (c) {
            c.classList.remove("is-active");
            c.removeAttribute("aria-current");
          });
          var match = sections.find(function (s) {
            return s.section === entry.target;
          });
          if (match) {
            match.chip.classList.add("is-active");
            match.chip.setAttribute("aria-current", "true");
          }
        });
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach(function (s) {
      chipObserver.observe(s.section);
    });
  }

  /* Expose order URL for debugging / future use */
  window.ThaiSweets = { orderUrl: ORDER_APP_URL };
})();
