const crypto = require("crypto");
const Order = require("../models/orderModel");
const { x } = require("pdfkit");
const SECRET_KEY = process.env.CLICK_SECRET_KEY;

exports.completePayment = async (req, res) => {

  const _postData = req.body?.Request?._postData; 
  if (!_postData) {
    console.log("Missing required fields in _postData");
    return res.status(400).json({
      error: -1,
      error_note: "Missing required fields in _postData",
    });
  }
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
        `${click_trans_id}${service_id}${SECRET_KEY}${merchant_trans_id}${amount}${action}${sign_time}`
      )
      .digest("hex");

      console.log(`${calculatedSign}`)

    if (sign_string !== calculatedSign) {
      return res.status(400).json({
        error: -1,
        error_note: "Invalid sign string",
      });
    }

    const order = await Order.findOne({ invoiceNumber: merchant_trans_id });
    if (!order) {
      return res.status(400).json({ error: -2, error_note: "Order not found" });
    }

    if (amount !== order.amount) {
      return res.status(400).json({
        error: -9,
        error_note: "Invalid amount",
      });
    }

    if (order.status === "ОПЛАЧЕНО" && order.paymentType === "Click") {
      return res.status(200).json({
        click_trans_id,
        merchant_trans_id,
        merchant_confirm_id: merchant_prepare_id,
        error: -4,
        error_note: "Payment already performed",
      });
    }

    if (merchant_prepare_id !== order._id.toString()) { 
      console.log("ll", merchant_prepare_id);
      return res.status(400).json({
        error: -5,
        error_note: "Prepare ID does not match order ID",
      });
    }

    if (error === 0) {
      await Order.findOneAndUpdate(
        { invoiceNumber: merchant_trans_id },
        {
          status: "ОПЛАЧЕНО",
          paymentType: "Click",
          perform_time: Date.now(),
        },
        { new: true }
      );

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
