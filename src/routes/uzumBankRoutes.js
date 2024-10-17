const { checkTransaction, checkTransactionStatus, createTransaction, confirmTransaction, reverseTransaction } = require('../controllers/uzumTransController')

const router = require('express').Router()

router.post('/check', checkTransaction)
router.post('/create', createTransaction)
router.post('/confirm', confirmTransaction)
router.post('/reverse', reverseTransaction)
router.post('/status', checkTransactionStatus)


module.exports = router