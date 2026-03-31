import { useEffect, useState } from "react";
import { customersApi } from "../api/customers.api";
import DataTable from "../components/DataTable";

const columns = [
  { key: "name", label: "Name" },
  { key: "gstin", label: "GSTIN" },
  { key: "stateCode", label: "State" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
];

const emptyForm = { name: "", gstin: "", stateCode: "", email: "", phone: "" };

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchCustomers = async () => {
    const response = await customersApi.getAll();
    setCustomers(response.data.data);
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      const response = await customersApi.getAll();
      setCustomers(response.data.data);
    };
    fetchCustomers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    await customersApi.create(form);
    setForm(emptyForm);
    setIsCreating(false);
    fetchCustomers();
  };

  const createForm = (
    <tr className="bg-yellow-50">
      {Object.keys(emptyForm).map((key) => (
        <td key={key} className="px-4 py-3">
          <input
            name={key}
            value={form[key as keyof typeof form]}
            onChange={handleChange}
            placeholder={key}
            className="border p-1 w-full rounded"
          />
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
      title="Customers"
      columns={columns}
      data={customers}
      onCreate={() => setIsCreating(!isCreating)}
      onDelete={async (id) => {
        await customersApi.deleteOne(id);
        fetchCustomers();
      }}
      createForm={createForm}
      isCreating={isCreating}
    />
  );
};

export default Customers;
