const express = require('express');
const { generateContractPDF } = require('../controllers/pdfController');
const authMiddleware = require('../middlware/auth');

const router = express.Router();

router.post('/generate-pdf', authMiddleware, generateContractPDF);

module.exports = router;
