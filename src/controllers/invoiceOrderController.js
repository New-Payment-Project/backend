const Invoice = require('../models/invoiceModel');

const mergeInvoicesAndOrders = async (req, res) => {
  try {
    const mergedResults = await Invoice.aggregate([
      {
        $lookup: {
          from: "orders", // Название коллекции orders
          localField: "invoiceNumber",
          foreignField: "invoiceNumber",
          as: "orderData", 
        },
      },
      {
        $unwind: {
          path: "$orderData",
          preserveNullAndEmptyArrays: false, // Исключаем записи без соответствующего заказа
        },
      },
      {
        $project: {
          _id: 1,
          invoiceNumber: 1,
          clientName: 1,
          clientPhone: 1,
          clientAddress: 1,
          status: 1,
          transactionId: "$orderData.transactionId",
          create_time: "$orderData.create_time",
          perform_time: "$orderData.perform_time",
          cancel_time: "$orderData.cancel_time",
          state: "$orderData.state",
          amount: "$orderData.amount",
          reason: "$orderData.reason",
          orderStatus: "$orderData.status",
        },
      },
    ]);

    res.status(200).json({ data: mergedResults });
  } catch (error) {
    console.error("Error merging invoices and orders:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  mergeInvoicesAndOrders,
};