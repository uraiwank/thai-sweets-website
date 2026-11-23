/*
 * Must be updated by hand when zones change in the order app admin.
 *
 * Single source for the delivery zones and the per-km formula on /bezorgen. The postcode checker, the zone
 * table, the map legend and the estimate calculator all read from here. After changing postcode ranges, re-run
 * `node scripts/build-zone-geo.js` to rebuild data/zones-pc4.json (map shapes).
 *
 * Amounts are euros for the products in the order, excluding delivery cost.
 * freeFrom: null = no free delivery.
 */
(function (root, factory) {
  var cfg = factory();
  if (typeof module === "object" && module.exports) module.exports = cfg;
  else root.ZonesConfig = cfg;
})(typeof self !== "undefined" ? self : this, function () {
  return {
    // Kitchen (map marker), Vlaardingen
    kitchen: { lat: 51.9122, lon: 4.3420 },

    zones: [
      { id: "vlaardingen", name: "Vlaardingen", ranges: [[3131, 3138]], fee: 5, min: 30, freeFrom: 100 },
      { id: "schiedam", name: "Schiedam", ranges: [[3111, 3125]], fee: 5, min: 30, freeFrom: 120 },
      { id: "rotterdam", name: "Rotterdam West/Centrum/Noord", ranges: [[3011, 3043]], fee: 7.5, min: 60, freeFrom: null },
      { id: "delft", name: "Delft", ranges: [[2611, 2629]], fee: 9, min: 60, freeFrom: null },
      { id: "rijswijk", name: "Rijswijk", ranges: [[2280, 2289]], fee: 12, min: 60, freeFrom: null },
      { id: "denhaag", name: "Den Haag / Voorburg", ranges: [[2491, 2599], [2271, 2275]], fee: 12, min: 60, freeFrom: null }
    ],

    // Fee -> map/legend colour (pastel fills; the legend always shows the amount as text too)
    feeColors: { "5": "#7cc4a0", "7.5": "#f2c66d", "9": "#f0a58f", "12": "#c9a6d8" },

    // Custom orders: price per kilometre driven from the kitchen
    perKm: { start: 5, perKm: 0.75, roundTo: 0.5, maxKm: 40 },

    // Estimate calculator: distance = straight line x detourFactor (same fallback as the order app).
    detourFactor: 1.3,
    // Start of the distance: "Gretha Hofstralaan, Vlaardingen", geocoded once with PDOK Locatieserver (street centroid).
    // Used for the calculation only. Never show this point on the map.
    routeOrigin: { lat: 51.92231203, lon: 4.34361765 }
  };
});
