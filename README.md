# Praman

Responsive Nepal-focused product label guide built with Next.js 16, React, TypeScript, Lucide icons, Next.js Route Handlers, and Netlify Database with Drizzle ORM.

## Run locally

Requirements: Node.js 24 or newer and npm.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The bundled product catalog is served directly, independently of database availability. The requested 20-product list is ranked first in the home feed and default search. For local database-backed features, use `netlify dev --port 8889`. Netlify provisions the database and applies the migrations in `netlify/database/migrations` on deployment. `npm run build` creates the production build; `npm start` runs it.

## Included

- Product catalog search with category, rating sort, and Nepal-made filters
- Product pages with label flags, ingredients, nutrition display, ratings, and higher-rated alternatives
- Barcode scanning through supported browser cameras, manual barcode lookup, and Open Food Facts fallback
- Persistent saved products, shopping list, preference profile, and community submissions in Netlify Database
- Responsive mobile navigation and larger Lucide icon treatments

The starter product ratings, nutrition values, and several ingredient lists are illustrative UI data, not verified label analysis. Four starter products use external package photographs; other products use generated CSS package illustrations. Community submissions are stored with a pending-review status; moderation tooling and accounts are not included yet. Saved data uses managed Postgres rather than the deployment's temporary filesystem. Define schema changes in `db/schema.ts` and generate migrations with `npx drizzle-kit generate --name <descriptive_name>`.
