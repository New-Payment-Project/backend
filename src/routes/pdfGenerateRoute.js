const express = require('express');
const { generateContractPDF } = require('../controllers/pdfController');

const router = express.Router();

router.post('/generate-pdf', generateContractPDF);

module.exports = router;
