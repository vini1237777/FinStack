interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  title: string;
  columns: Column[];
  data: any[];
  onCreate: () => void;
  onDelete?: (id: string) => void;
  createForm?: React.ReactNode;
  isCreating: boolean;
}

const DataTable = ({
  title,
  columns,
  data,
  onCreate,
  onDelete,
  createForm,
  isCreating,
}: DataTableProps) => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold" style={{ color: "black" }}>
          {title}
        </h2>
        <button
          onClick={onCreate}
          className="bg-blue-950 text-white px-4 py-2 rounded"
        >
          {isCreating ? "Cancel" : `Add ${title}`}
        </button>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-gray-800 text-white text-xs uppercase">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3">
                  {col.label}
                </th>
              ))}
              {onDelete && <th className="px-4 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {isCreating && createForm}
            {data.map((row) => (
              <tr key={row.id} className="border-b hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    {col.render
                      ? col.render(row[col.key], row)
                      : row[col.key] || "-"}
                  </td>
                ))}
                {onDelete && (
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onDelete(row.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
