# FinStack — Database Schema

## Master Tables

- users
- customers
- suppliers
- item_categories
- items
- warehouses
- hsn_sac_codes
- financial_years

## Accounting Tables

- ledger_accounts
- vouchers
- ledger_entries

## Sales Tables

- sales_invoices
- sales_invoice_items
- sales_returns
- sales_return_items

## Purchase Tables

- purchase_invoices
- purchase_invoice_items
- purchase_returns
- purchase_return_items

## Inventory Tables

- stock_movements

## Expense Tables

- expense_vouchers

## System Tables

- audit_logs

---

## Modules

- Master Tables
- Accounting Tables
- Sales Tables
- Purchase Tables
- Inventory Tables
- Expense Tables
- System Tables

---

## Master Tables

### `users`

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### `customers`

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  gstin VARCHAR(15) UNIQUE,
  state_code CHAR(2) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  pincode VARCHAR(6),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### `suppliers`

```sql
CREATE TABLE suppliers (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  gstin VARCHAR(15) UNIQUE,
  state_code CHAR(2) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  pincode VARCHAR(6),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### `item_categories`

```sql
CREATE TABLE item_categories (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### `items`

```sql
CREATE TABLE items (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  hsn_code VARCHAR(8) NOT NULL,
  category_id UUID REFERENCES item_categories(id),
  unit VARCHAR(20) NOT NULL,
  cost_price INTEGER NOT NULL,
  selling_price INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### `warehouses`

```sql
CREATE TABLE warehouses (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### `hsn_sac_codes`

```sql
CREATE TABLE hsn_sac_codes (
  id UUID PRIMARY KEY,
  code VARCHAR(8) NOT NULL UNIQUE,
  description VARCHAR(255) NOT NULL,
  gst_rate INTEGER NOT NULL,
  type VARCHAR(3) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### `financial_years`

```sql
CREATE TABLE financial_years (
  id UUID PRIMARY KEY,
  name VARCHAR(10) NOT NULL UNIQUE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Accounting Tables

### `ledger_accounts`

```sql
CREATE TABLE ledger_accounts (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(20) UNIQUE,
  account_type VARCHAR(20) NOT NULL,
  account_group VARCHAR(50) NOT NULL,
  parent_id UUID REFERENCES ledger_accounts(id),
  current_balance INTEGER DEFAULT 0,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### `vouchers`

```sql
CREATE TABLE vouchers (
  id UUID PRIMARY KEY,
  voucher_number VARCHAR(50) NOT NULL UNIQUE,
  voucher_type VARCHAR(20) NOT NULL,
  date DATE NOT NULL,
  financial_year_id UUID REFERENCES financial_years(id),
  reference_module VARCHAR(50),
  reference_id UUID,
  narration TEXT NOT NULL,
  total_amount INTEGER NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### `ledger_entries`

```sql
CREATE TABLE ledger_entries (
  id UUID PRIMARY KEY,
  voucher_id UUID REFERENCES vouchers(id),
  ledger_account_id UUID REFERENCES ledger_accounts(id),
  debit INTEGER NOT NULL DEFAULT 0,
  credit INTEGER NOT NULL DEFAULT 0,
  narration TEXT,
  entry_order INTEGER NOT NULL,
  date DATE NOT NULL,
  financial_year_id UUID REFERENCES financial_years(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Sales Tables

### `sales_invoices`

```sql
CREATE TABLE sales_invoices (
  id UUID PRIMARY KEY,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers(id),
  invoice_date DATE NOT NULL,
  financial_year_id UUID REFERENCES financial_years(id),
  total_amount INTEGER NOT NULL,
  cgst_total INTEGER NOT NULL DEFAULT 0,
  sgst_total INTEGER NOT NULL DEFAULT 0,
  igst_total INTEGER NOT NULL DEFAULT 0,
  grand_total INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  voucher_id UUID REFERENCES vouchers(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### `sales_invoice_items`

```sql
CREATE TABLE sales_invoice_items (
  id UUID PRIMARY KEY,
  sales_invoice_id UUID REFERENCES sales_invoices(id),
  item_id UUID REFERENCES items(id),
  hsn_code VARCHAR(8) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  taxable_amount INTEGER NOT NULL,
  gst_rate INTEGER NOT NULL,
  cgst_amount INTEGER NOT NULL DEFAULT 0,
  sgst_amount INTEGER NOT NULL DEFAULT 0,
  igst_amount INTEGER NOT NULL DEFAULT 0,
  total_amount INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### `sales_returns`

```sql
CREATE TABLE sales_returns (
  id UUID PRIMARY KEY,
  return_number VARCHAR(50) NOT NULL UNIQUE,
  sales_invoice_id UUID REFERENCES sales_invoices(id),
  customer_id UUID REFERENCES customers(id),
  return_date DATE NOT NULL,
  reason TEXT NOT NULL,
  financial_year_id UUID REFERENCES financial_years(id),
  total_amount INTEGER NOT NULL,
  cgst_total INTEGER NOT NULL DEFAULT 0,
  sgst_total INTEGER NOT NULL DEFAULT 0,
  igst_total INTEGER NOT NULL DEFAULT 0,
  grand_total INTEGER NOT NULL,
  voucher_id UUID REFERENCES vouchers(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### `sales_return_items`

```sql
CREATE TABLE sales_return_items (
  id UUID PRIMARY KEY,
  sales_return_id UUID REFERENCES sales_returns(id),
  item_id UUID REFERENCES items(id),
  warehouse_id UUID REFERENCES warehouses(id),
  hsn_code VARCHAR(8) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  taxable_amount INTEGER NOT NULL,
  gst_rate INTEGER NOT NULL,
  cgst_amount INTEGER NOT NULL DEFAULT 0,
  sgst_amount INTEGER NOT NULL DEFAULT 0,
  igst_amount INTEGER NOT NULL DEFAULT 0,
  total_amount INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Purchase Tables

### `purchase_invoices`

```sql
CREATE TABLE purchase_invoices (
  id UUID PRIMARY KEY,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  supplier_id UUID REFERENCES suppliers(id),
  invoice_date DATE NOT NULL,
  financial_year_id UUID REFERENCES financial_years(id),
  total_amount INTEGER NOT NULL,
  cgst_total INTEGER NOT NULL DEFAULT 0,
  sgst_total INTEGER NOT NULL DEFAULT 0,
  igst_total INTEGER NOT NULL DEFAULT 0,
  grand_total INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  voucher_id UUID REFERENCES vouchers(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### `purchase_invoice_items`

```sql
CREATE TABLE purchase_invoice_items (
  id UUID PRIMARY KEY,
  purchase_invoice_id UUID REFERENCES purchase_invoices(id),
  item_id UUID REFERENCES items(id),
  hsn_code VARCHAR(8) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  taxable_amount INTEGER NOT NULL,
  gst_rate INTEGER NOT NULL,
  cgst_amount INTEGER NOT NULL DEFAULT 0,
  sgst_amount INTEGER NOT NULL DEFAULT 0,
  igst_amount INTEGER NOT NULL DEFAULT 0,
  total_amount INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### `purchase_returns`

```sql
CREATE TABLE purchase_returns (
  id UUID PRIMARY KEY,
  return_number VARCHAR(50) NOT NULL UNIQUE,
  purchase_invoice_id UUID REFERENCES purchase_invoices(id),
  supplier_id UUID REFERENCES suppliers(id),
  return_date DATE NOT NULL,
  reason TEXT NOT NULL,
  financial_year_id UUID REFERENCES financial_years(id),
  total_amount INTEGER NOT NULL,
  cgst_total INTEGER NOT NULL DEFAULT 0,
  sgst_total INTEGER NOT NULL DEFAULT 0,
  igst_total INTEGER NOT NULL DEFAULT 0,
  grand_total INTEGER NOT NULL,
  voucher_id UUID REFERENCES vouchers(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### `purchase_return_items`

```sql
CREATE TABLE purchase_return_items (
  id UUID PRIMARY KEY,
  purchase_return_id UUID REFERENCES purchase_returns(id),
  item_id UUID REFERENCES items(id),
  warehouse_id UUID REFERENCES warehouses(id),
  hsn_code VARCHAR(8) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  taxable_amount INTEGER NOT NULL,
  gst_rate INTEGER NOT NULL,
  cgst_amount INTEGER NOT NULL DEFAULT 0,
  sgst_amount INTEGER NOT NULL DEFAULT 0,
  igst_amount INTEGER NOT NULL DEFAULT 0,
  total_amount INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Inventory Tables

### `stock_movements`

```sql
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY,
  item_id UUID REFERENCES items(id),
  warehouse_id UUID REFERENCES warehouses(id),
  movement_type VARCHAR(10) NOT NULL,
  quantity INTEGER NOT NULL,
  reference_type VARCHAR(50) NOT NULL,
  reference_id UUID NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Expense Tables

### `expense_vouchers`

```sql
CREATE TABLE expense_vouchers (
  id UUID PRIMARY KEY,
  expense_head VARCHAR(255) NOT NULL,
  supplier_id UUID REFERENCES suppliers(id),
  date DATE NOT NULL,
  financial_year_id UUID REFERENCES financial_years(id),
  hsn_sac_code VARCHAR(8),
  amount INTEGER NOT NULL,
  cgst_amount INTEGER NOT NULL DEFAULT 0,
  sgst_amount INTEGER NOT NULL DEFAULT 0,
  igst_amount INTEGER NOT NULL DEFAULT 0,
  total_amount INTEGER NOT NULL,
  payment_mode VARCHAR(20) NOT NULL,
  voucher_id UUID REFERENCES vouchers(id),
  created_by UUID REFERENCES users(id),
  narration TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## System Tables

### `audit_logs`

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action VARCHAR(20) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  old_value TEXT,
  new_value TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);
```

# <<<<<<< HEAD

> > > > > > > 64f1efca147aa6acbafc91a847f97bc49ca8be50
