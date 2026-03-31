import { Router, Request, Response } from "express";
import { expenseService } from "./expense.service";
import { authenticate, AuthRequest } from "../../middleware/auth";

const router = Router();

router.use(authenticate);

router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const expense = await expenseService.create(req.body, req.user!.userId);
    res.status(201).json({ data: expense });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const expenses = await expenseService.getAll();
    res.json({ data: expenses });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const expense = await expenseService.getById(id);
    res.json({ data: expense });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

export default router;
