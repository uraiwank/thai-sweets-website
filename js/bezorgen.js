/* Bezorgen page: postcode checker, zone table, legend, per-km example and map.
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

  /* Per-km formula and worked example */
  function perKmPrice(km) {
    var p = cfg.perKm;
    var raw = Math.round((p.start + km * p.perKm) * 100) / 100;
    var rounded = Math.round(Math.round((raw / p.roundTo) * 1e6) / 1e6) * p.roundTo;
    return { raw: raw, final: rounded };
  }
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
    var ex = $("#formula-example");
    if (ex) {
      var zone = cfg.zones.filter(function (z) { return z.id === cfg.example.zoneId; })[0];
      var price = perKmPrice(cfg.example.km);
      var km = num(cfg.example.km, 1, 1);
      ex.textContent = fill(t("bz.example"), {
        zone: zone ? zone.name : "",
        km: km,
        start: eur(p.start, true),
        rate: eur(p.perKm, true),
        raw: eur(price.raw, true),
        final: eur(price.final, true)
      });
    }
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
    if (marker && marker.getElement()) {
      var el = marker.getElement();
      el.setAttribute("title", t("bz.mapKitchen"));
      el.setAttribute("alt", t("bz.mapKitchen"));
    }
  }

  function start() {
    renderAll();
    bindChecker();
    initMap();
    document.addEventListener("thaisweets:lang", renderAll);
  }

  if (document.documentElement.getAttribute("data-i18n-ready")) start();
  else document.addEventListener("DOMContentLoaded", function () { window.setTimeout(start, 0); });
})();
