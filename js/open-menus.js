(function () {
  "use strict";

  /* Flip to true to force local sample (empty/error testing: edit sample or set a bad API URL). */
  var USE_MOCK = false;

  var API_BASE = "https://order.thaisweets.nl/api/open-menus";
  var ORDER_HOME = "https://order.thaisweets.nl";
  var TIMEOUT_MS = 6000;
  var LOGO_SRC = "images/logo/logo-green.png";

  var announceEl = document.querySelector("[data-open-menus-announce]");
  var gridEl = document.querySelector("[data-open-menus-grid]");
  if (!gridEl) return;

  function pageLang() {
    var lang = (document.documentElement.getAttribute("lang") || "en").toLowerCase();
    if (lang.indexOf("nl") === 0) return "nl";
    if (lang.indexOf("th") === 0) return "th";
    return "en";
  }

  function isHttpsUrl(value) {
    return typeof value === "string" && /^https:\/\//i.test(value);
  }

  function safeText(value) {
    return value == null ? "" : String(value);
  }

  function arrowSvg() {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "btn-arrow");
    svg.setAttribute("width", "18");
    svg.setAttribute("height", "18");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.8");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    var p1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p1.setAttribute("d", "M5 12h14");
    var p2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p2.setAttribute("d", "m13 6 6 6-6 6");
    svg.appendChild(p1);
    svg.appendChild(p2);
    return svg;
  }

  function focusNotifyEmail() {
    var banner = document.querySelector(".notify");
    var input = document.getElementById("notify-email");
    if (banner) {
      banner.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if (input) {
      window.setTimeout(function () {
        input.focus();
      }, 350);
    }
  }

  function finishAnnounceSlot() {
    if (!announceEl) return;
    announceEl.classList.remove("announce--slot");
    announceEl.removeAttribute("aria-busy");
  }

  function showAnnounce(menus) {
    if (!announceEl) return;
    var openMenus = menus.filter(function (m) {
      return m.status === "open";
    });
    var upcoming = menus.filter(function (m) {
      return m.status === "upcoming";
    });

    announceEl.replaceChildren();
    announceEl.hidden = true;

    if (openMenus.length) {
      openMenus.sort(function (a, b) {
        var ai = a.orderByISO || "";
        var bi = b.orderByISO || "";
        if (ai && bi) return ai < bi ? -1 : ai > bi ? 1 : 0;
        return 0;
      });
      var open = openMenus[0];
      if (!isHttpsUrl(open.url)) {
        finishAnnounceSlot();
        return;
      }

      var p = document.createElement("p");
      var strong = document.createElement("strong");
      strong.textContent = safeText(open.title) + " is open";
      p.appendChild(strong);
      var mid = " · Order by " + safeText(open.orderBy);
      if (open.pickup) mid += " for pickup " + safeText(open.pickup);
      mid += " · ";
      p.appendChild(document.createTextNode(mid));
      var a = document.createElement("a");
      a.href = open.url;
      a.textContent = "Order now";
      p.appendChild(a);
      announceEl.appendChild(p);
      announceEl.hidden = false;
      finishAnnounceSlot();
      return;
    }

    if (upcoming.length) {
      var next = upcoming[0];
      var p2 = document.createElement("p");
      p2.appendChild(document.createTextNode("Next round: "));
      var strong2 = document.createElement("strong");
      strong2.textContent = safeText(next.title);
      p2.appendChild(strong2);
      p2.appendChild(
        document.createTextNode(
          " opens " + safeText(next.opensAt || "soon") + " · "
        )
      );
      var a2 = document.createElement("a");
      a2.href = "#notify";
      a2.textContent = "Get notified";
      a2.addEventListener("click", function (e) {
        e.preventDefault();
        focusNotifyEmail();
      });
      p2.appendChild(a2);
      announceEl.appendChild(p2);
      announceEl.hidden = false;
    }
    finishAnnounceSlot();
  }

  function mediaFrame(imageUrl, title) {
    var wrap = document.createElement("div");
    wrap.className = "card__media round-card__media media-frame";

    if (isHttpsUrl(imageUrl)) {
      var img = document.createElement("img");
      img.src = imageUrl;
      img.alt = safeText(title);
      img.width = 1280;
      img.height = 800;
      img.loading = "lazy";
      img.decoding = "async";
      img.sizes = "(max-width: 900px) 100vw, 50vw";
      img.addEventListener("error", function () {
        wrap.replaceChildren();
        wrap.classList.add("round-card__media--fallback");
        var logo = document.createElement("img");
        logo.src = LOGO_SRC;
        logo.alt = "";
        logo.width = 160;
        logo.height = 54;
        wrap.appendChild(logo);
      });
      wrap.appendChild(img);
    } else {
      wrap.classList.add("round-card__media--fallback");
      var logo = document.createElement("img");
      logo.src = LOGO_SRC;
      logo.alt = "";
      logo.width = 160;
      logo.height = 54;
      wrap.appendChild(logo);
    }
    return wrap;
  }

  function metaRow(menu, includeOrderBy) {
    var dl = document.createElement("dl");
    dl.className = "round-card__meta";
    var items = [];
    if (includeOrderBy && menu.orderBy) {
      items.push({ dt: "Order by", dd: menu.orderBy });
    }
    if (menu.pickup) items.push({ dt: "Pickup", dd: menu.pickup });
    if (menu.delivery) items.push({ dt: "Delivery", dd: menu.delivery });
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

  function buildOpenCard(menu) {
    var article = document.createElement("article");
    article.className = "card round-card";
    article.appendChild(mediaFrame(menu.imageUrl, menu.title));

    var body = document.createElement("div");
    body.className = "round-card__body";

    if (menu.tag) {
      var badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = safeText(menu.tag);
      body.appendChild(badge);
    }

    var h3 = document.createElement("h3");
    h3.textContent = safeText(menu.title);
    body.appendChild(h3);

    if (menu.description) {
      var desc = document.createElement("p");
      desc.className = "muted";
      desc.textContent = safeText(menu.description);
      body.appendChild(desc);
    }

    body.appendChild(metaRow(menu, true));

    var btn = document.createElement("a");
    btn.className = "btn btn--primary";
    btn.href = isHttpsUrl(menu.url) ? menu.url : ORDER_HOME;
    btn.appendChild(document.createTextNode("View menu & order "));
    btn.appendChild(arrowSvg());
    body.appendChild(btn);

    article.appendChild(body);
    return article;
  }

  function buildUpcomingCard(menu) {
    var article = document.createElement("article");
    article.className = "card round-card";
    article.appendChild(mediaFrame(menu.imageUrl, menu.title));

    var body = document.createElement("div");
    body.className = "round-card__body";

    var badge = document.createElement("span");
    badge.className = "badge badge--opens";
    badge.textContent = menu.opensAt
      ? "Opens " + safeText(menu.opensAt)
      : "Opens soon";
    body.appendChild(badge);

    var h3 = document.createElement("h3");
    h3.textContent = safeText(menu.title);
    body.appendChild(h3);

    if (menu.description) {
      var desc = document.createElement("p");
      desc.className = "muted";
      desc.textContent = safeText(menu.description);
      body.appendChild(desc);
    }

    body.appendChild(metaRow(menu, false));

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn--outline";
    btn.textContent = "Notify me when it opens";
    btn.addEventListener("click", focusNotifyEmail);
    body.appendChild(btn);

    article.appendChild(body);
    return article;
  }

  function buildEmptyCard() {
    var article = document.createElement("article");
    article.className = "card round-card round-card--empty";

    var body = document.createElement("div");
    body.className = "round-card__body round-card__body--empty";

    var h3 = document.createElement("h3");
    h3.textContent = "No menu is open right now";
    body.appendChild(h3);

    var p = document.createElement("p");
    p.className = "muted";
    p.textContent = "Get an email as soon as the next round opens.";
    body.appendChild(p);

    var form = document.createElement("form");
    form.className = "notify-form round-empty-form";
    form.action = "#";
    form.method = "get";
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      focusNotifyEmail();
      var src = form.querySelector('input[type="email"]');
      var dest = document.getElementById("notify-email");
      if (src && dest && src.value) dest.value = src.value;
    });

    var label = document.createElement("label");
    label.className = "visually-hidden";
    label.setAttribute("for", "rounds-notify-email");
    label.textContent = "Email address";
    form.appendChild(label);

    var input = document.createElement("input");
    input.id = "rounds-notify-email";
    input.name = "email";
    input.type = "email";
    input.autocomplete = "email";
    input.required = true;
    input.placeholder = "you@email.com";
    form.appendChild(input);

    var submit = document.createElement("button");
    submit.className = "btn btn--gold";
    submit.type = "submit";
    submit.textContent = "Notify me";
    form.appendChild(submit);

    body.appendChild(form);
    article.appendChild(body);
    return article;
  }

  function renderSkeletons() {
    gridEl.classList.remove("rounds-grid--empty");
    gridEl.replaceChildren();
    for (var i = 0; i < 2; i++) {
      var sk = document.createElement("article");
      sk.className = "card round-card round-card--skeleton";
      sk.setAttribute("aria-hidden", "true");
      var media = document.createElement("div");
      media.className = "card__media round-card__media media-frame skeleton-block";
      var body = document.createElement("div");
      body.className = "round-card__body";
      body.innerHTML =
        '<span class="skeleton-line skeleton-line--badge"></span>' +
        '<span class="skeleton-line skeleton-line--title"></span>' +
        '<span class="skeleton-line"></span>' +
        '<span class="skeleton-line"></span>' +
        '<span class="skeleton-line skeleton-line--btn"></span>';
      sk.appendChild(media);
      sk.appendChild(body);
      gridEl.appendChild(sk);
    }
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

    showAnnounce(list);

    gridEl.replaceChildren();
    if (!list.length) {
      gridEl.classList.add("rounds-grid--empty");
      gridEl.appendChild(buildEmptyCard());
      return;
    }

    gridEl.classList.remove("rounds-grid--empty");
    list.forEach(function (menu) {
      gridEl.appendChild(
        menu.status === "upcoming" ? buildUpcomingCard(menu) : buildOpenCard(menu)
      );
    });
  }

  function fetchMenus() {
    if (USE_MOCK) {
      return fetch("js/open-menus.sample.json", { cache: "no-store" }).then(
        function (res) {
          if (!res.ok) throw new Error("mock unavailable");
          return res.json();
        }
      );
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
    renderSkeletons();

    fetchMenus()
      .then(function (data) {
        renderMenus(data && data.menus ? data.menus : []);
      })
      .catch(function () {
        if (announceEl) {
          announceEl.replaceChildren();
          announceEl.hidden = true;
          finishAnnounceSlot();
        }
        gridEl.classList.add("rounds-grid--empty");
        gridEl.replaceChildren();
        gridEl.appendChild(buildEmptyCard());
      });
  }

  // Defer past first paint / LCP so Home hero work is not competing with menus API.
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(start, { timeout: 1800 });
  } else {
    window.setTimeout(start, 1);
  }
})();
