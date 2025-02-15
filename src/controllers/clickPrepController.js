const crypto = require("crypto");
const Course = require("../models/courseModel");
const Order = require("../models/orderModel");
const SECRET_KEY = process.env.CLICK_SECRET_KEY;

exports.preparePayment = async (req, res) => {
  

  if (req.body === undefined) {
    console.log("Missing required field body", req.body);
    return res.status(400).json({
      error: -1,
      error_note: "request is empty",
    });
  }

  console.log("body", req.body);

  const {
    click_trans_id,
    service_id,
    click_paydoc_id,
    merchant_trans_id,
    amount,
    action,
    sign_time,
    sign_string,
    error,
    error_note,
    param2,
  } = req.body;
  try {
    if (
      click_trans_id === undefined ||
      service_id === undefined ||
      click_paydoc_id === undefined ||
      merchant_trans_id === undefined ||
      amount === undefined ||
      action === undefined ||
      sign_time === undefined ||
      sign_string === undefined ||
      param2 === undefined
    ) {
      console.log("Missing required fields");
      return res.status(400).json({
        error: -1,
        error_note: "Missing required fields",
      });
    }
    const numberAmount = Number(amount);
    console.log("Number amount: " + typeof numberAmount)

    const course = await Course.findById({ _id: param2 });
    if (!course) {
      console.log("No course");
      return res.status(400).json({
        error: -9,
        error_note: "Course not found",
      });
    }

    const order = await Order.One({ invoiceNumber: merchant_trans_id });
    if (!order) {
      console.log("No order");
      return res.status(400).json({
        error: -9,
        error_note: "Order not found",
      });
    }

    if (course.price !== numberAmount) {
      console.log("incorrect amount");
      return res.status(400).json({
        error: -2,
        error_note: "Incorrect amount",
      });
    }

    if (order.course_id.toString() !== param2) {  
      return res.status(400).json({
        error: -9,
        error_note: "Incorrect course",
      });
    }

    const expectedSignString = crypto
      .createHash("md5")
      .update(
        `${click_trans_id}${service_id}${SECRET_KEY}${merchant_trans_id}${numberAmount}${action}${sign_time}`
      )
      .digest("hex");
    console.log(expectedSignString);

    if (sign_string !== expectedSignString) {
      console.log("Invalid sign string");
      return res.status(400).json({
        error: -1,
        error_note: "Invalid sign string",
      });
    }

    const merchant_prepare_id = order._id;
  
    return res.status(200).json({
      click_trans_id,
      merchant_trans_id,
      merchant_prepare_id,
      error: 0,
      error_note: "Success",
  });
  } catch (error) {
    console.error("Error in preparePayment:", error);
    return res.status(500).json({
      error: -3,
      error_note: "Server error",
    });
  }
};
