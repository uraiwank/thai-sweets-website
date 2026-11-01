# Thai Sweets website

Marketing site for [Thai Sweets](https://www.thaisweets.nl) (Vlaardingen). Online ordering lives at [order.thaisweets.nl](https://order.thaisweets.nl); every **Order** button links there.

## Preview locally

Serve over HTTP (not `file://`), e.g. from this folder:

```bash
npx --yes serve -l 55343 .
```

## Edit often

- **Live open/upcoming rounds** (Home announcement bar + “Open for ordering” cards): `js/open-menus.js` fetches `https://order.thaisweets.nl/api/open-menus`. Toggle `USE_MOCK` and use `js/open-menus.sample.json` for empty/error testing.
- **Menu items / prices**: `js/menu-data.js` (and matching sections on `menu.html` if you keep static HTML in sync).
- **Order app URL**: `ORDER_APP_URL` in `js/main.js` and `https://order.thaisweets.nl` in HTML.

## Stack

Plain static HTML + CSS + vanilla JS. No build step. Deployable to Cloudflare Pages as static files.

## Pages

- `index.html` — Home
- `menu.html` — Menu
- `about.html` — Our Story
- `how-to-order.html` — How to Order
- `contact.html` — Contact
