import { useEffect, useState } from "react";
import { purchaseApi } from "../api/purchase.api";
import { suppliersApi } from "../api/suppliers.api";
import { itemsApi } from "../api/items.api";
import api from "../api/axios";

interface LineItem {
  itemId: string;
  quantity: number;
  unitPrice: number;
  hsnCode: string;
  warehouseId: string;
}

const emptyLineItem: LineItem = {
  itemId: "",
  quantity: 0,
  unitPrice: 0,
  hsnCode: "",
  warehouseId: "",
};

const PurchaseInvoices = () => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [financialYearId, setFinancialYearId] = useState("");

  const [supplierId, setSupplierId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { ...emptyLineItem },
  ]);

  const [invoices, setInvoices] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await suppliersApi.getAll();
        setSuppliers(res.data.data);
      } catch (e) {}
      try {
        const res = await itemsApi.getAll();
        setItems(res.data.data);
      } catch (e) {}
      try {
        const res = await api.get("/masters/warehouses");
        setWarehouses(res.data.data);
      } catch (e) {}
      try {
        const res = await api.get("/masters/financial-years");
        const active = res.data.data.find((fy: any) => fy.isActive);
        if (active) setFinancialYearId(active.id);
      } catch (e) {}
    };
    fetchData();
    const fetchInvoices = async () => {
      const res = await purchaseApi.getAll();
      setInvoices(res.data.data);
    };
    fetchInvoices();
  }, []);

  const handleItemSelect = (index: number, itemId: string) => {
    const selected = items.find((i: any) => i.id === itemId);
    if (selected) {
      updateLineItem(index, {
        itemId,
        hsnCode: selected.hsnCode,
        unitPrice: selected.costPrice,
      });
    }
  };

  const addLineItem = () => setLineItems([...lineItems, { ...emptyLineItem }]);
  const removeLineItem = (index: number) =>
    setLineItems(lineItems.filter((_, i) => i !== index));
  const updateLineItem = (index: number, updates: Partial<LineItem>) => {
    setLineItems(
      lineItems.map((item, i) =>
        i === index ? { ...item, ...updates } : item,
      ),
    );
  };
  const fetchInvoices = async () => {
    const res = await purchaseApi.getAll();
    setInvoices(res.data.data);
  };

  const handleSubmit = async () => {
    try {
      setError("");
      setSuccess("");
      await purchaseApi.create({
        supplierId,
        invoiceDate: new Date(invoiceDate).toISOString(),
        financialYearId,
        items: lineItems.map((li) => ({
          ...li,
          quantity: Number(li.quantity),
          unitPrice: Number(li.unitPrice),
        })),
      });
      setSuccess("Purchase Invoice created!");
      setSupplierId("");
      setInvoiceDate("");
      setLineItems([{ ...emptyLineItem }]);
      fetchInvoices();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create");
    }
  };

  const fmt = (paise: number) => `₹${(paise / 100).toLocaleString()}`;

  return (
    <div className="p-6">
      <h2 style={{ color: "black" }} className="text-2xl font-bold mb-4">
        Purchase Invoices
      </h2>

      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-500 mb-2">{success}</p>}

      <div className="bg-white p-4 rounded-lg border mb-6">
        <h3 className="text-lg font-semibold mb-3">Create Purchase Invoice</h3>

        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Supplier</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="border p-2 w-full rounded"
            >
              <option value="">Select Supplier</option>
              {suppliers.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.stateCode})
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">
              Invoice Date
            </label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="border p-2 w-full rounded"
            />
          </div>
        </div>

        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">Item</th>
              <th className="p-2">HSN</th>
              <th className="p-2">Warehouse</th>
              <th className="p-2">Qty</th>
              <th className="p-2">Unit Price (₹)</th>
              <th className="p-2">Total</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((li, index) => (
              <tr key={index} className="border-b">
                <td className="p-2">
                  <select
                    value={li.itemId}
                    onChange={(e) => handleItemSelect(index, e.target.value)}
                    className="border p-1 w-full rounded"
                  >
                    <option value="">Select</option>
                    {items.map((item: any) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-2">
                  <input
                    value={li.hsnCode}
                    readOnly
                    className="border p-1 w-full rounded bg-gray-50"
                  />
                </td>
                <td className="p-2">
                  <select
                    value={li.warehouseId}
                    onChange={(e) =>
                      updateLineItem(index, { warehouseId: e.target.value })
                    }
                    className="border p-1 w-full rounded"
                  >
                    <option value="">Select</option>
                    {warehouses.map((w: any) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={li.quantity}
                    onChange={(e) =>
                      updateLineItem(index, {
                        quantity: Number(e.target.value),
                      })
                    }
                    className="border p-1 w-20 rounded"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={li.unitPrice / 100}
                    onChange={(e) =>
                      updateLineItem(index, {
                        unitPrice: Number(e.target.value) * 100,
                      })
                    }
                    className="border p-1 w-28 rounded"
                  />
                </td>
                <td className="p-2 font-medium">
                  ₹{((li.quantity * li.unitPrice) / 100).toLocaleString()}
                </td>
                <td className="p-2">
                  {lineItems.length > 1 && (
                    <button
                      onClick={() => removeLineItem(index)}
                      className="text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between">
          <button
            onClick={addLineItem}
            className="text-blue-600 hover:underline"
          >
            + Add Item
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-950 text-white px-6 py-1 rounded"
          >
            Create Purchase Invoice
          </button>
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-3">Recent Purchase Invoices</h3>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-gray-800 text-white text-xs uppercase">
              <th className="px-4 py-3">Invoice #</th>
              <th className="px-4 py-3">Supplier</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">CGST</th>
              <th className="px-4 py-3">SGST</th>
              <th className="px-4 py-3">IGST</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv: any) => (
              <tr key={inv.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{inv.invoiceNumber}</td>
                <td className="px-4 py-3">{inv.supplier?.name}</td>
                <td className="px-4 py-3">
                  {new Date(inv.invoiceDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">{fmt(inv.totalAmount)}</td>
                <td className="px-4 py-3">{fmt(inv.cgstTotal)}</td>
                <td className="px-4 py-3">{fmt(inv.sgstTotal)}</td>
                <td className="px-4 py-3">{fmt(inv.igstTotal)}</td>
                <td className="px-4 py-3 font-bold">{fmt(inv.grandTotal)}</td>
                <td className="px-4 py-3">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                    {inv.status}
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

export default PurchaseInvoices;
