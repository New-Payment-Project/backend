const { CreateTransaction, getTransactions, getTransactionById, updateTransaction, deleteTransaction } = require('../controllers/transController')

const router = require('express').Router()

router.post('/create', CreateTransaction)
router.get('/', getTransactions)
router.get('/:id', getTransactionById)
router.put('/update/:id', updateTransaction)
router.delete('/delete/:id', deleteTransaction)
module.exports = router