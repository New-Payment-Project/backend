const express = require('express');
const { generatePDF } = require('../controllers/pdfController');  // Ensure the path is correct

const router = express.Router();

router.post('/generate-pdf', generatePDF);  // Ensure generatePDF is correctly passed here

module.exports = router;
