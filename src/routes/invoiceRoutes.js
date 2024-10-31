
const express = require('express');
const { createInvoice, getInvoices, getInvoiceById, deleteInvoiceById } = require('../controllers/invoiceController');
const { updateInvoiceStatusToPaid, checkInvoicesForExpiration } = require('../controllers/checkInvoiceController');
const router = express.Router();

router.post('/', createInvoice);
router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.put('/:id/pay', updateInvoiceStatusToPaid);
router.put('/check', checkInvoicesForExpiration);
router.delete('/:id', deleteInvoiceById);
module.exports = router;