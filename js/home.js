/* Home page: review carousel. */
(function () {
  "use strict";

  var INTERVAL_MS = 60000;
  var NAMES = ["B., Leiden", "A., Rotterdam", "W., Zoetermeer"];

  function t(key) {
    return window.ThaiSweetsI18n && window.ThaiSweetsI18n.t ? window.ThaiSweetsI18n.t(key) : key;
  }


  /* FAQPage JSON-LD: static Dutch copy sits in index.html; rebuild it from the visible text so it always matches the language shown. */
  function updateFaqSchema() {
    var script = document.getElementById("faq-jsonld");
    var items = document.querySelectorAll("[data-faq]");
    if (!script || !items.length) return;
    var entities = [];
    items.forEach(function (item) {
      var q = item.querySelector(".faq__q");
      var a = item.querySelector(".faq__a");
      if (!q || !a) return;
      entities.push({
        "@type": "Question",
        name: q.textContent.trim(),
        acceptedAnswer: { "@type": "Answer", text: a.textContent.trim() },
      });
    });
    script.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: entities }, null, 2);
  }
  document.addEventListener("thaisweets:lang", updateFaqSchema);
  if (document.documentElement.getAttribute("data-i18n-ready")) updateFaqSchema();
  else document.addEventListener("DOMContentLoaded", function () { window.setTimeout(updateFaqSchema, 0); });

  /* Photo carousel: native scroll-snap, buttons page through the photos. */
  var car = document.querySelector("[data-carousel]");
  if (car) {
    var track = car.querySelector("[data-carousel-track]");
    var prevBtn = car.querySelector("[data-carousel-prev]");
    var nextBtn = car.querySelector("[data-carousel-next]");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    var updateButtons = function () {
      var max = track.scrollWidth - track.clientWidth;
      var atStart = track.scrollLeft <= 2;
      var atEnd = track.scrollLeft >= max - 2;
      var focused = document.activeElement;
      prevBtn.disabled = atStart;
      nextBtn.disabled = atEnd;
      // A disabled button loses focus; hand it to the other one.
      if (focused === prevBtn && atStart) nextBtn.focus();
      else if (focused === nextBtn && atEnd) prevBtn.focus();
    };
    var page = function (dir) {
      var item = track.querySelector(".carousel__item");
      var step = item.getBoundingClientRect().width + 16;
      var visible = Math.max(1, Math.floor(track.clientWidth / step));
      track.scrollBy({ left: dir * step * visible, behavior: reduce.matches ? "auto" : "smooth" });
    };
    prevBtn.addEventListener("click", function () { page(-1); });
    nextBtn.addEventListener("click", function () { page(1); });
    track.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);
    updateButtons();
  }

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
