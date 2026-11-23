/*
 * One-time script: downloads the PC4 polygons of all delivery zones from opendatasoft
 * (georef-netherlands-postcode-pc4), simplifies them and saves static GeoJSON to data/zones-pc4.json.
 * The website never calls opendatasoft at runtime. Re-run after changing js/zones.config.js.
 *
 *   node scripts/build-zone-geo.js
 */
const fs = require("fs");
const path = require("path");
const cfg = require("../js/zones.config.js");

const API = "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/georef-netherlands-postcode-pc4/records";
const TOLERANCE = 0.0003; // degrees (~30 m)
const DECIMALS = 5;

function sqSegDist(p, a, b) {
  let x = a[0], y = a[1], dx = b[0] - x, dy = b[1] - y;
  if (dx || dy) {
    const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) { x = b[0]; y = b[1]; } else if (t > 0) { x += dx * t; y += dy * t; }
  }
  dx = p[0] - x; dy = p[1] - y;
  return dx * dx + dy * dy;
}
function dp(pts, sq, first, last, keep) {
  let max = sq, idx = -1;
  for (let i = first + 1; i < last; i++) {
    const d = sqSegDist(pts[i], pts[first], pts[last]);
    if (d > max) { idx = i; max = d; }
  }
  if (idx > -1) { keep[idx] = true; dp(pts, sq, first, idx, keep); dp(pts, sq, idx, last, keep); }
}
function simplifyRing(ring) {
  const keep = new Array(ring.length).fill(false);
  keep[0] = keep[ring.length - 1] = true;
  dp(ring, TOLERANCE * TOLERANCE, 0, ring.length - 1, keep);
  const out = ring.filter((_, i) => keep[i]).map((p) => p.map((n) => +n.toFixed(DECIMALS)));
  return out.length >= 4 ? out : null;
}
function simplifyGeom(g) {
  const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
  const res = polys
    .map((poly) => poly.map(simplifyRing).filter(Boolean))
    .filter((poly) => poly.length);
  return res.length === 1 ? { type: "Polygon", coordinates: res[0] } : { type: "MultiPolygon", coordinates: res };
}

async function fetchZone(zone) {
  const codes = [];
  for (const [a, b] of zone.ranges) for (let c = a; c <= b; c++) codes.push(`"${c}"`);
  const where = `pc4_code in (${codes.join(",")})`;
  const rows = [];
  for (let offset = 0; ; offset += 100) {
    const url = `${API}?where=${encodeURIComponent(where)}&limit=100&offset=${offset}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${zone.id}: HTTP ${res.status}`);
    const json = await res.json();
    rows.push(...json.results);
    if (rows.length >= json.total_count || !json.results.length) break;
  }
  return rows;
}

(async () => {
  const features = [];
  for (const zone of cfg.zones) {
    const rows = await fetchZone(zone);
    console.log(zone.id, rows.length, "postcodes");
    for (const r of rows) {
      const geom = r.geo_shape && r.geo_shape.geometry;
      if (!geom) continue;
      features.push({
        type: "Feature",
        properties: { pc4: r.pc4_code, zone: zone.id },
        geometry: simplifyGeom(geom)
      });
    }
  }
  const out = path.join(__dirname, "..", "data", "zones-pc4.json");
  fs.writeFileSync(out, JSON.stringify({ type: "FeatureCollection", features }));
  console.log("saved", out, (fs.statSync(out).size / 1024).toFixed(0) + " KB");
})().catch((e) => { console.error(e); process.exit(1); });
