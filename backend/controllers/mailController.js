const nodemailer = require("nodemailer");
const JobCard = require("../models/JobCard");
const Customer = require("../models/Customer");
const Garage = require("../models/GarageProfile");
const ServiceReminder = require("../models/ServiceReminder");
const cron = require("node-cron");

// Email configuration
const emailConfig = {
  user: "shreyashkhodepatil@gmail.com", // Your Gmail address
  pass: "jvhcgpibjvmsuapt" // Your Gmail App Password
};

// Create a transporter using SMTP with secure configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass
  }
});

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error("SMTP Configuration Error:", error);
    console.log("Email configuration check:", {
      user: emailConfig.user,
      hasPassword: !!emailConfig.pass
    });
  } else {
    console.log("SMTP Server is ready to send emails");
  }
});

// Get garage details
const getGarageDetails = async () => {
  try {
    const garage = await Garage.findOne();
    return garage || {
      name: "Auto Service Center",
      phone: "",
      email: "",
      addressLine: "",
      city: "",
      state: "",
      postalCode: "",
      invoiceFooter: "",
      gstno: ""
    };
  } catch (error) {
    console.error("Error fetching garage details:", error);
    return {
      name: "Auto Service Center",
      phone: "",
      email: "",
      addressLine: "",
      city: "",
      state: "",
      postalCode: "",
      invoiceFooter: "",
      gstno: ""
    };
  }
};

// Send regular email
const sendEmail = async (req, res) => {
  try {
    const { to, subject, text } = req.body;
    const garage = await getGarageDetails();

    if (!to || !subject || !text) {
      return res.status(400).json({ message: "Missing required email fields" });
    }

    const mailOptions = {
      from: `"${garage.name}" <${garage.email}>`,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
            ${garage.logo ? `<img src="${garage.logo}" alt="${garage.name}" style="max-width: 200px;">` : ''}
            <h2 style="color: #2563eb; margin: 10px 0;">${garage.name}</h2>
            <p style="color: #4b5563; margin: 5px 0;">${garage.addressLine}</p>
            <p style="color: #4b5563; margin: 5px 0;">${garage.city}, ${garage.state} - ${garage.postalCode}</p>
            <p style="color: #4b5563; margin: 5px 0;">Phone: ${garage.phone}</p>
          </div>
          <h2 style="color: #2563eb; margin-bottom: 20px;">${subject}</h2>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${text.replace(/\n/g, '<br>')}
          </div>
          <p style="color: #4b5563; margin-top: 20px;">
            Best regards,<br>
            ${garage.name}
          </p>
          ${garage.invoiceFooter ? `<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 0.875rem;">${garage.invoiceFooter}</p>
          </div>` : ''}
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    res.status(200).json({ message: "Email sent successfully", messageId: info.messageId });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ 
      message: "Failed to send email",
      error: error.message 
    });
  }
};

// Send special offer
const sendOffer = async (req, res) => {
  try {
    const { to, offerDetails, customerName } = req.body;
    const garage = await getGarageDetails();

    if (!to || !offerDetails || !customerName) {
      return res.status(400).json({ message: "Missing required offer fields" });
    }

    const mailOptions = {
      from: `"${garage.name}" <${garage.email}>`,
      to,
      subject: `Special Offer from ${garage.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
            ${garage.logo ? `<img src="${garage.logo}" alt="${garage.name}" style="max-width: 200px;">` : ''}
            <h2 style="color: #2563eb; margin: 10px 0;">${garage.name}</h2>
            <p style="color: #4b5563; margin: 5px 0;">${garage.addressLine}</p>
            <p style="color: #4b5563; margin: 5px 0;">${garage.city}, ${garage.state} - ${garage.postalCode}</p>
            <p style="color: #4b5563; margin: 5px 0;">Phone: ${garage.phone}</p>
            ${garage.gstno ? `<p style="color: #4b5563; margin: 5px 0;">GST No: ${garage.gstno}</p>` : ''}
          </div>
          <h2 style="color: #2563eb; margin-bottom: 20px;">Special Offer for ${customerName}</h2>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${offerDetails.replace(/\n/g, '<br>')}
          </div>
          <p style="color: #4b5563; margin-top: 20px;">
            Best regards,<br>
            ${garage.name}
          </p>
          ${garage.invoiceFooter ? `<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 0.875rem;">${garage.invoiceFooter}</p>
          </div>` : ''}
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Offer sent successfully:", info.messageId);
    res.status(200).json({ message: "Offer sent successfully", messageId: info.messageId });
  } catch (error) {
    console.error("Error sending offer:", error);
    res.status(500).json({ 
      message: "Failed to send offer",
      error: error.message 
    });
  }
};

// Send service reminder
const sendServiceReminder = async (req, res) => {
  try {
    const { customerId, vehicleNumber, lastServiceDate, serviceType } = req.body;
    const garage = await getGarageDetails();

    if (!customerId || !vehicleNumber || !lastServiceDate || !serviceType) {
      return res.status(400).json({ message: "Missing required reminder fields" });
    }

    // Get customer details
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (!customer.email) {
      return res.status(400).json({ message: "Customer has no email address" });
    }

    const mailOptions = {
      from: `"${garage.name}" <${garage.email}>`,
      to: customer.email,
      subject: `Service Reminder from ${garage.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
            ${garage.logo ? `<img src="${garage.logo}" alt="${garage.name}" style="max-width: 200px;">` : ''}
            <h2 style="color: #2563eb; margin: 10px 0;">${garage.name}</h2>
            <p style="color: #4b5563; margin: 5px 0;">${garage.addressLine}</p>
            <p style="color: #4b5563; margin: 5px 0;">${garage.city}, ${garage.state} - ${garage.postalCode}</p>
            <p style="color: #4b5563; margin: 5px 0;">Phone: ${garage.phone}</p>
          </div>
          <h2 style="color: #2563eb; margin-bottom: 20px;">Service Reminder</h2>
          <p>Dear ${customer.name},</p>
          <p>We noticed that your vehicle (${vehicleNumber}) is due for service.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Last Service Details:</strong></p>
            <ul>
              <li>Date: ${new Date(lastServiceDate).toLocaleDateString()}</li>
              <li>Service Type: ${serviceType}</li>
            </ul>
          </div>
          <p>Please schedule your next service appointment to ensure your vehicle's optimal performance.</p>
          <p style="color: #4b5563; margin-top: 20px;">
            Best regards,<br>
            ${garage.name}
          </p>
          ${garage.invoiceFooter ? `<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 0.875rem;">${garage.invoiceFooter}</p>
          </div>` : ''}
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Service reminder sent successfully:", info.messageId);
    res.status(200).json({ message: "Service reminder sent successfully", messageId: info.messageId });
  } catch (error) {
    console.error("Error sending service reminder:", error);
    res.status(500).json({ 
      message: "Failed to send service reminder",
      error: error.message 
    });
  }
};

// Get customer service history
const getServiceHistory = async (req, res) => {
  try {
    console.log("Fetching service history...");
    
    // First, let's check if we have any closed job cards
    const closedJobCards = await JobCard.find({ status: "Closed" });
    console.log("Number of closed job cards:", closedJobCards.length);

    const customers = await JobCard.aggregate([
      {
        $match: {
          status: "Closed",
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "customer",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      {
        $unwind: "$customerDetails",
      },
      {
        $sort: {
          jobInDate: -1,
        },
      },
      {
        $group: {
          _id: "$customer",
          name: { $first: "$customerDetails.name" },
          email: { $first: "$customerDetails.email" },
          mobile: { $first: "$customerDetails.mobile" },
          lastServiceDate: { $first: "$jobInDate" },
          lastServiceType: { $first: "$serviceType" },
          vehicleNumber: { $first: "$vehicleNumber" },
          totalServices: { $sum: 1 },
          serviceHistory: {
            $push: {
              date: "$jobInDate",
              type: "$serviceType",
              vehicleNumber: "$vehicleNumber",
              description: "$jobDescription"
            }
          }
        },
      },
    ]);

    console.log("Number of customers with service history:", customers.length);
    console.log("Sample customer data:", customers[0]);

    res.status(200).json(customers);
  } catch (error) {
    console.error("Error fetching service history:", error);
    res.status(500).json({ message: "Failed to fetch service history" });
  }
};

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Send offer to all customers
const sendBulkOffer = async (req, res) => {
  try {
    const { offerDetails } = req.body;
    const garage = await getGarageDetails();

    if (!offerDetails) {
      return res.status(400).json({ message: "Offer details are required" });
    }

    // Get all customers with email addresses
    const customers = await Customer.find({ email: { $exists: true, $ne: "" } });
    
    if (customers.length === 0) {
      return res.status(404).json({ message: "No customers with email addresses found" });
    }

    // Process customers in batches of 5
    const BATCH_SIZE = 5;
    const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds
    let successCount = 0;
    let failureCount = 0;
    const failedEmails = [];

    for (let i = 0; i < customers.length; i += BATCH_SIZE) {
      const batch = customers.slice(i, i + BATCH_SIZE);
      
      // Process each customer in the batch
      for (const customer of batch) {
        try {
          const mailOptions = {
            from: `"${garage.name}" <${garage.email}>`,
            to: customer.email,
            subject: `Special Offer from ${garage.name}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 20px;">
                  ${garage.logo ? `<img src="${garage.logo}" alt="${garage.name}" style="max-width: 200px;">` : ''}
                  <h2 style="color: #2563eb; margin: 10px 0;">${garage.name}</h2>
                  <p style="color: #4b5563; margin: 5px 0;">${garage.addressLine}</p>
                  <p style="color: #4b5563; margin: 5px 0;">${garage.city}, ${garage.state} - ${garage.postalCode}</p>
                  <p style="color: #4b5563; margin: 5px 0;">Phone: ${garage.phone}</p>
                  ${garage.gstno ? `<p style="color: #4b5563; margin: 5px 0;">GST No: ${garage.gstno}</p>` : ''}
                </div>
                <h2 style="color: #2563eb; margin-bottom: 20px;">Special Offer for ${customer.name}</h2>
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  ${offerDetails.replace(/\n/g, '<br>')}
                </div>
                <p style="color: #4b5563; margin-top: 20px;">
                  Best regards,<br>
                  ${garage.name}
                </p>
                ${garage.invoiceFooter ? `<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 0.875rem;">${garage.invoiceFooter}</p>
                </div>` : ''}
              </div>
            `
          };

          await transporter.sendMail(mailOptions);
          successCount++;
          
          // Add a small delay between individual emails
          await delay(500);
        } catch (error) {
          console.error(`Failed to send email to ${customer.email}:`, error);
          failureCount++;
          failedEmails.push(customer.email);
        }
      }

      // Add delay between batches
      if (i + BATCH_SIZE < customers.length) {
        await delay(DELAY_BETWEEN_BATCHES);
      }
    }
    
    res.status(200).json({ 
      message: `Offer sending completed`,
      summary: {
        totalCustomers: customers.length,
        successCount,
        failureCount,
        failedEmails
      }
    });
  } catch (error) {
    console.error("Error in bulk offer sending:", error);
    res.status(500).json({ 
      message: "Failed to send bulk offer",
      error: error.message 
    });
  }
};

// Send automatic service reminder after 3 months
const sendAutomaticServiceReminder = async () => {
  try {
    console.log("Starting automatic service reminder check...");
    const garage = await getGarageDetails();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // Find all closed job cards from 3 months ago that haven't received reminders
    const jobCards = await JobCard.find({
      status: "Closed",
      jobInDate: {
        $gte: threeMonthsAgo,
        $lt: new Date(threeMonthsAgo.getTime() + 24 * 60 * 60 * 1000) // Within 24 hours of 3 months ago
      }
    }).populate('customer');

    console.log(`Found ${jobCards.length} job cards for automatic reminders`);

    for (const jobCard of jobCards) {
      // Check if reminder was already sent
      const existingReminder = await ServiceReminder.findOne({
        jobCard: jobCard._id,
        status: "sent"
      });

      if (existingReminder) {
        console.log(`Skipping job card ${jobCard._id} - reminder already sent`);
        continue;
      }

      if (!jobCard.customer || !jobCard.customer.email) {
        console.log(`Skipping job card ${jobCard._id} - no customer email`);
        continue;
      }

      const mailOptions = {
        from: `"${garage.name}" <${garage.email}>`,
        to: jobCard.customer.email,
        subject: `Service Reminder from ${garage.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 20px;">
              ${garage.logo ? `<img src="${garage.logo}" alt="${garage.name}" style="max-width: 200px;">` : ''}
              <h2 style="color: #2563eb; margin: 10px 0;">${garage.name}</h2>
              <p style="color: #4b5563; margin: 5px 0;">${garage.addressLine}</p>
              <p style="color: #4b5563; margin: 5px 0;">${garage.city}, ${garage.state} - ${garage.postalCode}</p>
              <p style="color: #4b5563; margin: 5px 0;">Phone: ${garage.phone}</p>
              ${garage.gstno ? `<p style="color: #4b5563; margin: 5px 0;">GST No: ${garage.gstno}</p>` : ''}
            </div>
            <h2 style="color: #2563eb; margin-bottom: 20px;">Service Reminder</h2>
            <p>Dear ${jobCard.customer.name},</p>
            <p>It's been 3 months since your last service at ${garage.name}. To ensure your vehicle continues to perform at its best, we recommend scheduling your next service appointment.</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Last Service Details:</strong></p>
              <ul>
                <li>Date: ${new Date(jobCard.jobInDate).toLocaleDateString()}</li>
                <li>Vehicle Number: ${jobCard.vehicleNumber}</li>
                <li>Service Type: ${jobCard.serviceType}</li>
                <li>Description: ${jobCard.jobDescription}</li>
              </ul>
            </div>
            <p>Please contact us to schedule your next service appointment. Regular maintenance helps prevent costly repairs and ensures your vehicle's safety and reliability.</p>
            <p style="color: #4b5563; margin-top: 20px;">
              Best regards,<br>
              ${garage.name}
            </p>
            ${garage.invoiceFooter ? `<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 0.875rem;">${garage.invoiceFooter}</p>
            </div>` : ''}
          </div>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Sent automatic reminder to ${jobCard.customer.email} for vehicle ${jobCard.vehicleNumber}`);
        
        // Record successful reminder
        await ServiceReminder.create({
          jobCard: jobCard._id,
          customer: jobCard.customer._id,
          vehicleNumber: jobCard.vehicleNumber,
          lastServiceDate: jobCard.jobInDate,
          reminderSentDate: new Date(),
          status: "sent"
        });
      } catch (error) {
        console.error(`Failed to send automatic reminder to ${jobCard.customer.email}:`, error);
        
        // Record failed reminder
        await ServiceReminder.create({
          jobCard: jobCard._id,
          customer: jobCard.customer._id,
          vehicleNumber: jobCard.vehicleNumber,
          lastServiceDate: jobCard.jobInDate,
          reminderSentDate: new Date(),
          status: "failed",
          errorMessage: error.message
        });
      }
    }
  } catch (error) {
    console.error("Error in automatic service reminder:", error);
  }
};

// Schedule the automatic service reminder to run daily at 9 AM
cron.schedule('0 9 * * *', async () => {
  console.log('Running scheduled service reminder check...');
  await sendAutomaticServiceReminder();
});

// Test endpoint for automatic service reminder
const testAutomaticServiceReminder = async (req, res) => {
  try {
    await sendAutomaticServiceReminder();
    res.status(200).json({ message: "Automatic service reminder test completed" });
  } catch (error) {
    console.error("Error in test automatic service reminder:", error);
    res.status(500).json({ 
      message: "Failed to test automatic service reminder",
      error: error.message 
    });
  }
};

// Get reminder history
const getReminderHistory = async (req, res) => {
  try {
    const reminders = await ServiceReminder.find()
      .populate('jobCard')
      .populate('customer')
      .sort({ createdAt: -1 });
    
    res.status(200).json(reminders);
  } catch (error) {
    console.error("Error fetching reminder history:", error);
    res.status(500).json({ 
      message: "Failed to fetch reminder history",
      error: error.message 
    });
  }
};

module.exports = {
  sendEmail,
  sendOffer,
  sendServiceReminder,
  getServiceHistory,
  sendBulkOffer,
  sendAutomaticServiceReminder,
  testAutomaticServiceReminder,
  getReminderHistory,
}; 