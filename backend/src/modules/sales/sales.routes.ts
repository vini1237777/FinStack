import { Router, Request, Response } from "express";
import { salesService } from "./sales.service";
import { authenticate, AuthRequest } from "../../middleware/auth";

const router = Router();

router.use(authenticate);

router.post("/invoices", async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await salesService.createInvoice(
      req.body,
      req.user!.userId,
    );
    res.status(201).json({ data: invoice });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/invoices", async (req: Request, res: Response) => {
  try {
    const invoices = await salesService.getAll();
    res.json({ data: invoices });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/invoices/:id", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const invoice = await salesService.getById(id);
    res.json({ data: invoice });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

export default router;
