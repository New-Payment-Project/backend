const compareOrdersAndInvoices = require('../services/CompareOrdersInvoices');
const getComparedOrdersAndInvoices = async (req, res) => {
  try {
    const comparedResults = await compareOrdersAndInvoices();
    res.status(200).json({ data: comparedResults });
  } catch (error) {
    console.error("Error fetching compared orders and invoices:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
module.exports = {
  getComparedOrdersAndInvoices,
};