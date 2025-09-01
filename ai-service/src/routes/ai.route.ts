import { Router } from "express";
import { connectDB } from "../config/mongodb";

const router = Router();

router.post("/predict", async (req, res) => {
  try {
    const db = await connectDB();
    const collection = db.collection("predictions");

    const result = await collection.insertOne({
      input: req.body,
      createdAt: new Date(),
    });

    res.json({
      message: "AI prediction result (stub)",
      input: req.body,
      id: result.insertedId,
    });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/test-db", async (_req, res) => {
  try {
    const db = await connectDB();
    const testCollection = db.collection("test");

    const doc = { message: "Hello MongoDB!", createdAt: new Date() };
    await testCollection.insertOne(doc);

    const allDocs = await testCollection.find().toArray();
    res.json(allDocs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database test failed" });
  }
});

export default router;
