/* eslint-disable react-refresh/only-export-components */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Items from "./pages/Items";
import SalesInvoices from "./pages/SalesInvoices";
import PurchaseInvoices from "./pages/PurchaseInvoices";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import Layout from "./pages/Layout";
import Features from "./pages/Features";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/items" element={<Items />} />
            <Route path="/sales" element={<SalesInvoices />} />
            <Route path="/purchase" element={<PurchaseInvoices />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/features" element={<Features />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
