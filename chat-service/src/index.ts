
import express from "express";
import CHATROUTE from "./routes/chat.route"
const app = express();
const PORT =  3003;


app.use(express.json());
app.use("/api/v1/chat", CHATROUTE)

app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});