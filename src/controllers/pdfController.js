const PDFDocument = require('pdfkit');

const translateStatus = (status) => {
  switch (status) {
    case 'ВЫСТАВЛЕНО':
      return "JARAYONDA";
    case 'ОПЛАЧЕНО':
      return "TO'LANGAN";
    case 'НЕ ОПЛАЧЕНО':
      return "TO'LANMAGAN";
    case 'ОТМЕНЕНО':
      return "BEKOR QILINGAN";
    default:
      return status || 'N/A';
  }
};

const generatePDF = async (req, res) => {
  try {
    const { orders } = req.body;

    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=order_${orders[0].invoiceNumber}.pdf`,
        'Content-Length': pdfBuffer.length,
      });
      res.status(200).send(pdfBuffer);
    });

    doc.font('Helvetica');

    doc.fontSize(18).text('Order Details', { align: 'center' });
    doc.moveDown(1);

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    const addKeyValueRow = (key, value) => {
      doc.fontSize(12).text(`${key}:`, { continued: true });
      doc.fontSize(12).text(value || 'N/A');
      doc.moveDown(0.5);
    };

    const order = orders[0];

    addKeyValueRow('Invoice Number', `${order.course_id?.prefix || 'U'}${order.invoiceNumber || 'N/A'}`);
    addKeyValueRow('Client', order.clientName || 'N/A');
    addKeyValueRow('Course', order.course_id?.title || 'N/A');
    addKeyValueRow('Created Date', order.create_time
      ? new Date(order.create_time).toLocaleDateString('en-GB') + ' | ' +
      new Date(order.create_time).toLocaleTimeString('en-GB', { hour12: false })
      : 'N/A');
    addKeyValueRow('Client Phone', order.clientPhone || 'N/A');
    addKeyValueRow('Client Address', order.clientAddress || 'N/A');
    addKeyValueRow('Telegram Username', order.tgUsername || 'N/A');
    addKeyValueRow('Passport', order.passport || 'N/A');

    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    addKeyValueRow('Service', order.paymentType || 'N/A');

    const translatedStatus = translateStatus(order.status);
    addKeyValueRow('Status', translatedStatus);

    const isPaid = order.status === 'ОПЛАЧЕНО';
    doc.fontSize(14).text('Amount:', { continued: true })
      .text(
        order.amount
          ? isPaid
            ? `${(order.amount / 100).toFixed(2)} ${order.currency || 'UZS'}`
            : `${order.amount} ${order.currency || 'UZS'}`
          : 'N/A'
      );

    doc.end();
  } catch (err) {
    console.error('Error generating PDF:', err);
    res.status(500).send('Error generating PDF');
  }
};

module.exports = { generatePDF };
