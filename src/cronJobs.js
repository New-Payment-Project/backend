const cron = require("node-cron");
const moment = require("moment");
const Order = require("./models/orderModel"); 

cron.schedule("0 0 * * *", async () => {
  console.log("Running cron job to cancel unpaid orders...");

  const threeDaysAgo = moment().subtract(3, "days").toDate();

  try {
    const ordersToUpdate = await Order.find({
      create_time: { $lte: threeDaysAgo },
      status: "ВЫСТАВЛЕНО", 
    });

    if (ordersToUpdate.length > 0) {
      const orderIds = ordersToUpdate.map((order) => order._id);
      const updatedOrders = await Order.updateMany(
        { _id: { $in: orderIds } },
        { $set: { status: "ОТМЕНЕНО" } }
      );

      console.log(
        `Updated ${updatedOrders.modifiedCount} orders to "ОТМЕНЕНО".`
      );
    } else {
      console.log("No orders found to update.");
    }
  } catch (error) {
    console.error("Error during cron job execution:", error.message);
  }
});
