const Invoice = require("../models/invoiceModel");
const Course = require("../models/courseModel");
const Counter = require("../models/counterModel");
const Orders = require("../models/orderModel");
// const { sendOrderToBot } = require("../bot");

async function getNextSequenceValue(sequenceName) {
  const sequenceDocument = await Counter.findByIdAndUpdate(
    { _id: sequenceName },
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );
  return sequenceDocument.sequence_value;
}

function formatInvoiceNumber(number) {
  return String(number).padStart(5, "0");
}

const createInvoice = async (req, res) => {
  const { clientName, clientPhone, tgUsername } = req.body;
  console.log(req.body);

  try {
    const sequenceNumber = await getNextSequenceValue("invoiceNumber");
    const invoiceNumber = formatInvoiceNumber(sequenceNumber);

    const invoice = new Invoice({
      invoiceNumber,
      clientName,
      clientPhone,
      status: "ВЫСТАВЛЕНО",
      tgUsername,
    });

    const newInvoice = await invoice.save();
    res.status(201).json(newInvoice);

    let retries = 5;
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    while (retries > 0) {
      const updatedOrder = await Orders.findOne({ invoiceNumber }).populate(
        "course_id"
      );

      if (updatedOrder) {
        console.log("Order found, sending to bot:", updatedOrder);
        sendOrderToBot(updatedOrder); 
        break;
      }

      await delay(1000);
      retries--;
    }

    if (retries === 0) {
      console.warn(
        `Order with invoiceNumber ${invoiceNumber} not found after retries`
      );
    }
  } catch (err) {
    console.error("Error creating invoice:", err.message);

    if (!res.headersSent) {
      res.status(400).json({ message: err.message });
    }
  }
};

const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find();
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.status(200).json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    await invoice.remove();
    res.status(200).json({ message: "Invoice deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  deleteInvoiceById,
};
