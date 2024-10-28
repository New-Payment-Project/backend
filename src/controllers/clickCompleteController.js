const crypto = require("crypto");
const Order = require("../models/orderModel");
const { x } = require("pdfkit");
const SECRET_KEY = process.env.CLICK_SECRET_KEY;

exports.completePayment = async (req, res) => {
  const _postData = req.body;
  if (_postData === undefined) {
    console.log("Missing required fields in _postData");
    return res.status(400).json({
      error: -9,
      error_note: "Missing required fields in _postData",
    });
  }

  console.log(req.body)

  const {
    click_trans_id,
    service_id,
    click_paydoc_id,
    merchant_trans_id,
    merchant_prepare_id,
    amount,
    action,
    error,
    error_note,
    sign_time,
    sign_string,
    param2,
  } = _postData;

  try {
    const calculatedSign = crypto
      .createHash("md5")
      .update(
        `${click_trans_id}${service_id}${SECRET_KEY}${merchant_trans_id}${merchant_prepare_id}${amount}${action}${sign_time}`
      )
      .digest("hex");

    console.log(click_trans_id, service_id, SECRET_KEY, merchant_trans_id, amount, action, sign_time)
    console.log(`${sign_string}`);
    console.log(`${calculatedSign}`);

    if (sign_string !== calculatedSign) {
      console.log("Invalid sign string");
      return res.status(400).json({
        error: -1,
        error_note: "Invalid sign string",
      });
    }


    const order = await Order.findOne({ invoiceNumber: merchant_trans_id });
    if (!order) {
      console.log("No order");
      return res.status(400).json({ error: -9, error_note: "Order not found" });
    }


    console.log("Amount chumbils", typeof amount, typeof order.amount)

    if (amount !== String(order.amount)) {
      console.log("Invalid amount");
      return res.status(400).json({
        error: -2,
        error_note: "Invalid amount",
      });
    }

    if (order.status === "ОПЛАЧЕНО" && order.paymentType === "Click") {
      console.log("Payment already performed");
      return res.status(200).json({
        click_trans_id,
        merchant_trans_id,
        merchant_confirm_id: merchant_prepare_id,
        error: -4,
        error_note: "Payment already performed",
      });
    }

    if (merchant_prepare_id === undefined || null) {
      console.log("Missing merchant_prepare_id in _postData");
      return res.status(400).json({
        error: -9,
        error_note: "Missing merchant_prepare_id in _postData",
      });
    }

    if (merchant_prepare_id !== order._id.toString()) {
      console.log("prepare", merchant_prepare_id);
      return res.status(400).json({
        error: -9,
        error_note: "Prepare ID does not match order ID",
      });
    }

    if (error === 0) {
      await Order.findOneAndUpdate(
        { invoiceNumber: parseInt(merchant_trans_id) },
        {
          status: "ОПЛАЧЕНО",
          paymentType: "Click",
          perform_time: Date.now(),
        },
        { new: true }
      );

      await Invoice.findOneAndUpdate(
        { invoiceNumber: parseInt(merchant_trans_id) },
        { status: "ОПЛАЧЕНО" }
      );

      console.log("success")

      return res.status(200).json({
        click_trans_id,
        merchant_trans_id,
        merchant_confirm_id: merchant_prepare_id,
        error: 0,
        error_note: "Success",
      });
    }

    return res.status(400).json({
      click_trans_id,
      merchant_trans_id,
      merchant_confirm_id: merchant_prepare_id,
      error,
      error_note: error_note || "An error occurred",
    });
  } catch (error) {
    console.error("Error in completePayment:", error);
    return res.status(500).json({ error: -3, error_note: "Server error" });
  }
};
