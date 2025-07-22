const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // or use SMTP config
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendReminderMail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"Carageer Garage" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Reminder email sent to ${to}`);
  } catch (error) {
    console.error("Error sending mail:", error);
  }
};

module.exports = { sendReminderMail };
