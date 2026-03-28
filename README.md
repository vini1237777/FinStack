# FinStack

 1) A modular ERP system for Indian SMEs to manage sales, inventory, accounting, and GST compliance with a double-entry accounting engine


 # Tech Stack — 
 Node.js - Runtime for backend services,
 TypeScript - Type safety across the codebase,
 PostgreSQL -  relational integrity for double-entry accounting , 
 Prisma - Type-safe ORM with auto-generated migrations and schema versioning., 
 JWT - for authentication, 
 Swagger - for maintaining api docs.

# Features (POC Scope) — 
1) Purchase Module : Planned
2) Sales Module : Planned
3) Expense Module
4) Accounting Module
5) Ledger Module
6) Inventory / Stock Module
7) GST & GSTR-3B Module
8) Profit & Loss Module



# Project Structure — 

.
├── README.md
├── docker-compose.yml
├── docs
│   ├── DATABASE_SCHEMA.md
│   ├── DESIGN_DOCUMENT.md 
│   └── api-spec.yaml   
├── package-lock.json
├── package.json
├── prisma
├── src
│   └── index.ts




# Getting Started — 

commands:

1. npm i 

# API Documentation —  
Available at /api-docs when server is running.


# Architecture — 
See docs/DESIGN_DOCUMENT.md for full system design.