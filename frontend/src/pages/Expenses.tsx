import { useEffect, useState } from "react";
import { expensesApi } from "../api/expenses.api";
import api from "../api/axios";

const Expenses = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [financialYearId, setFinancialYearId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    expenseHead: "",
    date: "",
    hsnSacCode: "",
    amount: "",
    paymentMode: "BANK",
    narration: "",
    vendorState: "MH",
  });

  useEffect(() => {
    const fetchFY = async () => {
      try {
        const res = await api.get("/masters/financial-years");
        const active = res.data.data.find((fy: any) => fy.isActive);
        if (active) setFinancialYearId(active.id);
      } catch (e) {}
    };
    fetchFY();
    const fetchExpenses = async () => {
      const res = await expensesApi.getAll();
      setExpenses(res.data.data);
    };
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    const res = await expensesApi.getAll();
    setExpenses(res.data.data);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      setError("");
      setSuccess("");
      await expensesApi.create({
        ...form,
        amount: Number(form.amount) * 100,
        date: new Date(form.date).toISOString(),
        financialYearId,
      });
      setSuccess("Expense recorded!");
      setForm({
        expenseHead: "",
        date: "",
        hsnSacCode: "",
        amount: "",
        paymentMode: "BANK",
        narration: "",
        vendorState: "MH",
      });
      setIsCreating(false);
      fetchExpenses();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create");
    }
  };

  const fmt = (paise: number) => `₹${(paise / 100).toLocaleString()}`;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Expenses</h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-blue-950 text-white px-4 py-1 rounded"
        >
          {isCreating ? "Cancel" : "Add Expense"}
        </button>
      </div>

      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-500 mb-2">{success}</p>}

      {isCreating && (
        <div className="bg-white p-4 rounded-lg border mb-6">
          <h3 className="text-lg font-semibold mb-3">Record Expense</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Expense Head
              </label>
              <input
                name="expenseHead"
                value={form.expenseHead}
                onChange={handleChange}
                placeholder="e.g. Internet, Rent, Travel"
                className="border p-2 w-full rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Amount (₹)
              </label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="5000"
                className="border p-2 w-full rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                HSN/SAC Code (optional)
              </label>
              <input
                name="hsnSacCode"
                value={form.hsnSacCode}
                onChange={handleChange}
                placeholder="9954"
                className="border p-2 w-full rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Payment Mode
              </label>
              <select
                name="paymentMode"
                value={form.paymentMode}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              >
                <option value="BANK">Bank</option>
                <option value="CASH">Cash</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Vendor State
              </label>
              <input
                name="vendorState"
                value={form.vendorState}
                onChange={handleChange}
                placeholder="MH"
                className="border p-2 w-full rounded"
              />
            </div>
            <div className="col-span-3">
              <label className="block text-sm font-medium mb-1">
                Narration
              </label>
              <input
                name="narration"
                value={form.narration}
                onChange={handleChange}
                placeholder="March internet bill"
                className="border p-2 w-full rounded"
              />
            </div>
          </div>
          <button
            onClick={handleSubmit}
            className="bg-blue-950 text-white px-6 py-2 rounded"
          >
            Record Expense
          </button>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-gray-800 text-white text-xs uppercase">
              <th className="px-4 py-3">Expense Head</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">CGST</th>
              <th className="px-4 py-3">SGST</th>
              <th className="px-4 py-3">IGST</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Mode</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp: any) => (
              <tr key={exp.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{exp.expenseHead}</td>
                <td className="px-4 py-3">
                  {new Date(exp.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">{fmt(exp.amount)}</td>
                <td className="px-4 py-3">{fmt(exp.cgstAmount)}</td>
                <td className="px-4 py-3">{fmt(exp.sgstAmount)}</td>
                <td className="px-4 py-3">{fmt(exp.igstAmount)}</td>
                <td className="px-4 py-3 font-bold">{fmt(exp.totalAmount)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${exp.paymentMode === "BANK" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}`}
                  >
                    {exp.paymentMode}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Expenses;
