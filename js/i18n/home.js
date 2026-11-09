/* Home page (short design) texts, NL + EN. Loaded after nl.js / en.js: it adds `home2` and
 * overrides a few older keys (meta, rounds labels).
 *
 * NEWS BAR: `news` is the fallback text (no rounds / API error). With data, js/open-menus.js builds the
 * text from `newsOpen` / `newsUpcoming`.
 */
(function () {
  var D = (window.ThaiSweetsI18nData = window.ThaiSweetsI18nData || {});

  function merge(lang, extra) {
    var pack = (D[lang] = D[lang] || {});
    Object.keys(extra).forEach(function (group) {
      pack[group] = Object.assign(pack[group] || {}, extra[group]);
    });
  }

  merge("nl", {
    meta: {
      homeTitle: "Thai Sweets | Thaise desserts vers op bestelling in Vlaardingen",
      homeDesc:
        "Echte Thaise desserts, snacks en taarten, vers gemaakt in kleine rondes in Vlaardingen. Kies je lekkernijen, kies een tijd en betaal online."
    },
    a11y: { langNl: "NL, Nederlands", langEn: "EN, English" },
    rounds: {
      openNow: "Nu open",
      orderByLabel: "Bestel vóór",
      viewMenuOrder: "Bekijk menu & bestel"
    },
    home2: {
      // Fallback; the bar shows the live round when /api/open-menus has one (see js/open-menus.js).
      news: "Vers gemaakt op bestelling · Vlaardingen",
      newsOpen: "Nu open: {title} · bestel vóór {orderBy}",
      newsUpcoming: "{title} · bestellen vanaf {opensAt}",
      newsLabel: "Nieuws",
      order: "Bestellen",
      heroTitle: 'Thaise desserts, vers gemaakt <span class="accent">op bestelling</span>',
      heroText:
        "Echte Thaise recepten, vers gemaakt in kleine rondes. Kies je lekkernijen, kies een tijd, betaal online – klaar.",
      heroCta: "Bestel nu →",
      heroAlt: "Gouden geluksset met vijf Thaise desserts",
      openTitle: "Nu te bestellen",
      notifyLabel: "Mail me als het opent",
      notifyButton: "Aanmelden",
      waysTitle: "Zo bestel je bij ons",
      way1Title: "Feest of evenement",
      way1Text: "Kies zelf een datum, minstens 7 dagen vooruit. Vanaf €200.",
      way1Cta: "Bestel op maat →",
      way2Title: "Taarten & cupcakes",
      way2Text: "Voor een verjaardag of feest, op bestelling gemaakt.",
      way2Cta: "Bestel een taart →",
      way3Title: "Zakelijk",
      way3Text: "Voor horeca, toko’s en catering, in grotere aantallen.",
      way3Cta: "Neem contact op →",
      way3Mail: "mailto:info@thaisweets.nl?subject=Zakelijk",
      galleryTitle: "Wat we maken",
      galleryText: "Sommige lekkernijen maken we alleen op maat.",
      gal1: "Laagjescake met vlinderbloem",
      gal2: "Kleefrijst met mango",
      gal3: "Cake met jonge kokos",
      gal4: "Currypasteitjes met kip",
      gal5: "Rozencupcakes",
      gal6: "Tong Muan-rolletjes",
      gal7: "Gouden geluksset",
      gal8: "Luk Chup (vruchtjes van mungboon)",
      gal9: "Khanom Pia (gebakjes)",
      gal10: "Foi Tong",
      gal11: "Tong Yib",
      gal12: "Pandan-laagjescake",
      gal13: "Khanom Krok (kokospannenkoekjes)",
      gal14: "Khanom Tuay (kokosmelkkopjes)",
      gal15: "Khanom Bueng (mini Thaise crêpes)",
      gal16: "Taropudding met kokosroom",
      gal17: "Alua (bloemvormige zoetigheid)",
      gal18: "Cupcakeboeket",
      gal19: "Mini donutcakejes",
      gal20: "Worst met glasnoedels",
      gal21: "Gestoomde bloem- en vogeldumplings",
      galPrev: "Vorige foto's",
      galNext: "Volgende foto's",
      aboutTitle: "Over ons",
      aboutText:
        "Sinds 2019 maken we in Vlaardingen Thaise desserts, snacks en taarten. Alles vers en alleen op bestelling, met de echte smaak van Thailand.",
      aboutAlt: "Knapperige Tong Muan-rolletjes",
      reviewsLabel: "Reviews van klanten",
      reviewPrev: "Vorige review",
      reviewNext: "Volgende review",
      reviewStars: "5 van de 5 sterren",
      reviewOf: " van ",
      pause: "Pauzeer",
      play: "Afspelen",
      review1: "De Thong Muan waren heerlijk! Alles was zo vers en smaakte geweldig.",
      review2: "De balletjes met dipsaus waren absoluut heerlijk!",
      review3:
        "De lekkernijen waren zo lekker, heel erg bedankt! Ik had er echt wat minder heimwee door.",
      footTitle: "Zin in iets lekkers?",
      footText: "Thaise desserts, snacks en taarten, met liefde gemaakt in Vlaardingen.",
      footCta: "Online bestellen →",
      contact: "Contact",
      pickup: "Afhalen: Gretha Hofstralaan, Vlaardingen",
      follow: "Volg ons",
      info: "Info",
      terms: "Algemene voorwaarden",
      privacy: "Privacybeleid",
      allergens: "Allergenen",
      cookies: "Cookie-instellingen",
      copy: "© 2026 Thai Sweets · KVK 73838306 · btw NL002463537B15",
      homeLabel: "Thai Sweets, naar boven",
      roundsLoading: "Rondes laden…"
    }
  });

  merge("en", {
    meta: {
      homeTitle: "Thai Sweets | Thai desserts made fresh to order in Vlaardingen",
      homeDesc:
        "Real Thai desserts, snacks and cakes, made fresh in small rounds in Vlaardingen. Pick your treats, choose a time and pay online."
    },
    a11y: { langNl: "NL, Nederlands", langEn: "EN, English" },
    rounds: {
      openNow: "Open now",
      orderByLabel: "Order by",
      viewMenuOrder: "See menu & order"
    },
    home2: {
      news: "Freshly made to order · Vlaardingen",
      newsOpen: "Open now: {title} · order by {orderBy}",
      newsUpcoming: "{title} · orders open {opensAt}",
      newsLabel: "News",
      order: "Order",
      heroTitle: 'Thai desserts, freshly made <span class="accent">to order</span>',
      heroText:
        "Real Thai recipes, made fresh in small rounds. Pick your treats, choose a time, pay online – done.",
      heroCta: "Order now →",
      heroAlt: "Golden lucky set with five Thai desserts",
      openTitle: "Order now",
      notifyLabel: "Email me when it opens",
      notifyButton: "Sign up",
      waysTitle: "How to order",
      way1Title: "Party or event",
      way1Text: "Pick your own date, at least 7 days ahead. From €200.",
      way1Cta: "Custom order →",
      way2Title: "Cakes & cupcakes",
      way2Text: "For a birthday or party, made to order.",
      way2Cta: "Order a cake →",
      way3Title: "Business",
      way3Text: "For restaurants, Asian shops and catering, in larger quantities.",
      way3Cta: "Get in touch →",
      way3Mail: "mailto:info@thaisweets.nl?subject=Business",
      galleryTitle: "What we make",
      galleryText: "Some treats are made for custom orders only.",
      gal1: "Butterfly pea layer cake",
      gal2: "Mango sticky rice",
      gal3: "Young coconut cake",
      gal4: "Chicken curry puffs",
      gal5: "Rose cupcakes",
      gal6: "Tong Muan rolls",
      gal7: "Golden lucky set",
      gal8: "Luk Chup (fruit-shaped mung bean sweets)",
      gal9: "Khanom Pia (pastries)",
      gal10: "Foi Tong",
      gal11: "Tong Yib",
      gal12: "Pandan layer cake",
      gal13: "Khanom Krok (coconut pancakes)",
      gal14: "Khanom Tuay (coconut milk cups)",
      gal15: "Khanom Bueng (mini Thai crêpes)",
      gal16: "Taro pudding with coconut cream",
      gal17: "Alua (flower-shaped sweets)",
      gal18: "Cupcake bouquet",
      gal19: "Mini donut cakes",
      gal20: "Glass noodle sausage",
      gal21: "Steamed flower & bird dumplings",
      galPrev: "Previous photos",
      galNext: "Next photos",
      aboutTitle: "About us",
      aboutText:
        "Since 2019 we have been making Thai desserts, snacks and cakes in Vlaardingen. Everything fresh and only to order, with the real taste of Thailand.",
      aboutAlt: "Crispy Tong Muan rolls",
      reviewsLabel: "Customer reviews",
      reviewPrev: "Previous review",
      reviewNext: "Next review",
      reviewStars: "5 out of 5 stars",
      reviewOf: " of ",
      pause: "Pause",
      play: "Play",
      review1: "The Thong Muan were delicious! Everything was so fresh and tasted great.",
      review2: "The balls with dipping sauce were absolutely delicious!",
      review3:
        "The treats were so tasty, thank you so much! They really made me feel a bit less homesick.",
      footTitle: "Craving something sweet?",
      footText: "Thai desserts, snacks and cakes, made with love in Vlaardingen.",
      footCta: "Order online →",
      contact: "Contact",
      pickup: "Pickup: Gretha Hofstralaan, Vlaardingen",
      follow: "Follow us",
      info: "Info",
      terms: "Terms and conditions",
      privacy: "Privacy policy",
      allergens: "Allergens",
      cookies: "Cookie settings",
      copy: "© 2026 Thai Sweets · KVK 73838306 · VAT NL002463537B15",
      homeLabel: "Thai Sweets, back to top",
      roundsLoading: "Loading rounds…"
    }
  });
})();
