/**
 * i18n engine — loads packs from js/i18n/{nl,en}.js into ThaiSweetsI18nData.
 * Dutch (nl) is the default.
 *
 * Thai is hidden test mode only: ?lang=th turns it on for this browser (remembered),
 * ?lang=nl or ?lang=en turns it off. th.js is loaded only while Thai is on, and the
 * page gets <meta name="robots" content="noindex">. See HANDOFF.md.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "thaisweets_lang";
  var ORDER = "https://order.thaisweets.nl";
  var THAI_PACK_URL = null;
  try {
    THAI_PACK_URL = new URL("i18n/th.js", document.currentScript.src).href;
  } catch (e) {}
  // Thai stays false (NL + EN only) unless test mode switches it on below.
  var SUPPORTED = { nl: true, en: true, th: false };
  var lang = "nl";

  function packs() {
    return window.ThaiSweetsI18nData || {};
  }

  function getByPath(obj, path) {
    var parts = String(path).split(".");
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (!cur || typeof cur !== "object") return null;
      cur = cur[parts[i]];
    }
    return cur == null ? null : cur;
  }

  function t(key) {
    var data = packs();
    var val = getByPath(data[lang], key);
    if (val == null && lang !== "en") val = getByPath(data.en, key);
    if (val == null && lang !== "nl") val = getByPath(data.nl, key);
    return val == null ? key : val;
  }

  function menuField(id, field) {
    var data = packs();
    var row = getByPath(data[lang], "items." + id) || getByPath(data.en, "items." + id);
    return row ? row[field] : null;
  }

  function readStored() {
    try {
      var s = localStorage.getItem(STORAGE_KEY);
      if (s && SUPPORTED[s]) return s;
    } catch (e) {}
    return null;
  }

  function applyMeta() {
    var page = document.body && document.body.getAttribute("data-page");
    if (!page) return;
    var title = t("meta." + page + "Title");
    var desc = t("meta." + page + "Desc");
    if (title && title.indexOf("meta.") !== 0) document.title = title;
    var md = document.querySelector('meta[name="description"]');
    if (md && desc && desc.indexOf("meta.") !== 0) md.setAttribute("content", desc);
    var ogt = document.querySelector('meta[property="og:title"]');
    if (ogt && title && title.indexOf("meta.") !== 0) ogt.setAttribute("content", title);
    var ogd = document.querySelector('meta[property="og:description"]');
    if (ogd && desc && desc.indexOf("meta.") !== 0) ogd.setAttribute("content", desc);
  }

  function applyElement(el) {
    var key = el.getAttribute("data-i18n");
    if (!key) return;
    var attr = el.getAttribute("data-i18n-attr");
    var val = t(key);
    if (attr === "html") {
      el.innerHTML = val;
      return;
    }
    if (attr) {
      attr.split(",").forEach(function (a) {
        a = a.trim();
        if (!a) return;
        if (a === "text") el.textContent = val;
        else if (a === "html") el.innerHTML = val;
        else el.setAttribute(a, val);
      });
      return;
    }
    el.textContent = val;
  }

  function applyMenuItems(root) {
    (root || document).querySelectorAll("[data-menu-item]").forEach(function (el) {
      var id = el.getAttribute("data-menu-item");
      var field = el.getAttribute("data-menu-field") || "name";
      var val = menuField(id, field);
      if (val == null) return;
      if (el.tagName === "IMG" || field === "alt") el.setAttribute("alt", val);
      else el.textContent = val;
    });
  }

  function applyOrderLinks(root) {
    (root || document).querySelectorAll("[data-order-path]").forEach(function (a) {
      var path = a.getAttribute("data-order-path") || "/";
      if (path.charAt(0) !== "/") path = "/" + path;
      a.href = ORDER + "/" + lang + (path === "/" ? "/" : path);
    });
    (root || document).querySelectorAll("[data-legal]").forEach(function (a) {
      var hash = a.getAttribute("data-legal");
      a.href = ORDER + "/" + lang + "/legal#" + hash;
    });
  }

  function applyLangControls() {
    document.querySelectorAll(".lang-switch").forEach(function (group) {
      group.setAttribute("aria-label", t("a11y.language"));
      group.querySelectorAll("button[data-lang]").forEach(function (btn) {
        var code = btn.getAttribute("data-lang");
        var active = code === lang;
        btn.setAttribute("aria-pressed", active ? "true" : "false");
        if (active) btn.setAttribute("aria-current", "true");
        else btn.removeAttribute("aria-current");
        var labelKey =
          code === "nl" ? "a11y.langNl" : code === "th" ? "a11y.langTh" : "a11y.langEn";
        btn.setAttribute("aria-label", t(labelKey));
      });
    });
  }

  function applyThemeLabel() {
    var theme = document.documentElement.getAttribute("data-theme") || "light";
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.setAttribute(
        "aria-label",
        t(theme === "dark" ? "a11y.themeToLight" : "a11y.themeToDark")
      );
    });
  }

  function applyHomeHero() {
    var h1 = document.querySelector("[data-i18n-home-h1]");
    if (!h1) return;
    h1.replaceChildren();
    h1.appendChild(document.createTextNode(t("home.h1Before")));
    var span = document.createElement("span");
    span.className = "accent-italic";
    span.textContent = t("home.h1Accent");
    h1.appendChild(span);
  }

  function apply(root) {
    document.documentElement.lang = lang;
    document.documentElement.setAttribute("data-lang", lang);
    applyMeta();
    (root || document).querySelectorAll("[data-i18n]").forEach(applyElement);
    applyMenuItems(root);
    applyOrderLinks(root);
    applyLangControls();
    applyThemeLabel();
    applyHomeHero();
    document.documentElement.setAttribute("data-i18n-ready", "true");
  }

  function setLang(next) {
    if (!SUPPORTED[next]) return;
    lang = next;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
    apply();
    document.dispatchEvent(new CustomEvent("thaisweets:lang", { detail: { lang: lang } }));
  }

  function bind() {
    document.querySelectorAll(".lang-switch button[data-lang]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setLang(btn.getAttribute("data-lang"));
      });
    });
  }

  // Test mode: ?lang=th|nl|en. Only "th" turns Thai on; nl/en turn it off again.
  function thaiTestMode() {
    var q = null;
    try {
      q = new URLSearchParams(window.location.search).get("lang");
    } catch (e) {}
    if (q === "th" || q === "nl" || q === "en") {
      try {
        localStorage.setItem(STORAGE_KEY, q);
      } catch (e) {}
      return q === "th";
    }
    try {
      return localStorage.getItem(STORAGE_KEY) === "th";
    } catch (e) {}
    return false;
  }

  function loadThai() {
    if (!THAI_PACK_URL) return;
    var meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    var s = document.createElement("script");
    s.src = THAI_PACK_URL;
    s.onload = function () {
      SUPPORTED.th = true;
      lang = "th";
      apply();
      document.dispatchEvent(new CustomEvent("thaisweets:lang", { detail: { lang: lang } }));
    };
    document.head.appendChild(s);
  }

  var thaiOn = thaiTestMode();
  lang = readStored() || "nl";
  if (thaiOn) loadThai();

  window.ThaiSweetsI18n = {
    t: t,
    getLang: function () {
      return lang;
    },
    setLang: setLang,
    apply: apply,
    menuField: menuField,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      apply();
      bind();
    });
  } else {
    apply();
    bind();
  }
})();
