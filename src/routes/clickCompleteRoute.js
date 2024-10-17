const express = require('express');
const router = express.Router();
const clickCompleteController = require('../controllers/clickCompleteController');

router.post('/complete', clickCompleteController.completePayment);

module.exports = router;
