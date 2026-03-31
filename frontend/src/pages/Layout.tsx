import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = () => {
  const navigate = useNavigate();

  const { logout, user } = useAuth();

  return (
    <div className="flex h-screen ">
      <aside className="w-64 h-full flex-col bg-gray-800 text-white p-4 flex justify-between text-left">
        <div className="flex flex-col">
          <div className="w-full p-5"> Welcome {user?.name}!</div>
          <hr className="mb-5" />
          <div>
            <nav
              className="block py-2 px-4 rounded hover:bg-gray-700"
              onClick={() => navigate("/customers")}
            >
              Customers
            </nav>
            <nav
              className="block py-2 px-4 rounded hover:bg-gray-700"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </nav>
            <nav
              className="block py-2 px-4 rounded hover:bg-gray-700"
              onClick={() => navigate("/expenses")}
            >
              Expenses
            </nav>
            <nav
              className="block py-2 px-4 rounded hover:bg-gray-700"
              onClick={() => navigate("/items")}
            >
              Items
            </nav>
            <nav
              className="block py-2 px-4 rounded hover:bg-gray-700"
              onClick={() => navigate("/purchaseInvoices")}
            >
              Purchase Invoices
            </nav>
            <nav
              className="block py-2 px-4 rounded hover:bg-gray-700"
              onClick={() => navigate("/reports")}
            >
              Reports
            </nav>
            <nav
              className="block py-2 px-4 rounded hover:bg-gray-700"
              onClick={() => navigate("/salesInvoices")}
            >
              Sales Invoices
            </nav>
          </div>
        </div>
        <button onClick={() => logout()}>Logout</button>
      </aside>
      <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
