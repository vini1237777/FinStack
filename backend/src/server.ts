import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes";
import mastersRoutes from "./modules/masters/masters.routes";
import salesRoutes from "./modules/sales/sales.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "FinStack API running" });
});

app.use("/auth", authRoutes);
app.use("/masters", mastersRoutes);
app.use("/sales", salesRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
