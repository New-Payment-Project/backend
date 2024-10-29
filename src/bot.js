const TelegramBot = require("node-telegram-bot-api");
const token = process.env.TG_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const sendOrderToBot = (orderData) => {
  const message = `
    Заказ ${orderData.prefix}${orderData.invoiceNumber}:
    Клиент: ${orderData.clientName}
    Телефон: ${orderData.clientPhone}
    Адрес: ${orderData.clientAddress || "не указан"}
    ТГ Username: ${orderData.tgUsername || "не указан"}
    Статус: ${orderData.status}
    Сумма: ${orderData.amount || "не указан"}
  `;

  bot.sendMessage("954780945", message).catch((error) => {
    console.error("Error sending message to bot:", error.message);
  });
};
module.exports = { bot, sendOrderToBot };
