const fs = require("fs");
const c = fs.readFileSync("menu.html", "utf8");
const re =
  /<h3>([^<]+)<\/h3>[\s\S]*?<p class="thai-name"[^>]*>([^<]*)<\/p>\s*<p class="muted">([^<]*)<\/p>/g;
let m;
while ((m = re.exec(c))) {
  console.log(JSON.stringify({ h3: m[1], thai: m[2], desc: m[3] }));
}
