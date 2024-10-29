const express = require('express');
const router = express.Router();
const { getComparedOrdersAndInvoices } = require('../controllers/compareController');

router.get('/compare-orders-invoices', getComparedOrdersAndInvoices);
module.exports = router;