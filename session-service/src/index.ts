import express from "express";
import sessionRoute from "./routes/session.route";

const app = express();
const PORT =  3002;

app.use(express.json());
app.use("/api/v1/session", sessionRoute);

app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});