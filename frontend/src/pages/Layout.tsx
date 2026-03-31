import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const navItems = [
  { path: "/features", label: "Features", icon: "" },
  { path: "/dashboard", label: "Dashboard", icon: "" },
  { path: "/customers", label: "Customers", icon: "" },
  { path: "/items", label: "Items", icon: "" },
  { path: "/sales", label: "Sales", icon: "" },
  { path: "/purchase", label: "Purchases", icon: "" },
  { path: "/expenses", label: "Expenses", icon: "" },
  { path: "/reports", label: "Reports", icon: "" },
];

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="px-6 py-5 border-b border-slate-700">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-emerald-400">Fin</span>Stack
          </h1>
          <p className="text-xs text-slate-400 mt-1">ERP Accounting System</p>
        </div>

        <div className="px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200
                  ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-400 font-medium"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-100 px-3 py-3">
          <a
            href="https://github.com/vini1237777/FinStack"
            target="_blank"
            className="block px-3 py-2 rounded-md text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          >
            GitHub Repo ↗
          </a>
        </div>

        <div className="px-3 py-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-red-500/20 hover:text-red-400 w-full transition-all duration-200"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center sticky top-0 z-10">
          <h2
            className="text-sm font-medium text-slate-500"
            style={{ color: "black" }}
          >
            {navItems.find((item) => item.path === location.pathname)?.label ||
              "FinStack"}
          </h2>
          <div className="text-xs text-slate-400">FY 2025-26</div>
        </div>

        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
