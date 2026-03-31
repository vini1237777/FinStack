import { useEffect, useState } from "react";
import { reportsApi } from "../api/reports.api";
import api from "../api/axios";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("trial-balance");
  const [financialYearId, setFinancialYearId] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFY = async () => {
      const res = await api.get("/masters/financial-years");
      const active = res.data.data.find((fy: any) => fy.isActive);
      if (active) setFinancialYearId(active.id);
    };
    fetchFY();
  }, []);

  useEffect(() => {
    if (!financialYearId) return;

    const fetchReport = async () => {
      setLoading(true);
      try {
        let res;
        if (activeTab === "trial-balance")
          res = await reportsApi.trialBalance(financialYearId);
        else if (activeTab === "profit-loss")
          res = await reportsApi.profitLoss(financialYearId);
        else if (activeTab === "gstr3b")
          res = await reportsApi.gstr3b(financialYearId);
        else res = await reportsApi.stockSummary();
        setData(res.data.data);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };

    fetchReport();
  }, [activeTab, financialYearId]);

  const tabs = [
    { key: "trial-balance", label: "Trial Balance" },
    { key: "profit-loss", label: "Profit & Loss" },
    { key: "gstr3b", label: "GSTR-3B" },
    { key: "stock", label: "Stock Summary" },
  ];

  const handleTabChange = (tab: string) => {
    setData(null);
    setActiveTab(tab);
  };
  const fmt = (paise: number) => `₹${(paise / 100).toLocaleString()}`;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4" style={{ color: "black" }}>
        Reports
      </h2>
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-1 rounded ${activeTab === tab.key ? "bg-blue-950 text-white" : "bg-gray-200"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {loading && <p>Loading...</p>}
      {!loading && data && activeTab === "trial-balance" && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800 text-white text-xs uppercase">
                <th className="px-4 py-3 text-left">Account</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-right">Debit</th>
                <th className="px-4 py-3 text-right">Credit</th>
              </tr>
            </thead>
            <tbody>
              {data.entries?.map((row: any, i: number) => (
                <tr key={i} className="border-b hover:bg-gray-50 text-left">
                  <td className="px-4 py-3">{row.accountName}</td>
                  <td className="px-4 py-3">{row.accountType}</td>
                  <td className="px-4 py-3 text-right">
                    {row.totalDebit ? fmt(row.totalDebit) : "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {row.totalCredit ? fmt(row.totalCredit) : "-"}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="px-4 py-3" colSpan={2}>
                  Total
                </td>
                <td className="px-4 py-3 text-right">
                  {fmt(data.totals?.totalDebit || 0)}
                </td>
                <td className="px-4 py-3 text-right">
                  {fmt(data.totals?.totalCredit || 0)}
                </td>
              </tr>
              <tr className={data.isBalanced ? "bg-green-50" : "bg-red-50"}>
                <td className="px-4 py-3 font-bold" colSpan={4}>
                  {data.isBalanced
                    ? "✓ Trial Balance is Balanced"
                    : "✗ Trial Balance is NOT Balanced"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {!loading && data && activeTab === "profit-loss" && (
        <div className="grid grid-cols-2 gap-6">
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-green-700 text-white px-4 py-0.5 font-semibold">
              Income
            </div>
            {data.income?.map((row: any, i: number) => (
              <div key={i} className="flex justify-between px-4 py-1 border-b">
                <span>{row.name}</span>
                <span>{fmt(row.amount)}</span>
              </div>
            ))}
            <div className="flex justify-between px-4 py-0.5 font-bold bg-green-50">
              <span>Total Income</span>
              <span>{fmt(data.totalIncome || 0)}</span>
            </div>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-red-700 text-white px-4 py-1 font-semibold">
              Expenses
            </div>
            {data.expenses?.map((row: any, i: number) => (
              <div key={i} className="flex justify-between px-4 py-2 border-b">
                <span>{row.name}</span>
                <span>{fmt(row.amount)}</span>
              </div>
            ))}
            <div className="flex justify-between px-4 py-1 font-bold bg-red-50">
              <span>Total Expenses</span>
              <span>{fmt(data.totalExpenses || 0)}</span>
            </div>
          </div>
          <div
            className={`col-span-2 p-1 py-0.5 rounded-lg text-center text-xl font-bold ${data.isProfit ? "bg-green-100" : "bg-red-100"}`}
          >
            {data.isProfit ? "Net Profit" : "Net Loss"}:{" "}
            {fmt(Math.abs(data.netProfit || 0))}
          </div>
        </div>
      )}
      {!loading && data && activeTab === "gstr3b" && (
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-blue-700 text-white px-4 py-0.5 font-semibold">
              Output Tax (Collected on Sales)
            </div>
            <div className="grid grid-cols-4 gap-4 p-4">
              <div>
                <span className="text-sm text-gray-500">Taxable Value</span>
                <p className="font-bold">
                  {fmt(data.outputTax?.taxableValue || 0)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">CGST</span>
                <p className="font-bold">{fmt(data.outputTax?.cgst || 0)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">SGST</span>
                <p className="font-bold">{fmt(data.outputTax?.sgst || 0)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">IGST</span>
                <p className="font-bold">{fmt(data.outputTax?.igst || 0)}</p>
              </div>
            </div>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-green-700 text-white px-4 py-0.5 font-semibold">
              Input Tax Credit (Paid on Purchases + Expenses)
            </div>
            <div className="grid grid-cols-4 gap-4 p-4">
              <div>
                <span className="text-sm text-gray-500">Total ITC</span>
                <p className="font-bold">
                  {fmt(data.inputTaxCredit?.total || 0)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">CGST</span>
                <p className="font-bold">
                  {fmt(data.inputTaxCredit?.totalCGST || 0)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">SGST</span>
                <p className="font-bold">
                  {fmt(data.inputTaxCredit?.totalSGST || 0)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">IGST</span>
                <p className="font-bold">
                  {fmt(data.inputTaxCredit?.totalIGST || 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-orange-600 text-white px-4 py-0.5 font-semibold">
              Net Tax Liability
            </div>
            <div className="grid grid-cols-4 gap-4 p-4">
              <div>
                <span className="text-sm text-gray-500">Net Payable</span>
                <p className="font-bold text-lg">
                  {fmt(data.netTaxLiability?.total || 0)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">CGST</span>
                <p className="font-bold">
                  {fmt(data.netTaxLiability?.cgst || 0)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">SGST</span>
                <p className="font-bold">
                  {fmt(data.netTaxLiability?.sgst || 0)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">IGST</span>
                <p className="font-bold">
                  {fmt(data.netTaxLiability?.igst || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {!loading && data && activeTab === "stock" && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800 text-white text-xs uppercase">
                <th className="px-4 py-3 text-left">Item</th>
                <th className="px-4 py-3 text-left">Warehouse</th>
                <th className="px-4 py-3 text-right">Stock In</th>
                <th className="px-4 py-3 text-right">Stock Out</th>
                <th className="px-4 py-3 text-right">Current Stock</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((row: any, i: number) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{row.item}</td>
                  <td className="px-4 py-3">{row.warehouse}</td>
                  <td className="px-4 py-3 text-right text-green-600">
                    {row.totalIn}
                  </td>
                  <td className="px-4 py-3 text-right text-red-600">
                    {row.totalOut}
                  </td>
                  <td className="px-4 py-3 text-right font-bold">
                    {row.currentStock}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Reports;
