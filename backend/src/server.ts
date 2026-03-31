import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes";
import mastersRoutes from "./modules/masters/masters.routes";
import salesRoutes from "./modules/sales/sales.routes";
import purchaseRoutes from "./modules/purchase/purchase.routes";
import expenseRoutes from "./modules/expenses/expense.routes";
import reportsRoutes from "./modules/reports/reports.routes";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: ["http://localhost:3000"],
  }),
);
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/masters", mastersRoutes);
app.use("/sales", salesRoutes);
app.use("/purchase", purchaseRoutes);
app.use("/expenses", expenseRoutes);
app.use("/reports", reportsRoutes);

app.use(express.static(path.join(process.cwd(), "public")));
app.get("/{*path}", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
