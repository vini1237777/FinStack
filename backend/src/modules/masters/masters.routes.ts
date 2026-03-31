import { Router, Request, Response } from "express";
import { customerService } from "./customer.service";
import { supplierService } from "./supplier.service";
import { itemService } from "./item.service";
import { authenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/rbac";
import { inventoryService } from "../inventory/inventory.service";
import prisma from "../../config/database";

const router = Router();

router.use(authenticate);

router.post("/customers", async (req: Request, res: Response) => {
  try {
    const customer = await customerService.create(req.body);
    res.status(201).json({ data: customer });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/customers", async (req: Request, res: Response) => {
  try {
    const customers = await customerService.getAll();
    res.json({ data: customers });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/customers/:id", async (req: Request, res: Response) => {
  try {
    const customer = await customerService.getById(
      Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
    );
    res.json({ data: customer });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.put("/customers/:id", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const customer = await customerService.update(id, req.body);
    res.json({ data: customer });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete(
  "/customers/:id",
  authorize("admin"),
  async (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      await customerService.delete(id);
      res.json({ message: "Customer deleted" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
);

router.post("/suppliers", async (req: Request, res: Response) => {
  try {
    const supplier = await supplierService.create(req.body);
    res.status(201).json({ data: supplier });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/suppliers", async (req: Request, res: Response) => {
  try {
    const suppliers = await supplierService.getAll();
    res.json({ data: suppliers });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/suppliers/:id", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const supplier = await supplierService.getById(id);
    res.json({ data: supplier });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});
router.put("/suppliers/:id", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const supplier = await supplierService.update(id, req.body);
    res.json({ data: supplier });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete(
  "/suppliers/:id",
  authorize("admin"),
  async (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      await supplierService.delete(id);
      res.json({ message: "Supplier deleted" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
);

router.post("/items", async (req: Request, res: Response) => {
  try {
    const item = await itemService.create(req.body);
    res.status(201).json({ data: item });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/items", async (req: Request, res: Response) => {
  try {
    const items = await itemService.getAll();
    res.json({ data: items });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/items/:id", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const item = await itemService.getById(id);
    res.json({ data: item });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.put("/items/:id", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const item = await itemService.update(id, req.body);
    res.json({ data: item });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete(
  "/items/:id",
  authorize("admin"),
  async (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      await itemService.delete(id);
      res.json({ message: "Item deleted" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
);

router.post("/stock-in", async (req: Request, res: Response) => {
  try {
    const movement = await inventoryService.stockIn(req.body);
    res.status(201).json({ data: movement });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/categories", async (req: Request, res: Response) => {
  try {
    const categories = await prisma.itemCategory.findMany();
    res.json({ data: categories });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/warehouses", async (req: Request, res: Response) => {
  try {
    const warehouses = await prisma.warehouse.findMany();
    res.json({ data: warehouses });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/financial-years", async (req: Request, res: Response) => {
  try {
    const years = await prisma.financialYear.findMany();
    res.json({ data: years });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
