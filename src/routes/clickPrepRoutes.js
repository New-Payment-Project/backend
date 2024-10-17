const express = require('express');
const router = express.Router();
const clickPrepController = require('../controllers/clickPrepController');

router.post('/prepare', clickPrepController.preparePayment);

module.exports = router;
