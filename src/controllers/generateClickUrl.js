const crypto = require("crypto");
const SECRET_KEY = process.env.CLICK_SECRET_KEY;

exports.generateClickPaymentUrl = (req, res) => {
    const { amount, merchant_trans_id, course_id } = req.body;

    const service_id = "37390";
    const merchant_id = "12110";
    const merchant_user_id = "46320";
    const return_url = "https://markaz.norbekovgroup.uz/course-info";

    if (!amount || !merchant_trans_id || !course_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const paymentUrl = `https://my.click.uz/services/pay/?service_id=${service_id}&merchant_id=${merchant_id}&merchant_user_id=${merchant_user_id}&transaction_param=${merchant_trans_id}&amount=${amount}&additional_param3=${course_id}&return_url=${encodeURIComponent(
        return_url
    )}`;

    return res.json({ paymentUrl });
};
