import { Router, Request, Response } from "express";
import { reportsService } from "./reports.service";
import { authenticate } from "../../middleware/auth";

const router = Router();

router.use(authenticate);

router.get(
  "/trial-balance/:financialYearId",
  async (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.financialYearId)
        ? req.params.financialYearId[0]
        : req.params.financialYearId;
      const report = await reportsService.trialBalance(id);
      res.json({ data: report });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.get(
  "/profit-loss/:financialYearId",
  async (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.financialYearId)
        ? req.params.financialYearId[0]
        : req.params.financialYearId;
      const report = await reportsService.profitAndLoss(id);
      res.json({ data: report });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.get("/gstr3b/:financialYearId", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.financialYearId)
      ? req.params.financialYearId[0]
      : req.params.financialYearId;
    const report = await reportsService.gstr3b(id);
    res.json({ data: report });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get(
  "/ledger/:accountId/:financialYearId",
  async (req: Request, res: Response) => {
    try {
      const accountId = Array.isArray(req.params.accountId)
        ? req.params.accountId[0]
        : req.params.accountId;
      const financialYearId = Array.isArray(req.params.financialYearId)
        ? req.params.financialYearId[0]
        : req.params.financialYearId;
      const report = await reportsService.ledgerStatement(
        accountId,
        financialYearId,
      );
      res.json({ data: report });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.get("/stock-summary", async (req: Request, res: Response) => {
  try {
    const report = await reportsService.stockSummary();
    res.json({ data: report });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
