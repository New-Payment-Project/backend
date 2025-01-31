require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (to, subject, text) => {
  try {
    let info = await transporter.sendMail({
      from: `${process.env.SMTP_USER}`,
      to,
      subject,
      text,
    });
    return info;
  } catch (error) {
    console.error("Email Error:", error);
  }
};

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
