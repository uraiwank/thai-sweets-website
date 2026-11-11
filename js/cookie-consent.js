/**
 * Cookie consent for thaisweets.nl.
 *
 * Two categories:
 *  - Essential (language, theme, notify flag): always on, nothing to ask.
 *  - Analytics (Google Tag Manager / Google Analytics): off until the visitor accepts.
 *
 * Google Consent Mode v2: every consent signal starts "denied". Accepting updates only
 * analytics_storage to "granted"; ad_storage, ad_user_data and ad_personalization are never updated.
 * The GTM script (GTM-N8ND93C7) is not requested until analytics consent exists.
 *
 * The choice is stored in localStorage under thaisweets_consent_v2. The v1 key from the old banner
 * (which also stored advertising/personalisation) is deleted, so everyone is asked again.
 * Markup: #consent-banner and #consent-dialog (index.html, 404.html); [data-cookie-settings] opens the dialog.
 */
(function () {
  "use strict";

  var KEY = "thaisweets_consent_v2";
  var OLD_KEYS = ["thaisweets_cookie_consent"];
  var GTM_ID = "GTM-N8ND93C7";

  try {
    OLD_KEYS.forEach(function (k) {
      localStorage.removeItem(k);
    });
  } catch (e) {}

  // Consent Mode: defaults first, before anything else can touch the dataLayer.
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });

  var gtmLoaded = false;

  function loadGTM() {
    if (gtmLoaded) return;
    gtmLoaded = true;
    window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtm.js?id=" + GTM_ID;
    document.head.appendChild(s);
  }

  function readChoice() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (data && data.v === 2 && typeof data.analytics === "boolean") return data;
    } catch (e) {}
    return null;
  }

  function saveChoice(analytics) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ v: 2, analytics: analytics, ts: new Date().toISOString() }));
    } catch (e) {}
  }

  // Google Analytics cookies (_ga, _ga_XXXX, _gid, _gat) left behind after consent is withdrawn.
  function deleteAnalyticsCookies() {
    var host = window.location.hostname.split(".");
    var domains = [""];
    for (var i = 0; i < host.length - 1; i++) domains.push("; domain=." + host.slice(i).join("."));
    document.cookie.split(";").forEach(function (c) {
      var name = c.split("=")[0].trim();
      if (!/^(_ga|_gid|_gat)/.test(name)) return;
      domains.forEach(function (d) {
        document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + d;
      });
    });
  }

  function applyChoice(analytics) {
    if (analytics) {
      gtag("consent", "update", { analytics_storage: "granted" });
      loadGTM();
    } else {
      gtag("consent", "update", { analytics_storage: "denied" });
      if (gtmLoaded) deleteAnalyticsCookies();
    }
  }

  var banner = document.getElementById("consent-banner");
  var dlg = document.getElementById("consent-dialog");
  var box = document.getElementById("consent-analytics");

  function reserveSpace() {
    var h = banner && !banner.hidden ? banner.offsetHeight + 16 : 0;
    document.documentElement.style.setProperty("--consent-h", h + "px");
  }

  function showBanner() {
    if (!banner) return;
    banner.hidden = false;
    reserveSpace();
  }

  function hideBanner() {
    if (!banner) return;
    banner.hidden = true;
    reserveSpace();
  }

  function choose(analytics) {
    saveChoice(analytics);
    applyChoice(analytics);
    hideBanner();
  }

  function openSettings() {
    if (!dlg) return;
    var c = readChoice();
    if (box) box.checked = !!(c && c.analytics);
    if (typeof dlg.showModal === "function") {
      if (!dlg.open) dlg.showModal();
      document.body.classList.add("dialog-open");
    } else {
      dlg.setAttribute("open", "");
    }
  }

  function closeSettings() {
    if (!dlg) return;
    if (typeof dlg.close === "function") dlg.close();
    else dlg.removeAttribute("open");
    document.body.classList.remove("dialog-open");
  }

  function bind() {
    var accept = document.querySelector("[data-consent-accept]");
    var reject = document.querySelector("[data-consent-reject]");
    if (accept) accept.addEventListener("click", function () { choose(true); });
    if (reject) reject.addEventListener("click", function () { choose(false); });

    document.querySelectorAll("[data-cookie-settings]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        openSettings();
      });
    });

    if (dlg) {
      var save = dlg.querySelector("[data-consent-save]");
      var close = dlg.querySelector("[data-consent-close]");
      if (save) save.addEventListener("click", function () {
        choose(!!(box && box.checked));
        closeSettings();
      });
      if (close) close.addEventListener("click", closeSettings);
      dlg.addEventListener("close", function () { document.body.classList.remove("dialog-open"); });
      dlg.addEventListener("click", function (e) {
        if (e.target !== dlg) return;
        var r = dlg.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeSettings();
      });
    }
    window.addEventListener("resize", reserveSpace);
    document.addEventListener("thaisweets:lang", reserveSpace);
  }

  function init() {
    bind();
    var c = readChoice();
    if (c) applyChoice(c.analytics);
    else showBanner();
  }

  window.CookieConsent = { showPreferences: openSettings, getChoice: readChoice };

  // The banner stays hidden until idle so it cannot become the LCP element or compete with the hero.
  function start() {
    try {
      init();
    } catch (e) {}
  }
  if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(start, { timeout: 2000 });
  else window.setTimeout(start, 1);
})();
