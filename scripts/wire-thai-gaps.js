/**
 * Wire hardcoded English to data-i18n / extend packs for TH gaps.
 * Run: node scripts/wire-thai-gaps.js
 */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");

function read(p) {
  return fs.readFileSync(path.join(ROOT, p), "utf8");
}
function write(p, s) {
  fs.writeFileSync(path.join(ROOT, p), s, "utf8");
}

function loadPack(lang) {
  const sandbox = { window: {} };
  vm.runInNewContext(read("js/i18n/" + lang + ".js"), sandbox);
  return sandbox.window.ThaiSweetsI18nData[lang];
}

function escapeJs(s) {
  return String(s)
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n");
}

function emitObject(obj, indent) {
  const pad = "  ".repeat(indent);
  const keys = Object.keys(obj);
  const lines = ["{"];
  keys.forEach((key, idx) => {
    const val = obj[key];
    const comma = idx < keys.length - 1 ? "," : "";
    const safeKey = /^[A-Za-z_][A-Za-z0-9_]*$/.test(key) ? key : JSON.stringify(key);
    if (val != null && typeof val === "object" && !Array.isArray(val)) {
      lines.push(pad + "  " + safeKey + ": " + emitObject(val, indent + 1) + comma);
    } else {
      lines.push(pad + "  " + safeKey + ': "' + escapeJs(val) + '"' + comma);
    }
  });
  lines.push(pad + "}");
  return lines.join("\n");
}

function writePack(lang, pack, header) {
  const body =
    header +
    "\nwindow.ThaiSweetsI18nData = window.ThaiSweetsI18nData || {};\n" +
    "window.ThaiSweetsI18nData." +
    lang +
    " = " +
    emitObject(pack, 0) +
    ";\n";
  write("js/i18n/" + lang + ".js", body);
}

function setPath(root, dotted, value) {
  const parts = dotted.split(".");
  let cur = root;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]] || typeof cur[parts[i]] !== "object") cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

function flat(obj, prefix, acc) {
  Object.keys(obj).forEach((k) => {
    const p = prefix ? prefix + "." + k : k;
    const v = obj[k];
    if (v != null && typeof v === "object") flat(v, p, acc);
    else acc.push([p, v]);
  });
  return acc;
}

/* ---- new strings ---- */
const NEW = {
  en: {
    "home.check1": "Recipes from my mom & grandmas",
    "home.sinceLabel": "Handcrafting Thai treats in Vlaardingen",
    "home.storyQuote": "“Each order means the world to me.”",
    "home.starsEyebrowAlt": "Kind words",
    "home.starsTitleAlt": "From our customers",
    "home.review1":
      "“The Thong Muan (crispy rolled wafers) were delicious! Everything was so fresh and tasted amazing.”",
    "home.review2": "“The meatballs with dipping sauce were absolutely delicious!”",
    "home.review3":
      "“The sweets were so delicious, thank you so much! They really made me feel less homesick.”",
    "home.starsAria": "5 out of 5 stars",
    "home.howHomeEyebrow": "How to order",
    "home.howHomeTitle": "Four simple steps",
    "home.howHomeSide":
      "Everything is made fresh to order, so please allow at least <strong>1 week</strong> before your pickup or delivery date.",
    "home.howHome1Title": "Browse the menu",
    "home.howHome1Body": "Find the Thai desserts, snacks and cakes you'd like.",
    "home.howHome2Title": "Place your order",
    "home.howHome2Body": "Order online at least 1 week before your date.",
    "home.howHome3Title": "Confirmation",
    "home.howHome3Body":
      "I confirm availability, final price and pickup or delivery by email or WhatsApp.",
    "home.howHome4Title": "Enjoy your treats",
    "home.howHome4Body": "Pick up in Vlaardingen for free, or have it delivered.",
    "home.catAltDesserts": "Pandan layer cake",
    "home.catAltSavory": "Chicken curry puffs",
    "home.catAltCakes": "Rose flower cupcakes",
    "about.hiTitle": "Hi, I'm Nina",
    "about.hiBody":
      "Thai Sweets is my passion and my connection to home. I grew up in Nong Khai, Thailand, learning to cook in my mom's food shop alongside my grandmas. After training at Suan Dusit International Culinary School, I moved to Vlaardingen and started handcrafting authentic Thai desserts, snacks and cakes from my home kitchen.",
    "about.hiBody2":
      "Making these Thai treats isn't just my business: it's my way of staying connected to home and sharing that connection with you. Whether it's a sweet dessert, a savoury snack or a special cake, each order means the world to me. Thank you for supporting my small business and letting me bring a little taste of Thailand into your life.",
    "about.tl1Strong": "Nong Khai",
    "about.tl1Body": "Helping in my mom's food shop, learning recipes from my mom and grandmas.",
    "about.tl2Strong": "Bangkok",
    "about.tl2Body": "Trained at Suan Dusit International Culinary School.",
    "about.tl3Strong": "2019",
    "about.tl3Body": "Started Thai Sweets in my home kitchen in Vlaardingen.",
    "about.promiseEyebrow": "Our promise & connection",
    "about.promiseTitle": "As close to Thailand as possible",
    "about.promiseLead":
      "Every order is made with care. We use only fresh, high-quality ingredients, preparing everything by hand in small batches, for the true, authentic taste of Thai sweets in every bite.",
    "about.promise1": "Everything handmade by me in small batches from my home kitchen",
    "about.promise2": "Authentic flavours from my home kitchen to yours",
    "about.promise3": "Freshness and quality in every ingredient",
    "about.exploreMenu": "Explore the menu",
    "about.altMom": "Nina's mother cooking in Thailand",
    "about.altHands": "Hands preparing Thai dumplings",
    "cookies.bodyBanner":
      "This website only uses essential cookies. If we add analytics later, we'll ask for your consent first. Read more in our ",
    "cookies.moreInfoPrefix": "You can find more information in our ",
    "cookies.close": "Close preferences",
  },
  nl: {
    "home.check1": "Recepten van mijn moeder en oma’s",
    "home.sinceLabel": "Handgemaakte Thaise lekkernijen in Vlaardingen",
    "home.storyQuote": "“Elke bestelling betekent de wereld voor mij.”",
    "home.starsEyebrowAlt": "Lieve woorden",
    "home.starsTitleAlt": "Van onze klanten",
    "home.review1":
      "“De Thong Muan (knapperige rolwafels) waren heerlijk! Alles was zo vers en smaakte fantastisch.”",
    "home.review2": "“De balletjes met dipsaus waren absoluut heerlijk!”",
    "home.review3":
      "“De zoetigheden waren zo lekker, heel erg bedankt! Ze maakten me echt minder homesick.”",
    "home.starsAria": "5 van de 5 sterren",
    "home.howHomeEyebrow": "Zo bestel je",
    "home.howHomeTitle": "Vier eenvoudige stappen",
    "home.howHomeSide":
      "Alles wordt vers op bestelling gemaakt, dus houd rekening met minstens <strong>1 week</strong> voor je ophaal- of bezorgdatum.",
    "home.howHome1Title": "Bekijk het menu",
    "home.howHome1Body": "Zoek de Thaise desserts, snacks en cakes die je wilt.",
    "home.howHome2Title": "Plaats je bestelling",
    "home.howHome2Body": "Bestel online minstens 1 week voor je datum.",
    "home.howHome3Title": "Bevestiging",
    "home.howHome3Body":
      "Ik bevestig beschikbaarheid, eindprijs en ophalen of bezorgen per e-mail of WhatsApp.",
    "home.howHome4Title": "Geniet van je lekkernijen",
    "home.howHome4Body": "Haal gratis op in Vlaardingen, of laat bezorgen.",
    "home.catAltDesserts": "Pandan-laagjescake",
    "home.catAltSavory": "Kipcurrypuffs",
    "home.catAltCakes": "Rozenbloemcupcakes",
    "about.hiTitle": "Hoi, ik ben Nina",
    "about.hiBody":
      "Thai Sweets is mijn passie en mijn verbinding met thuis. Ik groeide op in Nong Khai, Thailand, en leerde koken in de eettent van mijn moeder samen met mijn oma’s. Na een opleiding aan Suan Dusit International Culinary School verhuisde ik naar Vlaardingen en begon ik authentieke Thaise desserts, snacks en cakes met de hand te maken in mijn thuiskeuken.",
    "about.hiBody2":
      "Deze Thaise lekkernijen maken is niet alleen mijn bedrijf: het is mijn manier om verbonden te blijven met thuis en die connectie met jou te delen. Of het nu een zoet dessert, een hartige snack of een speciale cake is — elke bestelling betekent de wereld voor mij. Dank je wel dat je mijn kleine zaak steunt.",
    "about.tl1Strong": "Nong Khai",
    "about.tl1Body": "Helpen in de eettent van mijn moeder, recepten leren van mijn moeder en oma’s.",
    "about.tl2Strong": "Bangkok",
    "about.tl2Body": "Opgeleid aan Suan Dusit International Culinary School.",
    "about.tl3Strong": "2019",
    "about.tl3Body": "Thai Sweets gestart in mijn thuiskeuken in Vlaardingen.",
    "about.promiseEyebrow": "Onze belofte & verbinding",
    "about.promiseTitle": "Zo dicht mogelijk bij Thailand",
    "about.promiseLead":
      "Elke bestelling maak ik met zorg. Alleen verse, hoogwaardige ingrediënten, met de hand in kleine batches, voor de echte authentieke smaak van Thaise zoetigheden in elke hap.",
    "about.promise1": "Alles met de hand door mij in kleine batches vanuit mijn thuiskeuken",
    "about.promise2": "Authentieke smaken van mijn thuiskeuken naar de jouwe",
    "about.promise3": "Versheid en kwaliteit in elk ingrediënt",
    "about.exploreMenu": "Bekijk het menu",
    "about.altMom": "Nina’s moeder kookt in Thailand",
    "about.altHands": "Handen die Thaise dumplings bereiden",
    "cookies.bodyBanner":
      "Deze website gebruikt alleen essentiële cookies. Als we later analytics toevoegen, vragen we eerst om je toestemming. Lees meer in ons ",
    "cookies.moreInfoPrefix": "Meer informatie vind je in ons ",
    "cookies.close": "Voorkeuren sluiten",
  },
  th: {
    "home.check1": "สูตรจากแม่และคุณยาย",
    "home.sinceLabel": "ทำขนมไทยด้วยมือที่ Vlaardingen",
    "home.storyQuote": "“ทุกออเดอร์มีความหมายกับฉันมาก”",
    "home.starsEyebrowAlt": "คำชมจากลูกค้า",
    "home.starsTitleAlt": "จากลูกค้าของเรา",
    "home.review1":
      "“ทองม้วนกรอบอร่อยมาก! ทุกอย่างสดใหม่และรสชาติดีสุด ๆ”",
    "home.review2": "“ลูกชิ้นกับน้ำจิ้มอร่อยสุด ๆ!”",
    "home.review3":
      "“ขนมอร่อยมาก ขอบคุณมาก ๆ! ทำให้คิดถึงบ้านน้อยลงจริง ๆ”",
    "home.starsAria": "5 จาก 5 ดาว",
    "home.howHomeEyebrow": "วิธีสั่ง",
    "home.howHomeTitle": "สี่ขั้นตอนง่าย ๆ",
    "home.howHomeSide":
      "ทุกอย่างทำสดตามออเดอร์ กรุณาเผื่อเวลาอย่างน้อย <strong>1 สัปดาห์</strong> ก่อนวันรับหรือจัดส่ง",
    "home.howHome1Title": "เลือกดูเมนู",
    "home.howHome1Body": "เลือกขนมไทย ของว่าง และเค้กที่อยากได้",
    "home.howHome2Title": "สั่งซื้อ",
    "home.howHome2Body": "สั่งออนไลน์ล่วงหน้าอย่างน้อย 1 สัปดาห์",
    "home.howHome3Title": "ยืนยันออเดอร์",
    "home.howHome3Body":
      "เราจะยืนยันความพร้อม ราคาสุดท้าย และการรับเองหรือจัดส่งทางอีเมลหรือ WhatsApp",
    "home.howHome4Title": "เพลิดเพลินกับขนม",
    "home.howHome4Body": "รับเองฟรีที่ Vlaardingen หรือให้เราจัดส่ง",
    "home.catAltDesserts": "ขนมชั้นใบเตย",
    "home.catAltSavory": "กะหรี่พัฟไก่",
    "home.catAltCakes": "คัพเค้กดอกกุหลาบ",
    "about.hiTitle": "สวัสดีค่ะ ฉันชื่อนิน่า",
    "about.hiBody":
      "Thai Sweets คือความหลงใหลและการเชื่อมโยงกับบ้านเกิด ฉันเติบโตที่หนองคาย เรียนรู้การทำอาหารในร้านของคุณแม่พร้อมคุณยาย หลังเรียนที่โรงเรียนการอาหารนานาชาติสวนดุสิต ฉันย้ายมา Vlaardingen และเริ่มทำขนมไทย ของว่าง และเค้กด้วยมือจากครัวที่บ้าน",
    "about.hiBody2":
      "การทำขนมไทยไม่ใช่แค่ธุรกิจ แต่เป็นวิธีที่ฉันเชื่อมโยงกับบ้านและแบ่งปันรสชาตินั้นกับคุณ ไม่ว่าจะเป็นขนมหวาน ของว่าง หรือเค้กพิเศษ ทุกออเดอร์มีความหมายมาก ขอบคุณที่สนับสนุนร้านเล็ก ๆ ของฉัน",
    "about.tl1Strong": "หนองคาย",
    "about.tl1Body": "ช่วยงานในร้านของคุณแม่ เรียนรู้สูตรจากแม่และคุณยาย",
    "about.tl2Strong": "กรุงเทพฯ",
    "about.tl2Body": "เรียนที่โรงเรียนการอาหารนานาชาติสวนดุสิต",
    "about.tl3Strong": "2019",
    "about.tl3Body": "เริ่ม Thai Sweets จากครัวที่บ้านใน Vlaardingen",
    "about.promiseEyebrow": "คำมั่นและการเชื่อมโยงของเรา",
    "about.promiseTitle": "ใกล้เคียงรสชาติไทยมากที่สุด",
    "about.promiseLead":
      "ทุกออเดอร์ทำด้วยความใส่ใจ ใช้แต่วัตถุดิบสดคุณภาพดี ทำมือเป็นชุดเล็ก ๆ เพื่อรสชาติขนมไทยแท้ในทุกคำ",
    "about.promise1": "ทำมือทั้งหมดโดยฉันเป็นชุดเล็ก ๆ จากครัวที่บ้าน",
    "about.promise2": "รสชาติแท้จากครัวบ้านฉันถึงบ้านคุณ",
    "about.promise3": "ความสดและคุณภาพในทุกวัตถุดิบ",
    "about.exploreMenu": "ดูเมนู",
    "about.altMom": "คุณแม่ของนิน่ากำลังทำอาหารที่ประเทศไทย",
    "about.altHands": "มือกำลังเตรียมขนมจีบ",
    "cookies.bodyBanner":
      "เว็บไซต์นี้ใช้เฉพาะคุกกี้ที่จำเป็น หากเราเพิ่มการวิเคราะห์ภายหลัง จะขอความยินยอมก่อน อ่านเพิ่มใน ",
    "cookies.moreInfoPrefix": "ข้อมูลเพิ่มเติมอยู่ใน ",
    "cookies.close": "ปิดการตั้งค่า",
  },
};

/* Extract also-on-menu items from menu.html (3 sections). */
function extractAlsoItems() {
  const html = read("menu.html");
  const sections = [
    ...html.matchAll(
      /<p class="also-title">Also on the menu<\/p>\s*<ul class="also-list">([\s\S]*?)<\/ul>/g
    ),
  ];
  if (!sections.length) throw new Error("also-list not found");
  const items = [];
  const re =
    /<strong>([^<]+)<\/strong>\s*<div class="thai-name">([^<]*)<\/div>[\s\S]*?<p class="desc">([^<]*)<\/p>/g;
  for (const sec of sections) {
    let m;
    while ((m = re.exec(sec[1]))) {
      items.push({ name: m[1].trim(), thai: m[2].trim(), desc: m[3].trim() });
    }
  }
  return items;
}

function slugify(name, i) {
  return (
    "also" +
    String(i + 1) +
    "_" +
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 24)
  );
}

/* Thai translations for also-on-menu English names/descriptions; keep thai-name as-is */
const ALSO_TH_NAME = {
  "Pandan Layer Cake": "ขนมชั้นใบเตย",
  "Taro Pudding with Coconut Cream": "ตะโก้เผือก",
  "Cassava Pudding with Coconut Cream": "ตะโก้มันสำปะหลัง",
  "Coconut-Rice Pancakes": "ขนมครก",
  "Sweet Coconut Milk Cups": "ขนมถ้วย",
  "Mini Thai Crêpes": "ขนมเบื้อง",
  "Flower-Shaped Thai Mochi": "ขนมอาลัวดอกไม้",
  "Small Thai Mochi": "อาลัวโบราณ",
  "Large Pastry Bun (1 salted egg yolk)": "ขนมเปี๊ยะใหญ่ (ไข่เค็ม 1 ฟอง)",
  "Jumbo Pastry Bun (5 salted egg yolks)": "ขนมเปี๊ยะจัมโบ้ (ไข่เค็ม 5 ฟอง)",
  "Banana Tong Muan": "ทองม้วนกล้วยหอม",
  "Thai Honeycomb Cookies": "ขนมดอกจอก",
  "Sampanni Shortbread Cookies": "สัมปันนี",
  "Grilled Sticky Rice": "ข้าวเหนียวปิ้ง",
  "Thai Coconut Pancake": "บ้าบิ่นมะพร้าวอ่อน / เผือก",
  "Steamed Sticky Rice with Coconut": "ขนมใส่ไส้",
  "Steamed Cassava Cake": "ขนมมัน",
  "Orchid Flower Layer Cake": "ขนมชั้นดอกกล้วยไม้",
  "Thai Custard Cake": "ขนมหม้อแกง",
  "Pandan Pudding": "เปียกปูนใบเตย",
  "Traditional Black Pudding": "เปียกปูนโบราณ",
  "Sticky Rice with Egg Custard": "ข้าวเหนียวสังขยา",
  "Pandan Rice Noodles in Coconut Milk": "ลอดช่องใบเตย",
  "Taro Paste": "เผือกกวน",
  "Mung Bean Paste": "ถั่วกวน",
  "Happiness & Well-being Set": "ชุดขนมเสริมสุข",
  "Coconut Milk Jelly": "วุ้นกะทิมะพร้าวอ่อน",
  "Glass-Coated Coconut Jelly": "วุ้นกะทิเคลือบแก้ว",
  "Isaan Fermented Sausage": "ไส้กรอกอีสาน",
  "BBQ Meatballs with Dipping Sauce": "ลูกชิ้นปิ้ง",
  "Spring Rolls": "ปอเปี๊ยะทอด",
  "Banana Fritters": "กล้วยทอด",
  "Fried Tempeh": "เทมเป้ทอด",
  "Grilled Sticky Rice with Egg Glaze": "ข้าวจี่",
  "Mini Young Coconut Cupcakes": "มินิคัพเค้กมะพร้าวอ่อน",
  "Christmas Flower Cupcakes": "คัพเค้กดอกไม้คริสต์มาส",
  "Christmas Flower Bouquet": "ช่อคัพเค้กดอกไม้คริสต์มาส",
};
const ALSO_TH_DESC = {
  "Pandan Layer Cake": "นึ่งหลายชั้น เหนียวหนึบ หอมใบเตย",
  "Taro Pudding with Coconut Cream": "ฐานเผือกหวาน ราดหัวกะทิเค็มข้น",
  "Cassava Pudding with Coconut Cream": "ฐานมันสำปะหลังหวาน ราดหัวกะทิเค็มข้น",
  "Coconut-Rice Pancakes": "ขนมครกเล็ก ๆ กลางนุ่มกะทิ",
  "Sweet Coconut Milk Cups": "ขนมสองชั้น ฐานหวาน หัวกะทิเค็ม",
  "Mini Thai Crêpes": "เครปบางรูปทรงทาโก้ ไส้ครีมและท็อปปิ้ง",
  "Flower-Shaped Thai Mochi": "ขนมอ่อนนุ่มปั้นเป็นดอกไม้นานาสี",
  "Small Thai Mochi": "นอกกรอบในหนึบ มะพร้าวกับแป้ง",
  "Large Pastry Bun (1 salted egg yolk)": "ไส้ถั่วกวน เผือก หรือฟักเชื่อม",
  "Jumbo Pastry Bun (5 salted egg yolks)": "ขนาดใหญ่พิเศษ ไส้ถั่วกวน เผือก หรือฟัก",
  "Banana Tong Muan": "ทองม้วนกรอบ หอมกลิ่นกล้วย",
  "Thai Honeycomb Cookies": "คุกกี้กรอบรูปดอกบัว",
  "Sampanni Shortbread Cookies": "ละลายในปาก จากแป้งมันสำปะหลังคั่วและกะทิ",
  "Grilled Sticky Rice": "ข้าวเหนียวกะทิกับกล้วยหรือเผือก ปิ้งในใบตอง",
  "Thai Coconut Pancake": "แพนเค้กหวานหนึบ มะพร้าวอ่อนหรือเผือก",
  "Steamed Sticky Rice with Coconut": "ไส้มะพร้าวหวานในแป้งข้าวเหนียว นึ่งใบตอง",
  "Steamed Cassava Cake": "มันสำปะหลังขูดนึ่งกับน้ำตาลและกะทิ",
  "Orchid Flower Layer Cake": "ขนมชั้นปั้นเป็นดอกกล้วยไม้",
  "Thai Custard Cake": "สังขยาอบ ฐานถั่วกวน เผือก หรือไข่",
  "Pandan Pudding": "เปียกปูนใบเตยนุ่ม โรยมะพร้าวขูด",
  "Traditional Black Pudding": "เปียกปูนดำโบราณ จากขี้เถ้ากาบมะพร้าว",
  "Sticky Rice with Egg Custard": "ข้าวเหนียวหวานราดสังขยาไข่นึ่ง",
  "Pandan Rice Noodles in Coconut Milk": "เส้นแป้งขี้หนูสีเขียวในกะทิและน้ำตาลโตนด",
  "Taro Paste": "เผือกกวนกะทิเนื้อแน่น",
  "Mung Bean Paste": "ถั่วกวนกะทิเนื้อแน่น",
  "Happiness & Well-being Set": "ชุดขนมไทยห้าอย่าง เพื่อความสุขและสุขภาพดี",
  "Coconut Milk Jelly": "วุ้นกะทิเนียน ใส่เนื้อมะพร้าวอ่อน",
  "Glass-Coated Coconut Jelly": "วุ้นกะทิสองชั้น หน้าใสเงา",
  "Isaan Fermented Sausage": "ไส้กรอกหมักรสเปรี้ยวจากอีสาน ย่างเสิร์ฟ",
  "BBQ Meatballs with Dipping Sauce": "ลูกชิ้นเนื้อหรือหมูปิ้งเสียบไม้ (10 ชิ้น)",
  "Spring Rolls": "ปอเปี๊ยะกรอบ ผักรวมหรือใส่ไก่",
  "Banana Fritters": "กล้วยหั่นชุบแป้งหวาน ทอดเหลืองกรอบ",
  "Fried Tempeh": "เทมเป้ถั่วเหลืองหมักทอดกรอบ",
  "Grilled Sticky Rice with Egg Glaze": "ข้าวเหนียวปรุงรส ย่างทาไข่",
  "Mini Young Coconut Cupcakes": "เค้กมะพร้าวอ่อนชิ้นเล็กนุ่ม",
  "Christmas Flower Cupcakes": "คัพเค้กธีมดอกไม้สำหรับคริสต์มาส",
  "Christmas Flower Bouquet": "จัดคัพเค้กเป็นช่อดอกไม้สำหรับงานคริสต์มาส",
};

function patchIndex(html) {
  let h = html;
  h = h.replace(
    /<li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"\/><\/svg><span>Recipes from my mom & grandmas<\/span><\/li>/,
    '<li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg><span data-i18n="home.check1">Recipes from my mom & grandmas</span></li>'
  );
  h = h.replace(
    /<h3>See which menus are open on our order page<\/h3>\s*<p class="muted">JavaScript is off, so live rounds cannot load here\.<\/p>/,
    '<h3 data-i18n="home.roundsNoscriptTitle">See which menus are open on our order page</h3>\n                <p class="muted" data-i18n="home.roundsNoscriptBody">JavaScript is off, so live rounds cannot load here.</p>'
  );
  h = h.replace(
    /<p class="eyebrow">Our menu<\/p>\s*<h2>Authentic Thai treats, all made fresh to order<\/h2>/,
    '<p class="eyebrow" data-i18n="home.menuEyebrow">Our menu</p>\n            <h2 data-i18n="home.menuTitle">Authentic Thai treats, all made fresh to order</h2>'
  );
  h = h.replace(
    /<p class="section-head__side"><a href="menu.html">See the full menu →<\/a><\/p>/,
    '<p class="section-head__side"><a href="menu.html" data-i18n="home.menuSeeAll">See the full menu →</a></p>'
  );
  h = h.replace(
    /alt="Pandan layer cake"/,
    'alt="Pandan layer cake" data-i18n="home.catAltDesserts" data-i18n-attr="alt"'
  );
  h = h.replace(
    /alt="Chicken curry puffs"/,
    'alt="Chicken curry puffs" data-i18n="home.catAltSavory" data-i18n-attr="alt"'
  );
  h = h.replace(
    /alt="Rose flower cupcakes"/,
    'alt="Rose flower cupcakes" data-i18n="home.catAltCakes" data-i18n-attr="alt"'
  );
  h = h.replace(
    /<h3>Traditional Thai Desserts<\/h3>\s*<p class="muted">Layer cakes, luk chup, golden sweets · from €8<\/p>/,
    '<h3 data-i18n="home.catDesserts">Traditional Thai Desserts</h3>\n              <p class="muted" data-i18n="home.catDessertsMeta">Layer cakes, luk chup, golden sweets · from €8</p>'
  );
  h = h.replace(
    /<h3>Savory Snacks<\/h3>\s*<p class="muted">Curry puffs, sausages, dumplings · from €8<\/p>/,
    '<h3 data-i18n="home.catSavory">Savory Snacks</h3>\n              <p class="muted" data-i18n="home.catSavoryMeta">Curry puffs, sausages, dumplings · from €8</p>'
  );
  h = h.replace(
    /<h3>Cakes &amp; Cupcakes<\/h3>\s*<p class="muted">Flower cupcakes, young coconut cake · from €4<\/p>/,
    '<h3 data-i18n="home.catCakes">Cakes &amp; Cupcakes</h3>\n              <p class="muted" data-i18n="home.catCakesMeta">Flower cupcakes, young coconut cake · from €4</p>'
  );
  h = h.replace(
    /<p class="eyebrow">Our values<\/p>\s*<h2>What goes into every box<\/h2>/,
    '<p class="eyebrow" data-i18n="home.valuesEyebrow">Our values</p>\n          <h2 data-i18n="home.valuesTitle">What goes into every box</h2>'
  );
  h = h.replace(
    /<h3>Authenticity &amp; heritage<\/h3>\s*<p class="muted">Every sweet follows traditional Thai recipes cherished for generations: the real flavours of Thailand I grew up with\.<\/p>/,
    '<h3 data-i18n="home.value1Title">Authenticity &amp; heritage</h3>\n            <p class="muted" data-i18n="home.value1Body">Every sweet follows traditional Thai recipes cherished for generations: the real flavours of Thailand I grew up with.</p>'
  );
  h = h.replace(
    /<h3>Quality<\/h3>\s*<p class="muted">Great food starts with great ingredients\. Only the freshest, finest ingredients go into everything I make\.<\/p>/,
    '<h3 data-i18n="home.value2Title">Quality</h3>\n            <p class="muted" data-i18n="home.value2Body">Great food starts with great ingredients. Only the freshest, finest ingredients go into everything I make.</p>'
  );
  h = h.replace(
    /<h3>Sustainability<\/h3>\s*<p class="muted">Pre-order only means less food waste\. I'm also moving step by step to eco-friendly packaging\.<\/p>/,
    '<h3 data-i18n="home.value3Title">Sustainability</h3>\n            <p class="muted" data-i18n="home.value3Body">Pre-order only means less food waste. I\'m also moving step by step to eco-friendly packaging.</p>'
  );
  h = h.replace(
    /alt="Nina as a child with her mother in Thailand"/g,
    'alt="Nina as a child with her mother in Thailand" data-i18n="home.storyAlt1" data-i18n-attr="alt"'
  );
  h = h.replace(
    /alt="Hands shaping Thai dumplings"/,
    'alt="Hands shaping Thai dumplings" data-i18n="home.storyAlt2" data-i18n-attr="alt"'
  );
  h = h.replace(
    /<span>Handcrafting Thai treats in Vlaardingen<\/span>/,
    '<span data-i18n="home.sinceLabel">Handcrafting Thai treats in Vlaardingen</span>'
  );
  h = h.replace(
    /<p class="eyebrow">Our story<\/p>\s*<h2>From my mom's shop in Nong Khai to your table<\/h2>\s*<p class="lead">Hi, I'm Nina[\s\S]*?<\/p>\s*<p class="quote">“Each order means the world to me\.”<\/p>\s*<a href="about.html">Read our story →<\/a>/,
    '<p class="eyebrow" data-i18n="home.storyEyebrow">Our story</p>\n          <h2 data-i18n="home.storyTitle">From Nong Khai to Vlaardingen</h2>\n          <p class="lead" data-i18n="home.storyBody">I\'m Nina. Thai Sweets started from love for my mom and grandmas\' desserts — now I bake them here, by hand, for you.</p>\n          <p class="quote" data-i18n="home.storyQuote">“Each order means the world to me.”</p>\n          <a href="about.html" data-i18n="home.storyCta">Read our story</a>'
  );
  h = h.replace(
    /<p class="eyebrow">Kind words<\/p>\s*<h2>From our customers<\/h2>/,
    '<p class="eyebrow" data-i18n="home.starsEyebrowAlt">Kind words</p>\n          <h2 data-i18n="home.starsTitleAlt">From our customers</h2>'
  );
  h = h.replace(/aria-label="5 out of 5 stars"/g, 'aria-label="5 out of 5 stars" data-i18n="home.starsAria" data-i18n-attr="aria-label"');
  h = h.replace(
    /<p>“The Thong Muan \(crispy rolled wafers\) were delicious! Everything was so fresh and tasted amazing\.”<\/p>/,
    '<p data-i18n="home.review1">“The Thong Muan (crispy rolled wafers) were delicious! Everything was so fresh and tasted amazing.”</p>'
  );
  h = h.replace(
    /<p>“The meatballs with dipping sauce were absolutely delicious!”<\/p>/,
    '<p data-i18n="home.review2">“The meatballs with dipping sauce were absolutely delicious!”</p>'
  );
  h = h.replace(
    /<p>“The sweets were so delicious, thank you so much! They really made me feel less homesick\.”<\/p>/,
    '<p data-i18n="home.review3">“The sweets were so delicious, thank you so much! They really made me feel less homesick.”</p>'
  );
  h = h.replace(
    /<p class="eyebrow">How to order<\/p>\s*<h2>Four simple steps<\/h2>\s*<\/div>\s*<p class="section-head__side">Everything is made fresh to order, so please allow at least <strong>1 week<\/strong> before your pickup or delivery date\.<\/p>/,
    '<p class="eyebrow" data-i18n="home.howHomeEyebrow">How to order</p>\n            <h2 data-i18n="home.howHomeTitle">Four simple steps</h2>\n          </div>\n          <p class="section-head__side" data-i18n="home.howHomeSide" data-i18n-attr="html">Everything is made fresh to order, so please allow at least <strong>1 week</strong> before your pickup or delivery date.</p>'
  );
  h = h.replace(
    /<h3>Browse the menu<\/h3>\s*<p class="muted">Find the Thai desserts, snacks and cakes you'd like\.<\/p>/,
    '<h3 data-i18n="home.howHome1Title">Browse the menu</h3>\n            <p class="muted" data-i18n="home.howHome1Body">Find the Thai desserts, snacks and cakes you\'d like.</p>'
  );
  h = h.replace(
    /<h3>Place your order<\/h3>\s*<p class="muted">Order online at least 1 week before your date\.<\/p>/,
    '<h3 data-i18n="home.howHome2Title">Place your order</h3>\n            <p class="muted" data-i18n="home.howHome2Body">Order online at least 1 week before your date.</p>'
  );
  h = h.replace(
    /<h3>Confirmation<\/h3>\s*<p class="muted">I confirm availability, final price and pickup or delivery by email or WhatsApp\.<\/p>/,
    '<h3 data-i18n="home.howHome3Title">Confirmation</h3>\n            <p class="muted" data-i18n="home.howHome3Body">I confirm availability, final price and pickup or delivery by email or WhatsApp.</p>'
  );
  h = h.replace(
    /<h3>Enjoy your treats<\/h3>\s*<p class="muted">Pick up in Vlaardingen for free, or have it delivered\.<\/p>/,
    '<h3 data-i18n="home.howHome4Title">Enjoy your treats</h3>\n            <p class="muted" data-i18n="home.howHome4Body">Pick up in Vlaardingen for free, or have it delivered.</p>'
  );
  h = h.replace(
    /<a class="btn btn--secondary" href="how-to-order.html" data-reveal>Delivery &amp; pickup details/,
    '<a class="btn btn--secondary" href="how-to-order.html" data-reveal><span data-i18n="home.howCta">Delivery &amp; pickup details</span>'
  );
  return h;
}

function patchCookies(html) {
  let h = html;
  h = h.replace(
    /<p id="cookie-consent-description">\s*This website only uses essential cookies\. If we add analytics later, we'll ask for your consent first\.\s*Read more in our (<a[^>]*>)[\s\S]*?<\/a>\.\s*<\/p>/,
    '<p id="cookie-consent-description"><span data-i18n="cookies.bodyBanner">This website only uses essential cookies. If we add analytics later, we\'ll ask for your consent first. Read more in our </span>$1<span data-i18n="footer.privacy">Privacy Policy</span></a>.</p>'
  );
  // simpler fallback if structure differs
  if (!h.includes('data-i18n="cookies.bodyBanner"')) {
    h = h.replace(
      /This website only uses essential cookies\. If we add analytics later, we'll ask for your consent first\.\s*Read more in our /,
      '<span data-i18n="cookies.bodyBanner">This website only uses essential cookies. If we add analytics later, we\'ll ask for your consent first. Read more in our </span>'
    );
  }
  h = h.replace(
    /aria-label="Close preferences"/g,
    'aria-label="Close preferences" data-i18n="cookies.close" data-i18n-attr="aria-label"'
  );
  h = h.replace(
    /<p>We use cookies to improve your experience on our website\. You can set your preferences for each type of cookie below\.<\/p>/g,
    '<p data-i18n="cookies.prefsIntro">We use cookies to improve your experience on our website. You can set your preferences for each type of cookie below.</p>'
  );
  h = h.replace(/<h3>Essential cookies<\/h3>/g, '<h3 data-i18n="cookies.essentialTitle">Essential cookies</h3>');
  h = h.replace(
    /<p>These cookies are needed for the website to work and cannot be switched off\.<\/p>/g,
    '<p data-i18n="cookies.essentialBody">These cookies are needed for the website to work and cannot be switched off.</p>'
  );
  h = h.replace(/<span class="pref-always">Always on<\/span>/g, '<span class="pref-always" data-i18n="cookies.alwaysOn">Always on</span>');
  h = h.replace(/<h3>Analytics cookies<\/h3>/g, '<h3 data-i18n="cookies.analyticsTitle">Analytics cookies</h3>');
  h = h.replace(
    /<p>These cookies help us understand how visitors use our website by collecting and reporting information anonymously\.<\/p>/g,
    '<p data-i18n="cookies.analyticsBody">These cookies help us understand how visitors use our website by collecting and reporting information anonymously.</p>'
  );
  h = h.replace(
    /<span class="visually-hidden">Analytics cookies<\/span>/g,
    '<span class="visually-hidden" data-i18n="cookies.analyticsTitle">Analytics cookies</span>'
  );
  h = h.replace(/<h3>Advertising cookies<\/h3>/g, '<h3 data-i18n="cookies.adsTitle">Advertising cookies</h3>');
  h = h.replace(
    /<p>These cookies are used to show ads that are relevant to you and your interests\.<\/p>/g,
    '<p data-i18n="cookies.adsBody">These cookies are used to show ads that are relevant to you and your interests.</p>'
  );
  h = h.replace(
    /<span class="visually-hidden">Advertising cookies<\/span>/g,
    '<span class="visually-hidden" data-i18n="cookies.adsTitle">Advertising cookies</span>'
  );
  h = h.replace(/<h3>Functional cookies<\/h3>/g, '<h3 data-i18n="cookies.functionalTitle">Functional cookies</h3>');
  h = h.replace(
    /<p>These cookies enable extra features, such as videos and live chat\.<\/p>/g,
    '<p data-i18n="cookies.functionalBody">These cookies enable extra features, such as videos and live chat.</p>'
  );
  h = h.replace(
    /<span class="visually-hidden">Functional cookies<\/span>/g,
    '<span class="visually-hidden" data-i18n="cookies.functionalTitle">Functional cookies</span>'
  );
  h = h.replace(/<h3>Personalisation cookies<\/h3>/g, '<h3 data-i18n="cookies.personalTitle">Personalisation cookies</h3>');
  h = h.replace(
    /<p>These cookies are used to personalise content and ads based on your preferences and behaviour\.<\/p>/g,
    '<p data-i18n="cookies.personalBody">These cookies are used to personalise content and ads based on your preferences and behaviour.</p>'
  );
  h = h.replace(
    /<span class="visually-hidden">Personalisation cookies<\/span>/g,
    '<span class="visually-hidden" data-i18n="cookies.personalTitle">Personalisation cookies</span>'
  );
  h = h.replace(
    /onclick="CookieConsent\.accept\(\)">Accept all<\/button>/g,
    'onclick="CookieConsent.accept()" data-i18n="cookies.acceptAll">Accept all</button>'
  );
  h = h.replace(
    /You can find more information in our /g,
    '<span data-i18n="cookies.moreInfoPrefix">You can find more information in our </span>'
  );
  return h;
}

function patchAbout(html) {
  let h = html;
  h = h.replace(/<h2>Hi, I'm Nina<\/h2>/, '<h2 data-i18n="about.hiTitle">Hi, I\'m Nina</h2>');
  h = h.replace(
    /<p class="lead">Thai Sweets is my passion and my connection to home\.[\s\S]*?<\/p>/,
    '<p class="lead" data-i18n="about.hiBody">Thai Sweets is my passion and my connection to home. I grew up in Nong Khai, Thailand, learning to cook in my mom\'s food shop alongside my grandmas. After training at Suan Dusit International Culinary School, I moved to Vlaardingen and started handcrafting authentic Thai desserts, snacks and cakes from my home kitchen.</p>'
  );
  h = h.replace(
    /<p class="muted">Making these Thai treats isn't just my business:[\s\S]*?<\/p>/,
    '<p class="muted" data-i18n="about.hiBody2">Making these Thai treats isn\'t just my business: it\'s my way of staying connected to home and sharing that connection with you. Whether it\'s a sweet dessert, a savoury snack or a special cake, each order means the world to me. Thank you for supporting my small business and letting me bring a little taste of Thailand into your life.</p>'
  );
  h = h.replace(
    /<li><strong>Nong Khai<\/strong> Helping in my mom's food shop, learning recipes from my mom and grandmas\.<\/li>/,
    '<li><strong data-i18n="about.tl1Strong">Nong Khai</strong> <span data-i18n="about.tl1Body">Helping in my mom\'s food shop, learning recipes from my mom and grandmas.</span></li>'
  );
  h = h.replace(
    /<li><strong>Bangkok<\/strong> Trained at Suan Dusit International Culinary School\.<\/li>/,
    '<li><strong data-i18n="about.tl2Strong">Bangkok</strong> <span data-i18n="about.tl2Body">Trained at Suan Dusit International Culinary School.</span></li>'
  );
  h = h.replace(
    /<li><strong>2019<\/strong> Started Thai Sweets in my home kitchen in Vlaardingen\.<\/li>/,
    '<li><strong data-i18n="about.tl3Strong">2019</strong> <span data-i18n="about.tl3Body">Started Thai Sweets in my home kitchen in Vlaardingen.</span></li>'
  );
  h = h.replace(
    /<p class="eyebrow">Our promise &amp; connection<\/p>/,
    '<p class="eyebrow" data-i18n="about.promiseEyebrow">Our promise &amp; connection</p>'
  );
  h = h.replace(
    /<h2>As close to Thailand as possible<\/h2>/,
    '<h2 data-i18n="about.promiseTitle">As close to Thailand as possible</h2>'
  );
  h = h.replace(
    /<p class="lead">Every order is made with care\.[\s\S]*?<\/p>/,
    '<p class="lead" data-i18n="about.promiseLead">Every order is made with care. We use only fresh, high-quality ingredients, preparing everything by hand in small batches, for the true, authentic taste of Thai sweets in every bite.</p>'
  );
  h = h.replace(
    /<span>Everything handmade by me in small batches from my home kitchen<\/span>/,
    '<span data-i18n="about.promise1">Everything handmade by me in small batches from my home kitchen</span>'
  );
  h = h.replace(
    /<span>Authentic flavours from my home kitchen to yours<\/span>/,
    '<span data-i18n="about.promise2">Authentic flavours from my home kitchen to yours</span>'
  );
  h = h.replace(
    /<span>Freshness and quality in every ingredient<\/span>/,
    '<span data-i18n="about.promise3">Freshness and quality in every ingredient</span>'
  );
  h = h.replace(
    /alt="Nina's mother cooking in Thailand"/,
    'alt="Nina\'s mother cooking in Thailand" data-i18n="about.altMom" data-i18n-attr="alt"'
  );
  h = h.replace(
    /alt="Hands preparing Thai dumplings"/,
    'alt="Hands preparing Thai dumplings" data-i18n="about.altHands" data-i18n-attr="alt"'
  );
  h = h.replace(
    /<a class="btn btn--primary" href="menu.html">Explore the menu/,
    '<a class="btn btn--primary" href="menu.html"><span data-i18n="about.exploreMenu">Explore the menu</span>'
  );
  return h;
}

function patchMenu(html, alsoKeys) {
  let h = html;
  h = h.replace(
    /<h1>Authentic Thai treats, handmade fresh to order<\/h1>/,
    '<h1 data-i18n="menu.title">All made fresh to order</h1>'
  );
  h = h.replace(
    /<p class="lead">From traditional desserts to custom cakes, every item is crafted with care using quality ingredients\. All items need at least 1 week's notice\. Allergens are listed with each product on the order page\.<\/p>/,
    '<p class="lead" data-i18n="menu.lead">Traditional Thai desserts, savory snacks and cakes from Thai Sweets — made in small batches.</p>'
  );
  h = h.replace(
    /<a href="#desserts">Traditional Thai Desserts<\/a>/,
    '<a href="#desserts" data-i18n="menu.chipDesserts">Desserts</a>'
  );
  h = h.replace(/<a href="#savory">Savory Snacks<\/a>/, '<a href="#savory" data-i18n="menu.chipSavory">Snacks</a>');
  h = h.replace(
    /<a href="#cakes">Cakes &amp; Cupcakes<\/a>/,
    '<a href="#cakes" data-i18n="menu.chipCakes">Cakes</a>'
  );
  h = h.replace(
    /<p class="also-title">Also on the menu<\/p>/g,
    '<p class="also-title" data-i18n="menu.alsoTitle">Also on the menu</p>'
  );
  alsoKeys.forEach((item) => {
    const nameEsc = item.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const descEsc = item.desc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    h = h.replace(
      new RegExp("<strong>" + nameEsc + "</strong>"),
      '<strong data-i18n="menu.' + item.id + 'Name">' + item.name + "</strong>"
    );
    h = h.replace(
      new RegExp('<p class="desc">' + descEsc + "</p>"),
      '<p class="desc" data-i18n="menu.' + item.id + 'Desc">' + item.desc + "</p>"
    );
  });
  return h;
}

function syncTxtFiles(packs) {
  const order = flat(packs.en, "", []).map((x) => x[0]);
  const lines = (lang) => order.map((k) => {
    const parts = k.split(".");
    let cur = packs[lang];
    for (const p of parts) cur = cur[p];
    return String(cur).replace(/\r\n|\r|\n/g, "[BR]");
  });
  write("translations/keys.txt", order.join("\n") + "\n");
  write("translations/en.txt", lines("en").join("\n") + "\n");
  write("translations/nl.txt", lines("nl").join("\n") + "\n");
  write("translations/th.txt", lines("th").join("\n") + "\n");
  console.log("Synced translation txt files:", order.length, "keys");
}

function main() {
  const also = extractAlsoItems();
  console.log("also items", also.length);
  const alsoMeta = also.map((it, i) => ({ ...it, id: slugify(it.name, i) }));

  // Extend NEW with also-on-menu
  NEW.en["menu.alsoTitle"] = "Also on the menu";
  NEW.nl["menu.alsoTitle"] = "Ook op het menu";
  NEW.th["menu.alsoTitle"] = "มีบนเมนูด้วย";
  alsoMeta.forEach((it) => {
    NEW.en["menu." + it.id + "Name"] = it.name;
    NEW.en["menu." + it.id + "Desc"] = it.desc;
    NEW.nl["menu." + it.id + "Name"] = it.name; // keep EN names as dessert display; NL can stay English/romanized product titles
    NEW.nl["menu." + it.id + "Desc"] = it.desc; // temporary; Thai is critical for Nina
    NEW.th["menu." + it.id + "Name"] = ALSO_TH_NAME[it.name] || it.name;
    NEW.th["menu." + it.id + "Desc"] = ALSO_TH_DESC[it.name] || it.desc;
  });

  // NL translations for also names/descs — quick Dutch where natural; keep Thai dessert romanization names
  alsoMeta.forEach((it) => {
    // Prefer keeping traditional names; translate descriptive EN names lightly for NL
    if (ALSO_TH_NAME[it.name] && /Khanom|Tong|Ta-Koh|Sampan|Ba-Bin|Khao|A-Lua|Foi/.test(it.thai)) {
      NEW.nl["menu." + it.id + "Name"] = it.thai || it.name;
    }
  });

  const packs = { en: loadPack("en"), nl: loadPack("nl"), th: loadPack("th") };
  ["en", "nl", "th"].forEach((lang) => {
    Object.keys(NEW[lang]).forEach((k) => setPath(packs[lang], k, NEW[lang][k]));
  });

  writePack(
    "en",
    packs.en,
    "/* English copy for Thai Sweets marketing site — edit freely. */"
  );
  writePack(
    "nl",
    packs.nl,
    "/* Nederlands — Thai Sweets marketing site.\n * Includes wired home/about/menu/cookie strings.\n */"
  );
  writePack(
    "th",
    packs.th,
    "/* ไทย — Thai Sweets marketing site.\n * Includes wired home/about/menu/cookie strings. Keep dessert romanizations where noted.\n */"
  );

  write("index.html", patchCookies(patchIndex(read("index.html"))));
  write("about.html", patchCookies(patchAbout(read("about.html"))));
  write("menu.html", patchCookies(patchMenu(read("menu.html"), alsoMeta)));
  ["how-to-order.html", "contact.html", "404.html"].forEach((f) => {
    write(f, patchCookies(read(f)));
  });

  syncTxtFiles(packs);
  console.log("Done wiring Thai gaps.");
}

main();
