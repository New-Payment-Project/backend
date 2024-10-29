
const express = require('express');
const { createInvoice, getInvoices, getInvoiceById, deleteInvoiceById } = require('../controllers/invoiceController');
const { updateInvoiceStatusToPaid, checkInvoicesForExpiration } = require('../controllers/checkInvoiceController');
const router = express.Router();

router.post('/invoices', createInvoice);
router.get('/invoices', getInvoices);
router.get('/invoices/:id', getInvoiceById);
router.put('/invoices/:id/pay', updateInvoiceStatusToPaid);
router.put('/invoices/check', checkInvoicesForExpiration);
router.delete('/invoices/:id', deleteInvoiceById);
module.exports = router;