const express = require('express');
const router = express.Router();
const { mergeInvoicesAndOrders } = require('../controllers/invoiceOrderController');

router.get('/invoices-orders', mergeInvoicesAndOrders);

module.exports = router;