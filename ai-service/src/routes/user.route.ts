import { Router } from "express";
import { connectDB } from "../config/mongodb";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const db = await connectDB();
    const users = await db.collection("users").find().toArray();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "DB Error" });
  }
});

export default router;
