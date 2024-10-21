const express = require("express");
const connectDB = require("./config/database");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const authMiddleware = require("./middlware/auth");
const { globalLimiter } = require("./services/requestRateLimiter");
const uzumAuthMiddleware = require("./middlware/uzumAuthMiddleware");
const pdfGenerateRoute = require("./routes/pdfGenerateRoute");

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
  uzumBankRoutes,
} = require("./config/allRoutes");

dotenv.config();

connectDB();
const app = express();

app.use(globalLimiter);
app.use(
  cors({
    origin: [
      // Server domains and ip
      "https://billing.norbekovgroup.uz",
      "https://markaz.norbekovgroup.uz",
      "https://forum.norbekovgroup.uz",
      "http://174.138.43.233:3000",
      "http://174.138.43.233:3001",

      // Banks
      "https://test.paycom.uz",
      "https://217.29.119.130",
      "https://217.29.119.131",
      "https://217.29.119.132",
      "https://217.29.119.133",
      "https://217.12.88.66",

      // Test
      "http://localhost:3000",
      "http://localhost:3001",
      "https://norbekovgroup.vercel.app",
    ],
    methods: "GET, POST, PUT, DELETE, PATCH",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use("/", paymentRoutes);
app.use("/api/v1/uzum-bank", uzumAuthMiddleware, uzumBankRoutes);
app.use("/api/v1", courseRoutes);
app.use("/api/v1", invoiceRoutes);
app.use("/api/v1", orderRoutes);
app.use("/api/v1/counter", counterRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/v1/compare", compareRoutes);
app.use("/api/v1", invoiceOrdersRoutes);
app.use("/api/v1/click", clickPrepRoutes);
app.use("/api/v1/click", clickCompleteRoutes);
app.use("/api/v1", pdfGenerateRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
