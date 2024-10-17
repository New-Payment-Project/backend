const puppeteer = require('puppeteer');

const generatePDF = async (req, res) => {
  try {
    const { orders } = req.body;

    // Create a simple HTML table structure for Puppeteer
    const htmlContent = `
      <html>
        <head>
          <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid black; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Order Report</h1>
          <table>
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>Client</th>
                <th>Course</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Service</th>
              </tr>
            </thead>
            <tbody>
              ${orders.map(order => `
                <tr>
                  <td>${order.invoiceNumber}</td>
                  <td>${order.clientName}</td>
                  <td>${order.course_id?.title || ''}</td>
                  <td>${order.amount}</td>
                  <td>${order.status}</td>
                  <td>${new Date(order.create_time).toLocaleDateString()}</td>
                  <td>${order.paymentType ? order.paymentType : 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    console.log('HTML Content:', htmlContent);  // Log the HTML content for verification

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true
    });

    const page = await browser.newPage();

    // Set viewport size
    await page.setViewport({ width: 1280, height: 800 });

    // Set the content of the page
    await page.setContent(htmlContent);

    // Generate the PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true
    });

    await browser.close();

    console.log('PDF Buffer Length:', pdfBuffer.length);

    if (!pdfBuffer || pdfBuffer.length === 0) {
      console.error('PDF Buffer is empty');
      return res.status(500).send('Error generating PDF');
    }

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=F00003.pdf`,
      'Content-Length': pdfBuffer.length
    });

    res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error('Error generating PDF:', err);
    res.status(500).send('Error generating PDF');
  }
};

module.exports = { generatePDF };
