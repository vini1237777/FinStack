import { useEffect, useState } from "react";
import { itemsApi } from "../api/items.api";
import DataTable from "../components/DataTable";

const columns = [
  { key: "name", label: "Name" },
  { key: "hsnCode", label: "HSN Code" },
  { key: "categoryId", label: "Category ID" },
  { key: "unit", label: "Unit" },
  {
    key: "costPrice",
    label: "Cost Price",
    render: (val: number) => `₹${val / 100}`,
  },
  {
    key: "sellingPrice",
    label: "Selling Price",
    render: (val: number) => `₹${val / 100}`,
  },
];

const emptyForm = {
  name: "",
  hsnCode: "",
  categoryId: "",
  unit: "",
  costPrice: "",
  sellingPrice: "",
};

const Items = () => {
  const [items, setItems] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await itemsApi.getCategories();
      setCategories(response.data.data);
    };

    const fetchItems = async () => {
      const response = await itemsApi.getAll();
      setItems(response.data.data);
    };
    fetchItems();
    fetchCategories();
  }, []);

  const fetchItems = async () => {
    const response = await itemsApi.getAll();
    setItems(response.data.data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    await itemsApi.create({
      ...form,
      costPrice: Number(form.costPrice) * 100,
      sellingPrice: Number(form.sellingPrice) * 100,
    });
    setForm(emptyForm);
    setIsCreating(false);
    fetchItems();
  };

  const createForm = (
    <tr className="bg-yellow-50">
      {Object.keys(emptyForm).map((key) => (
        <td key={key} className="px-4 py-3">
          {key === "categoryId" ? (
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="border p-1 w-full rounded"
            >
              <option value="">Select Category</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              name={key}
              value={form[key as keyof typeof form]}
              onChange={handleChange}
              placeholder={key}
              className="border p-1 w-full rounded"
            />
          )}
        </td>
      ))}
      <td className="px-4 py-3">
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-3 py-1 rounded"
        >
          Save
        </button>
      </td>
    </tr>
  );

  return (
    <DataTable
      title="Items"
      columns={columns}
      data={items}
      onCreate={() => setIsCreating(!isCreating)}
      onDelete={async (id) => {
        await itemsApi.deleteOne(id);
        fetchItems();
      }}
      createForm={createForm}
      isCreating={isCreating}
    />
  );
};

export default Items;
