/**
 * "Mail me when it opens" signup → POST https://order.thaisweets.nl/api/notify
 * Body max 2KB JSON: { email, lang, turnstileToken, menuId }
 *
 * Two places use it, both rendered/owned elsewhere:
 *  - the modal <dialog id="notify-dialog"> (opened from an upcoming-round card, ThaiSweetsNotify.open)
 *  - the inline form in the "no menu open" box (js/open-menus.js announces it with "thaisweets:notify-form")
 * Turnstile is rendered only while one of these forms is shown, never on the page itself.
 *
 * menuId: the endpoint takes a menu UUID or null (null = every menu that opens). /api/open-menus has no
 * ids yet, so this sends menu.id when the API provides it and null otherwise. The dialog texts follow:
 * per-round texts with an id, the general "when a menu opens" texts without.
 */
(function () {
  "use strict";

  var API = "https://order.thaisweets.nl/api/notify";
  var SITE_KEY = "0x4AAAAAAFWuqbo-gwLmvDr8";
  var SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  var SCRIPT_ID = "cf-turnstile-script";
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  var scriptPromise = null;
  function loadTurnstile() {
    if (window.turnstile) return Promise.resolve();
    if (scriptPromise) return scriptPromise;
    scriptPromise = new Promise(function (resolve, reject) {
      var s = document.getElementById(SCRIPT_ID);
      if (!s) {
        s = document.createElement("script");
        s.id = SCRIPT_ID;
        s.src = SCRIPT_SRC;
        s.async = true;
        document.head.appendChild(s);
      }
      s.addEventListener("load", function () {
        resolve();
      });
      s.addEventListener("error", function () {
        scriptPromise = null;
        reject(new Error("turnstile"));
      });
    });
    return scriptPromise;
  }

  function messageFor(status, code) {
    if (status === 200) return t("notify.done");
    if (status === 429 || code === "limited") return t("notify.limited");
    if (status === 403 || code === "captcha") return t("notify.captcha");
    if (status === 400 || code === "invalid") return t("notify.invalid");
    return t("notify.failed");
  }

  /* One signup form. opts.getMenuId() → UUID or null; opts.onSuccess() runs after an accepted signup. */
  function createForm(form, opts) {
    var input = form.querySelector("[data-notify-email]");
    var submit = form.querySelector('button[type="submit"]');
    var errorEl = form.querySelector("[data-notify-error]");
    var statusEl = form.querySelector("[data-notify-status]");
    var host = form.querySelector("[data-notify-widget]");
    var widgetId = null;
    var token = null;
    var sending = false;
    var mounted = false;

    function setError(message, focusField) {
      errorEl.textContent = message || "";
      errorEl.hidden = !message;
      if (message) {
        input.setAttribute("aria-invalid", "true");
        if (focusField) input.focus();
      } else {
        input.removeAttribute("aria-invalid");
      }
    }

    function setStatus(kind, message) {
      statusEl.textContent = message || "";
      statusEl.hidden = !message;
      statusEl.setAttribute("data-status", kind || "");
    }

    function setSending(on) {
      sending = on;
      submit.disabled = on;
      submit.setAttribute("aria-busy", on ? "true" : "false");
    }

    function removeWidget() {
      if (widgetId != null && window.turnstile) {
        try {
          window.turnstile.remove(widgetId);
        } catch (e) {}
      }
      widgetId = null;
      token = null;
      host.replaceChildren();
    }

    function renderWidget() {
      if (!window.turnstile || !mounted) return;
      removeWidget();
      widgetId = window.turnstile.render(host, {
        sitekey: SITE_KEY,
        language: currentLang(),
        appearance: "always",
        callback: function (value) {
          token = value || null;
        },
        "expired-callback": function () {
          token = null;
        },
        "error-callback": function () {
          token = null;
          setError(t("notify.captcha"), false);
        },
      });
    }

    function resetWidget() {
      token = null;
      if (widgetId != null && window.turnstile) {
        try {
          window.turnstile.reset(widgetId);
        } catch (e) {}
      }
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (sending) return;
      setError("");
      var email = String(input.value || "").trim();
      if (!EMAIL.test(email)) {
        setStatus("", "");
        setError(t("notify.invalid"), true);
        return;
      }
      if (!token) {
        setStatus("", "");
        setError(t("notify.captcha"), false);
        return;
      }
      var body = JSON.stringify({
        email: email,
        lang: currentLang(),
        turnstileToken: token,
        menuId: (opts.getMenuId && opts.getMenuId()) || null,
      });
      if (new TextEncoder().encode(body).length > 2048) {
        setError(t("notify.invalid"), true);
        return;
      }
      setSending(true);
      setStatus("pending", t("notify.sending"));
      fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: body })
        .then(function (res) {
          return res
            .json()
            .catch(function () {
              return {};
            })
            .then(function (data) {
              return { res: res, data: data || {} };
            });
        })
        .then(function (r) {
          if (r.res.ok && r.data.ok) {
            setError("");
            if (opts.onSuccess) opts.onSuccess(statusEl);
            else setStatus("ok", messageFor(200));
          } else {
            setStatus("", "");
            setError(messageFor(r.res.status, r.data.code), false);
            resetWidget();
          }
        })
        .catch(function () {
          setStatus("", "");
          setError(t("notify.failed"), false);
          resetWidget();
        })
        .then(function () {
          setSending(false);
        });
    });

    return {
      input: input,
      mount: function () {
        mounted = true;
        setError("");
        setStatus("", "");
        setSending(false);
        loadTurnstile()
          .then(renderWidget)
          .catch(function () {
            if (mounted) setError(t("notify.captcha"), false);
          });
      },
      unmount: function () {
        mounted = false;
        removeWidget();
      },
      clear: function () {
        input.value = "";
        setError("");
        setStatus("", "");
      },
    };
  }

  /* ---- Modal dialog (upcoming-round cards) ---- */
  var dlg = document.getElementById("notify-dialog");
  var dialogForm = null;
  var current = null;
  var titleEl = null;
  var descEl = null;

  function fill(template, values) {
    return String(template).replace(/\{(\w+)\}/g, function (m, k) {
      return values[k] != null ? values[k] : m;
    });
  }

  if (dlg && typeof dlg.showModal === "function") {
    titleEl = document.getElementById("notify-title");
    descEl = document.getElementById("notify-desc");

    dialogForm = createForm(document.getElementById("notify-dialog-form"), {
      getMenuId: function () {
        return current && current.menuId;
      },
      onSuccess: function () {
        if (current) current.done = true;
        dlg.close();
      },
    });

    dlg.querySelector("[data-notify-close]").addEventListener("click", function () {
      dlg.close();
    });
    // Click on the backdrop (outside the dialog box) closes it.
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg) dlg.close();
    });
    dlg.addEventListener("close", function () {
      document.body.classList.remove("dialog-open");
      dialogForm.unmount();
      var c = current;
      current = null;
      if (c) {
        if (c.done && c.onDone) c.onDone();
        if (c.opener && c.opener.focus) c.opener.focus();
      }
    });
    document.addEventListener("thaisweets:lang", function () {
      if (dlg.open) dlg.close();
    });
  }

  function openDialog(opts) {
    if (!dlg || !dialogForm) return;
    current = opts;
    // With a menu id the signup is for that round; without one it is the general "any menu" signup.
    if (opts.menuId) {
      titleEl.textContent = fill(t("home2.dlgTitle"), { title: opts.title });
      descEl.textContent = opts.opensAt
        ? fill(t("home2.dlgLine"), { date: opts.opensAt })
        : t("home2.dlgLineNoDate");
    } else {
      titleEl.textContent = t("home2.dlgTitleGeneral");
      descEl.textContent = fill(opts.opensAt ? t("home2.dlgLineGeneral") : t("home2.dlgLineGeneralNoDate"), {
        title: opts.title,
        date: opts.opensAt,
      });
    }
    dialogForm.clear();
    document.body.classList.add("dialog-open");
    dlg.showModal();
    dialogForm.mount();
    dialogForm.input.focus();
  }

  window.ThaiSweetsNotify = { open: openDialog };

  /* ---- Inline form in the "no menu open" box ---- */
  var inline = null;
  var inlineEl = null;
  function setupInline() {
    var el = document.querySelector("form[data-notify-inline]");
    if (el === inlineEl) return;
    if (inline) inline.unmount();
    inline = null;
    inlineEl = el;
    if (!el) return;
    inline = createForm(el, {
      getMenuId: function () {
        return null;
      },
    });
    inline.mount();
  }
  document.addEventListener("thaisweets:notify-form", setupInline);
  setupInline();
})();
