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

module.exports = sendEmail;
