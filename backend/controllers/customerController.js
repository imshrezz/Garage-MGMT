const Customer = require("../models/Customer");
const JobCard = require("../models/JobCard");
const GstBill = require("../models/GstBill");
const NonGstBill = require("../models/NonGstBill");
const nodemailer = require("nodemailer");

// Get all customers
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json({ customers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single customer by ID
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new customer
const createCustomer = async (req, res) => {
  try {
    const {
      name,
      mobile,
      alternateNumber,
      email,
      address,
      vehicles = [],
    } = req.body;

    const customer = new Customer({
      name,
      mobile,
      alternateNumber,
      email,
      address,
      vehicles,
    });

    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ error: error.message || "Error creating customer." });
  }
};

// Update customer by ID (including vehicles)
const updateCustomer = async (req, res) => {
  try {
    const {
      name,
      mobile,
      alternateNumber,
      email,
      address,
      vehicles,
    } = req.body;

    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        name,
        mobile,
        alternateNumber,
        email,
        address,
        vehicles,
      },
      { new: true, runValidators: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json(updatedCustomer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete customer by ID
const deleteCustomer = async (req, res) => {
  try {
    const deleted = await Customer.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json({ message: "Customer deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get customers with job cards
const getCustomersWithJobCards = async (req, res) => {
  try {
    const customers = await Customer.find();
    const customersWithJobCards = await Promise.all(
      customers.map(async (customer) => {
        const jobCard = await JobCard.findOne({ customer: customer._id });
        return jobCard ? customer : null;
      })
    );
    const filteredCustomers = customersWithJobCards.filter(customer => customer !== null);
    res.json({ customers: filteredCustomers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Customer Service History
const getCustomerServiceHistory = async (req, res) => {
  try {
    const customerId = req.params.customerId;
    
    // Get all job cards for the customer
    const jobCards = await JobCard.find({ customer: customerId })
      .sort({ createdAt: -1 });

    // Get all GST bills with items populated
    const gstBills = await GstBill.find({ customer: customerId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'items.item',
        model: 'Item',
        select: 'description hsnCode rate'
      })
      .lean(); // Convert to plain JavaScript object
    
    // Get all Non-GST bills with items populated
    const nonGstBills = await NonGstBill.find({ customer: customerId })
      .sort({ createdAt: -1 })
      .populate('items')
      .lean();

    // Combine and format the service history
    const serviceHistory = {
      jobCards: jobCards.map(job => ({
        date: job.createdAt,
        type: 'Job Card',
        vehicleNumber: job.vehicleNumber,
        kmReading: job.kmIn,
        services: [job.serviceType]
      })),
      gstBills: gstBills.map(bill => {
        // Format items with proper error handling
        const formattedItems = bill.items.map(item => {
          try {
            if (!item.item) {
              console.log('Missing item reference in bill:', bill._id, 'item:', item);
              return 'Unknown Item';
            }
            
            const description = item.item.description || 'Unknown Item';
            const quantity = item.quantity || 1;
            const rate = item.rate || 0;
            
            return `${description} (${quantity} x ₹${rate})`;
          } catch (error) {
            console.error('Error formatting item:', error);
            return 'Unknown Item';
          }
        }).filter(Boolean);

        return {
          date: bill.createdAt,
          type: 'GST Bill',
          invoiceNo: bill.invoiceNo,
          items: formattedItems,
          totalAmount: parseFloat(bill.totalAmount) || 0,
          mechanicCharge: parseFloat(bill.mechanicCharge) || 0
        };
      }),
      nonGstBills: nonGstBills.map(bill => {
        // Format items with proper error handling
        const formattedItems = (bill.items || []).map(item => {
          try {
            if (!item) {
              console.log('Missing item in non-GST bill:', bill._id);
              return 'Unknown Item';
            }
            
            const description = item.description || 'Unknown Item';
            return description;
          } catch (error) {
            console.error('Error formatting non-GST item:', error);
            return 'Unknown Item';
          }
        }).filter(Boolean);

        return {
          date: bill.createdAt,
          type: 'Non-GST Bill',
          invoiceNo: bill.invoiceNo,
          items: formattedItems,
          totalAmount: parseFloat(bill.totalAmount) || 0,
          mechanicCharge: parseFloat(bill.mechanicCharge) || 0
        };
      })
    };

    res.json(serviceHistory);
  } catch (error) {
    console.error("Error fetching service history:", error);
    res.status(500).json({ message: "Failed to fetch service history" });
  }
};

// Send Service Reminder Email
const sendServiceReminder = async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const customer = await Customer.findById(customerId);
    
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Get customer's service history
    const jobCards = await JobCard.find({ customer: customerId })
      .sort({ createdAt: -1 })
      .limit(1);

    if (jobCards.length === 0) {
      return res.status(400).json({ message: "No service history found for this customer" });
    }

    const lastService = jobCards[0];
    const lastServiceDate = new Date(lastService.createdAt);
    const currentDate = new Date();
    const monthsSinceLastService = (currentDate - lastServiceDate) / (1000 * 60 * 60 * 24 * 30);

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Prepare email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: customer.email,
      subject: 'Vehicle Service Reminder',
      html: `
        <h2>Service Reminder</h2>
        <p>Dear ${customer.name},</p>
        <p>We hope this email finds you well. We noticed that it has been ${Math.round(monthsSinceLastService)} months since your last service.</p>
        <p>Last Service Details:</p>
        <ul>
          <li>Date: ${lastServiceDate.toLocaleDateString()}</li>
          <li>Vehicle: ${lastService.vehicleNumber}</li>
          <li>KM Reading: ${lastService.kmIn}</li>
        </ul>
        <p>To ensure your vehicle's optimal performance and safety, we recommend scheduling a service appointment.</p>
        <p>Please contact us to book your service appointment.</p>
        <p>Best regards,<br>Your Garage Team</p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.json({ 
      message: "Service reminder email sent successfully",
      lastServiceDate: lastServiceDate,
      monthsSinceLastService: Math.round(monthsSinceLastService)
    });
  } catch (error) {
    console.error("Error sending service reminder:", error);
    res.status(500).json({ message: "Failed to send service reminder" });
  }
};

// Get Customers Due for Service
const getCustomersDueForService = async (req, res) => {
  try {
    const customers = await Customer.find();
    const customersDueForService = [];

    for (const customer of customers) {
      const lastJobCard = await JobCard.findOne({ customer: customer._id })
        .sort({ createdAt: -1 });

      if (lastJobCard) {
        const lastServiceDate = new Date(lastJobCard.createdAt);
        const currentDate = new Date();
        const monthsSinceLastService = (currentDate - lastServiceDate) / (1000 * 60 * 60 * 24 * 30);

        // Consider a customer due for service if it's been more than 3 months
        if (monthsSinceLastService >= 3) {
          customersDueForService.push({
            customerId: customer._id,
            name: customer.name,
            email: customer.email,
            mobile: customer.mobile,
            lastServiceDate: lastServiceDate,
            monthsSinceLastService: Math.round(monthsSinceLastService),
            vehicleNumber: lastJobCard.vehicleNumber
          });
        }
      }
    }

    res.json(customersDueForService);
  } catch (error) {
    console.error("Error fetching customers due for service:", error);
    res.status(500).json({ message: "Failed to fetch customers due for service" });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomersWithJobCards,
  getCustomerServiceHistory,
  sendServiceReminder,
  getCustomersDueForService
};

