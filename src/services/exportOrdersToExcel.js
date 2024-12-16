const XLSX = require("xlsx");
const Order = require("../models/orderModel");

const exportToExcel = async (req, res) => {
  try {
    const { orderIds } = req.body; // Extract from body
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).send("Invalid or missing 'orderIds'");
    }

    const data = await Order.find({ _id: { $in: orderIds } });

    const rows = data.map((order, id) => ({
      ID: id + 1,
      ClientName: order.clientName || "N/A",
      ClientPhone: order.clientPhone || "N/A",
      CourseTitle: decodeURIComponent(order.courseTitle) || "N/A",
      Amount: order.amount || 0,
      Status: order.status,
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders Data");

    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="orders_data.xlsx"'
    );
    res.type(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(excelBuffer);
  } catch (error) {
    console.error("Error generating Excel file:", error);
    res.status(500).send("Error generating Excel file");
  }
};

module.exports = { exportToExcel };
