const router = require('express').Router()

const { exportToExcel } = require('../services/exportOrdersToExcel');

router.get('/order', exportToExcel);

module.exports = router
