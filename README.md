# SmartPOS

A modern, multilingual point-of-sale and retail management frontend built with React 19, Vite, Tailwind CSS v4, and Zustand.

SmartPOS runs entirely in the browser. Demo data is generated locally and persisted to `localStorage`, so every flow — checkout, refunds, inventory adjustments, purchasing, reporting, and settings — works without a backend.

## Features

- **Point of sale** — searchable product grid, barcode/SKU lookup, cart quantity controls, discounts, tax, cash/card/QR payments, change calculation, and printable receipts.
- **Dashboard** — revenue and profit KPIs, sales trend chart, top products, category mix, payment breakdown, low-stock alerts, recent activity, and date-range filters.
- **Catalog** — products with emoji or uploaded images, categories, SKU/barcode, cost and selling price, and stock thresholds.
- **Inventory** — stock movements, manual adjustments (in/out/set), low-stock filters, and valuation.
- **People** — customers and suppliers with contact details, notes, and purchase/sales history.
- **Operations** — purchase orders with receiving (stock increases only on receive), sales history with refunds and receipt reprints, payments ledger, and expenses.
- **Reports** — revenue, profit, top customers/products, category and payment breakdowns, plus CSV export and print-friendly output.
- **Administration** — user management with role assignment, store/receipt/preferences settings, JSON backup, and demo-data reset.
- **Accounts** — login, forgot/reset password demo, profile editing, and password change with strength validation.
- **Roles** — `ADMIN` (everything), `MANAGER` (everything except users and settings), `CASHIER` (POS, own sales, read-only customers).
- **Experience** — English and Khmer localization, light/dark themes, responsive layout, skeletons, empty states, confirm dialogs, and animated transitions. Preferences persist across reloads.

## Tech stack

React 19 · Vite 8 · Tailwind CSS v4 · React Router 7 · Zustand · Recharts · React Hook Form · react-hot-toast · Framer Motion · i18next / react-i18next · Lucide icons

## Getting started

Requires Node.js 20.19+ (or 22.12+).

```bash
npm install
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`).

```bash
npm run build     # production build
npm run preview   # preview the production build
npm run lint      # Oxlint
```

## Demo accounts

| Role    | Email                  | Password      |
| ------- | ---------------------- | ------------- |
| Admin   | `admin@smartpos.com`   | `password123` |
| Manager | `manager@smartpos.com` | `password123` |
| Cashier | `cashier@smartpos.com` | `password123` |

Sign-in accepts any seeded user with the demo password. Role-based navigation and route guards hide or block modules a user cannot access.

## Data and reset

- App preferences: `localStorage["smartpos.app.v1"]` (session, theme, language, sidebar, settings).
- Business data: `localStorage["smartpos.data.v1"]` (products, sales, payments, purchases, expenses, users, movements, activity).
- Seeded on first load with 30 products, 8 categories, 12 customers, 5 suppliers, 5 users, and ~90 days of sales.
- Reset from **Settings → Data → Reset demo data**, or clear both keys in your browser.

## Project structure

```
src/
  components/   UI kit, forms, tables, layout, POS, charts
  data/         deterministic demo data generator
  hooks/        currency, table controls, delayed loading, click-outside, scroll
  layouts/      authenticated app shell and auth shell
  locales/      English and Khmer translation trees
  pages/        one folder per module
  routes/       navigation config and route guards
  store/        Zustand app and data stores
  utils/        formatting, permissions, analytics, calculations, CSV
```

## Notes

This is a frontend demo: authentication, password reset, and payments are simulated locally. Replace the Zustand persistence layer with real API calls before production use.
