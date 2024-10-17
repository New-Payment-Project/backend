const prepareService = require("../services/clickPrepService");
const Order = require("../models/orderModel");

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
  } = req.body;
  try {
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
      sign_string === undefined
    ) {
      return res
        .status(400)
        .json({ error: -1, error_note: "Missing required fields" });
    }

    const result = await prepareService.preparePayment({
      click_trans_id,
      service_id,
      click_paydoc_id,
      merchant_trans_id,
      amount,
      action,
      error,
      error_note,
      sign_time,
      sign_string,
    });

    if (result.error) {
      return res.status(400).json(result);
    }

    const newOrder = new Order({
      transactionId: click_trans_id,
      invoiceNumber: null,
      create_time: Date.now(),
      perform_time: null,
      cancel_time: null,
      amount: amount,
      course_id: merchant_trans_id,
      status: "ВЫСТАВЛЕНО",
      system: "Click",
    });

    console.log("New order to be saved:", newOrder);

    try {
      const savedOrder = await newOrder.save();
      console.log("Order saved successfully:", savedOrder);
      return res.status(200).json({ result, order: savedOrder });
    } catch (saveError) {
      console.error("Error saving new order:", saveError);
      return res
        .status(500)
        .json({ error: -3, error_note: "Failed to save order" });
    }
  } catch (error) {
    console.error("Error in preparePayment controller:", error);
    return res.status(500).json({ error: -3, error_note: "Server error" });
  }
};
