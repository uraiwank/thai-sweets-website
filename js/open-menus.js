(function () {
  "use strict";

  /* Flip to true to force the local sample (js/open-menus.sample.json).
     On localhost you can also use ?rounds=sample (all 3) | mixed (open + upcoming) | open1 | upcoming1 | upcoming2 | empty | error. */
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

  var NOTIFIED_PREFIX = "thaisweets_notified_";

  function isNotified(slug) {
    try {
      return localStorage.getItem(NOTIFIED_PREFIX + slug) === "1";
    } catch (e) {
      return false;
    }
  }

  function rememberNotified(slug) {
    try {
      localStorage.setItem(NOTIFIED_PREFIX + slug, "1");
    } catch (e) {}
  }

  function announce(message) {
    var live = document.querySelector("[data-notify-live]");
    if (!live) return;
    live.textContent = "";
    window.setTimeout(function () {
      live.textContent = message;
    }, 60);
  }

  function bellSvg() {
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("width", "20");
    svg.setAttribute("height", "20");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    ["M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9", "M10.3 21a1.94 1.94 0 0 0 3.4 0"].forEach(function (d) {
      var path = document.createElementNS(ns, "path");
      path.setAttribute("d", d);
      svg.appendChild(path);
    });
    return svg;
  }

  function setBellDone(btn) {
    btn.classList.add("btn--done");
    btn.setAttribute("aria-disabled", "true");
    btn.removeAttribute("aria-haspopup");
    btn.replaceChildren(document.createTextNode(t("home2.bellDone")));
  }

  /* Upcoming round: one outline button with a bell. It opens the notify dialog (js/notify.js). */
  function buildBellButton(menu) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn--outline";
    if (isNotified(menu.slug)) {
      setBellDone(btn);
      return btn;
    }
    btn.setAttribute("aria-haspopup", "dialog");
    btn.appendChild(bellSvg());
    btn.appendChild(document.createTextNode(t("home2.bellBtn")));
    btn.addEventListener("click", function () {
      if (btn.getAttribute("aria-disabled") === "true") return;
      if (!window.ThaiSweetsNotify) return;
      window.ThaiSweetsNotify.open({
        title: safeText(menu.title),
        opensAt: menu.opensAt,
        menuId: typeof menu.id === "string" ? menu.id : null,
        opener: btn,
        onDone: function () {
          rememberNotified(menu.slug);
          setBellDone(btn);
          announce(
            typeof menu.id === "string"
              ? t("home2.bellDoneLive").replace("{title}", safeText(menu.title))
              : t("home2.bellDoneLiveGeneral")
          );
        },
      });
    });
    return btn;
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

  function buildUpcomingCard(menu) {
    var article = document.createElement("article");
    article.className = "round-card round-card--upcoming";
    var soon = menu.opensAt ? t("rounds.opensPrefix") + safeText(menu.opensAt) : t("rounds.opensSoon");
    article.appendChild(mediaFrame(menu.imageUrl, menu.title, statusBadge(soon, false)));

    var body = document.createElement("div");
    body.className = "round-card__body";
    body.appendChild(cardHead(menu));
    body.appendChild(metaRow(menu));
    body.appendChild(buildBellButton(menu));

    article.appendChild(body);
    return article;
  }

  /* No rounds: soft pink box with the general signup (any menu). */
  function buildEmptyBox() {
    var box = document.createElement("div");
    box.className = "notify-empty";

    var text = document.createElement("div");
    text.className = "notify-empty__text";
    var h3 = document.createElement("h3");
    h3.textContent = t("home2.emptyTitle");
    text.appendChild(h3);
    var p = document.createElement("p");
    p.textContent = t("home2.emptyText");
    text.appendChild(p);
    var party = document.createElement("p");
    party.className = "notify-empty__party";
    party.appendChild(document.createTextNode(t("home2.emptyParty") + " "));
    var a = document.createElement("a");
    a.href = ORDER_HOME + "/" + pageLang() + "/";
    a.textContent = t("home2.emptyPartyLink");
    party.appendChild(a);
    text.appendChild(party);
    box.appendChild(text);

    var form = document.createElement("form");
    form.className = "notify-form";
    form.setAttribute("data-notify-inline", "");
    form.noValidate = true;

    var label = document.createElement("label");
    label.setAttribute("for", "notify-inline-email");
    label.textContent = t("home2.emptyLabel");
    form.appendChild(label);

    var row = document.createElement("div");
    row.className = "notify-form__row";
    var input = document.createElement("input");
    input.id = "notify-inline-email";
    input.className = "notify-input";
    input.name = "email";
    input.type = "email";
    input.autocomplete = "email";
    input.required = true;
    input.placeholder = t("notify.placeholder");
    input.setAttribute("data-notify-email", "");
    input.setAttribute("aria-describedby", "notify-inline-error");
    row.appendChild(input);
    var submit = document.createElement("button");
    submit.type = "submit";
    submit.className = "btn";
    submit.textContent = t("home2.notifyButton");
    row.appendChild(submit);
    form.appendChild(row);

    var error = document.createElement("p");
    error.id = "notify-inline-error";
    error.className = "notify-error";
    error.setAttribute("role", "alert");
    error.setAttribute("data-notify-error", "");
    error.hidden = true;
    form.appendChild(error);

    var widget = document.createElement("div");
    widget.className = "notify-turnstile";
    widget.setAttribute("data-notify-widget", "");
    form.appendChild(widget);

    var status = document.createElement("p");
    status.className = "notify-status";
    status.setAttribute("role", "status");
    status.setAttribute("data-notify-status", "");
    status.hidden = true;
    form.appendChild(status);

    var hint = document.createElement("p");
    hint.className = "notify-hint";
    hint.textContent = t("home2.unsub");
    form.appendChild(hint);

    box.appendChild(form);
    return box;
  }

  /* Static placeholders while loading (no shimmer). */
  function renderSkeletons() {
    gridEl.setAttribute("aria-busy", "true");
    gridEl.className = "rounds-grid rounds-grid--many";
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

  /* Heading: "Nu te bestellen" when a round is open, otherwise "Binnenkort te bestellen". With no rounds the
     pink box carries the message, so the heading stays for screen readers only. */
  function setHeading(anyOpen, noRounds) {
    var h = document.getElementById("open-title");
    if (!h) return;
    var key = anyOpen ? "home2.openTitle" : "home2.soonTitle";
    h.setAttribute("data-i18n", key);
    h.textContent = t(key);
    h.classList.toggle("visually-hidden", !!noRounds);
  }

  function renderEmpty() {
    setNews(null);
    setHeading(false, true);
    gridEl.setAttribute("aria-busy", "false");
    gridEl.className = "rounds-grid rounds-grid--empty";
    gridEl.replaceChildren(buildEmptyBox());
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
    setHeading(
      list.some(function (m) {
        return m.status === "open";
      }),
      false
    );
    gridEl.setAttribute("aria-busy", "false");
    gridEl.className = "rounds-grid " + (list.length === 1 ? "rounds-grid--one" : "rounds-grid--many");
    gridEl.replaceChildren();
    list.forEach(function (menu) {
      gridEl.appendChild(menu.status === "upcoming" ? buildUpcomingCard(menu) : buildOpenCard(menu));
    });
    announceNotifyForm();
  }

  /* Local testing only (localhost): ?rounds=sample (all 3) | mixed (open + upcoming) | open1 | upcoming1 | upcoming2 | empty | error */
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
    if (USE_MOCK || /^(sample|mixed|open1|upcoming1|upcoming2|upcoming)$/.test(mode || "")) {
      return fetch("js/open-menus.sample.json", { cache: "no-store" }).then(function (res) {
        if (!res.ok) throw new Error("mock unavailable");
        return res.json();
      }).then(function (data) {
        var only = {
          open1: ["thai-desserts-1"],
        mixed: ["thai-desserts-1", "christmas-2026"],
          upcoming1: ["christmas-2026"],
          upcoming: ["christmas-2026"],
          upcoming2: ["christmas-2026", "thai-dessert-2612"],
        }[mode];
        if (only) {
          data.menus = data.menus.filter(function (m) {
            return only.indexOf(m.slug) !== -1;
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
