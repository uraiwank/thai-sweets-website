/**
 * Rebuild js/i18n/{nl,th}.js from translations/{nl,th}.txt + keys.txt,
 * then merge translations/{nl,th}-extra.txt + keys-extra.txt (same rules).
 *
 * Main pack: line counts must match translations/en.txt (+ keys.txt).
 * Extra pack: line counts must match translations/en-extra.txt (+ keys-extra.txt).
 * `[BR]` in a line becomes a real newline in the string value.
 *
 * Usage:
 *   node scripts/import-translations.js           # both nl + th
 *   node scripts/import-translations.js --lang=nl # Dutch only
 *   node scripts/import-translations.js --lang=th # Thai only
 *
 * Does not modify en.js. Does not create missing *-extra.txt files.
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

function exists(filePath) {
  try {
    fs.accessSync(filePath);
    return true;
  } catch (e) {
    return false;
  }
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

function headers(lang, withExtra) {
  const extraNote = withExtra ? " + keys-extra.txt / " + lang + "-extra.txt" : "";
  if (lang === "nl") {
    return [
      "/* Nederlands — Thai Sweets marketing site.",
      " * Rebuilt by scripts/import-translations.js from translations/nl.txt + keys.txt" +
        extraNote +
        ".",
      " */",
    ].join("\n");
  }
  return [
    "/* ไทย — Thai Sweets marketing site.",
    " * Rebuilt by scripts/import-translations.js from translations/th.txt + keys.txt" +
      extraNote +
      ".",
    " * Review dessert names (items.*.name) after import against order-app messaging/DB.",
    " */",
  ].join("\n");
}

function buildObject(keys, values) {
  const root = {};
  for (let i = 0; i < keys.length; i++) {
    const text = String(values[i]).split("[BR]").join("\n");
    setPath(root, keys[i], text);
  }
  return root;
}

function writePack(lang, obj, withExtra) {
  const body = emitObject(obj, 0);
  const out =
    headers(lang, withExtra) +
    "\nwindow.ThaiSweetsI18nData = window.ThaiSweetsI18nData || {};\n" +
    "window.ThaiSweetsI18nData." +
    lang +
    " = " +
    body +
    ";\n";
  fs.writeFileSync(path.join(OUT, lang + ".js"), out, "utf8");
}

function parseLangs(argv) {
  var langs = [];
  argv.forEach(function (arg) {
    var m = /^--lang=(nl|th)$/.exec(arg);
    if (m) langs.push(m[1]);
  });
  if (!langs.length) return ["nl", "th"];
  return langs;
}

function loadExtras(lang) {
  const keysExtraPath = path.join(TRANS, "keys-extra.txt");
  const enExtraPath = path.join(TRANS, "en-extra.txt");
  const langExtraPath = path.join(TRANS, lang + "-extra.txt");

  if (!exists(keysExtraPath) && !exists(enExtraPath) && !exists(langExtraPath)) {
    return null;
  }

  if (!exists(keysExtraPath) || !exists(enExtraPath)) {
    console.error(
      "Extra translations incomplete: need both keys-extra.txt and en-extra.txt when using extras."
    );
    process.exit(1);
  }
  if (!exists(langExtraPath)) {
    console.error(
      "Missing " + lang + "-extra.txt (required to match en-extra.txt / keys-extra.txt)."
    );
    process.exit(1);
  }

  const keysExtra = readLines(keysExtraPath);
  const enExtra = readLines(enExtraPath);
  const langExtra = readLines(langExtraPath);
  const expected = enExtra.length;

  if (keysExtra.length !== expected) {
    console.error(
      "keys-extra.txt line count must match en-extra.txt (" +
        expected +
        "), got " +
        keysExtra.length
    );
    process.exit(1);
  }
  if (langExtra.length !== expected) {
    console.error(
      lang +
        "-extra.txt line count mismatch: expected " +
        expected +
        " (en-extra.txt), got " +
        langExtra.length
    );
    process.exit(1);
  }

  return { keys: keysExtra, values: langExtra, count: expected };
}

function main() {
  const langs = parseLangs(process.argv.slice(2));
  const keys = readLines(path.join(TRANS, "keys.txt"));
  const en = readLines(path.join(TRANS, "en.txt"));
  const expected = en.length;

  if (keys.length !== expected) {
    console.error("keys.txt line count must match en.txt (" + expected + "), got " + keys.length);
    process.exit(1);
  }

  const written = [];
  langs.forEach(function (lang) {
    const file = lang + ".txt";
    const values = readLines(path.join(TRANS, file));
    if (values.length !== expected) {
      console.error(
        file + " line count mismatch: expected " + expected + " (en.txt), got " + values.length
      );
      process.exit(1);
    }

    const pack = buildObject(keys, values);
    const extras = loadExtras(lang);
    if (extras) {
      for (let i = 0; i < extras.keys.length; i++) {
        const text = String(extras.values[i]).split("[BR]").join("\n");
        setPath(pack, extras.keys[i], text);
      }
    }

    writePack(lang, pack, !!(extras && extras.count));
    written.push(
      "js/i18n/" +
        lang +
        ".js" +
        (extras ? " (+" + extras.count + " extra)" : "")
    );
  });

  console.log("Wrote " + written.join(", ") + " (main " + expected + " strings each).");
}

main();
