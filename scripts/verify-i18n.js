const fs = require("fs");
for (const f of ["index.html", "menu.html", "contact.html", "404.html", "about.html", "how-to-order.html"]) {
  const c = fs.readFileSync(f, "utf8");
  const page = (c.match(/data-page="([^"]+)/) || [])[1];
  console.log({
    f,
    page,
    langBtns: (c.match(/data-lang=/g) || []).length,
    i18nEngine: c.includes("js/i18n.js"),
    packs: c.includes("i18n/nl.js") && c.includes("i18n/th.js"),
    notify: c.includes('id="notify-form"'),
    turnstile: c.includes("notify-turnstile"),
    thai: /[\u0E00-\u0E7F]/.test(c),
  });
}
