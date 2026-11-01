/**
 * Wire data-i18n / notify / lang / order links on all marketing HTML pages (UTF-8).
 */
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");

function read(f) {
  let c = fs.readFileSync(path.join(root, f), "utf8");
  if (c.charCodeAt(0) === 0xfeff) c = c.slice(1);
  return c;
}
function write(f, c) {
  fs.writeFileSync(path.join(root, f), c.replace(/\r\n/g, "\n"), "utf8");
  console.log("ok", f);
}

const LANG = `<div class="lang-switch" role="group" aria-label="Language" data-i18n="a11y.language" data-i18n-attr="aria-label">
          <button type="button" data-lang="nl" aria-label="Nederlands" aria-pressed="true" aria-current="true">NL</button>
          <button type="button" data-lang="en" aria-label="English" aria-pressed="false">EN</button>
          <button type="button" data-lang="th" aria-label="ไทย" aria-pressed="false">TH</button>
        </div>`;

const BOOT = `<script>
    (function () {
      document.documentElement.classList.add('js');
      try {
        var L = localStorage.getItem('thaisweets_lang');
        document.documentElement.lang = (L === 'nl' || L === 'en' || L === 'th') ? L : 'nl';
      } catch (e0) { document.documentElement.lang = 'nl'; }
      try {
        var t = localStorage.getItem('thaisweets_theme');
        if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
      } catch (e) {}
    })();
  </script>`;

const SCRIPTS_BASE = `  <script src="js/i18n/nl.js" defer></script>
  <script src="js/i18n/en.js" defer></script>
  <script src="js/i18n/th.js" defer></script>
  <script src="js/i18n.js" defer></script>
  <script src="js/main.js" defer></script>
  <script src="js/cookie-consent.js" defer></script>`;

const SCRIPTS_HOME = `  <script src="js/i18n/nl.js" defer></script>
  <script src="js/i18n/en.js" defer></script>
  <script src="js/i18n/th.js" defer></script>
  <script src="js/i18n.js" defer></script>
  <script src="js/main.js" defer></script>
  <script src="js/open-menus.js" defer></script>
  <script src="js/notify.js" defer></script>
  <script src="js/cookie-consent.js" defer></script>`;

function patchCommon(html, page) {
  html = html.replace(/<html lang="[^"]*">/, '<html lang="nl">');
  html = html.replace(/<body([^>]*)>/, function (_, attrs) {
    attrs = attrs.replace(/\s*data-page="[^"]*"/g, "");
    return "<body" + attrs + ' data-page="' + page + '">';
  });

  // Replace head theme bootstrap with lang+theme bootstrap
  html = html.replace(
    /<script>\s*\(function \(\) \{[\s\S]*?\}\)\(\);\s*<\/script>\s*<\/head>/,
    BOOT + "\n</head>"
  );

  html = html.replace(
    /<div class="lang-switch" role="group" aria-label="Language">\s*<button type="button">NL<\/button>\s*<button type="button" aria-current="true">EN<\/button>\s*<button type="button">TH<\/button>\s*<\/div>/g,
    LANG
  );

  html = html.replace(
    /href="https:\/\/order\.thaisweets\.nl"/g,
    'href="https://order.thaisweets.nl/nl/" data-order-path="/"'
  );
  html = html.replace(
    /href="https:\/\/order\.thaisweets\.nl\/(?:en|nl|th)\/legal#terms"/g,
    'href="https://order.thaisweets.nl/nl/legal#terms" data-legal="terms"'
  );
  html = html.replace(
    /href="https:\/\/order\.thaisweets\.nl\/(?:en|nl|th)\/legal#privacy"/g,
    'href="https://order.thaisweets.nl/nl/legal#privacy" data-legal="privacy"'
  );
  html = html.replace(
    /href="https:\/\/order\.thaisweets\.nl\/(?:en|nl|th)\/legal#allergens"/g,
    'href="https://order.thaisweets.nl/nl/legal#allergens" data-legal="allergens"'
  );

  html = html.replace(
    /<a class="skip-link" href="#main">[^<]*<\/a>/,
    '<a class="skip-link" href="#main" data-i18n="a11y.skip">Skip to content</a>'
  );
  html = html.replace(
    /aria-label="Thai Sweets home"/g,
    'aria-label="Thai Sweets home" data-i18n="a11y.home" data-i18n-attr="aria-label"'
  );
  html = html.replace(
    /aria-label="Main"/g,
    'aria-label="Main" data-i18n="a11y.mainNav" data-i18n-attr="aria-label"'
  );
  html = html.replace(
    /aria-label="Mobile"/g,
    'aria-label="Mobile" data-i18n="a11y.mobileNav" data-i18n-attr="aria-label"'
  );
  html = html.replace(
    /aria-label="Open menu"/g,
    'aria-label="Open menu" data-i18n="a11y.openMenu" data-i18n-attr="aria-label"'
  );
  html = html.replace(
    /aria-label="Switch to dark theme"/g,
    'aria-label="Switch to dark theme" data-i18n="a11y.themeToDark" data-i18n-attr="aria-label"'
  );
  html = html.replace(
    /aria-label="Legal"/g,
    'aria-label="Legal" data-i18n="a11y.legal" data-i18n-attr="aria-label"'
  );

  html = html.replace(
    /(<a href="menu\.html"(?: aria-current="page")?)(?: data-i18n="nav\.menu")?>Menu<\/a>/g,
    '$1 data-i18n="nav.menu">Menu</a>'
  );
  html = html.replace(
    /(<a href="about\.html"(?: aria-current="page")?)(?: data-i18n="nav\.story")?>Our Story<\/a>/g,
    '$1 data-i18n="nav.story">Our Story</a>'
  );
  html = html.replace(
    /(<a href="how-to-order\.html"(?: aria-current="page")?)(?: data-i18n="nav\.how")?>How to Order<\/a>/g,
    '$1 data-i18n="nav.how">How to Order</a>'
  );
  html = html.replace(
    /(<a href="contact\.html"(?: aria-current="page")?)(?: data-i18n="nav\.contact")?>Contact<\/a>/g,
    '$1 data-i18n="nav.contact">Contact</a>'
  );

  // Order CTAs: wrap label
  html = html.replace(
    /(data-order-path="\/"[^>]*>)\s*Order online(\s*)(<svg)/g,
    '$1<span data-i18n="nav.order">Order online</span>$2$3'
  );
  html = html.replace(
    /(data-order-path="\/"[^>]*>)\s*Order online\s*<\/a>/g,
    '$1<span data-i18n="nav.order">Order online</span></a>'
  );

  html = html.replace(
    /Fresh homemade Thai cuisine made with love\. Vlaardingen, since 2019\./g,
    '<span data-i18n="footer.blurb">Fresh homemade Thai cuisine made with love. Vlaardingen, since 2019.</span>'
  );
  html = html.replace(/<h3>Shop<\/h3>/g, '<h3 data-i18n="footer.shop">Shop</h3>');
  html = html.replace(/<h3>Follow<\/h3>/g, '<h3 data-i18n="footer.follow">Follow</h3>');
  html = html.replace(
    /(<h3)>Contact<\/h3>(\s*<ul>\s*<li><a href="mailto:)/g,
    '$1 data-i18n="footer.contact">Contact</h3>$2'
  );
  html = html.replace(
    /(<a href="how-to-order\.html")>How to order<\/a>/g,
    '$1 data-i18n="footer.how">How to order</a>'
  );
  html = html.replace(
    /(<li><a href="menu\.html")>Menu<\/a>/g,
    '$1 data-i18n="nav.menu">Menu</a>'
  );
  html = html.replace(
    /(<a[^>]*data-legal="terms"[^>]*)>General Terms<\/a>/g,
    '$1 data-i18n="footer.terms">General Terms</a>'
  );
  html = html.replace(
    /(<a[^>]*data-legal="privacy"[^>]*)>Privacy Policy<\/a>/g,
    '$1 data-i18n="footer.privacy">Privacy Policy</a>'
  );
  html = html.replace(
    /(<a[^>]*data-legal="allergens"[^>]*)>Allergens<\/a>/g,
    '$1 data-i18n="footer.allergens">Allergens</a>'
  );
  html = html.replace(
    /(href="#cookie-settings"[^>]*)>Cookie settings<\/a>/g,
    '$1 data-i18n="footer.cookies">Cookie settings</a>'
  );
  html = html.replace(
    /© 2026 Thai Sweets · KVK 73838306 · VAT NL002463537B15/g,
    '<span data-i18n="footer.copy">© 2026 Thai Sweets · KVK 73838306 · VAT NL002463537B15</span>'
  );
  html = html.replace(
    /<span>Gretha Hofstralaan, Vlaardingen<\/span>/g,
    '<span data-i18n="footer.address">Gretha Hofstralaan, Vlaardingen</span>'
  );

  // Cookies (shared block)
  html = html.replace(
    /id="cookie-consent-title">We use cookies<\/h2>/,
    'id="cookie-consent-title" data-i18n="cookies.title">We use cookies</h2>'
  );
  html = html.replace(
    /id="reject-cookies" class="btn btn--secondary" aria-label="Reject all">Reject all<\/button>/,
    'id="reject-cookies" class="btn btn--secondary" aria-label="Reject all" data-i18n="cookies.reject" data-i18n-attr="text,aria-label">Reject all</button>'
  );
  html = html.replace(
    /id="manage-cookies" class="btn btn--secondary" aria-label="Manage preferences">Manage preferences<\/button>/,
    'id="manage-cookies" class="btn btn--secondary" aria-label="Manage preferences" data-i18n="cookies.manage" data-i18n-attr="text,aria-label">Manage preferences</button>'
  );
  html = html.replace(
    /id="accept-cookies" class="btn btn--primary" aria-label="Accept all">Accept all<\/button>/,
    'id="accept-cookies" class="btn btn--primary" aria-label="Accept all" data-i18n="cookies.accept" data-i18n-attr="text,aria-label">Accept all</button>'
  );
  html = html.replace(
    /id="preferences-modal-title">Cookie preferences<\/h2>/,
    'id="preferences-modal-title" data-i18n="cookies.prefsTitle">Cookie preferences</h2>'
  );
  html = html.replace(
    /id="save-preferences" class="btn btn--primary">Save preferences<\/button>/,
    'id="save-preferences" class="btn btn--primary" data-i18n="cookies.save">Save preferences</button>'
  );

  // Scripts
  html = html.replace(
    /<script src="js\/(?:i18n\/[^"]+\.js|i18n\.js|main\.js|open-menus\.js|notify\.js|cookie-consent\.js)" defer><\/script>\s*/g,
    ""
  );
  return html;
}

function finishScripts(html, home) {
  if (!html.includes("</body>")) throw new Error("no body end");
  return html.replace("</body>", (home ? SCRIPTS_HOME : SCRIPTS_BASE) + "\n</body>");
}

// ---- index ----
let index = read("index.html");
index = patchCommon(index, "home");
index = index.replace(
  /aria-label="Ordering announcement"/,
  'aria-label="Ordering announcement" data-i18n="a11y.announce" data-i18n-attr="aria-label"'
);
// Notify block replace
index = index.replace(
  /<div class="notify" data-reveal>[\s\S]*?<\/form>\s*<\/div>/,
  `<div class="notify" data-reveal>
          <div>
            <h2 data-i18n="notify.title">Never miss a menu round</h2>
            <p data-i18n="notify.body">We email you only when a new menu opens for ordering. Unsubscribe any time.</p>
          </div>
          <form class="notify-form" id="notify-form" novalidate>
            <label class="visually-hidden" for="notify-email" data-i18n="notify.email">Email address</label>
            <input id="notify-email" name="email" type="email" autocomplete="email" inputmode="email" maxlength="200" required data-i18n="notify.placeholder" data-i18n-attr="placeholder" placeholder="you@email.com">
            <button class="btn btn--gold" type="submit" data-i18n="notify.button">Notify me</button>
            <div id="notify-turnstile" class="notify-turnstile"></div>
            <p id="notify-status" class="notify-status" role="status" aria-live="polite" hidden></p>
            <p class="notify-consent muted" data-i18n="notify.consent">We only email you about menus opening. You can unsubscribe in every email.</p>
          </form>
        </div>`
);

index = index.replace(
  /<p class="eyebrow hero-animate">[^<]*<\/p>/,
  '<p class="eyebrow hero-animate" data-i18n="home.eyebrow">Handcrafted in Vlaardingen · Since 2019</p>'
);
index = index.replace(
  /<h1 class="hero-animate">[\s\S]*?<\/h1>/,
  '<h1 class="hero-animate" data-i18n-home-h1>Taste the <span class="accent-italic">tradition.</span></h1>'
);
index = index.replace(
  /<p class="lead hero-animate">[\s\S]*?<\/p>/,
  '<p class="lead hero-animate" data-i18n="home.lead">Experience the art of Thai sweets…</p>'
);
index = index.replace(/>View our menu<\/a>/, ' data-i18n="home.viewMenu">View our menu</a>');
index = index.replace(
  /Recipes from my mom &amp; grandmas/,
  '<span data-i18n="home.check1">Recipes from my mom &amp; grandmas</span>'
);
index = index.replace(
  /Handmade in small batches/,
  '<span data-i18n="home.check2">Handmade in small batches</span>'
);
index = index.replace(
  /Pre-order only, no waste/,
  '<span data-i18n="home.check3">Pre-order only, no waste</span>'
);
index = index.replace(
  /alt="Golden auspicious Thai dessert set"/,
  'alt="Golden auspicious Thai dessert set" data-i18n="home.heroAlt1" data-i18n-attr="alt"'
);
index = index.replace(
  /alt="Butterfly pea layer cake"/,
  'alt="Butterfly pea layer cake" data-i18n="home.heroAlt2" data-i18n-attr="alt"'
);
index = index.replace(
  /alt="Khanom pia pastry buns"/,
  'alt="Khanom pia pastry buns" data-i18n="home.heroAlt3" data-i18n-attr="alt"'
);
index = index.replace(
  /<p class="eyebrow">Open for ordering<\/p>/,
  '<p class="eyebrow" data-i18n="home.roundsEyebrow">Open for ordering</p>'
);
index = index.replace(
  /<h2>Made fresh in small rounds<\/h2>/,
  '<h2 data-i18n="home.roundsTitle">Made fresh in small rounds</h2>'
);
index = index.replace(
  /Working on a pre-order basis means everything is already promised to someone, so nothing goes to waste\./,
  '<span data-i18n="home.roundsSide">Working on a pre-order basis means everything is already promised to someone, so nothing goes to waste.</span>'
);
index = finishScripts(index, true);
write("index.html", index);

const MENU_MAP = [
  ["Sticky Rice with Mango", "mango"],
  ["Butterfly Pea Layer Cake", "butterfly"],
  ["Fruit-Shaped Mung Bean Dessert", "lukchup"],
  ["Golden Auspicious Set", "golden"],
  ["Mini Pastry Bun", "pia"],
  ["Crispy Coconut Rolls", "tongmuan"],
  ["Foi Tong", "foitong"],
  ["Tong Yib", "tongyib"],
  ["Chicken Curry Puffs", "curry"],
  ["Fried Flour Dumplings", "dumplings"],
  ["Steamed Flower & Bird Dumplings", "flowerbird"],
  ["Glass Noodle Sausage", "sausage"],
  ["Young Coconut Cake", "coconutcake"],
  ["Rose Flower Cupcakes", "rose"],
  ["Flower Bouquet Cupcakes", "bouquet"],
  ["Mini Donut Cakes", "minidonut"],
];

function patchMenu(html) {
  html = patchCommon(html, "menu");
  html = html.replace(
    /<p class="eyebrow">Our menu<\/p>/,
    '<p class="eyebrow" data-i18n="menu.eyebrow">Our menu</p>'
  );
  html = html.replace(
    /aria-label="Menu categories"/,
    'aria-label="Menu categories" data-i18n="menu.chipsLabel" data-i18n-attr="aria-label"'
  );
  html = html.replace(
    /<h2>Traditional Thai Desserts<\/h2>/,
    '<h2 data-i18n="menu.dessertsTitle">Traditional Thai Desserts</h2>'
  );
  html = html.replace(
    /Experience the art of Thai sweets with our collection of traditional desserts\./,
    '<span data-i18n="menu.dessertsLead">Experience the art of Thai sweets with our collection of traditional desserts.</span>'
  );
  html = html.replace(
    /<h2>Savory Snacks<\/h2>/,
    '<h2 data-i18n="menu.savoryTitle">Savory Snacks</h2>'
  );
  html = html.replace(
    /<h2>Cakes &amp; Cupcakes<\/h2>/,
    '<h2 data-i18n="menu.cakesTitle">Cakes &amp; Cupcakes</h2>'
  );

  for (const [name, id] of MENU_MAP) {
    const esc = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    html = html.replace(
      new RegExp("<h3>" + esc + "</h3>"),
      '<h3 data-menu-item="' + id + '" data-menu-field="name">' + name + "</h3>"
    );
    // muted description after thai-name for this item — first muted after this h3
  }
  // Mark muted descriptions via thai-name siblings is hard; mark all menu-item muted with ids by walk
  // Simple approach: for each article, we already have h3 with data-menu-item — add field on following muted
  html = html.replace(
    /(<h3 data-menu-item="([^"]+)" data-menu-field="name">[\s\S]*?<p class="muted">)([^<]*)(<\/p>)/g,
    '$1<span data-menu-item="$2" data-menu-field="desc">$3</span>$4'
  );
  html = html.replace(
    /(<img[^>]*alt=")([^"]+)("[^>]*loading="lazy">)/g,
    function (full, a, alt, b) {
      // only menu item images inside menu-item-card
      return full;
    }
  );
  // Alts on menu cards: attach when preceded closely by data-menu-item h3 — skip for now, set via field on img near article
  for (const [name, id] of MENU_MAP) {
    const esc = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    html = html.replace(
      new RegExp('alt="' + esc + '"'),
      'alt="' + name + '" data-menu-item="' + id + '" data-menu-field="alt"'
    );
  }
  return finishScripts(html, false);
}

function patchAbout(html) {
  html = patchCommon(html, "about");
  html = html.replace(
    /<p class="eyebrow">Our mission &amp; history<\/p>/,
    '<p class="eyebrow" data-i18n="about.eyebrow">Our mission &amp; history</p>'
  );
  html = html.replace(
    /<h1>Sharing the flavours of Thailand, one bite at a time<\/h1>/,
    '<h1 data-i18n="about.title">Sharing the flavours of Thailand, one bite at a time</h1>'
  );
  html = html.replace(
    /Handcrafting authentic Thai treats in Vlaardingen since 2019, and bringing joy with every order\./,
    '<span data-i18n="about.lead">Handcrafting authentic Thai treats in Vlaardingen since 2019, and bringing joy with every order.</span>'
  );
  html = html.replace(
    /alt="Nina as a child with her mother in Thailand"/,
    'alt="Nina as a child with her mother in Thailand" data-i18n="about.altHero" data-i18n-attr="alt"'
  );
  return finishScripts(html, false);
}

function patchHow(html) {
  html = patchCommon(html, "how");
  html = html.replace(
    /<p class="eyebrow">How to order<\/p>/,
    '<p class="eyebrow" data-i18n="how.eyebrow">How to order</p>'
  );
  html = html.replace(
    /<h1>Made fresh, just for you<\/h1>/,
    '<h1 data-i18n="how.title">Made fresh, just for you</h1>'
  );
  html = html.replace(
    /Everything is made fresh to order, so I need <strong>at least 1 week's notice<\/strong> before your pickup or delivery date\./,
    '<span data-i18n="how.notice" data-i18n-attr="html">Everything is made fresh to order, so I need <strong>at least 1 week\'s notice</strong> before your pickup or delivery date.</span>'
  );
  html = html.replace(/<h2>Browse our menu<\/h2>/, '<h2 data-i18n="how.step1Title">Browse our menu</h2>');
  html = html.replace(
    /Take a look at our Thai desserts, snacks and cakes to find what you'd like\./,
    '<span data-i18n="how.step1Body">Take a look at our Thai desserts, snacks and cakes to find what you\'d like.</span>'
  );
  html = html.replace(/<h2>Place your order<\/h2>/, '<h2 data-i18n="how.step2Title">Place your order</h2>');
  html = html.replace(
    /Order online with your details and the items you'd like\. Remember: at least 1 week's notice\./,
    '<span data-i18n="how.step2Body">Order online with your details and the items you\'d like. Remember: at least 1 week\'s notice.</span>'
  );
  html = html.replace(/<h2>Confirm your order<\/h2>/, '<h2 data-i18n="how.step3Title">Confirm your order</h2>');
  html = html.replace(
    /I'll contact you by email or WhatsApp to confirm availability, the final price \(including any delivery fee\) and pickup or delivery\./,
    '<span data-i18n="how.step3Body">I\'ll contact you by email or WhatsApp to confirm availability, the final price (including any delivery fee) and pickup or delivery.</span>'
  );
  html = html.replace(
    /Payment details follow after confirmation\./,
    '<span data-i18n="how.step3Hint">Payment details follow after confirmation.</span>'
  );
  html = html.replace(/<h2>Enjoy your treats<\/h2>/, '<h2 data-i18n="how.step4Title">Enjoy your treats</h2>');
  html = html.replace(
    /Pick up your order or have it delivered on your chosen date\. Everything is made fresh just for you\./,
    '<span data-i18n="how.step4Body">Pick up your order or have it delivered on your chosen date. Everything is made fresh just for you.</span>'
  );
  html = html.replace(
    /<h2>Delivery &amp; pickup<\/h2>/,
    '<h2 data-i18n="how.deliveryTitle">Delivery &amp; pickup</h2>'
  );
  html = html.replace(
    /<h3>Delivery areas &amp; minimums<\/h3>/,
    '<h3 data-i18n="how.areasTitle">Delivery areas &amp; minimums</h3>'
  );
  html = html.replace(
    /Vlaardingen &amp; Schiedam: regular delivery, minimum order €50\./,
    '<span data-i18n="how.areas1">Vlaardingen &amp; Schiedam: regular delivery, minimum order €50.</span>'
  );
  html = html.replace(
    /Other nearby areas: delivery may be possible depending on date, time and location\. Please ask\./,
    '<span data-i18n="how.areas2">Other nearby areas: delivery may be possible depending on date, time and location. Please ask.</span>'
  );
  html = html.replace(/<h3>Delivery cost<\/h3>/, '<h3 data-i18n="how.costTitle">Delivery cost</h3>');
  html = html.replace(
    /Delivery fees depend on distance\. I'll confirm the exact cost when you place your order\./,
    '<span data-i18n="how.costBody">Delivery fees depend on distance. I\'ll confirm the exact cost when you place your order.</span>'
  );
  html = html.replace(/<h3>Prefer pickup\?<\/h3>/, '<h3 data-i18n="how.pickupTitle">Prefer pickup?</h3>');
  html = html.replace(
    /Pick up your order in Vlaardingen \(Gretha Hofstralaan\) at no extra cost\./,
    '<span data-i18n="how.pickupBody">Pick up your order in Vlaardingen (Gretha Hofstralaan) at no extra cost.</span>'
  );
  html = html.replace(
    />Start your order(\s*<svg)/,
    ' data-i18n="how.startOrder">Start your order$1'
  );
  // fix start order with span
  html = html.replace(
    /(data-order-path="\/"[^>]*>)\s*Start your order/,
    '$1<span data-i18n="how.startOrder">Start your order</span>'
  );
  html = html.replace(/>View the menu<\/a>/, ' data-i18n="how.viewMenu">View the menu</a>');
  return finishScripts(html, false);
}

function patchContact(html) {
  html = patchCommon(html, "contact");
  html = html.replace(
    /<p class="eyebrow">Get in touch<\/p>/,
    '<p class="eyebrow" data-i18n="contact.eyebrow">Get in touch</p>'
  );
  html = html.replace(
    /<h1>We'd love to hear from you<\/h1>/,
    '<h1 data-i18n="contact.title">We\'d love to hear from you</h1>'
  );
  html = html.replace(
    /Have a question or want to learn more about our Thai sweets\? Email or WhatsApp us and we'll get back to you as soon as possible\./,
    '<span data-i18n="contact.lead">Have a question or want to learn more about our Thai sweets? Email or WhatsApp us and we\'ll get back to you as soon as possible.</span>'
  );
  html = html.replace(
    /<p class="eyebrow" style="margin-top:28px">Follow us<\/p>/,
    '<p class="eyebrow" style="margin-top:28px" data-i18n="contact.follow">Follow us</p>'
  );
  html = html.replace(/<h2>Reach us directly<\/h2>/, '<h2 data-i18n="contact.reachTitle">Reach us directly</h2>');
  html = html.replace(
    /Choose email or WhatsApp — no form needed\./,
    '<span data-i18n="contact.reachBody">Choose email or WhatsApp — no form needed.</span>'
  );
  html = html.replace(
    /aria-label="Email us at info@thaisweets.nl">\s*[\s\S]*?Email us/,
    'aria-label="Email us at info@thaisweets.nl" data-i18n="contact.emailUsAria" data-i18n-attr="aria-label">\n            <svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>\n            <span data-i18n="contact.emailUs">Email us</span>'
  );
  // WhatsApp button text
  html = html.replace(
    /(wa\.me\/31645591043"[^>]*>\s*<svg[\s\S]*?<\/svg>\s*)WhatsApp/,
    '$1<span data-i18n="contact.whatsapp">WhatsApp</span>'
  );
  html = html.replace(
    /Have an allergy\? Our kitchen also works with peanuts, tree nuts, sesame and soy\. Please contact us before ordering\./,
    '<span data-i18n="contact.allergy">Have an allergy? Our kitchen also works with peanuts, tree nuts, sesame and soy. Please contact us before ordering.</span>'
  );
  html = html.replace(
    /Gretha Hofstralaan, Vlaardingen \(pickup\)/,
    '<span data-i18n="contact.pickup">Gretha Hofstralaan, Vlaardingen (pickup)</span>'
  );
  return finishScripts(html, false);
}

function patch404(html) {
  html = patchCommon(html, "notFound");
  html = html.replace(
    /<h1>[^<]*<\/h1>/,
    '<h1 data-i18n="notFound.title">Page not found</h1>'
  );
  // body paragraph — first lead-like p in main
  html = html.replace(
    /(<main[\s\S]*?<p class="lead">)([^<]+)(<\/p>)/,
    '$1<span data-i18n="notFound.body">$2</span>$3'
  );
  html = html.replace(
    /(<a class="btn btn--primary"[^>]*href="index\.html")>([^<]+)<\/a>/,
    '$1 data-i18n="notFound.home">$2</a>'
  );
  html = html.replace(
    /(<a class="btn btn--secondary"[^>]*href="menu\.html")>([^<]+)<\/a>/,
    '$1 data-i18n="notFound.menu">$2</a>'
  );
  return finishScripts(html, false);
}

write("menu.html", patchMenu(read("menu.html")));
write("about.html", patchAbout(read("about.html")));
write("how-to-order.html", patchHow(read("how-to-order.html")));
write("contact.html", patchContact(read("contact.html")));
write("404.html", patch404(read("404.html")));

console.log("done");
