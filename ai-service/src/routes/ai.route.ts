
import { Router, Request, Response } from "express";

const router = Router();

router.post("/predict", (req: Request, res: Response) => {
  res.json({ message: "AI prediction result", input: req.body });
});

export default router;