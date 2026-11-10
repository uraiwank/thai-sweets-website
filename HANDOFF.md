# Handoff: Thai Sweets marketing site (the new thaisweets.nl)

Copied from the order-app handoff `C:\Thai-Sweets-2026\thai-sweets-order\docs\HANDOFF-2026-11-02.md` on 2026-11-02. For anything about order.thaisweets.nl (the order app), see that file.

Nina calls this site "the shop website" (เว็บไซต์ร้าน). She moved back from Cursor/Grok to Claude Code: **Claude now handles this repo, code and local commits.**

## Rules for this repo
- Commit only when Nina says so. Push only when Nina says so. Never merge into `main` without Nina's OK.
- Stage files by name, never `git add -A`.
- Never commit `translations/th-review.xlsx` or `translations/en.pdf`.
- Don't delete files without asking Nina.
- Don't work in the order app repo (`C:\Thai-Sweets-2026\thai-sweets-order`) from a session here; only read it.

## Decision: launch with Dutch and English only (2026-11-02)
Nina decided Thai comes later, after her review. Thai is hidden, not removed:
- No TH button in the language switch (header and mobile menu, all 6 pages); the inline language bootstrap on each page accepts only nl/en; `SUPPORTED.th` is `false` in `js/i18n.js` by default.
- `sitemap.xml` lists no `/th/` URLs, there are no hreflang tags, and no page links to `/th/` (order and legal links use the current language).
- Kept for later: `translations/th.txt`, `th-extra.txt`, `js/i18n/th.js`, the `th` branches in `js/notify.js` / `js/open-menus.js`, and the scripts.
- Open items 2 and 3 (Thai review and wording) are no longer launch blockers.

### Testing Thai on the live site (hidden test mode)
- Visit any page with `?lang=th` (e.g. `https://.../index.html?lang=th`): Thai turns on for that browser and is remembered (localStorage key `thaisweets_lang` = `th`).
- Visit any page with `?lang=nl` or `?lang=en` to turn it off again. Without the flag, Thai is unavailable (a stored `th` is ignored unless test mode is on).
- `js/i18n/th.js` is loaded only while Thai is on (by `js/i18n.js`), and the page then gets `<meta name="robots" content="noindex">` as a safety net. Normal visitors never download the Thai pack.
- Clicking the NL/EN buttons while in Thai also turns it off for that browser (they overwrite the remembered language). Re-visit `?lang=th` to come back.
- Thai-mode pages load Dutch first for a split second, then switch to Thai once `th.js` has loaded.

### Turning Thai on for everyone (later, after Nina's review is imported)
1. Set `th: true` in `SUPPORTED` in `js/i18n.js` and remove the test-mode gate (`thaiTestMode` / `loadThai`); load `js/i18n/th.js` normally.
2. Restore the `<button type="button" data-lang="th" aria-label="ไทย" aria-pressed="false">TH</button>` in both lang-switch groups on every page, add `<script src="js/i18n/th.js" defer></script>` before `js/i18n.js`, and re-add `|| L === 'th'` in the inline bootstrap.
3. Drop the noindex meta, and add `/th/` URLs to the sitemap/hreflang if wanted.

## State
- Branch `feat/short-design` (new one-page design, from `cursor/translation-export-cc1f`), in sync with `origin/main` (latest code commit `4b88583`, then the HANDOFF update), pushed to `origin/main` and `origin/feat/short-design` (workers.dev preview only). Update this line (count + latest commit) whenever a commit is made. Built on `cursor/notify-i18n-cc1f` (`4972e2b`).
- Done (local only):
  - Notify form → `POST /api/notify` with Turnstile (site key matches the order app), `menuId: null`, aria-live messages.
  - NL / EN / TH language switch; order and legal links follow `/{nl|en|th}/`.
  - Translations live in `translations/` as plain text (one text per line), imported into `js/i18n/*.js` with `scripts/import-translations.js`:
    - `en.txt`, `nl.txt`, `th.txt`, `keys.txt`: 368 lines each.
    - `en-extra.txt`, `nl-extra.txt`, `th-extra.txt`, `keys-extra.txt`: 11 lines each.
    - Lines 126–135 (moved from 105–114) are fragments joined with dates; their leading/trailing spaces are intentional.
    - All `*.txt` and `*-extra.txt` files are committed (`a4d934f`).
  - Dutch: lines 1–92 from DeepL, cleaned up by Claude; lines 93–368 and extras written by Claude. Uses informal "je".
  - Link/button check on the preview (2026-11-01): no broken internal links or images; theme toggle, mobile menu, cookie banner and settings work.

## Open items
(Numbering follows the order-app handoff; item 1 is done, so the list starts at 2.)

2. **Thai translation needs Nina's full review.** Nina found many wrong Thai texts. Review file: `translations/th-review.xlsx` (374 rows: File, Line, English, Thai, Correction, OK?). Not filled in yet. When Nina returns it: copy each non-empty Correction into the matching line of `th.txt` / `th-extra.txt`, keep line counts (368 / 11) and fragment spaces, then import. `th-review.xlsx` and `en.pdf` must not be committed.
3. Thai wording to confirm with Nina: dessert names "ช่อม่วงและขนมรูปนก" (Steamed Flower & Bird Dumplings), "ปั้นสิบทอด" (Fried Flour Dumplings), "ขนมจีบ" for dumplings. Name is spelled "นิน่า" in the current `th.txt`.
4. Customer reviews on the home page: review 2 mentions "meatballs with dipping sauce". Nina to confirm all three are real customer quotes and still fit the menu (EU rules: no invented reviews).
5. Overnight QA task (accessibility, links, screenshots, Lighthouse, SEO, untranslated text; report in `reports/overnight-YYYY-MM-DD.md`) was drafted but **not run yet** (no `reports/` folder).
6. Then: merge into `main` and push (updates only the workers.dev preview; thaisweets.nl still points to the old Firebase site), and test the notify form with a real email on the preview.
7. Untracked leftovers from Grok (not deleted, not committed): `.lighthouse/`, `scripts/__pycache__/`, one-off `scripts/_*.js` and `scripts/wire-*.js`, `GROK_PROMPT_open-menus.md`, `BRIEF.md`. Ask Nina before deleting.

(Item 1, `th.txt` line 297 re-import, was done in `75a8e60`: `about.tl3Body` in `th.js`.)

## Later (not urgent)
- Privacy policy (`src/lib/legal/*`, nl/en/th, in the order app repo): add a section about the marketing site (cookie consent, GTM-N8ND93C7 only after consent, notify-me signup via the order app) **before** thaisweets.nl moves to the new site. Wait until the marketing site is nearly final.

## How to Order page removed (2026-11-02, uncommitted)
- `how-to-order.html` deleted: online ordering at order.thaisweets.nl replaces it. Links removed from header nav, mobile menu, footer and sitemap; the home "Delivery & pickup details" button now points to the order app.
- `_redirects` (Cloudflare Pages) sends `/how-to-order` and `/how-to-order.html` → `https://order.thaisweets.nl/nl` (301).
- Translation keys for that page are still in `translations/` and `js/i18n/` (line counts unchanged). Unused now: `meta.howTitle`, `meta.howDesc`, `nav.how`, `footer.how`, all `how.*` (eyebrow, title, notice, step1–4 Title/Body, step3Hint, deliveryTitle, areasTitle, areas1, areas2, costTitle, costBody, pickupTitle, pickupBody, startOrder, viewMenu), `extra.how.desc_fallback`.
- Open: the home "Four simple steps" section (`home.howHome*`) still describes the old process; wording to be decided by Nina.
