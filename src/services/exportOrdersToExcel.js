const XLSX = require("xlsx");
const Order = require("../models/orderModel");

const exportToExcel = async (req, res) => {
  try {
    // Get the order IDs from query params (should be a comma-separated list)
    const { orderIds } = req.query;
    const orderIdArray = orderIds ? orderIds.split(',') : [];

    // Find orders that match the provided IDs (if any)
    const data = await Order.find({
      _id: { $in: orderIdArray } // Match only the orders whose IDs are in the array
    });

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
    console.error(error);
    res.status(500).send("Error generating Excel file");
  }
};


module.exports = { exportToExcel };
