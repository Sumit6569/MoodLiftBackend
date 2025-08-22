import express from "express";
const app = express();
const PORT =  3006;
import FEEDBACKROUTE from "./routes/feedback.route"

app.use(express.json());
app.use("/api/v1/feedback", FEEDBACKROUTE)

app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});