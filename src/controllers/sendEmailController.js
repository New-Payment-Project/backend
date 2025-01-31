const sendEmail = require("../services/emailSender")

const sendEmailController = async (req, res) => {
  const { to, subject, text } = req.body;
  try {
    const result = await sendEmail(to, subject, text);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to send email" });
  }
};

module.exports = { sendEmailController };
