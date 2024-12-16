const cron = require("node-cron");
const Order = require("./models/orderModel");
const moment = require("moment");

cron.schedule("* * * * *", async () => {
  console.log("Running cron job to cancel unpaid orders...");

  try {
    const threeDaysAgo = moment().subtract(3, "days").toDate();

    const result = await Order.updateMany(
      {
        status: "ВЫПЛАЧЕНО",
        create_time: { $lte: threeDaysAgo },
      },
      {
        $set: { status: "ОТМЕНЕНО", cancel_time: Date.now() },
      }
    );

    console.log(`Cron job completed: ${result.nModified} orders updated.`);
  } catch (error) {
    console.error("Error running cron job:", error.message);
  }
});
