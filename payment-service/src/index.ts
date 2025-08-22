import express from "express";
import paymentRoute from "./routes/payment.route";
const app = express();
const PORT =  3004;

app.use(express.json());
app.use("/api/v1/payment", paymentRoute);

app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});