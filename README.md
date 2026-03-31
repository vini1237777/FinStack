# FinStack

A modular ERP system for Indian SMEs with double-entry accounting, GST compliance, and inventory management.

## Live Demo

- App: https://your-vercel-url.vercel.app
- API: https://finstack-production-4ed3.up.railway.app

## Tech Stack

- Frontend: React 19, TypeScript, Tailwind CSS, Vite
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL with Prisma ORM
- Auth: JWT with role-based access control
- Deployment: Vercel (frontend) + Railway (backend + database)

## Features

- Double-entry accounting engine with automatic ledger posting
- GST calculation — auto CGST/SGST (intrastate) vs IGST (interstate)
- Sales & Purchase invoice management with line items
- Inventory tracking with stock-in/stock-out per warehouse
- Expense recording with GST input credit
- Financial reports: Trial Balance, Profit & Loss, GSTR-3B, Stock Summary
- Dashboard with real-time business metrics

## Architecture

```
READ-ONLY LAYER
┌──────────┬──────────┬─────────┐
│  Ledger  │ Reports  │   P&L   │
└────┬─────┴─────┬────┴────┬────┘
     │           │         │
TRANSACTION LAYER
┌──────────┬──────────┬─────────┐
│ Purchase │  Sales   │Expenses │
└──┬──┬──┬─┴──┬──┬──┬─┴──┬──┬──┘
   │  │  │    │  │  │    │  │
FOUNDATION LAYER
┌──────────┬──────────┬─────────┐
│Accounting│Inventory │   GST   │
│  Engine  │          │  Calc   │
└──────────┴──────────┴─────────┘
```

Transaction modules (Sales, Purchase, Expenses) call the foundation services.
The Accounting Engine validates that debits equal credits and saves atomically.

## Demo Flow

1. Login → Sign in with pre-filled credentials
2. Create Purchase → Buy laptops from Dell India (interstate → IGST)
3. Create Sale to Reliance → Same state (MH→MH) → CGST + SGST
4. Create Sale to Infosys → Different state (MH→KA) → IGST
5. Record Expense → Internet bill with GST
6. Check Reports → Trial Balance (Balanced ✓), P&L, GSTR-3B, Stock

## How It Works — Sales Invoice Example

```
User clicks "Create Invoice"
  → Selects customer, items, quantities
  → Backend:
    1. GST Calculator checks states → CGST/SGST or IGST
    2. Inventory Service reduces stock
    3. Accounting Engine posts:
       Dr. Accounts Receivable    (customer owes you)
       Cr. Sales Revenue          (income earned)
       Cr. CGST/SGST/IGST Payable (tax collected)
    4. Validates: total debits = total credits
    5. Saves everything atomically
```

## Database

22 tables across 7 modules. See [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)

## API Endpoints

| Method   | Route                        | Description             |
| -------- | ---------------------------- | ----------------------- |
| POST     | /auth/register               | Register user           |
| POST     | /auth/login                  | Login, get JWT          |
| GET/POST | /masters/customers           | Customer CRUD           |
| GET/POST | /masters/suppliers           | Supplier CRUD           |
| GET/POST | /masters/items               | Item CRUD               |
| POST     | /sales/invoices              | Create sales invoice    |
| GET      | /sales/invoices              | List sales invoices     |
| POST     | /purchase/invoices           | Create purchase invoice |
| GET      | /purchase/invoices           | List purchase invoices  |
| POST     | /expenses                    | Record expense          |
| GET      | /reports/trial-balance/:fyId | Trial Balance           |
| GET      | /reports/profit-loss/:fyId   | Profit & Loss           |
| GET      | /reports/gstr3b/:fyId        | GSTR-3B Summary         |
| GET      | /reports/stock-summary       | Stock levels            |

## Local Setup

```bash
# Backend
cd backend
npm install
cp .env.example .env    # Update DATABASE_URL
npx prisma migrate dev
npm run seed
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## Design Documents

- [Design Document](docs/DESIGN_DOCUMENT.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
