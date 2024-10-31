const express = require("express");
const router = express.Router();
const {
  getOrders,
  getOrderById,
  createOrder,
} = require("../controllers/orderController");

router.get("/", getOrders);
router.get("/:id", getOrderById);
router.post("/create", createOrder);

module.exports = router;