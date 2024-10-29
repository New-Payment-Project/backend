const TelegramBot = require("node-telegram-bot-api");
const token = "7230758974:AAEUk-Vf46omoACp-lfm6mZmCMc1qkDp9_o";
const bot = new TelegramBot(token, { polling: false });

const sendOrderToBot = (orderData) => {
  console.log("Sending order data:", orderData);

  const message = `
    Заказ ${orderData.course_id?.prefix || ""}${orderData.invoiceNumber}:
    Курс: ${orderData.courseTitle}
    👤 Клиент: ${orderData.clientName}
    Телефон: ${orderData.clientPhone}
    ТГ Username: ${orderData.tgUsername || "не указан"}
    Статус: ${orderData.status}

    Сумма: ${orderData.amount || "не указан"}
  `;

  bot
    .sendMessage("954780945", message)
    .then(() => console.log("Message sent successfully"))
    .catch((error) => {
      console.error("Error sending message to bot:", error.message);
    });
};
module.exports = { bot, sendOrderToBot };
