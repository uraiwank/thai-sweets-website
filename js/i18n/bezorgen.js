/* Bezorgen page texts, NL + EN. Loaded after js/i18n/home.js (shared header/footer/consent keys).
 * Amounts, postcodes and the per-km formula come from js/zones.config.js, not from here. */
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
      bezorgenTitle: "Bezorgen en ophalen | Thai Sweets",
      bezorgenDesc:
        "Zo werkt bezorgen bij Thai Sweets: vaste prijs per gebied bij een menu, prijs per kilometer voor bestellingen op maat. Check je postcode of haal gratis op in Vlaardingen."
    },
    bz: {
      title: "Bezorgen en ophalen",
      intro: "We bezorgen vanuit Vlaardingen. Hoe we de bezorgkosten berekenen, hangt af van wat je bestelt.",
      choicesLabel: "Kies hoe je bestelt",
      choiceMenuTitle: "Je bestelt uit een menu",
      choiceMenuText: "Kerst, Thaise desserts en andere rondes. Vaste prijs per gebied.",
      choiceCustomTitle: "Je bestelt op maat",
      choiceCustomText: "Feest, taart, cupcakes of boeket. Prijs per kilometer.",
      menuTitle: "Je bestelt uit een menu",
      checkerLabel: "Je postcode",
      checkerHint: "Vul de 4 cijfers in, bijvoorbeeld 3131.",
      checkerButton: "Check",
      resultOk: "Bezorgen in {zone}: bezorgkosten {fee}, minimaal bestelbedrag {min}, {free}.",
      resultFreeFrom: "gratis bezorgd vanaf {amount}",
      resultNoFree: "geen gratis bezorging",
      resultOutside: "Buiten ons gebied? Dan kun je gratis ophalen in Vlaardingen.",
      resultInvalid: "Vul een postcode van 4 cijfers in.",
      pickupTitle: "Ophalen",
      pickupText: "Gratis en zonder minimum. Gretha Hofstralaan – het precieze adres krijg je na betaling.",
      mapLabel: "Kaart van onze bezorggebieden",
      mapError: "De kaart kon niet worden geladen. Gebruik de tabel hieronder.",
      mapKitchen: "Onze keuken, Vlaardingen",
      legendTitle: "Bezorgkosten per gebied",
      legendKitchen: "Onze keuken (Vlaardingen)",
      tableCaption: "Bezorggebieden met bezorgkosten, minimumbedrag en gratis bezorgen",
      colArea: "Gebied",
      colPostcodes: "Postcodes",
      colFee: "Bezorgkosten",
      colMin: "Minimum",
      colFree: "Gratis vanaf",
      noFree: "Geen",
      tableNote: "Bedragen gelden voor de producten in je bestelling, zonder bezorgkosten.",
      customTitle: "Op maat: prijs per kilometer",
      customIntro:
        "Voor feesten, taarten, cupcakes en boeketten rekenen we de bezorgkosten op rijafstand vanaf onze keuken. We rijden dan speciaal voor jou.",
      formulaStart: "Starttarief",
      formulaPerKm: "Per km (rijafstand)",
      formulaRound: "Afgerond op",
      formulaMax: "Max",
      formulaMaxValue: "{km} km",
      formulaSlot: "Kies een vrije dag en tijd bij het bestellen.",
      exampleLabel: "Voorbeeld",
      example: "{zone} {km} km → {start} + {km} × {rate} = {raw} → {final}",
      soon: "Binnenkort kun je bestellingen op maat hier online plaatsen. Tot die tijd: stuur ons een bericht, dan rekenen we de prijs voor je uit.",
      contactButton: "Stuur ons een bericht",
      info1Title: "Wanneer bezorgen we?",
      info1Text: "Op vaste dagen per ronde. Bij elk menu zie je de bezorgdagen en tijdvakken.",
      info2Title: "Niet thuis?",
      info2Text: "Dan kun je je bestelling daarna bij ons ophalen in Vlaardingen.",
      info3Title: "Verder weg?",
      info3Text: "Sommige producten versturen we gekoeld met PostNL. Dat zie je bij het menu.",
      ctaText: "Bekijk wat er nu te bestellen is.",
      ctaButton: "Naar de menu's"
    }
  });

  merge("en", {
    meta: {
      bezorgenTitle: "Delivery and pickup | Thai Sweets",
      bezorgenDesc:
        "How delivery works at Thai Sweets: a fixed price per area for menus, a price per kilometre for custom orders. Check your postcode or pick up for free in Vlaardingen."
    },
    bz: {
      title: "Delivery and pickup",
      intro: "We deliver from Vlaardingen. How we calculate delivery costs depends on what you order.",
      choicesLabel: "Choose how you order",
      choiceMenuTitle: "You order from a menu",
      choiceMenuText: "Christmas, Thai desserts and other rounds. Fixed price per area.",
      choiceCustomTitle: "You order custom",
      choiceCustomText: "Party, cake, cupcakes or bouquet. Price per kilometre.",
      menuTitle: "You order from a menu",
      checkerLabel: "Your postcode",
      checkerHint: "Enter the 4 digits, for example 3131.",
      checkerButton: "Check",
      resultOk: "Delivery to {zone}: delivery cost {fee}, minimum order {min}, {free}.",
      resultFreeFrom: "free delivery from {amount}",
      resultNoFree: "no free delivery",
      resultOutside: "Outside our area? Then you can pick up for free in Vlaardingen.",
      resultInvalid: "Enter a postcode of 4 digits.",
      pickupTitle: "Pickup",
      pickupText: "Free, with no minimum. Gretha Hofstralaan – you get the exact address after payment.",
      mapLabel: "Map of our delivery areas",
      mapError: "The map could not be loaded. Please use the table below.",
      mapKitchen: "Our kitchen, Vlaardingen",
      legendTitle: "Delivery cost per area",
      legendKitchen: "Our kitchen (Vlaardingen)",
      tableCaption: "Delivery areas with delivery cost, minimum order and free delivery",
      colArea: "Area",
      colPostcodes: "Postcodes",
      colFee: "Delivery cost",
      colMin: "Minimum",
      colFree: "Free from",
      noFree: "None",
      tableNote: "Amounts apply to the products in your order, excluding delivery cost.",
      customTitle: "Custom: price per kilometre",
      customIntro:
        "For parties, cakes, cupcakes and bouquets we charge delivery by driving distance from our kitchen. We make a special trip just for you.",
      formulaStart: "Starting fee",
      formulaPerKm: "Per km (driving distance)",
      formulaRound: "Rounded to",
      formulaMax: "Max",
      formulaMaxValue: "{km} km",
      formulaSlot: "Pick a free day and time when you order.",
      exampleLabel: "Example",
      example: "{zone} {km} km → {start} + {km} × {rate} = {raw} → {final}",
      soon: "Soon you will be able to place custom orders here online. Until then, send us a message and we will work out the price for you.",
      contactButton: "Send us a message",
      info1Title: "When do we deliver?",
      info1Text: "On fixed days per round. Each menu shows the delivery days and time slots.",
      info2Title: "Not home?",
      info2Text: "Then you can pick up your order from us in Vlaardingen afterwards.",
      info3Title: "Further away?",
      info3Text: "We send some products chilled with PostNL. You will see this on the menu.",
      ctaText: "See what you can order right now.",
      ctaButton: "To the menus"
    }
  });
})();
