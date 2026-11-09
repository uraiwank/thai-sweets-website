/* Home page: review carousel + cookie settings link. */
(function () {
  "use strict";

  var INTERVAL_MS = 60000;
  var NAMES = ["B., Leiden", "A., Rotterdam", "W., Zoetermeer"];

  function t(key) {
    return window.ThaiSweetsI18n && window.ThaiSweetsI18n.t ? window.ThaiSweetsI18n.t(key) : key;
  }

  document.querySelectorAll('[href="#cookie-settings"], [data-cookie-settings]').forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      if (window.CookieConsent && window.CookieConsent.showPreferences) {
        window.CookieConsent.showPreferences();
      }
    });
  });

  var root = document.querySelector("[data-reviews]");
  if (!root) return;

  var live = root.querySelector("[data-reviews-live]");
  var textEl = root.querySelector("[data-reviews-text]");
  var nameEl = root.querySelector("[data-reviews-name]");
  var posEl = root.querySelector("[data-reviews-pos]");
  var toggle = root.querySelector("[data-reviews-toggle]");
  var state = { i: 0, paused: false, manual: false };

  function render() {
    textEl.textContent = "“" + t("home2.review" + (state.i + 1)) + "”";
    nameEl.textContent = NAMES[state.i];
    posEl.textContent = state.i + 1 + t("home2.reviewOf") + NAMES.length;
    live.setAttribute("aria-live", state.paused || state.manual ? "polite" : "off");
    toggle.setAttribute("aria-pressed", state.paused ? "true" : "false");
    toggle.textContent = t(state.paused ? "home2.play" : "home2.pause");
    root.setAttribute("aria-label", t("home2.reviewsLabel"));
    root.querySelector("[data-reviews-prev]").setAttribute("aria-label", t("home2.reviewPrev"));
    root.querySelector("[data-reviews-next]").setAttribute("aria-label", t("home2.reviewNext"));
    root.querySelector(".stars").setAttribute("aria-label", t("home2.reviewStars"));
  }

  function go(step) {
    state.i = (state.i + step + NAMES.length) % NAMES.length;
    state.manual = true;
    render();
  }

  root.querySelector("[data-reviews-prev]").addEventListener("click", function () {
    go(-1);
  });
  root.querySelector("[data-reviews-next]").addEventListener("click", function () {
    go(1);
  });
  toggle.addEventListener("click", function () {
    state.paused = !state.paused;
    render();
  });

  window.setInterval(function () {
    if (state.paused) return;
    state.i = (state.i + 1) % NAMES.length;
    render();
  }, INTERVAL_MS);

  document.addEventListener("thaisweets:lang", render);
  // i18n.js applies the language on DOMContentLoaded; render once it is ready.
  if (document.documentElement.getAttribute("data-i18n-ready")) render();
  else document.addEventListener("DOMContentLoaded", function () { window.setTimeout(render, 0); });
})();
