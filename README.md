# Praman

Responsive Nepal-focused product label guide built with Next.js 16, React, TypeScript, Lucide icons, Next.js Route Handlers, and Node's built-in SQLite database.

## Run locally

Requirements: Node.js 24 or newer and npm.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The server creates `data/praman.db` and seeds the 54-product catalog on first use. The requested 20-product list is ranked first in the home feed and default search. `npm run build` creates the production build; `npm start` runs it.

## Included

- Product catalog search with category, rating sort, and Nepal-made filters
- Product pages with label flags, ingredients, nutrition display, ratings, and higher-rated alternatives
- Barcode scanning through supported browser cameras, manual barcode lookup, and Open Food Facts fallback
- Persistent saved products, shopping list, preference profile, and community submissions in SQLite
- Responsive mobile navigation and larger Lucide icon treatments

The starter product ratings, nutrition values, and several ingredient lists are illustrative UI data, not verified label analysis. Four starter products use external package photographs; other products use generated CSS package illustrations. Community submissions are stored with a pending-review status; moderation tooling and accounts are not included yet. For deployments with an ephemeral filesystem, set `DATABASE_PATH` to a writable persistent volume path (the file is placed under the app's `data` directory).
