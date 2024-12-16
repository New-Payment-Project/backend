const router = require("express").Router();
const { exportToExcel } = require("../services/exportOrdersToExcel");

router.post("/order", exportToExcel);

module.exports = router;
