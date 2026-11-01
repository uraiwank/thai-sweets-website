/**
 * Home notify form → POST https://order.thaisweets.nl/api/notify
 * Body max 2KB JSON: { email, lang, turnstileToken, menuId: null }
 */
(function () {
  "use strict";

  var API = "https://order.thaisweets.nl/api/notify";
  var SITE_KEY = "0x4AAAAAAFWuqbo-gwLmvDr8";
  var SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  var SCRIPT_ID = "cf-turnstile-script";

  var form = document.getElementById("notify-form");
  if (!form) return;

  var emailInput = document.getElementById("notify-email");
  var submitBtn = form.querySelector('button[type="submit"]');
  var statusEl = document.getElementById("notify-status");
  var widgetHost = document.getElementById("notify-turnstile");
  var widgetId = null;
  var token = null;
  var sending = false;

  function t(key) {
    if (window.ThaiSweetsI18n && typeof window.ThaiSweetsI18n.t === "function") {
      return window.ThaiSweetsI18n.t(key);
    }
    return key;
  }

  function currentLang() {
    if (window.ThaiSweetsI18n && typeof window.ThaiSweetsI18n.getLang === "function") {
      return window.ThaiSweetsI18n.getLang();
    }
    var lang = (document.documentElement.getAttribute("lang") || "nl").toLowerCase();
    if (lang.indexOf("en") === 0) return "en";
    if (lang.indexOf("th") === 0) return "th";
    return "nl";
  }

  function setStatus(kind, message) {
    if (!statusEl) return;
    statusEl.textContent = message || "";
    statusEl.hidden = !message;
    statusEl.setAttribute("data-status", kind || "");
    statusEl.className = "notify-status" + (kind ? " notify-status--" + kind : "");
  }

  function setSending(on) {
    sending = on;
    if (submitBtn) {
      submitBtn.disabled = on || !token;
      submitBtn.setAttribute("aria-busy", on ? "true" : "false");
    }
  }

  function resetTurnstile() {
    token = null;
    if (widgetId != null && window.turnstile) {
      try {
        window.turnstile.reset(widgetId);
      } catch (e) {}
    }
    setSending(false);
  }

  function loadTurnstile() {
    return new Promise(function (resolve, reject) {
      if (window.turnstile) {
        resolve();
        return;
      }
      var existing = document.getElementById(SCRIPT_ID);
      if (existing) {
        existing.addEventListener("load", function () {
          resolve();
        });
        existing.addEventListener("error", reject);
        return;
      }
      var s = document.createElement("script");
      s.id = SCRIPT_ID;
      s.src = SCRIPT_SRC;
      s.async = true;
      s.onload = function () {
        resolve();
      };
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function renderWidget() {
    if (!widgetHost || !window.turnstile) return;
    widgetHost.replaceChildren();
    widgetId = window.turnstile.render(widgetHost, {
      sitekey: SITE_KEY,
      language: currentLang(),
      appearance: "always",
      callback: function (value) {
        token = value || null;
        setSending(false);
      },
      "expired-callback": function () {
        token = null;
        setSending(false);
      },
      "error-callback": function () {
        token = null;
        setSending(false);
        setStatus("error", t("notify.captcha"));
      },
    });
  }

  function messageFor(status, code) {
    if (status === 200) return t("notify.done");
    if (status === 429 || code === "limited") return t("notify.limited");
    if (status === 403 || code === "captcha") return t("notify.captcha");
    if (status === 400 || code === "invalid") return t("notify.invalid");
    if (status === 503 || code === "failed") return t("notify.failed");
    return t("notify.failed");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (sending) return;
    if (!emailInput) return;

    var email = String(emailInput.value || "").trim();
    if (!email) {
      setStatus("error", t("notify.invalid"));
      emailInput.focus();
      return;
    }
    if (!token) {
      setStatus("error", t("notify.captcha"));
      return;
    }

    setSending(true);
    setStatus("pending", t("notify.sending"));

    var body = JSON.stringify({
      email: email,
      lang: currentLang(),
      turnstileToken: token,
      menuId: null,
    });
    if (new TextEncoder().encode(body).length > 2048) {
      setStatus("error", t("notify.invalid"));
      resetTurnstile();
      return;
    }

    fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body,
    })
      .then(function (res) {
        return res
          .json()
          .catch(function () {
            return {};
          })
          .then(function (data) {
            return { res: res, data: data };
          });
      })
      .then(function (_ref) {
        var res = _ref.res;
        var data = _ref.data || {};
        var code = data.code;
        if (res.ok && data.ok) {
          setStatus("ok", messageFor(200));
          // Keep email on success too (user asked keep on error; success can stay)
        } else {
          setStatus("error", messageFor(res.status, code));
        }
      })
      .catch(function () {
        setStatus("error", t("notify.failed"));
      })
      .finally(function () {
        resetTurnstile();
      });
  });

  document.addEventListener("thaisweets:lang", function () {
    if (widgetId != null && window.turnstile) {
      try {
        window.turnstile.remove(widgetId);
      } catch (e) {}
      widgetId = null;
    }
    token = null;
    if (window.turnstile) renderWidget();
    setSending(false);
  });

  setSending(false);

  loadTurnstile()
    .then(function () {
      renderWidget();
      setSending(false);
    })
    .catch(function () {
      setStatus("error", t("notify.captcha"));
      setSending(false);
    });
})();
