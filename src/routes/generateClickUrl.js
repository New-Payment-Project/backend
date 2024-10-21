const express = require('express');
const { generateClickPaymentUrl } = require('../controllers/generateClickUrl');
const router = express.Router();

router.post('/generate-click-payment-url', generateClickPaymentUrl);

module.exports = router;
