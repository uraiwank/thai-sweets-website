/**
 * Find visible English leftovers: text nodes / attrs without data-i18n / data-menu-item.
 */
const fs = require("fs");
const path = require("path");

const pages = [
  "index.html",
  "menu.html",
  "about.html",
  "how-to-order.html",
  "contact.html",
  "404.html",
];

const SKIP_TAGS = new Set(["script", "style", "svg", "path", "circle", "noscript"]);
const OK_ATTR_EXACT = new Set([
  "Thai Sweets",
  "NL",
  "EN",
  "TH",
  "404",
  "Instagram",
  "Facebook",
  "TikTok",
  "info@thaisweets.nl",
  "06 45591043",
]);

function stripTags(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function hasLatinWord(s) {
  return /[A-Za-z]{3,}/.test(s);
}

function isMostlyEnglish(s) {
  if (!s || s.length < 3) return false;
  if (OK_ATTR_EXACT.has(s)) return false;
  if (/^[\d\s€$.,·|/+\-–—:()]+$/.test(s)) return false;
  if (/@|https?:|^\+?\d[\d\s]+$/.test(s)) return false;
  // Thai dessert romanizations / brand often stay Latin — flag descriptive English sentences
  return hasLatinWord(s) && /[A-Za-z]/.test(s) && !/^[\u0E00-\u0E7F\s]+$/.test(s);
}

function walk(file) {
  const html = fs.readFileSync(file, "utf8");
  const findings = [];

  // Title / meta without dynamic i18n (engine updates via meta.* keys if data-page set)
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
  if (title && /[A-Za-z]{4,}/.test(title)) {
    findings.push({ kind: "title-fallback", text: title, note: "OK if i18n meta applied at runtime" });
  }

  // Elements with English text but no data-i18n / data-menu-item on self or wrapping span
  // Heuristic: match opening tags then immediate text until next tag
  const re =
    /<(h[1-6]|p|a|button|span|strong|label|li|dt|dd|div|figcaption|option)(\s[^>]*)?>([^<]*)</gi;
  let m;
  while ((m = re.exec(html))) {
    const tag = m[1].toLowerCase();
    const attrs = m[2] || "";
    const text = m[3].replace(/\s+/g, " ").trim();
    if (!text || text.length < 2) continue;
    if (!isMostlyEnglish(text)) continue;
    if (/data-i18n=|data-menu-item=|data-menu-field=/.test(attrs)) continue;
    // Skip pure brand / social
    if (OK_ATTR_EXACT.has(text)) continue;
    // Skip if only Thai Sweets brand words short
    if (/^Thai Sweets/.test(text) && text.length < 20) continue;
    const line = html.slice(0, m.index).split(/\n/).length;
    findings.push({ kind: "hardcoded", tag, line, text: text.slice(0, 140), attrs: attrs.slice(0, 80) });
  }

  // Attributes
  const attrRe = /\s(aria-label|placeholder|alt|title)="([^"]+)"/gi;
  while ((m = attrRe.exec(html))) {
    const name = m[1];
    const val = m[2];
    if (!isMostlyEnglish(val)) continue;
    // Check nearby for data-i18n-attr
    const start = Math.max(0, m.index - 200);
    const window = html.slice(start, m.index + m[0].length + 50);
    if (/data-i18n=/.test(window) && /data-i18n-attr=/.test(window)) continue;
    const line = html.slice(0, m.index).split(/\n/).length;
    findings.push({ kind: "attr", name, line, text: val.slice(0, 140) });
  }

  return findings;
}

for (const file of pages) {
  const f = walk(file);
  console.log("\n=== " + file + " (" + f.length + ") ===");
  f.filter((x) => x.kind === "hardcoded" || x.kind === "attr")
    .slice(0, 60)
    .forEach((x) => {
      if (x.kind === "hardcoded") console.log("L" + x.line + " <" + x.tag + "> " + JSON.stringify(x.text));
      else console.log("L" + x.line + " @" + x.name + " " + JSON.stringify(x.text));
    });
  if (f.filter((x) => x.kind === "hardcoded" || x.kind === "attr").length > 60) {
    console.log("... truncated");
  }
}
