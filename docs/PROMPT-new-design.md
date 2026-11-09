# Task: rebuild thaisweets.nl from the approved short design (preview first)

Read CLAUDE.md and HANDOFF.md first. Rules: commit only when Nina says, push only when Nina says,
stage files by name (never `git add -A`), never commit `th-review.xlsx` or `en.pdf`, ask before deleting files.
Only one tool works in this checkout at a time.

## Approved design (Nina approved on 9 Nov 2026)
- Source files: `docs/design-approved/home-nl.dc.html` (Dutch, main) and `docs/design-approved/home-en.dc.html` (English).
  Canvas: https://claude.ai/artifact/RW9G5bwHX5KVsa5tzX1C47 (artboards "Home kort – Nederlands (nieuw)" and "Home kort – English (nieuw)").
- The `.dc.html` files are design markup: copy layout, colours, fonts, spacing and texts exactly. Ignore `<x-dc>`, `<helmet>`,
  `{{...}}` holes and the `DCLogic` script; rebuild that behaviour in plain JS.
- Images: `/_blob/...` URLs are design uploads. Use the matching files in `images/` (match by the alt text, e.g.
  golden set, butterfly pea layer cake, pandan layer cake, mango sticky rice, coconut cake, curry puffs, rose cupcakes,
  Tong Muan, logo). Keep webp, width/height attributes, lazy loading below the fold.

## Page (one page, NL + EN only)
1. Green news bar on top (text in ONE place per language, easy for Nina to edit).
2. Header: logo, NL/EN switch, "Bestellen" button. No TH button.
3. Hero: one photo, heading, text, "Bestel nu".
4. "Nu te bestellen": round cards. Use the EXISTING live API: `js/open-menus.js` already fetches
   `https://order.thaisweets.nl/api/open-menus`. Render each round as the design card (open round: photo, "Nu open" badge,
   label, title, text, Bestel vóór / Afhalen / Bezorgen, "Bekijk menu & bestel" link to the round; upcoming round: "Opent ..."
   badge and the email form). Keep the empty and error states.
   Email form = the EXISTING `js/notify.js` (`POST /api/notify` with Turnstile, aria-live messages). Do not invent a new API.
5. Green band "Zo bestel je bij ons": 3 cards. Feest of evenement (from €200, 7 days ahead) and Taarten & cupcakes link to
   order.thaisweets.nl (nl/en); Zakelijk = mailto.
6. "Wat we maken": photo mosaic, no captions.
7. Pink band "Over ons" + review carousel: auto-advance every 60 s, ‹ › buttons, Pause/Play button (WCAG 2.2.2),
   aria-live off while auto-playing, polite after a manual step. No blur, fade or shimmer animations.
8. Footer as in the design (contact, social, legal links to order app, cookie settings link, KVK/btw).
- No dark mode for now. Keep the cookie banner and cookie settings.
- Texts: never mention Nina, her mother, family, Nong Khai or culinary school; use "we".
- Thai stays hidden (no TH button). Do not delete the Thai files.

## Old pages
- `about.html`, `contact.html`, `menu.html` and old sections are replaced. Remove them from navigation and `sitemap.xml`,
  add redirects to `/` in `_redirects`. List the files that could be deleted and ask Nina; do not delete them yourself.

## Checks before showing Nina
- Local preview NL and EN, desktop 1440 px and phone 390 px, no horizontal scroll.
- Live rounds load from the API; empty and error states work (`USE_MOCK` / sample JSON).
- axe-core WCAG 2.2 AA: no violations NL/EN. Keyboard only works (switch, carousel, form).
- All links work. Contrast 4.5:1.

## Deploy (preview only)
- Work on a new branch from the current branch, e.g. `feat/short-design`.
- When the local preview is OK, show Nina, then commit ONLY when she says. Merging into `main` and pushing updates
  only the workers.dev preview (https://thai-sweets-website.uraiwank.workers.dev); thaisweets.nl still points to Firebase.
- Do NOT change DNS or the thaisweets.nl domain. That is a separate step after Nina tests the preview.
