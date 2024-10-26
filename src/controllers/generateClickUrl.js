const crypto = require("crypto");
const SECRET_KEY = process.env.CLICK_SECRET_KEY;

exports.generateClickPaymentUrl = (req, res) => {
  const { amount, merchant_trans_id, course_id } = req.body;

  const service_id = "37390";
  const merchant_id = "12110";
  const merchant_user_id = "46320";
  const return_url = "https://markaz.norbekovgroup.uz/course-info";

  if (!amount || !merchant_trans_id || !course_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const hashString = `${merchant_id}${merchant_trans_id}${SECRET_KEY}`;

  const hash = crypto.createHash("md5").update(hashString).digest("hex");

  const paymentUrl = `https://my.click.uz/services/pay?service_id=${service_id}&merchant_id=${merchant_id}&amount=${amount}&transaction_param=${merchant_trans_id}&return_url=${encodeURIComponent(
    return_url
  )}&merchant_user_id=${merchant_user_id}&additional_param2=${course_id}`;
  console.log(paymentUrl);
  return res.json({ paymentUrl });
};
