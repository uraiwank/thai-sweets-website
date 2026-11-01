# Thai Sweets website

Marketing site for [Thai Sweets](https://www.thaisweets.nl) (Vlaardingen). Online ordering lives in a separate app; every **Order** button links there.

## Preview locally

Open `index.html` in a browser, or from this folder:

```bash
npx serve .
```

## Edit often

- **Order-round dates** (Home announcement bar + "Open for ordering" cards): search `ROUND DATA` in `index.html`.
- **Menu items / prices**: `js/menu-data.js` (and matching sections on `menu.html` if you keep static HTML in sync).
- **Order app URL**: search `ORDER_APP_URL` / `thai-sweets-order.uraiwank.workers.dev` across HTML files.

## Stack

Plain static HTML + CSS + vanilla JS. No build step. Deployable to Cloudflare Pages as static files.

## Pages

- `index.html` — Home
- `menu.html` — Menu
- `about.html` — Our Story
- `how-to-order.html` — How to Order
- `contact.html` — Contact
