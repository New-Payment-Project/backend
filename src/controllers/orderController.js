const Order = require("../models/orderModel");
const amocrmService = require("../services/amocrmServices");

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("course_id");
    res.status(200).json({ data: orders });
  } catch (error) {
    console.error("Error getting orders:", error);
    res
      .status(500)
      .json({ message: "Error getting orders", error: error.message });
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
    res
      .status(500)
      .json({ message: "Error getting order", error: error.message });
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
      prefix,
      paymentType,
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
      courseTitle,
      reason: null,
      status: status || "НЕ ОПЛАЧЕНО",
      paymentType,
    });

    await newOrder.save();

    // Логика повторных попыток для ожидания заполнения course_id
    let retries = 5;
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    while (retries > 0) {
      const updatedOrder = await Order.findOne({ invoiceNumber }).populate(
        "course_id"
      );

      if (
        updatedOrder &&
        updatedOrder.course_id &&
        updatedOrder.course_id.prefix
      ) {
        console.log(
          "Order found with course_id, syncing with AmoCRM:",
          updatedOrder
        );
        await syncOrderWithAmoCRM(updatedOrder); // Теперь отправляем в syncOrderWithAmoCRM
        break;
      }

      console.log(`Retrying... (${retries} retries left)`);
      await delay(1000); // Задержка 1 секунда перед следующей попыткой
      retries--;
    }

    if (retries === 0) {
      console.warn(
        `Order with invoiceNumber ${invoiceNumber} does not have course_id populated after retries`
      );
    }

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

    // Определяем `pipeline_id` и соответствие статусов в зависимости от префикса курса
    const isForumPrefix = order.course_id.prefix === "F";
    const pipelineId = isForumPrefix ? 8732934 : 8820650;

    const statusMapping = isForumPrefix
      ? {
          ВЫСТАВЛЕНО: 70702490, // статус для "PAYMENT Forum"
          ОПЛАЧЕНО: 142,
        }
      : {
          ВЫСТАВЛЕНО: 71299438, // статус для "PAYMENT Markaz"
          ОПЛАЧЕНО: 71299450,
          ОТМЕНЕНО: 71299446,
          "НЕ ОПЛАЧЕНО": 71299442,
        };

    const statusId =
      statusMapping[order.status] || (isForumPrefix ? 70702490 : 71299438); // Статус по умолчанию — "ВЫСТАВЛЕНО"

    console.log(`Pipeline ID: ${pipelineId}, Status ID: ${statusId}`); // Проверка pipeline_id и status_id

    // Поиск существующих сделок по телефону клиента
    const existingDeals = await amocrmService.findDealByPhone(
      phone,
      accessToken
    );

    // Проверка на существование сделки с тем же invoiceNumber
    const matchingDeal = existingDeals.find((deal) =>
      deal.custom_fields_values?.some(
        (f) => f.field_id === 1628273 && f.values[0].value === invoiceNumber // Проверка invoiceNumber
      )
    );

    const fixedPrice = order.amount
      ? order.status === "ОПЛАЧЕНО"
        ? order.paymentType !== "Click"
          ? `${order.amount / 100} сум`
          : `${order.amount} сум`
        : `${order.amount} сум`
      : "нет данных";

    console.log("Price Type", typeof fixedPrice);

    // Данные для обновления или создания сделки
    const dealData = {
      pipeline_id: pipelineId, // Установка воронки на основе префикса
      name: dealName,
      price: parseInt(fixedPrice),
      status_id: statusId, // Устанавливаем `status_id` на основе статуса заказа
      custom_fields_values: [
        { field_id: 1628435, values: [{ value: order.clientName }] },
        { field_id: 1628433, values: [{ value: order.clientPhone }] },
        { field_id: 1628267, values: [{ value: order.tgUsername || "нет" }] },
        { field_id: 1628269, values: [{ value: order.courseTitle }] },
        { field_id: 1628271, values: [{ value: order.status }] },
        { field_id: 1628273, values: [{ value: order.invoiceNumber }] },
      ],
    };

    console.log("Deal data being sent:", JSON.stringify(dealData, null, 2)); // Проверка данных перед отправкой

    if (matchingDeal) {
      // Если сделка найдена, обновляем её
      console.log(
        `Updating existing deal with ID: ${matchingDeal.id} for invoiceNumber: ${invoiceNumber}`
      );
      dealData.pipeline_id = matchingDeal.pipeline_id; // Устанавливаем pipeline_id из существующей сделки
      await amocrmService.updateDeal(matchingDeal.id, dealData, accessToken);
      console.log(
        `Updated existing deal for course "${order.courseTitle}" with phone ${phone}.`
      );
    } else {
      // Если сделка не найдена, создаём новую
      console.log(
        `Creating a new deal for phone ${phone} and name "${dealName}" with pipeline_id ${pipelineId}.`
      );
      await amocrmService.createDeal([dealData], accessToken);
      console.log(
        `Created new deal for course "${order.courseTitle}" with phone ${phone}.`
      );
    }
  } catch (error) {
    console.error(
      `Error syncing order with phone ${order.clientPhone}:`,
      error.message
    );
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  syncOrderWithAmoCRM,
};
