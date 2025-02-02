const path = require("path");
const express = require("express");
const connectDB = require("./config/database");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const { globalLimiter } = require("./services/requestRateLimiter");
const authMiddleware = require("./middlware/auth");
const uzumAuthMiddleware = require("./middlware/uzumAuthMiddleware");
const pdfGenerateRoute = require("./routes/pdfGenerateRoute");
require("./cronJobs");

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
  generateClickUrl,
  exportToExcel,
  sendEmailRoutes,
} = require("./config/allRoutes");

dotenv.config();

connectDB();

const app = express();
app.use(globalLimiter);

app.use(
  cors({
    origin: [
      // Server domains and IP
      "https://dma.com.uz",
      "https://api.dma.com.uz",
      "https://forum.dma.com.uz",
      "https://markaz.dma.com.uz",
      "https://billing.dma.com.uz",

      // Banks
      "https://test.paycom.uz",
      "https://217.29.119.130",
      "https://217.29.119.131",
      "https://217.29.119.132",
      "https://217.29.119.133",
      "https://217.12.88.66",

      // Test environments
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
  })
);
app.options("*", cors());

app.set("trust proxy", 1);
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: false })); //true

app.use("/", paymentRoutes);
app.use("/", generateClickUrl);
app.use("/api/v1/uzum-bank", uzumAuthMiddleware, uzumBankRoutes);
app.use("/api/v1/courses", authMiddleware, courseRoutes);
app.use("/api/v1/invoices", authMiddleware, invoiceRoutes);
app.use("/api/v1/orders", authMiddleware, orderRoutes);
app.use("/api/v1/counter", counterRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/v1/compare", compareRoutes);
app.use("/api/v1", invoiceOrdersRoutes);
app.use("/api/v1/click", clickPrepRoutes);
app.use("/api/v1/click", clickCompleteRoutes);
app.use("/api/v1", pdfGenerateRoute);
// app.use("/api/v1", sendEmailRoutes);
app.use("/api/v1/export", exportToExcel);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
