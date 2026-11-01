/**
 * Rebuild js/i18n/nl.js and js/i18n/th.js from translations/{nl,th}.txt + keys.txt.
 *
 * Expects the same line count as translations/en.txt (and keys.txt).
 * `[BR]` in a line becomes a real newline in the string value.
 *
 * Usage: node scripts/import-translations.js
 * Does not modify en.js.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const TRANS = path.join(ROOT, "translations");
const OUT = path.join(ROOT, "js", "i18n");

function readLines(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const normalized = raw.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");
  if (lines.length && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

function setPath(root, dotted, value) {
  const parts = dotted.split(".");
  let cur = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!Object.prototype.hasOwnProperty.call(cur, p) || typeof cur[p] !== "object" || cur[p] === null) {
      cur[p] = {};
    }
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

function escapeJsString(s) {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function emitObject(obj, indent) {
  const pad = "  ".repeat(indent);
  const keys = Object.keys(obj);
  const lines = ["{"];
  keys.forEach(function (key, idx) {
    const val = obj[key];
    const comma = idx < keys.length - 1 ? "," : "";
    const safeKey = /^[A-Za-z_][A-Za-z0-9_]*$/.test(key) ? key : JSON.stringify(key);
    if (val != null && typeof val === "object" && !Array.isArray(val)) {
      const nested = emitObject(val, indent + 1);
      lines.push(pad + "  " + safeKey + ": " + nested + comma);
    } else {
      lines.push(pad + "  " + safeKey + ': "' + escapeJsString(String(val)) + '"' + comma);
    }
  });
  lines.push(pad + "}");
  return lines.join("\n");
}

function headers(lang) {
  if (lang === "nl") {
    return [
      "/* Nederlands — Thai Sweets marketing site.",
      " * Rebuilt by scripts/import-translations.js from translations/nl.txt + keys.txt.",
      " * Review dessert names (items.*.name) after import.",
      " */",
    ].join("\n");
  }
  return [
    "/* ไทย — Thai Sweets marketing site.",
    " * Rebuilt by scripts/import-translations.js from translations/th.txt + keys.txt.",
    " * Review dessert names (items.*.name) after import against order-app messaging/DB.",
    " */",
  ].join("\n");
}

function buildPack(lang, keys, values) {
  const root = {};
  for (let i = 0; i < keys.length; i++) {
    const text = String(values[i]).split("[BR]").join("\n");
    setPath(root, keys[i], text);
  }
  const body = emitObject(root, 0);
  return (
    headers(lang) +
    "\nwindow.ThaiSweetsI18nData = window.ThaiSweetsI18nData || {};\n" +
    "window.ThaiSweetsI18nData." +
    lang +
    " = " +
    body +
    ";\n"
  );
}

function main() {
  const keys = readLines(path.join(TRANS, "keys.txt"));
  const en = readLines(path.join(TRANS, "en.txt"));
  const nl = readLines(path.join(TRANS, "nl.txt"));
  const th = readLines(path.join(TRANS, "th.txt"));

  const expected = en.length;
  const counts = {
    "keys.txt": keys.length,
    "en.txt": en.length,
    "nl.txt": nl.length,
    "th.txt": th.length,
  };

  const mismatches = Object.keys(counts).filter(function (name) {
    return counts[name] !== expected;
  });
  if (mismatches.length) {
    console.error(
      "Line count mismatch (expected " +
        expected +
        " like en.txt): " +
        mismatches
          .map(function (n) {
            return n + "=" + counts[n];
          })
          .join(", ")
    );
    process.exit(1);
  }

  if (keys.length !== expected) {
    console.error("keys.txt line count must match en.txt");
    process.exit(1);
  }

  fs.writeFileSync(path.join(OUT, "nl.js"), buildPack("nl", keys, nl), "utf8");
  fs.writeFileSync(path.join(OUT, "th.js"), buildPack("th", keys, th), "utf8");
  console.log("Wrote js/i18n/nl.js and js/i18n/th.js (" + expected + " strings each).");
}

main();
