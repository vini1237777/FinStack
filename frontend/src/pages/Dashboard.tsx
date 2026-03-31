import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { reportsApi } from "../api/reports.api";
import { salesApi } from "../api/sales.api";
import { purchaseApi } from "../api/purchase.api";
import api from "../api/axios";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalPurchases: 0,
    gstPayable: 0,
    trialBalanced: false,
    salesCount: 0,
    purchaseCount: 0,
    netProfit: 0,
    isProfit: false,
    recentSales: [] as any[],
    recentPurchases: [] as any[],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const fyRes = await api.get("/masters/financial-years");
        const activeFY = fyRes.data.data.find((fy: any) => fy.isActive);
        if (!activeFY) return;

        const [salesRes, purchaseRes, gstRes, trialRes, plRes] =
          await Promise.all([
            salesApi.getAll(),
            purchaseApi.getAll(),
            reportsApi.gstr3b(activeFY.id),
            reportsApi.trialBalance(activeFY.id),
            reportsApi.profitLoss(activeFY.id),
          ]);

        const salesData = salesRes.data.data;
        const purchaseData = purchaseRes.data.data;

        setStats({
          totalSales: salesData.reduce(
            (sum: number, inv: any) => sum + inv.grandTotal,
            0,
          ),
          totalPurchases: purchaseData.reduce(
            (sum: number, inv: any) => sum + inv.grandTotal,
            0,
          ),
          gstPayable: gstRes.data.data.netTaxLiability?.total || 0,
          trialBalanced: trialRes.data.data.isBalanced,
          salesCount: salesData.length,
          purchaseCount: purchaseData.length,
          netProfit: plRes.data.data.netProfit || 0,
          isProfit: plRes.data.data.isProfit,
          recentSales: salesData.slice(0, 5),
          recentPurchases: purchaseData.slice(0, 5),
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const fmt = (paise: number) => {
    const rupees = Math.abs(paise) / 100;
    const formatted = rupees.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${paise < 0 ? "-" : ""}₹${formatted}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-lg font-semibold" style={{ color: "black" }}>
          Overview
        </h2>
        <p className="text-sm text-slate-400">Financial Year 2025–26</p>
      </div>

      <div className="grid grid-cols-5 gap-px bg-slate-200 rounded-lg overflow-hidden mb-8 border border-slate-200">
        <div className="bg-white px-5 py-4">
          <p className="text-xs text-slate-400 mb-1">Revenue</p>
          <p className="text-lg font-semibold text-slate-800">
            {fmt(stats.totalSales)}
          </p>
          <p className="text-xs text-slate-400">{stats.salesCount} invoices</p>
        </div>
        <div className="bg-white px-5 py-4">
          <p className="text-xs text-slate-400 mb-1">Purchases</p>
          <p className="text-lg font-semibold text-slate-800">
            {fmt(stats.totalPurchases)}
          </p>
          <p className="text-xs text-slate-400">
            {stats.purchaseCount} invoices
          </p>
        </div>
        <div className="bg-white px-5 py-4">
          <p className="text-xs text-slate-400 mb-1">Net P&L</p>
          <p
            className={`text-lg font-semibold ${stats.isProfit ? "text-emerald-700" : "text-red-700"}`}
          >
            {fmt(stats.netProfit)}
          </p>
          <p className="text-xs text-slate-400">
            {stats.isProfit ? "Profit" : "Loss"}
          </p>
        </div>
        <div className="bg-white px-5 py-4">
          <p className="text-xs text-slate-400 mb-1">GST Liability</p>
          <p
            className={`text-lg font-semibold ${stats.gstPayable > 0 ? "text-amber-700" : "text-emerald-700"}`}
          >
            {fmt(stats.gstPayable)}
          </p>
          <p className="text-xs text-slate-400">
            {stats.gstPayable > 0 ? "Payable" : "ITC Credit"}
          </p>
        </div>
        <div className="bg-white px-5 py-4">
          <p className="text-xs text-slate-400 mb-1">Trial Balance</p>
          <p
            className={`text-lg font-semibold ${stats.trialBalanced ? "text-emerald-700" : "text-red-700"}`}
          >
            {stats.trialBalanced ? "Balanced" : "Error"}
          </p>
          <p className="text-xs text-slate-400">Double-entry audit</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3">
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="flex justify-between items-center px-5 py-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700">
                Recent Sales
              </h3>
              <button
                onClick={() => navigate("/sales")}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                View all
              </button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-slate-100">
                  <th className="text-left px-5 py-2 font-medium">Invoice</th>
                  <th className="text-left px-5 py-2 font-medium">Customer</th>
                  <th className="text-left px-5 py-2 font-medium">Date</th>
                  <th className="text-right px-5 py-2 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentSales.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-6 text-center text-slate-300 text-sm"
                    >
                      No sales recorded yet
                    </td>
                  </tr>
                )}
                {stats.recentSales.map((inv: any) => (
                  <tr
                    key={inv.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-5 py-3 font-medium text-slate-700">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {inv.customer?.name}
                    </td>
                    <td className="px-5 py-3 text-slate-400">
                      {new Date(inv.invoiceDate).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-slate-700">
                      {fmt(inv.grandTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 mt-4">
            <div className="flex justify-between items-center px-5 py-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700">
                Recent Purchases
              </h3>
              <button
                onClick={() => navigate("/purchase")}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                View all
              </button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-slate-100">
                  <th className="text-left px-5 py-2 font-medium">Invoice</th>
                  <th className="text-left px-5 py-2 font-medium">Supplier</th>
                  <th className="text-left px-5 py-2 font-medium">Date</th>
                  <th className="text-right px-5 py-2 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentPurchases.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-6 text-center text-slate-300 text-sm"
                    >
                      No purchases recorded yet
                    </td>
                  </tr>
                )}
                {stats.recentPurchases.map((inv: any) => (
                  <tr
                    key={inv.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-5 py-3 font-medium text-slate-700">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {inv.supplier?.name}
                    </td>
                    <td className="px-5 py-3 text-slate-400">
                      {new Date(inv.invoiceDate).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-slate-700">
                      {fmt(inv.grandTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-2 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              {[
                { path: "/sales", label: "Create Sales Invoice" },
                { path: "/purchase", label: "Record Purchase" },
                { path: "/expenses", label: "Record Expense" },
                { path: "/customers", label: "Add Customer" },
                { path: "/items", label: "Add Item" },
              ].map((a) => (
                <button
                  key={a.path}
                  onClick={() => navigate(a.path)}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-600 rounded-md border border-slate-150 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">
              Reports
            </h3>
            <div className="space-y-2">
              {[
                { label: "Trial Balance", tab: "trial-balance" },
                { label: "Profit & Loss", tab: "profit-loss" },
                { label: "GSTR-3B Summary", tab: "gstr3b" },
                { label: "Stock Summary", tab: "stock" },
              ].map((r) => (
                <button
                  key={r.tab}
                  onClick={() => navigate("/reports")}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-600 rounded-md border border-slate-150 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
