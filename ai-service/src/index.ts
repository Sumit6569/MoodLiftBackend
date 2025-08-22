
import express from "express";
import AIROUTE from "./routes/ai.route"
const app = express();
const PORT =  3005;

app.use(express.json());
app.use('/api/v1/a1', AIROUTE)

app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});