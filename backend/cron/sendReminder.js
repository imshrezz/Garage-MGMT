const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const JobCard = require("../models/JobCard");
const Customer = require("../models/Customer");

// Setup transporter (for example with Gmail or ethereal)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your-email@gmail.com",
    pass: "your-app-password",
  },
});

async function sendReminders() {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const dueJobs = await JobCard.find({
    jobInDate: { $lte: threeMonthsAgo },
    reminderSent: false,
  }).populate("customer");

  for (const job of dueJobs) {
    const customer = job.customer;

    if (!customer?.email) continue;

    const mailOptions = {
      from: '"Carageer Garage" <your-email@gmail.com>',
      to: customer.email,
      subject: "Time for Your Next Vehicle Service!",
      html: `
        <p>Hi ${customer.name},</p>
        <p>We hope your vehicle has been running smoothly!</p>
        <p>It's been 3 months since your last service on <strong>${job.jobInDate.toDateString()}</strong>.</p>
        <p>We recommend a checkup to ensure everything stays in top shape.</p>
        <p><strong>Book your appointment today!</strong></p>
        <p>– Caragreer Garage</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    job.reminderSent = true;
    await job.save();
  }

  console.log("Reminder emails sent!");
}

module.exports = sendReminders;
