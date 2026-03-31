import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const fy = await prisma.financialYear.upsert({
    where: { name: "2025-26" },
    update: {},
    create: {
      name: "2025-26",
      startDate: new Date("2025-04-01"),
      endDate: new Date("2026-03-31"),
      isActive: true,
    },
  });
  console.log("Financial Year created:", fy.name);

  const accounts = [
    {
      name: "Sales Revenue",
      code: "REV-001",
      accountType: "INCOME",
      accountGroup: "Direct Income",
      isSystem: true,
    },
    {
      name: "Purchase Account",
      code: "EXP-001",
      accountType: "EXPENSE",
      accountGroup: "Direct Expense",
      isSystem: true,
    },
    {
      name: "CGST Input Credit",
      code: "AST-001",
      accountType: "ASSET",
      accountGroup: "Current Assets",
      isSystem: true,
    },
    {
      name: "SGST Input Credit",
      code: "AST-002",
      accountType: "ASSET",
      accountGroup: "Current Assets",
      isSystem: true,
    },
    {
      name: "IGST Input Credit",
      code: "AST-003",
      accountType: "ASSET",
      accountGroup: "Current Assets",
      isSystem: true,
    },
    {
      name: "CGST Payable",
      code: "LIA-001",
      accountType: "LIABILITY",
      accountGroup: "Current Liabilities",
      isSystem: true,
    },
    {
      name: "SGST Payable",
      code: "LIA-002",
      accountType: "LIABILITY",
      accountGroup: "Current Liabilities",
      isSystem: true,
    },
    {
      name: "IGST Payable",
      code: "LIA-003",
      accountType: "LIABILITY",
      accountGroup: "Current Liabilities",
      isSystem: true,
    },
    {
      name: "Accounts Receivable",
      code: "AST-004",
      accountType: "ASSET",
      accountGroup: "Current Assets",
      isSystem: true,
    },
    {
      name: "Accounts Payable",
      code: "LIA-004",
      accountType: "LIABILITY",
      accountGroup: "Current Liabilities",
      isSystem: true,
    },
    {
      name: "Bank Account",
      code: "AST-005",
      accountType: "ASSET",
      accountGroup: "Current Assets",
      isSystem: true,
    },
    {
      name: "Cash Account",
      code: "AST-006",
      accountType: "ASSET",
      accountGroup: "Current Assets",
      isSystem: true,
    },
    {
      name: "Sales Return",
      code: "EXP-002",
      accountType: "EXPENSE",
      accountGroup: "Direct Expense",
      isSystem: true,
    },
    {
      name: "Purchase Return",
      code: "REV-002",
      accountType: "INCOME",
      accountGroup: "Direct Income",
      isSystem: true,
    },
  ];

  for (const account of accounts) {
    await prisma.ledgerAccount.upsert({
      where: { code: account.code },
      update: {},
      create: account,
    });
  }
  console.log("Ledger Accounts created:", accounts.length);

  const hsnCodes = [
    {
      code: "8471",
      description: "Computers & Laptops",
      gstRate: 18,
      type: "HSN",
    },
    {
      code: "6109",
      description: "T-shirts & Clothing",
      gstRate: 5,
      type: "HSN",
    },
    { code: "0401", description: "Milk & Dairy", gstRate: 0, type: "HSN" },
    { code: "8517", description: "Mobile Phones", gstRate: 12, type: "HSN" },
    { code: "9954", description: "IT Services", gstRate: 18, type: "SAC" },
    { code: "3304", description: "Cosmetics", gstRate: 28, type: "HSN" },
  ];

  for (const hsn of hsnCodes) {
    await prisma.hsnSacCode.upsert({
      where: { code: hsn.code },
      update: {},
      create: hsn,
    });
  }
  console.log("HSN/SAC Codes created:", hsnCodes.length);

  await prisma.warehouse.upsert({
    where: { name: "Main Warehouse" },
    update: {},
    create: {
      name: "Main Warehouse",
      description: "Primary storage facility",
      location: "Mumbai",
    },
  });
  console.log("Warehouse created");

  await prisma.itemCategory.upsert({
    where: { name: "Electronics" },
    update: {},
    create: { name: "Electronics", description: "Electronic items" },
  });
  await prisma.itemCategory.upsert({
    where: { name: "Clothing" },
    update: {},
    create: { name: "Clothing", description: "Clothing items" },
  });
  console.log("Item Categories created");

  console.log("\nSeed completed successfully!");

  await prisma.supplier.upsert({
    where: { gstin: "06AABCD1234E1Z5" },
    update: {},
    create: {
      name: "Dell India",
      gstin: "06AABCD1234E1Z5",
      stateCode: "GJ",
      email: "sales@dell.in",
    },
  });
  await prisma.supplier.upsert({
    where: { gstin: "27AABCS5678F1ZM" },
    update: {},
    create: {
      name: "HP India",
      gstin: "27AABCS5678F1ZM",
      stateCode: "MH",
      email: "sales@hp.in",
    },
  });

  await prisma.customer.upsert({
    where: { gstin: "27AABCR1718E1ZM" },
    update: {},
    create: {
      name: "Reliance Industries",
      gstin: "27AABCR1718E1ZM",
      stateCode: "MH",
      email: "info@reliance.com",
    },
  });
  await prisma.customer.upsert({
    where: { gstin: "29AABCI1234F1Z5" },
    update: {},
    create: {
      name: "Infosys",
      gstin: "29AABCI1234F1Z5",
      stateCode: "KA",
      email: "info@infosys.com",
    },
  });
  console.log("Customers created");

  const electronicsCategory = await prisma.itemCategory.findFirst({
    where: { name: "Electronics" },
  });
  if (electronicsCategory) {
    await prisma.item.upsert({
      where: { id: "default-laptop" },
      update: {},
      create: {
        name: "Laptop",
        hsnCode: "8471",
        categoryId: electronicsCategory.id,
        unit: "pieces",
        costPrice: 5000000,
        sellingPrice: 7000000,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
