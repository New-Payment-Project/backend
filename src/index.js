const express = require("express");
const connectDB = require("./config/database");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const {
  clickCompleteRoutes,
  clickPrepRoutes,
  invoiceOrdersRoutes,
  compareRoutes,
  courseRoutes,
  invoiceRoutes,
  counterRoutes,
  paymentRoutes,
  orderRoutes,
  authRoutes,
  transactionRoutes,
  uzumBankRoutes
} = require("./config/allRoutes");

dotenv.config();

connectDB();

const app = express();
app.use(cors({
  origin: ['http://localhost:3000', "https://test.paycom.uz", "https://", "https://norbekovgroup.vercel.app", "http://174.138.43.233:3000", "http://174.138.43.233:3001", "https://markaz.norbekovgroup.uz", "https://forum.norbekovgroup.uz", "https://billing.norbekovgroup.uz"],
  methods: 'GET,POST',
  allowedHeaders: 'Content-Type, Authorization',
  credentials: true,
}));
app.use(bodyParser.json());


app.use("/", paymentRoutes);
app.use("/api/v1/uzum-bank", uzumBankRoutes);
app.use("/api/v1", courseRoutes);
app.use("/api/v1", invoiceRoutes);
app.use("/api/v1", orderRoutes);
app.use("/api/v1/counter", counterRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/v1/compare", compareRoutes);
app.use("/api/v1", invoiceOrdersRoutes);
app.use("/api/v1/click", clickPrepRoutes);
app.use("/api/v1/click", clickCompleteRoutes)


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});