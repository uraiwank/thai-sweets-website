/* Bezorgen page: postcode checker, zone table, legend, per-km estimate calculator and map.
 * All numbers come from js/zones.config.js (ZonesConfig). Map shapes: data/zones-pc4.json (static). */
(function () {
  "use strict";

  var cfg = window.ZonesConfig;
  if (!cfg) return;

  var TILES = "https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0/pastel/EPSG:3857/{z}/{x}/{y}.png";

  function $(sel) { return document.querySelector(sel); }
  function i18n() { return window.ThaiSweetsI18n; }
  function t(key) { return i18n() ? i18n().t(key) : key; }
  function lang() { return i18n() ? i18n().getLang() : "nl"; }
  function fill(str, vars) {
    return String(str).replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
  }

  /* Number and money formatting: "€5", "€7,50" (NL) / "€7.50" (EN). */
  function num(n, minDec, maxDec) {
    return new Intl.NumberFormat(lang() === "en" ? "en-GB" : "nl-NL", {
      minimumFractionDigits: minDec,
      maximumFractionDigits: maxDec
    }).format(n);
  }
  function eur(n, always2) {
    var dec = always2 || n % 1 !== 0 ? 2 : 0;
    return "€" + num(n, dec, 2);
  }

  function zoneFor(pc4) {
    for (var i = 0; i < cfg.zones.length; i++) {
      var z = cfg.zones[i];
      for (var j = 0; j < z.ranges.length; j++) {
        if (pc4 >= z.ranges[j][0] && pc4 <= z.ranges[j][1]) return z;
      }
    }
    return null;
  }
  function rangesText(z) {
    return z.ranges.map(function (r) { return r[0] + "–" + r[1]; }).join(" + ");
  }

  /* Table (stacks as cards under 600px via data-label) */
  function renderTable() {
    var body = $("#zone-rows");
    if (!body) return;
    body.replaceChildren();
    cfg.zones.forEach(function (z) {
      var tr = document.createElement("tr");
      var cells = [
        ["bz.colArea", z.name, true],
        ["bz.colPostcodes", rangesText(z)],
        ["bz.colFee", eur(z.fee)],
        ["bz.colMin", eur(z.min)],
        ["bz.colFree", z.freeFrom == null ? t("bz.noFree") : eur(z.freeFrom)]
      ];
      cells.forEach(function (c) {
        var cell = document.createElement(c[2] ? "th" : "td");
        if (c[2]) cell.scope = "row";
        cell.setAttribute("data-label", t(c[0]));
        cell.textContent = c[1];
        tr.appendChild(cell);
      });
      body.appendChild(tr);
    });
  }

  /* Legend by fee */
  function renderLegend() {
    var list = $("#legend-list");
    if (!list) return;
    list.replaceChildren();
    var byFee = {};
    cfg.zones.forEach(function (z) { (byFee[z.fee] = byFee[z.fee] || []).push(z.name); });
    Object.keys(byFee).sort(function (a, b) { return a - b; }).forEach(function (fee) {
      var li = document.createElement("li");
      var sw = document.createElement("span");
      sw.className = "bz-swatch";
      sw.setAttribute("aria-hidden", "true");
      sw.style.background = cfg.feeColors[fee] || "#ccc";
      var strong = document.createElement("strong");
      strong.textContent = eur(+fee);
      li.appendChild(sw);
      li.appendChild(strong);
      li.appendChild(document.createTextNode(" · " + byFee[fee].join(", ")));
      list.appendChild(li);
    });
    var k = document.createElement("li");
    var pin = document.createElement("span");
    pin.className = "bz-pin bz-pin--legend";
    pin.setAttribute("aria-hidden", "true");
    k.appendChild(pin);
    k.appendChild(document.createTextNode(t("bz.legendKitchen")));
    list.appendChild(k);
  }

  /* Per-km formula box */
  function renderFormula() {
    var p = cfg.perKm;
    var vals = {
      start: eur(p.start, true),
      perKm: eur(p.perKm, true),
      roundTo: eur(p.roundTo, true),
      maxKm: fill(t("bz.formulaMaxValue"), { km: num(p.maxKm, 0, 0) })
    };
    document.querySelectorAll("[data-formula]").forEach(function (el) {
      el.textContent = vals[el.getAttribute("data-formula")];
    });
  }

  /* Estimate calculator. Same maths as the order app (src/lib/custom/rules.ts): distance = straight line x 1.3 rounded to
   * 1 decimal; fee = base + per km (cents, half-up), rounded UP to the next 50 cents. */
  var GEOCODE = "https://api.pdok.nl/bzk/locatieserver/search/v3_1/free";
  var lastCalc = null;

  function haversineKm(a, b) {
    var R = 6371;
    var rad = function (d) { return (d * Math.PI) / 180; };
    var h = Math.pow(Math.sin(rad(b.lat - a.lat) / 2), 2) +
      Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.pow(Math.sin(rad(b.lon - a.lon) / 2), 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  function estimate(dest) {
    var km = Math.round(haversineKm(cfg.routeOrigin, dest) * cfg.detourFactor * 10) / 10;
    var p = cfg.perKm;
    var baseC = Math.round(p.start * 100), perC = Math.round(p.perKm * 100), step = Math.round(p.roundTo * 100);
    var rawC = baseC + Math.round((perC * Math.round(km * 10)) / 10);
    return { km: km, rawC: rawC, feeC: Math.ceil(rawC / step) * step };
  }

  function showCalc() {
    var out = $("#calc-result");
    if (!out || !lastCalc) return;
    out.hidden = false;
    out.className = "bz-result";
    out.replaceChildren();
    function line(text, cls) {
      var s = document.createElement("span");
      s.className = cls || "bz-result__line";
      s.textContent = text;
      out.appendChild(s);
    }
    var c = lastCalc;
    if (c.kind === "ok") {
      var p = cfg.perKm;
      out.classList.add("bz-result--ok");
      line(fill(t("bz.calcDistance"), { km: num(c.km, 1, 1) }));
      line(fill(t("bz.calcSum"), { start: eur(p.start), km: num(c.km, 1, 1), rate: eur(p.perKm, true), raw: eur(c.rawC / 100, true) }));
      line(fill(t("bz.calcFee"), { fee: eur(c.feeC / 100, true) }), "bz-result__line bz-result__fee");
      line(t("bz.calcEstimate"), "bz-result__note");
      return;
    }
    out.classList.add("bz-result--warn");
    line(t({ tooFar: "bz.calcTooFar", invalid: "bz.calcInvalid", notFound: "bz.calcNotFound", error: "bz.calcError", busy: "bz.calcBusy" }[c.kind]));
    if (c.kind === "tooFar") line(fill(t("bz.calcDistance"), { km: num(c.km, 1, 1) }), "bz-result__note");
  }

  function geocode(postcode, nr, letter, signal) {
    var fq = ["type:adres", "postcode:" + postcode, "huisnummer:" + nr];
    if (letter) fq.push("huisletter:" + letter.toLowerCase());
    var params = new URLSearchParams({ q: "*:*", rows: "1", fl: "weergavenaam,centroide_ll" });
    fq.forEach(function (f) { params.append("fq", f); });
    var url = GEOCODE + "?" + params.toString();
    return fetch(url, { signal: signal }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }).then(function (j) {
      var d = j && j.response && j.response.docs && j.response.docs[0];
      var m = d && /POINT\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/.exec(d.centroide_ll || "");
      if (!m) return letter ? geocode(postcode, nr, "", signal) : null;
      return { lon: +m[1], lat: +m[2] };
    });
  }

  function bindCalc() {
    var form = $("#calc-form");
    if (!form) return;
    var pcEl = $("#calc-pc"), nrEl = $("#calc-nr"), btn = form.querySelector("button[type=submit]");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var postcode = pcEl.value.replace(/\s/g, "").toUpperCase();
      var nrRaw = nrEl.value.trim().replace(/\s+/g, " ");
      var okPc = /^[1-9][0-9]{3}[A-Z]{2}$/.test(postcode);
      var okNr = /^\d{1,5}(\s?[A-Za-z]{1,2}|[-/]\s?[0-9A-Za-z]{1,4})?$/.test(nrRaw);
      pcEl.setAttribute("aria-invalid", okPc ? "false" : "true");
      nrEl.setAttribute("aria-invalid", okNr ? "false" : "true");
      if (!okPc || !okNr) { lastCalc = { kind: "invalid" }; showCalc(); return; }
      var parts = /^(\d{1,5})\s?([A-Za-z]{1,2})?/.exec(nrRaw);
      lastCalc = { kind: "busy" };
      showCalc();
      btn.disabled = true;
      var ctl = new AbortController();
      var timer = window.setTimeout(function () { ctl.abort(); }, 8000);
      geocode(postcode, parts[1], parts[2] || "", ctl.signal).then(function (pt) {
        if (!pt) { lastCalc = { kind: "notFound" }; return; }
        var r = estimate(pt);
        lastCalc = r.km > cfg.perKm.maxKm ? { kind: "tooFar", km: r.km } : { kind: "ok", km: r.km, rawC: r.rawC, feeC: r.feeC };
      }).catch(function () {
        lastCalc = { kind: "error" };
      }).then(function () {
        window.clearTimeout(timer);
        btn.disabled = false;
        showCalc();
      });
    });
  }

  /* Postcode checker */
  var lastPc = null; // last result, so a language switch can rewrite the message
  var map = null, geoLayers = {}, marker = null, highlighted = null;

  function showResult() {
    var out = $("#pc-result");
    if (!out || lastPc == null) return;
    out.hidden = false;
    out.className = "bz-result";
    if (lastPc === "invalid") {
      out.classList.add("bz-result--warn");
      out.textContent = t("bz.resultInvalid");
      return;
    }
    var zone = zoneFor(lastPc);
    if (!zone) {
      out.classList.add("bz-result--warn");
      out.textContent = t("bz.resultOutside");
      return;
    }
    out.classList.add("bz-result--ok");
    var free = zone.freeFrom == null
      ? t("bz.resultNoFree")
      : fill(t("bz.resultFreeFrom"), { amount: eur(zone.freeFrom) });
    out.textContent = fill(t("bz.resultOk"), { zone: zone.name, fee: eur(zone.fee), min: eur(zone.min), free: free });
  }

  function highlight(pc4) {
    if (!map) return;
    if (highlighted) { highlighted.setStyle({ weight: 1, color: "#fff" }); highlighted = null; }
    var layer = geoLayers[pc4];
    if (!layer) return;
    layer.setStyle({ weight: 3, color: "#1a1917" });
    layer.bringToFront();
    highlighted = layer;
    map.fitBounds(layer.getBounds(), { maxZoom: 12, padding: [24, 24] });
  }

  function bindChecker() {
    var form = $("#pc-form");
    var input = $("#pc-input");
    if (!form) return;
    input.addEventListener("input", function () {
      input.value = input.value.replace(/\D/g, "").slice(0, 4);
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = input.value.replace(/\s/g, "");
      if (!/^\d{4}$/.test(v)) {
        lastPc = "invalid";
        input.setAttribute("aria-invalid", "true");
      } else {
        lastPc = +v;
        input.removeAttribute("aria-invalid");
        highlight(v);
      }
      showResult();
    });
  }

  /* Map: PDOK BRT pastel tiles + static PC4 shapes */
  function mapError() {
    var el = $("#zone-map");
    if (!el) return;
    el.classList.add("bz-map--error");
    el.textContent = t("bz.mapError");
  }

  function initMap() {
    var el = $("#zone-map");
    if (!el) return;
    if (!window.L) { mapError(); return; }
    var L = window.L;
    map = L.map(el, {
      scrollWheelZoom: false,
      dragging: !L.Browser.mobile,
      tap: false
    }).setView([cfg.kitchen.lat, cfg.kitchen.lon], 10);
    L.tileLayer(TILES, {
      minZoom: 7,
      maxZoom: 18,
      attribution: '© <a href="https://www.kadaster.nl" target="_blank" rel="noopener noreferrer">Kadaster</a>'
    }).addTo(map);

    var zones = {};
    cfg.zones.forEach(function (z) { zones[z.id] = z; });
    marker = L.marker([cfg.kitchen.lat, cfg.kitchen.lon], {
      icon: L.divIcon({ className: "bz-pin-wrap", html: '<span class="bz-pin"></span>', iconSize: [28, 28], iconAnchor: [14, 28] }),
      title: t("bz.mapKitchen"),
      alt: t("bz.mapKitchen"),
      zIndexOffset: 1000
    }).addTo(map);

    fetch("data/zones-pc4.json")
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (geo) {
        var group = L.geoJSON(geo, {
          interactive: false,
          style: function (f) {
            var z = zones[f.properties.zone];
            return { fillColor: z ? cfg.feeColors[z.fee] : "#ccc", fillOpacity: 0.7, color: "#fff", weight: 1 };
          },
          onEachFeature: function (f, layer) { geoLayers[f.properties.pc4] = layer; }
        }).addTo(map);
        map.fitBounds(group.getBounds(), { padding: [12, 12] });
        if (typeof lastPc === "number") highlight(String(lastPc));
      })
      .catch(function () { /* tiles + marker stay; the table has all the information */ });
  }

  function renderAll() {
    renderTable();
    renderLegend();
    renderFormula();
    showResult();
    showCalc();
    if (marker && marker.getElement()) {
      var el = marker.getElement();
      el.setAttribute("title", t("bz.mapKitchen"));
      el.setAttribute("alt", t("bz.mapKitchen"));
    }
  }

  function start() {
    renderAll();
    bindChecker();
    bindCalc();
    initMap();
    document.addEventListener("thaisweets:lang", renderAll);
  }

  if (document.documentElement.getAttribute("data-i18n-ready")) start();
  else document.addEventListener("DOMContentLoaded", function () { window.setTimeout(start, 0); });
})();
