const crypto = require("crypto");
const Course = require("../models/courseModel");
const Order = require("../models/orderModel");
const SECRET_KEY = process.env.CLICK_SECRET_KEY;

exports.preparePayment = async (req, res) => {
  console.log("Received request with body:", req.body);

  if (req.body === undefined) {
    console.log("Error: Missing required field body", req.body);
    return res.status(400).json({
      error: -1,
      error_note: "Request is empty",
    });
  }

  console.log("Request body content:", req.body);

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
    // Check for required fields
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
      console.log("Error: Missing required fields in request body");
      return res.status(400).json({
        error: -1,
        error_note: "Missing required fields",
      });
    }
    
    const numberAmount = Number(amount);
    console.log("Parsed amount (as Number):", numberAmount, "Type:", typeof numberAmount);

    // Find course by ID
    const course = await Course.findById({ _id: param2 });
    if (!course) {
      console.log("Error: Course not found for param2:", param2);
      return res.status(400).json({
        error: -9,
        error_note: "Course not found",
      });
    }
    console.log("Course found:", course);

    // Find order by invoice number
    const order = await Order.findOne({ invoiceNumber: merchant_trans_id });
    if (!order) {
      console.log("Error: Order not found for merchant_trans_id:", merchant_trans_id);
      return res.status(400).json({
        error: -9,
        error_note: "Order not found",
      });
    }
    console.log("Order found:", order);

    // Check if amount matches course price
    if (course.price !== numberAmount) {
      console.log("Error: Incorrect amount. Expected:", course.price, "Received:", numberAmount);
      return res.status(400).json({
        error: -2,
        error_note: "Incorrect amount",
      });
    }

    // Validate if the course ID matches
    if (order.course_id.toString() !== param2) {
      console.log("Error: Incorrect course. Order course_id:", order.course_id, "param2:", param2);
      return res.status(400).json({
        error: -9,
        error_note: "Incorrect course",
      });
    }

    // Generate expected sign string
    const expectedSignString = crypto
      .createHash("md5")
      .update(
        `${click_trans_id}${service_id}${SECRET_KEY}${merchant_trans_id}${numberAmount}${action}${sign_time}`
      )
      .digest("hex");
    console.log("Generated expected sign string:", expectedSignString);

    // Compare sign strings
    if (sign_string !== expectedSignString) {
      console.log("Error: Invalid sign string. Received:", sign_string, "Expected:", expectedSignString);
      return res.status(400).json({
        error: -1,
        error_note: "Invalid sign string",
      });
    }

    const merchant_prepare_id = order._id;
    console.log("Transaction prepared successfully:", {
      click_trans_id,
      merchant_trans_id,
      merchant_prepare_id,
      error: 0,
      error_note: "Success",
    });
  
    return res.status(200).json({
      result: [{
        click_trans_id,
        merchant_trans_id,
        merchant_prepare_id,
        error: 0,
        error_note: "Success",
      }]
    });
  } catch (error) {
    console.error("Error in preparePayment:", error);
    return res.status(500).json({
      error: -3,
      error_note: "Server error",
    });
  }
};
