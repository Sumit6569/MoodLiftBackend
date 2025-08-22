import express from "express";
import userRoute from "./routes/user.route"
const app = express();
const PORT =  3001;

app.use(express.json());
app.use("/api/v1/user", userRoute);

app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});