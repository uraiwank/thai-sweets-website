# Thai Sweets website

Marketing site for [Thai Sweets](https://www.thaisweets.nl) (Vlaardingen). Online ordering lives at [order.thaisweets.nl](https://order.thaisweets.nl); every **Order** button links there.

## Preview locally

Serve over HTTP (not `file://`), e.g. from this folder:

```bash
npx --yes serve -l 55343 .
```

## Edit often

- **News bar**: `home2.news` in `js/i18n/home.js` (one line per language).
- **Page texts (NL/EN)**: `js/i18n/home.js` (`home2.*`); styles in `css/home.css`.
- **Live open/upcoming rounds**: `js/open-menus.js` fetches `https://order.thaisweets.nl/api/open-menus`. On localhost use `?rounds=sample|empty|error` to test; the email form is `js/notify.js`.
- **Order app URL**: `https://order.thaisweets.nl` in `index.html` and `js/i18n.js`.

## Stack

Plain static HTML + CSS + vanilla JS. No build step. Deployable to Cloudflare Pages as static files.

## Pages

- `index.html` — the whole site (one page, NL + EN). `about.html`, `contact.html` and `menu.html` are replaced; `_redirects` sends them to `/`.
