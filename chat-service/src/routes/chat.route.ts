
import { Router, Request, Response } from "express";

const router = Router();

// Get all chats
router.get("/", (req: Request, res: Response) => {
  res.json({ message: "Get all chats" });
});


export default router;