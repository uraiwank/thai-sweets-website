(function () {
  "use strict";

  /* Flip to true to force the local sample (js/open-menus.sample.json).
     On localhost you can also use ?rounds=sample | upcoming | empty | error. */
  var USE_MOCK = false;

  var API_BASE = "https://order.thaisweets.nl/api/open-menus";
  var ORDER_HOME = "https://order.thaisweets.nl";
  var TIMEOUT_MS = 6000;
  var LOGO_SRC = "images/logo/logo-horizontal.png";

  var gridEl = document.querySelector("[data-open-menus-grid]");
  if (!gridEl) return;

  function t(key) {
    if (window.ThaiSweetsI18n && typeof window.ThaiSweetsI18n.t === "function") {
      return window.ThaiSweetsI18n.t(key);
    }
    return key;
  }

  function pageLang() {
    if (window.ThaiSweetsI18n && typeof window.ThaiSweetsI18n.getLang === "function") {
      return window.ThaiSweetsI18n.getLang();
    }
    var lang = (document.documentElement.getAttribute("lang") || "nl").toLowerCase();
    if (lang.indexOf("en") === 0) return "en";
    if (lang.indexOf("th") === 0) return "th";
    return "nl";
  }

  function isHttpsUrl(value) {
    return typeof value === "string" && /^https:\/\//i.test(value);
  }

  function safeText(value) {
    return value == null ? "" : String(value);
  }

  function focusNotifyEmail() {
    var form = document.getElementById("notify-form");
    var input = document.getElementById("notify-email");
    if (form) form.scrollIntoView({ behavior: "smooth", block: "center" });
    if (input) {
      window.setTimeout(function () {
        input.focus();
      }, 350);
    }
  }

  function mediaFrame(imageUrl, title, status) {
    var wrap = document.createElement("div");
    wrap.className = "round-card__media";

    function fallback() {
      wrap.classList.add("round-card__media--fallback");
      var logo = document.createElement("img");
      logo.src = LOGO_SRC;
      logo.alt = "";
      logo.width = 160;
      logo.height = 82;
      wrap.insertBefore(logo, wrap.firstChild);
    }

    if (isHttpsUrl(imageUrl)) {
      var img = document.createElement("img");
      img.src = imageUrl;
      img.alt = safeText(title);
      img.width = 1280;
      img.height = 720;
      img.loading = "lazy";
      img.decoding = "async";
      img.addEventListener("error", function () {
        img.remove();
        fallback();
      });
      wrap.appendChild(img);
    } else {
      fallback();
    }
    if (status) wrap.appendChild(status);
    return wrap;
  }

  function statusBadge(text, isOpen) {
    var span = document.createElement("span");
    span.className = "status" + (isOpen ? "" : " status--soon");
    if (isOpen) {
      var dot = document.createElement("span");
      dot.className = "dot";
      dot.setAttribute("aria-hidden", "true");
      span.appendChild(dot);
    }
    span.appendChild(document.createTextNode(text));
    return span;
  }

  function metaRow(menu) {
    var dl = document.createElement("dl");
    dl.className = "round-card__meta";
    var items = [];
    if (menu.orderBy) items.push({ dt: t("rounds.orderByLabel"), dd: menu.orderBy });
    if (menu.pickup) items.push({ dt: t("rounds.pickupLabel"), dd: menu.pickup });
    if (menu.delivery) items.push({ dt: t("rounds.deliveryLabel"), dd: menu.delivery });
    if (!items.length) {
      dl.hidden = true;
      return dl;
    }
    if (items.length === 2) dl.classList.add("round-card__meta--two");
    if (items.length === 1) dl.classList.add("round-card__meta--one");
    items.forEach(function (item) {
      var div = document.createElement("div");
      var dt = document.createElement("dt");
      dt.textContent = item.dt;
      var dd = document.createElement("dd");
      dd.textContent = safeText(item.dd);
      div.appendChild(dt);
      div.appendChild(dd);
      dl.appendChild(div);
    });
    return dl;
  }

  function cardHead(menu) {
    var head = document.createElement("div");
    head.className = "round-card__head";
    if (menu.tag) {
      var tag = document.createElement("p");
      tag.className = "round-card__tag";
      tag.textContent = safeText(menu.tag);
      head.appendChild(tag);
    }
    var h3 = document.createElement("h3");
    h3.textContent = safeText(menu.title);
    head.appendChild(h3);
    if (menu.description) {
      var desc = document.createElement("p");
      desc.className = "round-card__desc";
      desc.textContent = safeText(menu.description);
      head.appendChild(desc);
    }
    return head;
  }

  /* The notify form is created here; js/notify.js binds to it on the event below. */
  function buildNotifyForm() {
    var form = document.createElement("form");
    form.id = "notify-form";
    form.className = "notify-form";
    form.noValidate = true;

    var label = document.createElement("label");
    label.setAttribute("for", "notify-email");
    label.textContent = t("home2.notifyLabel");
    form.appendChild(label);

    var row = document.createElement("div");
    row.className = "notify-form__row";
    var input = document.createElement("input");
    input.id = "notify-email";
    input.name = "email";
    input.type = "email";
    input.autocomplete = "email";
    input.required = true;
    input.placeholder = t("notify.placeholder");
    row.appendChild(input);
    var submit = document.createElement("button");
    submit.type = "submit";
    submit.className = "btn btn--outline";
    submit.textContent = t("home2.notifyButton");
    row.appendChild(submit);
    form.appendChild(row);

    var widget = document.createElement("div");
    widget.id = "notify-turnstile";
    widget.className = "notify-turnstile";
    form.appendChild(widget);

    var status = document.createElement("p");
    status.id = "notify-status";
    status.className = "notify-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.hidden = true;
    form.appendChild(status);
    return form;
  }

  function announceNotifyForm() {
    document.dispatchEvent(new CustomEvent("thaisweets:notify-form"));
  }

  function buildOpenCard(menu) {
    var article = document.createElement("article");
    article.className = "round-card";
    article.appendChild(mediaFrame(menu.imageUrl, menu.title, statusBadge(t("rounds.openNow"), true)));

    var body = document.createElement("div");
    body.className = "round-card__body";
    body.appendChild(cardHead(menu));
    body.appendChild(metaRow(menu));

    var btn = document.createElement("a");
    btn.className = "btn";
    btn.href = isHttpsUrl(menu.url) ? menu.url : ORDER_HOME + "/" + pageLang() + "/";
    btn.textContent = t("rounds.viewMenuOrder") + " →";
    body.appendChild(btn);

    article.appendChild(body);
    return article;
  }

  function buildUpcomingCard(menu, withForm) {
    var article = document.createElement("article");
    article.className = "round-card round-card--upcoming";
    var soon = menu.opensAt ? t("rounds.opensPrefix") + safeText(menu.opensAt) : t("rounds.opensSoon");
    article.appendChild(mediaFrame(menu.imageUrl, menu.title, statusBadge(soon, false)));

    var body = document.createElement("div");
    body.className = "round-card__body";
    body.appendChild(cardHead(menu));
    body.appendChild(metaRow(menu));

    if (withForm) {
      body.appendChild(buildNotifyForm());
    } else {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn--outline";
      btn.textContent = t("rounds.notifyWhen");
      btn.addEventListener("click", focusNotifyEmail);
      body.appendChild(btn);
    }

    article.appendChild(body);
    return article;
  }

  function buildEmptyCard() {
    var article = document.createElement("article");
    article.className = "round-card round-card--empty";

    var body = document.createElement("div");
    body.className = "round-card__body";

    var head = document.createElement("div");
    head.className = "round-card__head";
    var h3 = document.createElement("h3");
    h3.textContent = t("rounds.emptyTitle");
    head.appendChild(h3);
    var p = document.createElement("p");
    p.className = "round-card__desc";
    p.textContent = t("rounds.emptyBody");
    head.appendChild(p);
    body.appendChild(head);

    body.appendChild(buildNotifyForm());
    article.appendChild(body);
    return article;
  }

  /* Static placeholders while loading (no shimmer). */
  function renderSkeletons() {
    gridEl.setAttribute("aria-busy", "true");
    gridEl.replaceChildren();
    for (var i = 0; i < 2; i++) {
      var sk = document.createElement("article");
      sk.className = "round-card round-card--skeleton";
      sk.setAttribute("aria-hidden", "true");
      var media = document.createElement("div");
      media.className = "round-card__media skeleton-block";
      var body = document.createElement("div");
      body.className = "round-card__body";
      ["badge", "title", "", "", "btn"].forEach(function (mod) {
        var line = document.createElement("span");
        line.className = "skeleton-line" + (mod ? " skeleton-line--" + mod : "");
        body.appendChild(line);
      });
      sk.appendChild(media);
      sk.appendChild(body);
      gridEl.appendChild(sk);
    }
  }

  /* Green news bar: open round, else next upcoming round, else the fallback text (home2.news). */
  function setNews(list) {
    var el = document.querySelector("[data-news]");
    if (!el) return;
    var open = null;
    var next = null;
    (list || []).forEach(function (m) {
      if (m.status === "open" && isHttpsUrl(m.url) && !open) open = m;
      if (m.status === "upcoming" && m.opensAt) {
        if (!next || (m.opensAtISO || "") < (next.opensAtISO || "")) next = m;
      }
    });
    var round = open || next;
    if (!round) {
      el.textContent = t("home2.news");
      return;
    }
    var text = t(open ? "home2.newsOpen" : "home2.newsUpcoming")
      .replace("{title}", safeText(round.title))
      .replace("{orderBy}", safeText(round.orderBy))
      .replace("{opensAt}", safeText(round.opensAt));
    var a = document.createElement("a");
    a.href = open ? round.url : "#bestellen";
    a.textContent = text;
    el.replaceChildren(a);
  }

  /* Until data arrives keep what the bar shows; only fill the fallback when it has no round link. */
  function newsFallbackIfNoRound() {
    var el = document.querySelector("[data-news]");
    if (el && !el.querySelector("a")) el.textContent = t("home2.news");
  }

  function renderEmpty() {
    setNews(null);
    gridEl.setAttribute("aria-busy", "false");
    gridEl.replaceChildren();
    gridEl.appendChild(buildEmptyCard());
    announceNotifyForm();
  }

  function renderMenus(menus) {
    var list = Array.isArray(menus) ? menus.slice() : [];
    list = list.filter(function (m) {
      return m && (m.status === "open" || m.status === "upcoming");
    });
    list.sort(function (a, b) {
      if (a.status === "open" && b.status !== "open") return -1;
      if (b.status === "open" && a.status !== "open") return 1;
      var ai = a.orderByISO || a.opensAtISO || "";
      var bi = b.orderByISO || b.opensAtISO || "";
      if (ai && bi) return ai < bi ? -1 : ai > bi ? 1 : 0;
      return 0;
    });

    if (!list.length) {
      renderEmpty();
      return;
    }

    setNews(list);
    gridEl.setAttribute("aria-busy", "false");
    gridEl.replaceChildren();
    var formPlaced = false;
    list.forEach(function (menu) {
      if (menu.status === "upcoming") {
        gridEl.appendChild(buildUpcomingCard(menu, !formPlaced));
        formPlaced = true;
      } else {
        gridEl.appendChild(buildOpenCard(menu));
      }
    });
    if (formPlaced) announceNotifyForm();
  }

  /* Local testing only (localhost): ?rounds=sample | upcoming | empty | error */
  function testMode() {
    if (!/^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname)) return null;
    try {
      return new URLSearchParams(window.location.search).get("rounds");
    } catch (e) {
      return null;
    }
  }

  function fetchMenus() {
    var mode = testMode();
    if (mode === "empty") return Promise.resolve({ menus: [] });
    if (mode === "error") return Promise.reject(new Error("forced error"));
    if (USE_MOCK || mode === "sample" || mode === "upcoming") {
      return fetch("js/open-menus.sample.json", { cache: "no-store" }).then(function (res) {
        if (!res.ok) throw new Error("mock unavailable");
        return res.json();
      }).then(function (data) {
        if (mode === "upcoming") {
          data.menus = data.menus.filter(function (m) {
            return m.status === "upcoming";
          });
        }
        return data;
      });
    }

    var controller = new AbortController();
    var timer = window.setTimeout(function () {
      controller.abort();
    }, TIMEOUT_MS);
    var url = API_BASE + "?lang=" + encodeURIComponent(pageLang());

    return fetch(url, { signal: controller.signal, cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("api " + res.status);
        return res.json();
      })
      .finally(function () {
        window.clearTimeout(timer);
      });
  }

  function start() {
    newsFallbackIfNoRound();
    renderSkeletons();

    fetchMenus()
      .then(function (data) {
        renderMenus(data && data.menus ? data.menus : []);
      })
      .catch(function () {
        renderEmpty();
      });
  }

  document.addEventListener("thaisweets:lang", function () {
    start();
  });

  // Defer past first paint / LCP so the hero is not competing with the menus API.
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(start, { timeout: 1800 });
  } else {
    window.setTimeout(start, 1);
  }
})();
