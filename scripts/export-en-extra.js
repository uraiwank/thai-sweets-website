/**
 * Export customer-facing English NOT already in translations/en.txt.
 * Review quote paragraphs stay English (excluded from extra).
 *
 * Writes translations/en-extra.txt + keys-extra.txt (same rules as en.txt:
 * one string per line, no keys/code/quotes wrappers, HTML kept, newlines → [BR]).
 */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const PAGES = [
  "index.html",
  "menu.html",
  "about.html",
  "how-to-order.html",
  "contact.html",
  "404.html",
];

function readLines(p) {
  const raw = fs.readFileSync(p, "utf8").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = raw.split("\n");
  if (lines.length && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

function norm(s) {
  return String(s)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

const enLines = readLines(path.join(ROOT, "translations/en.txt"));
const keyLines = readLines(path.join(ROOT, "translations/keys.txt"));
const coveredTexts = new Set(enLines.map(norm));
const coveredKeys = new Set(keyLines);

// Expand covered texts with stripped-HTML versions of en.txt entries that contain tags
enLines.forEach((line) => {
  if (line.includes("<")) coveredTexts.add(norm(line.replace(/<[^>]+>/g, " ")));
});

const SKIP_EXACT = new Set([
  "Thai Sweets",
  "NL",
  "EN",
  "TH",
  "404",
  "Instagram",
  "Facebook",
  "TikTok",
  "WhatsApp",
  "info@thaisweets.nl",
  "06 45591043",
  "Nong Khai",
  "Bangkok",
  "Vlaardingen",
  "2019",
  "×",
  "&times;",
  "01",
  "02",
  "03",
  "04",
  "1",
  "2",
  "3",
  "4",
]);

function isDessertRomanization(t) {
  return /^(Khanom|Tong|Thong|Foi|Ta-Koh|Khao|A-Lua|Sampan|Ba-Bin|Piak|Lod|Puak|Tua|Woon|Sai|Look|Por|Kluay|Tempe|Kareepub|Pan |Chut |Cake |Met |Dara |Suan )/i.test(
    t
  );
}

function isReviewQuote(t) {
  return (
    /^[“"']/.test(t) &&
    /(delicious|homesick|meatballs|Thong Muan|wafer|sauce)/i.test(t)
  );
}

function isSkip(text) {
  const t = norm(text);
  if (!t || t.length < 2) return true;
  if (SKIP_EXACT.has(t)) return true;
  if (/^[\d\s€$.,·|/+\-–—:()%]+$/.test(t)) return true;
  if (/^from €/i.test(t)) return true;
  if (/^€\d/.test(t)) return true;
  if (/@|https?:|^\+?\d/.test(t)) return true;
  if (/^[\u0E00-\u0E7F\s&;]+$/.test(t)) return true;
  if (isDessertRomanization(t)) return true;
  if (/^[A-Z]\.,\s+[A-Za-z]+$/.test(t)) return true; // B., Leiden
  if (isReviewQuote(t)) return true; // leave review quotes in English
  if (!/[A-Za-z]{3,}/.test(t)) return true;
  // piece counts used as thai-name labels
  if (/^\d+\s+pieces?$/i.test(t)) return true;
  if (/^(Box A, B or C|7 or 11 pieces|12 pieces)$/i.test(t)) return true;
  return false;
}

function isCovered(text) {
  const t = norm(text);
  if (coveredTexts.has(t)) return true;
  const unq = t.replace(/^[“”"']+|["'“”]+$/g, "");
  if (coveredTexts.has(unq)) return true;
  return false;
}

function elementHasI18nKey(attrs) {
  const m = attrs.match(/data-i18n="([^"]+)"/);
  if (m && coveredKeys.has(m[1])) return m[1];
  const mi = attrs.match(/data-menu-item="([^"]+)"/);
  if (mi) return "items." + mi[1];
  return null;
}

function scanPage(file) {
  const html = fs.readFileSync(path.join(ROOT, file), "utf8");
  const findings = [];

  const re =
    /<(h[1-6]|p|a|button|span|strong|label|li|dt|dd|div|figcaption|cite|option|em)(\s[^>]*)?>([^<]*)</gi;
  let m;
  while ((m = re.exec(html))) {
    const tag = m[1].toLowerCase();
    const attrs = m[2] || "";
    const text = norm(m[3]);
    if (isSkip(text)) continue;
    if (isCovered(text)) continue;
    if (elementHasI18nKey(attrs)) continue;
    if (/class="[^"]*thai-name[^"]*"/.test(attrs)) continue;
    const before = html.slice(Math.max(0, m.index - 160), m.index);
    if (/review-card/.test(before) && (tag === "p" || tag === "cite")) continue;
    // fragment already inside a parent that has data-i18n html
    if (tag === "strong" && /data-i18n-attr="html"|data-i18n="how\.notice"/.test(before)) continue;
    const line = html.slice(0, m.index).split(/\n/).length;
    findings.push({ file, line, kind: "text", tag, text });
  }

  const attrRe = /\s(aria-label|placeholder|alt|title)="([^"]+)"/gi;
  while ((m = attrRe.exec(html))) {
    const name = m[1];
    const val = norm(m[2]);
    if (isSkip(val) || isCovered(val)) continue;
    const start = Math.max(0, m.index - 280);
    const win = html.slice(start, m.index + m[0].length + 60);
    const keyMatch = win.match(/data-i18n="([^"]+)"/);
    const attrList = (win.match(/data-i18n-attr="([^"]+)"/) || [])[1] || "";
    const attrs = attrList.split(",").map((s) => s.trim());
    if (keyMatch && coveredKeys.has(keyMatch[1]) && (attrs.includes(name) || attrs.includes("text"))) {
      continue;
    }
    // data-menu-field="alt"
    if (/data-menu-field="alt"/.test(win) || /data-menu-item=/.test(win)) continue;
    const line = html.slice(0, m.index).split(/\n/).length;
    findings.push({ file, line, kind: "attr", tag: name, text: val });
  }

  // title / meta description in head (fallback English — meta.* keys cover runtime)
  const title = (html.match(/<title>([^<]*)<\/title>/i) || [])[1];
  if (title && !isSkip(title) && !isCovered(norm(title))) {
    findings.push({ file, line: 1, kind: "title", tag: "title", text: norm(title) });
  }
  const metaDesc = (html.match(/<meta\s+name="description"\s+content="([^"]*)"/i) || [])[1];
  if (metaDesc && !isSkip(metaDesc) && !isCovered(norm(metaDesc))) {
    findings.push({ file, line: 2, kind: "meta", tag: "description", text: norm(metaDesc) });
  }

  return findings;
}

function suggestKey(f, idx) {
  const page =
    f.file === "index.html"
      ? "home"
      : f.file.replace(".html", "").replace("how-to-order", "how").replace("404", "notFound");
  const slug = f.text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .split("_")
    .filter(Boolean)
    .slice(0, 5)
    .join("_");
  if (f.kind === "attr" && f.tag === "alt") return "extra." + page + ".alt_" + slug;
  if (f.kind === "attr" && f.tag === "aria-label") return "extra.a11y." + slug;
  if (f.kind === "title") return "extra." + page + ".title_fallback";
  if (f.kind === "meta") return "extra." + page + ".desc_fallback";
  return "extra." + page + "." + (slug || "str_" + idx);
}

const all = [];
for (const f of PAGES) all.push(...scanPage(f));

const seenText = new Set();
const unique = [];
all.forEach((f, i) => {
  const t = norm(f.text);
  if (seenText.has(t)) return;
  seenText.add(t);
  f.key = suggestKey(f, i);
  unique.push(f);
});

// ensure unique keys
const used = new Set();
unique.forEach((f, i) => {
  let k = f.key;
  while (used.has(k)) k = f.key + "_" + (i + 1);
  used.add(k);
  f.key = k;
});

console.log("Uncovered customer-facing strings:", unique.length);
unique.forEach((f) => {
  console.log(
    f.file + ":L" + f.line + " [" + f.kind + "/" + f.tag + "] " + JSON.stringify(f.text) + " -> " + f.key
  );
});

const outDir = path.join(ROOT, "translations");
fs.writeFileSync(
  path.join(outDir, "keys-extra.txt"),
  unique.map((f) => f.key).join("\n") + (unique.length ? "\n" : ""),
  "utf8"
);
fs.writeFileSync(
  path.join(outDir, "en-extra.txt"),
  unique.map((f) => f.text.replace(/\r\n|\r|\n/g, "[BR]")).join("\n") + (unique.length ? "\n" : ""),
  "utf8"
);

// Also note categories user asked about that ARE already in en.txt
const already = [
  "about.hiTitle",
  "about.hiBody",
  "about.tl1Body",
  "about.promiseTitle",
  "home.storyBody",
  "home.starsEyebrowAlt",
  "home.starsTitleAlt",
  "home.storyAlt1",
  "about.altMom",
];
console.log("\nAlready in en.txt (not re-exported):");
already.forEach((k) => {
  const i = keyLines.indexOf(k);
  console.log(" ", k, i >= 0 ? "yes" : "NO");
});
