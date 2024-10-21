const crypto = require("crypto");
const SECRET_KEY = process.env.CLICK_SECRET_KEY;

exports.generateClickPaymentUrl = (req, res) => {
    const { amount, merchant_trans_id, course_id } = req.body;

    const service_id = "37390";
    const merchant_id = "12110";
    const merchant_user_id = "46320";
    const return_url = "https://forum.norbekovgroup.uz/course-info";

    if (!amount || !merchant_trans_id || !course_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const formattedAmount = parseInt(amount, 10); 
    const sign_string = crypto
        .createHash("md5")
        .update(
            `${merchant_trans_id}${service_id}${SECRET_KEY}${formattedAmount}${merchant_id}`
        )
        .digest("hex");

    const paymentUrl = `https://my.click.uz/services/pay/?service_id=${service_id}&merchant_id=${merchant_id}&merchant_user_id=${merchant_user_id}&transaction_param=${merchant_trans_id}&amount=${formattedAmount}&additional_param3=${course_id}&return_url=${encodeURIComponent(
        return_url
    )}&sign_string=${sign_string}`;

    // Возвращаем URL
    return res.json({ paymentUrl });
};
