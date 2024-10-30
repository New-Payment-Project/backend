const Order = require("../models/orderModel");
const amocrmService = require("../services/amocrmServices");

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("course_id");

    res.status(200).json({ data: orders });
  } catch (error) {
    console.error("Error getting orders:", error);
    res.status(500).json({ message: "Error getting orders", error: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId).populate("course_id");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ data: order });
  } catch (error) {
    console.error("Error getting order:", error);
    res.status(500).json({ message: "Error getting order", error: error.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const {
      transactionId,
      create_time,
      state,
      amount,
      course_id,
      user_id,
      clientName,
      clientPhone,
      clientAddress,
      invoiceNumber,
      status,
      passport,
      tgUsername,
      courseTitle,
      prefix
    } = req.body;


    const newOrder = new Order({
      transactionId,
      invoiceNumber,
      create_time,
      perform_time: null,
      cancel_time: null,
      state,
      amount,
      course_id,
      user_id,
      clientName,
      clientPhone,
      clientAddress,
      passport,
      tgUsername,
      prefix,
      courseTitle,
      reason: null,
      status: status || 'НЕ ОПЛАЧЕНО'
    });

    await newOrder.save();

    await syncOrderWithAmoCRM(newOrder);

    res.status(201).json({ message: "Order created", data: newOrder });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const syncOrderWithAmoCRM = async (order) => {
  try {
    const accessToken = await amocrmService.ensureValidAccessToken();
    const dealName = `${order.invoiceNumber} - ${order.courseTitle}`;
    const phone = order.clientPhone;
    const invoiceNumber = order.invoiceNumber;

    const statusMapping = {
      "ВЫСТАВЛЕНО": 71258234,
      "ОПЛАЧЕНО": 71258222, 
      "ОТМЕНЕНО": 71258226, 
      "НЕ ОПЛАЧЕНО": 71258230 
    };

    const statusId = statusMapping[order.status] || 71258234;

    const existingDeals = await amocrmService.findDealByPhone(phone, accessToken);

    const matchingDeal = existingDeals.find(deal =>
      deal.custom_fields_values?.some(f => 
        (f.field_id === 1628273 && f.values[0].value === invoiceNumber)  
      )
    );

    const dealData = {
      "pipeline_id": 8812830,
      "name": dealName,
      "price": order.amount,
      "status_id": statusId,
      "custom_fields_values": [
        { "field_id": 1623197, "values": [{ "value": order.clientName }] },
        { "field_id": 1623203, "values": [{ "value": order.clientPhone }] },
        { "field_id": 1628267, "values": [{ "value": order.tgUsername || 'нет' }] },
        { "field_id": 1628269, "values": [{ "value": order.courseTitle }] },
        { "field_id": 1628271, "values": [{ "value": order.status }] },
        { "field_id": 1628273, "values": [{ "value": order.invoiceNumber }]}
      ]
    };

    if (matchingDeal) {
      console.log(`Updating existing deal with ID: ${matchingDeal.id} for invoiceNumber: ${invoiceNumber}`);
      await amocrmService.updateDeal(matchingDeal.id, dealData, accessToken);
      console.log(`Updated existing deal for course "${order.courseTitle}" with phone ${phone}.`);
    } else {
      console.log(`Creating a new deal for phone ${phone} and name "${dealName}".`);
      await amocrmService.createDeal([dealData], accessToken);
      console.log(`Created new deal for course "${order.courseTitle}" with phone ${phone}.`);
    }

  } catch (error) {
    console.error(`Error syncing order with phone ${order.clientPhone}:`, error.message);
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
};
