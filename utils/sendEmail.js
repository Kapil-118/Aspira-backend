const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendEmail = async (
  to,
  subject,
  html
) => {
  const info = await transporter.sendMail({
    from: `"Team-Aspira" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });

  console.log("EMAIL SENT:");
  console.log(info);
};

module.exports = sendEmail;