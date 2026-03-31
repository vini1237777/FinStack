const Features = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-sm uppercase tracking-widest text-slate-500 mb-6">
          How It Works
        </h2>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="grid grid-cols-5 gap-4 text-center text-sm">
            {[
              {
                step: "1",
                title: "Create Invoice",
                desc: "Select customer and add line items",
              },
              {
                step: "2",
                title: "GST Auto-Calculates",
                desc: "CGST/SGST or IGST based on state",
              },
              {
                step: "3",
                title: "Stock Updates",
                desc: "Inventory adjusts automatically",
              },
              {
                step: "4",
                title: "Ledger Posts",
                desc: "Double-entry entries created",
              },
              {
                step: "5",
                title: "Reports Ready",
                desc: "Trial Balance, P&L, GSTR-3B",
              },
            ].map((s) => (
              <div key={s.step}>
                <div className="w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold">
                  {s.step}
                </div>
                <p className="font-medium text-white">{s.title}</p>
                <p className="text-slate-400 text-xs mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-sm uppercase tracking-widest text-slate-500 mb-6">
          Core Features
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              title: "Double-Entry Accounting Engine",
              desc: "Every transaction creates balanced debit/credit entries. The engine validates that total debits equal total credits before saving. If they don't balance, the transaction is rejected with no partial data.",
              tag: "Architecture",
            },
            {
              title: "Automated GST Calculation",
              desc: "System checks seller and buyer states automatically. Same state → CGST + SGST (split 50/50). Different state → IGST. Rates pulled from HSN/SAC master table.",
              tag: "Compliance",
            },
            {
              title: "Real-Time Inventory",
              desc: "Stock updates on every transaction. Sales reduce stock, purchases add stock, returns reverse. System blocks sales if insufficient stock in the selected warehouse.",
              tag: "Inventory",
            },
            {
              title: "Atomic Transactions",
              desc: "Invoice creation, stock update, and ledger posting happen inside a single database transaction. If any step fails, everything rolls back. No half-saved data.",
              tag: "Reliability",
            },
            {
              title: "Financial Reports",
              desc: "Trial Balance verifies accounting integrity. P&L shows business performance. GSTR-3B calculates net tax liability with input tax credit. All generated in real-time from ledger data.",
              tag: "Reports",
            },
            {
              title: "Role-Based Access Control",
              desc: "JWT authentication with role-based middleware. Admin, Accountant, Sales Executive, Purchase Executive — each role sees only what they need. Delete operations restricted to admin.",
              tag: "Security",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-slate-800/50 border border-slate-700 rounded-xl p-5"
            >
              <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-medium">
                {f.tag}
              </span>
              <h3 className="text-base font-semibold text-white mt-2">
                {f.title}
              </h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-sm uppercase tracking-widest text-slate-500 mb-6">
          Tech Stack
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              label: "Frontend",
              items: "React 19, TypeScript, Tailwind CSS, Vite",
            },
            {
              label: "Backend",
              items: "Node.js, Express, TypeScript, Prisma ORM",
            },
            {
              label: "Database",
              items: "PostgreSQL 16 — 22 tables, relational integrity",
            },
            {
              label: "Infrastructure",
              items: "Railway (API + DB), Vercel (frontend), JWT auth",
            },
          ].map((t, i) => (
            <div
              key={i}
              className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
            >
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                {t.label}
              </p>
              <p className="text-sm text-slate-300 mt-2">{t.items}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-sm uppercase tracking-widest text-slate-500 mb-6">
          Architecture
        </h2>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <pre className="text-sm text-slate-300 font-mono text-center leading-relaxed">
            {`READ-ONLY LAYER          Ledger  │  Reports  │  P&L
                                ▼          ▼         ▼
  TRANSACTION LAYER        Purchase │   Sales   │ Expenses
                                ▼          ▼         ▼
  FOUNDATION LAYER         Accounting │ Inventory │   GST
                             Engine   │  Service  │  Calc`}
          </pre>
          <p className="text-xs text-slate-500 text-center mt-4">
            Each layer only calls the layer below. No circular dependencies.
            Foundation has zero dependencies.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-sm uppercase tracking-widest text-slate-500 mb-6">
          Performance & Security
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              title: "Integer Arithmetic",
              desc: "All amounts stored in paise (not rupees) to avoid floating-point precision errors. ₹500.50 is stored as 50050.",
            },
            {
              title: "Database Transactions",
              desc: "Prisma $transaction ensures atomicity. Invoice + stock + ledger — all succeed or all fail together.",
            },
            {
              title: "Password Hashing",
              desc: "bcrypt with salt rounds of 10. Plain text passwords never stored.",
            },
            {
              title: "JWT with Expiry",
              desc: "Tokens expire in 24 hours. Role embedded in token for middleware-level access control.",
            },
            {
              title: "Input Validation",
              desc: "HSN codes validated before invoice creation. Stock levels checked before sales. Debit=credit enforced before saving.",
            },
            {
              title: "Foreign Key Integrity",
              desc: "PostgreSQL enforces referential integrity. Cannot delete customers with linked invoices.",
            },
          ].map((o, i) => (
            <div
              key={i}
              className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
            >
              <h3 className="text-sm font-semibold text-white">{o.title}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {o.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
