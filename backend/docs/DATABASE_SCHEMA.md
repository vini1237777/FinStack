TABLE: customers

id UUID PRIMARY KEY
name VARCHAR(255) NOT NULL
gstin VARCHAR(15) UNIQUE
state_code CHAR(2) NOT NULL -- needed for GST calc
email VARCHAR(255)
phone VARCHAR(20)
address TEXT
pincode VARCHAR(6)
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()

TABLE: suppliers

id UUID PRIMARY KEY
name VARCHAR(255) NOT NULL
gstin VARCHAR(15) UNIQUE -- optional, can be NULL
state_code CHAR(2) NOT NULL -- needed for GST calc
email VARCHAR(255)
phone VARCHAR(20)
address TEXT
pincode VARCHAR(6)
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()

TABLE: items

id UUID PRIMARY KEY
name VARCHAR(255) NOT NULL
description TEXT
hsn_code VARCHAR(8) NOT NULL -- links to GST rate
category_id UUID FOREIGN KEY → item_categories
unit VARCHAR(20) NOT NULL -- "pieces", "kg", "liters"
cost_price INTEGER NOT NULL -- in paise
selling_price INTEGER NOT NULL -- in paise
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()

TABLE: item_categories

id UUID PRIMARY KEY
name VARCHAR(255) NOT NULL UNIQUE
description TEXT
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()

TABLE: ledger_accounts

id UUID PRIMARY KEY
name VARCHAR(255) NOT NULL
code VARCHAR(20) UNIQUE -- "ACC-001", "ACC-002"
account_type VARCHAR(20) NOT NULL -- "ASSET", "LIABILITY", "INCOME", "EXPENSE"
account_group VARCHAR(50) NOT NULL -- "Current Assets", "Fixed Assets", etc.
parent_id UUID FOREIGN KEY → ledger_accounts -- for hierarchy
current_balance INTEGER DEFAULT 0 -- running total in paise
is_system BOOLEAN DEFAULT FALSE -- TRUE for built-in accounts like CGST
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()

TABLE: vouchers

id UUID PRIMARY KEY
voucher_number VARCHAR(50) NOT NULL UNIQUE -- "SALES-2026-001"
voucher_type VARCHAR(20) NOT NULL -- SALES, PURCHASE, PAYMENT, EXPENSE, JOURNAL
date DATE NOT NULL
financial_year_id UUID FOREIGN KEY → financial_years
reference_module VARCHAR(50) -- "SALES_INVOICE", "PURCHASE_INVOICE"
reference_id UUID -- ID of the source document
narration TEXT NOT NULL -- description of the transaction
total_amount INTEGER NOT NULL -- in paise
created_by UUID FOREIGN KEY → users
created_at TIMESTAMP DEFAULT NOW()

TABLE: ledger_entries

id UUID PRIMARY KEY
voucher_id UUID FOREIGN KEY → vouchers -- which transaction
ledger_account_id UUID FOREIGN KEY → ledger_accounts -- which account
debit INTEGER NOT NULL DEFAULT 0 -- in paise
credit INTEGER NOT NULL DEFAULT 0 -- in paise
narration TEXT
entry_order INTEGER NOT NULL -- position within voucher
date DATE NOT NULL
financial_year_id UUID FOREIGN KEY → financial_years
created_at TIMESTAMP DEFAULT NOW()

TABLE: financial_years

id UUID PRIMARY KEY
name VARCHAR(10) NOT NULL UNIQUE -- "2025-26"
start_date DATE NOT NULL -- 2025-04-01
end_date DATE NOT NULL -- 2026-03-31
is_active BOOLEAN DEFAULT FALSE -- only one can be active
created_at TIMESTAMP DEFAULT NOW()

TABLE: stock_movements

id UUID PRIMARY KEY
item_id UUID FOREIGN KEY → items
warehouse_id UUID FOREIGN KEY → warehouses
movement_type VARCHAR(10) NOT NULL -- "IN" or "OUT"
quantity INTEGER NOT NULL -- number of units
reference_type VARCHAR(50) NOT NULL -- "SALES_INVOICE", "PURCHASE_INVOICE", "ADJUSTMENT"
reference_id UUID NOT NULL -- ID of the invoice that caused this
date DATE NOT NULL
created_at TIMESTAMP DEFAULT NOW()

TABLE: warehouses

id UUID PRIMARY KEY
name VARCHAR(255) NOT NULL UNIQUE
description TEXT
location VARCHAR(255) -- city or address
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()

TABLE: hsn_sac_codes

id UUID PRIMARY KEY
code VARCHAR(8) NOT NULL UNIQUE -- "8471", "6109"
description VARCHAR(255) NOT NULL -- "Computers", "T-shirts"
gst_rate INTEGER NOT NULL -- 0, 5, 12, 18, 28
type VARCHAR(3) NOT NULL -- "HSN" for goods, "SAC" for services
created_at TIMESTAMP DEFAULT NOW()

TABLE: users

id UUID PRIMARY KEY
name VARCHAR(255) NOT NULL
email VARCHAR(255) NOT NULL UNIQUE
password VARCHAR(255) NOT NULL -- stored as bcrypt hash, NEVER plain text
phone VARCHAR(20)
role VARCHAR(20) NOT NULL -- "admin", "accountant", "sales_exec", "purchase_exec", "manager"
is_active BOOLEAN DEFAULT TRUE -- disable without deleting
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()

TABLE: sales_invoices

id UUID PRIMARY KEY
invoice_number VARCHAR(50) NOT NULL UNIQUE -- "INV-2026-001"
customer_id UUID FOREIGN KEY → customers
invoice_date DATE NOT NULL
financial_year_id UUID FOREIGN KEY → financial_years
total_amount INTEGER NOT NULL -- base amount before tax (paise)
cgst_total INTEGER NOT NULL DEFAULT 0
sgst_total INTEGER NOT NULL DEFAULT 0
igst_total INTEGER NOT NULL DEFAULT 0
grand_total INTEGER NOT NULL -- total with tax (paise)
status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' -- DRAFT, CONFIRMED, CANCELLED
voucher_id UUID FOREIGN KEY → vouchers -- links to accounting entry
created_by UUID FOREIGN KEY → users
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()

TABLE: sales_invoice_items

id UUID PRIMARY KEY
sales_invoice_id UUID FOREIGN KEY → sales_invoices
item_id UUID FOREIGN KEY → items
hsn_code VARCHAR(8) NOT NULL
quantity INTEGER NOT NULL
unit_price INTEGER NOT NULL -- paise
taxable_amount INTEGER NOT NULL -- quantity × unit_price
gst_rate INTEGER NOT NULL -- 5, 12, 18, 28
cgst_amount INTEGER NOT NULL DEFAULT 0
sgst_amount INTEGER NOT NULL DEFAULT 0
igst_amount INTEGER NOT NULL DEFAULT 0
total_amount INTEGER NOT NULL -- taxable + all GST
created_at TIMESTAMP DEFAULT NOW()

TABLE: purchase_invoices

id UUID PRIMARY KEY
invoice_number VARCHAR(50) NOT NULL UNIQUE
supplier_id UUID FOREIGN KEY → suppliers -- not customer
invoice_date DATE NOT NULL
financial_year_id UUID FOREIGN KEY → financial_years
total_amount INTEGER NOT NULL
cgst_total INTEGER NOT NULL DEFAULT 0
sgst_total INTEGER NOT NULL DEFAULT 0
igst_total INTEGER NOT NULL DEFAULT 0
grand_total INTEGER NOT NULL
status VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
voucher_id UUID FOREIGN KEY → vouchers
created_by UUID FOREIGN KEY → users
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()

TABLE: purchase_invoice_items

id UUID PRIMARY KEY
purchase_invoice_id UUID FOREIGN KEY → purchase_invoices
item_id UUID FOREIGN KEY → items
hsn_code VARCHAR(8) NOT NULL
quantity INTEGER NOT NULL
unit_price INTEGER NOT NULL
taxable_amount INTEGER NOT NULL
gst_rate INTEGER NOT NULL
cgst_amount INTEGER NOT NULL DEFAULT 0
sgst_amount INTEGER NOT NULL DEFAULT 0
igst_amount INTEGER NOT NULL DEFAULT 0
total_amount INTEGER NOT NULL
created_at TIMESTAMP DEFAULT NOW()

TABLE: expense_vouchers

id UUID PRIMARY KEY
expense_head VARCHAR(255) NOT NULL -- "Internet", "Rent", "Travel"
supplier_id UUID FOREIGN KEY → suppliers -- optional, some expenses have no vendor
date DATE NOT NULL
financial_year_id UUID FOREIGN KEY → financial_years
hsn_sac_code VARCHAR(8) -- for GST lookup
amount INTEGER NOT NULL -- base amount in paise
cgst_amount INTEGER NOT NULL DEFAULT 0
sgst_amount INTEGER NOT NULL DEFAULT 0
igst_amount INTEGER NOT NULL DEFAULT 0
total_amount INTEGER NOT NULL -- amount + all GST
payment_mode VARCHAR(20) NOT NULL -- "CASH" or "BANK"
voucher_id UUID FOREIGN KEY → vouchers
created_by UUID FOREIGN KEY → users
narration TEXT -- "March internet bill"
created_at TIMESTAMP DEFAULT NOW()

TABLE: sales_returns

id UUID PRIMARY KEY
return_number VARCHAR(50) NOT NULL UNIQUE
sales_invoice_id UUID FOREIGN KEY → sales_invoices -- original invoice
customer_id UUID FOREIGN KEY → customers
return_date DATE NOT NULL
reason TEXT NOT NULL
financial_year_id UUID FOREIGN KEY → financial_years
total_amount INTEGER NOT NULL
cgst_total INTEGER NOT NULL DEFAULT 0
sgst_total INTEGER NOT NULL DEFAULT 0
igst_total INTEGER NOT NULL DEFAULT 0
grand_total INTEGER NOT NULL
voucher_id UUID FOREIGN KEY → vouchers
created_by UUID FOREIGN KEY → users
created_at TIMESTAMP DEFAULT NOW()

TABLE: sales_return_items

id UUID PRIMARY KEY
sales_return_id UUID FOREIGN KEY → sales_returns
item_id UUID FOREIGN KEY → items
warehouse_id UUID FOREIGN KEY → warehouses
hsn_code VARCHAR(8) NOT NULL
quantity INTEGER NOT NULL
unit_price INTEGER NOT NULL
taxable_amount INTEGER NOT NULL
gst_rate INTEGER NOT NULL
cgst_amount INTEGER NOT NULL DEFAULT 0
sgst_amount INTEGER NOT NULL DEFAULT 0
igst_amount INTEGER NOT NULL DEFAULT 0
total_amount INTEGER NOT NULL
created_at TIMESTAMP DEFAULT NOW()

TABLE: audit_logs

id UUID PRIMARY KEY
user_id UUID FOREIGN KEY → users -- who did it
action VARCHAR(20) NOT NULL -- "CREATE", "UPDATE", "DELETE"
entity_type VARCHAR(50) NOT NULL -- "SALES_INVOICE", "CUSTOMER", "ITEM"
entity_id UUID NOT NULL -- which record was affected
old_value TEXT -- previous data (JSON)
new_value TEXT -- new data (JSON)
ip_address VARCHAR(45) -- where the request came from
created_at TIMESTAMP DEFAULT NOW()

TABLE: purchase_returns

id UUID PRIMARY KEY
return_number VARCHAR(50) NOT NULL UNIQUE
purchase_invoice_id UUID FOREIGN KEY → purchase_invoices
supplier_id UUID FOREIGN KEY → suppliers
return_date DATE NOT NULL
reason TEXT NOT NULL
financial_year_id UUID FOREIGN KEY → financial_years
total_amount INTEGER NOT NULL
cgst_total INTEGER NOT NULL DEFAULT 0
sgst_total INTEGER NOT NULL DEFAULT 0
igst_total INTEGER NOT NULL DEFAULT 0
grand_total INTEGER NOT NULL
voucher_id UUID FOREIGN KEY → vouchers
created_by UUID FOREIGN KEY → users
created_at TIMESTAMP DEFAULT NOW()

TABLE: purchase_return_items

id UUID PRIMARY KEY
purchase_return_id UUID FOREIGN KEY → purchase_returns
item_id UUID FOREIGN KEY → items
warehouse_id UUID FOREIGN KEY → warehouses
hsn_code VARCHAR(8) NOT NULL
quantity INTEGER NOT NULL
unit_price INTEGER NOT NULL
taxable_amount INTEGER NOT NULL
gst_rate INTEGER NOT NULL
cgst_amount INTEGER NOT NULL DEFAULT 0
sgst_amount INTEGER NOT NULL DEFAULT 0
igst_amount INTEGER NOT NULL DEFAULT 0
total_amount INTEGER NOT NULL
created_at TIMESTAMP DEFAULT NOW()

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
