const express = require('express');
const { handlePaymeRequest } = require('../controllers/paymentController');
const router = express.Router();

router.post('/', handlePaymeRequest);

module.exports = router;