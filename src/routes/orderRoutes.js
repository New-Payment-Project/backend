const express = require("express");
const router = express.Router();
const {
  getOrders,
  getOrderById,
  createOrder,
  deleteOrder,
  updateOrderStatus,
} = require("../controllers/orderController");

router.get("/", getOrders);
router.get("/:id", getOrderById);
router.post("/create", createOrder);
router.delete("/:id", deleteOrder);
router.put("/:id/status", updateOrderStatus);

module.exports = router;
