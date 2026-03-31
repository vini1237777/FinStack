import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes";
import mastersRoutes from "./modules/masters/masters.routes";
import salesRoutes from "./modules/sales/sales.routes";
import purchaseRoutes from "./modules/purchase/purchase.routes";
import expenseRoutes from "./modules/expenses/expense.routes";
import reportsRoutes from "./modules/reports/reports.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: ["http://localhost:3000", "https://your-vercel-url.vercel.app"],
  }),
);
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/masters", mastersRoutes);
app.use("/sales", salesRoutes);
app.use("/purchase", purchaseRoutes);
app.use("/expenses", expenseRoutes);
app.use("/reports", reportsRoutes);

import path from "path";

app.use(express.static(path.join(__dirname, "../../frontend/dist")));
app.get("/{*path}", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
