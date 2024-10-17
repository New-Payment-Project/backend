const puppeteer = require("puppeteer");

const generatePDF = async (req, res) => {
  let browser;
  try {
    const { orders } = req.body;

    if (!orders || orders.length === 0) {
      return res.status(400).send("No orders provided");
    }

    // Log orders for debugging
    console.log("Received orders:", orders);

    // Determine the filename
    const filename =
      orders.length === 1
        ? `${orders[0].invoiceNumber}.pdf`
        : `order_report_${Date.now()}.pdf`;

    // Generate HTML content
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
              font-size: 12px;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            tr:nth-child(even) { background-color: #f9f9f9; }
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
              ${orders
                .map(
                  (order) => `
                <tr>
                  <td>${order.invoiceNumber || "N/A"}</td>
                  <td>${order.clientName || "N/A"}</td>
                  <td>${order.course_id?.title || "N/A"}</td>
                  <td>${
                    order.amount
                      ? `${(order.amount / 100).toFixed(2)} ${
                          order.currency || "UZS"
                        }`
                      : "N/A"
                  }</td>
                  <td>${order.status || "N/A"}</td>
                  <td>${
                    order.create_time
                      ? new Date(order.create_time).toLocaleDateString()
                      : "N/A"
                  }</td>
                  <td>${order.paymentType || "N/A"}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    // Launch Puppeteer
    browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });

    const page = await browser.newPage();

    // Set page content
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error("PDF Buffer is empty");
    }

    // Close the browser
    await browser.close();

    // Set response headers
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${filename}`,
      "Content-Length": pdfBuffer.length,
    });

    // Send the PDF
    res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error("Error generating PDF:", err);
    if (browser) {
      await browser.close();
    }
    res.status(500).json({
      error: "Error generating PDF",
      message: err.message,
      stack: err.stack,
    });
  }
};

module.exports = { generatePDF };
