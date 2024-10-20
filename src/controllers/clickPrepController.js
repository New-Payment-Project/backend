const crypto = require("crypto");
const Course = require("../models/courseModel");
const Order = require("../models/orderModel");
const SECRET_KEY = process.env.CLICK_SECRET_KEY;

exports.preparePayment = async (req, res) => {
  const {
    click_trans_id,
    service_id,
    click_paydoc_id,
    error,
    error_note,
    merchant_trans_id,
    amount,
    action,
    sign_time,
    sign_string,
    param2, // The course ID
  } = req.body;

  try {
    // Check for required fields
    if (
      click_trans_id === undefined ||
      service_id === undefined ||
      click_paydoc_id === undefined ||
      error === undefined ||
      error_note === undefined ||
      merchant_trans_id === undefined ||
      amount === undefined ||
      action === undefined ||
      sign_time === undefined ||
      sign_string === undefined ||
      param2 === undefined
    ) {
      return res
        .status(400)
        .json({ error: -1, error_note: "Missing required fields" });
    }

    // Check if the course exists
    const course = await Course.findOne({ _id: param2 });
    if (!course) {
      return res
        .status(400)
        .json({ error: -9, error_note: "Additional param is incorrect" });
    }

    // Find the order using merchant_trans_id (which is the order ID)
    const order = await Order.findOne({ invoiceNumber: merchant_trans_id });
    if (!order || order.invoiceNumber !== merchant_trans_id) {
      return res
        .status(400)
        .json({ error: -5, error_note: "Merchant trans id is incorrect" });
    }

    // Validate the amount
    if (order.amount !== amount) {
      return res
        .status(400)
        .json({ error: -9, error_note: "Amount is incorrect" });
    }

    // Validate the course ID
    if (order.course_id.toString() !== param2) {
      return res
        .status(400)
        .json({ error: -9, error_note: "Additional param is incorrect" });
    }

    // Generate the expected sign string
    const expectedSignString = crypto
      .createHash("md5")
      .update(
        `${click_trans_id}${service_id}${SECRET_KEY}${merchant_trans_id}${amount}${action}${sign_time}`
      )
      .digest("hex");

    console.log(expectedSignString);

    // Validate the sign string
    if (!sign_string || sign_string !== expectedSignString) {
      return res
        .status(400)
        .json({ error: -1, error_note: "Invalid sign string" });
    }

    // Use the order._id as the merchant_prepare_id
    const merchant_prepare_id = order._id;

    return res.status(200).json({
      result: {
        click_trans_id,
        merchant_trans_id,
        merchant_prepare_id, // Send order._id as prepare ID
        error: 0,
        error_note: "Success",
      },
    });
  } catch (error) {
    console.error("Error in preparePayment controller:", error);
    return res.status(500).json({ error: -3, error_note: "Server error" });
  }
};
