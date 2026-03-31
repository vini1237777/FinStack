import { Router, Request, Response } from "express";
import { authService } from "./auth.service";

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  try {
    const user = await authService.register(req.body);
    res
      .status(201)
      .json({ data: user, message: "User registered successfully" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    res.status(200).json({ data: result, message: "Login successful" });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

export default router;
