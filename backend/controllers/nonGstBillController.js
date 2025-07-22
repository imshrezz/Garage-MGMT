const NonGstBill = require("../models/NonGstBill");
const Customer = require("../models/Customer");
const Item = require("../models/Item");
const Garage = require("../models/GarageProfile");
const JobCard = require("../models/JobCard");
const { generateNonGstInvoice } = require("../generateInvoice");

// CREATE Non-GST Bill
const createNonGstBill = async (req, res) => {
  try {
    const {
      customer,
      vehicleId,
      invoiceNo,
      invoiceDate,
      items,
      totalAmount,
      mechanicCharge,
      additionalNotes,
      garage,
      customerDetails,
      vehicleDetails,
    } = req.body;

    const bill = new NonGstBill({
      customer,
      vehicleId,
      invoiceNo,
      invoiceDate,
      items,
      totalAmount,
      mechanicCharge,
      additionalNotes,
      garage,
    });

    await bill.save();
    const populatedBill = await bill.populate([
      { path: "customer" },
      { path: "items" },
      { path: "vehicleId" },
    ]);
    res.status(201).json(populatedBill);
  } catch (error) {
    console.error("Error creating Non-GST bill:", error);
    res.status(400).json({ message: error.message });
  }
};

// READ all Non-GST Bills
const getAllNonGstBills = async (req, res) => {
  try {
    const bills = await NonGstBill.find()
      .populate("customer")
      .populate("items")
      .sort({ createdAt: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ single Non-GST Bill
const getNonGstBillById = async (req, res) => {
  try {
    const bill = await NonGstBill.findById(req.params.id)
      .populate("customer")
      .populate("items");

    if (!bill) return res.status(404).json({ message: "Bill not found" });

    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate PDF for Non-GST Bill
const generateNonGstBillPDF = async (req, res) => {
  try {
    // Fetch garage details
    const garage = await Garage.findOne();
    if (!garage) {
      return res.status(404).json({ message: "Garage details not found" });
    }

    const bill = await NonGstBill.findById(req.params.id)
      .populate({
        path: "customer",
        select: "name mobile address vehicles",
      })
      .populate("items");

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    // Find the specific vehicle from customer's vehicles array
    const selectedVehicle = bill.customer.vehicles.find(
      (vehicle) => vehicle._id.toString() === bill.vehicleId.toString()
    );

    if (!selectedVehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Fetch the latest job card for this vehicle to get KM reading
    const latestJobCard = await JobCard.findOne({
      customer: bill.customer._id,
      vehicleNumber: selectedVehicle.vehicleNumber,
    }).sort({ createdAt: -1 });

    // Calculate total amount from items
    const itemsTotal = bill.items.reduce((sum, item) => {
      const quantity = item.quantity || 0;
      const rate = item.rate || 0;
      return sum + quantity * rate;
    }, 0);

    const mechanicCharge = bill.mechanicCharge || 0;
    const totalAmount = itemsTotal + mechanicCharge;

    // Format bill data for PDF generation
    const billData = {
      invoiceNo: bill.invoiceNo,
      invoiceDate: bill.invoiceDate,
      totalAmount: totalAmount,
      mechanicCharge: mechanicCharge,
      additionalNotes: bill.additionalNotes || "",
      garage: {
        name: garage.name,
        address: `${garage.addressLine}, ${garage.city}, ${garage.state} - ${garage.postalCode}`,
        gstin: garage.gstno,
        phone: garage.phone,
        email: garage.email,
      },
      customerDetails: {
        name: bill.customer?.name || "",
        mobile: bill.customer?.mobile || "",
        address: bill.customer?.address || "",
      },
      vehicleDetails: {
        number: selectedVehicle.vehicleNumber,
        brand: selectedVehicle.brand,
        model: selectedVehicle.model,
        km: latestJobCard ? latestJobCard.kmIn.toString() : "N/A",
        registrationDate: selectedVehicle.registrationDate || "",
        insuranceExpiry: selectedVehicle.insuranceExpiry || "",
      },
      items: bill.items.map((item) => ({
        description: item.description || "",
        quantity: item.quantity || 0,
        rate: item.rate || 0,
        amount: (item.quantity || 0) * (item.rate || 0),
      })),
    };

    // Generate PDF
    const pdfBuffer = await generateNonGstInvoice(billData);

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Non-GST-Bill-${bill.invoiceNo}.pdf`
    );

    // Send PDF
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
};

// UPDATE Non-GST Bill
const updateNonGstBill = async (req, res) => {
  try {
    const bill = await NonGstBill.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("customer items");

    if (!bill) return res.status(404).json({ message: "Bill not found" });

    res.json(bill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE Non-GST Bill
const deleteNonGstBill = async (req, res) => {
  try {
    const bill = await NonGstBill.findByIdAndDelete(req.params.id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    res.json({ message: "Bill deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// TOTAL Amount Calculation
const calculateNonGstBillTotal = async (req, res) => {
  try {
    const bill = await NonGstBill.findById(req.params.id)
      .populate("customer")
      .populate("items");

    if (!bill) return res.status(404).json({ message: "Bill not found" });

    let totalAmount = 0;

    bill.items.forEach((item) => {
      totalAmount += item.amount;
    });

    res.json({
      customer: bill.customer.name,
      invoiceNo: bill.invoiceNo,
      invoiceDate: bill.invoiceDate,
      items: bill.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
        mechanicCharge: item.mechanicCharge,
      })),
      totalAmount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get count of all Non-GST Bills
const getAllNonGstBillsCount = async (req, res) => {
  try {
    const count = await NonGstBill.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createNonGstBill,
  getAllNonGstBills,
  getNonGstBillById,
  updateNonGstBill,
  deleteNonGstBill,
  calculateNonGstBillTotal,
  generateNonGstBillPDF,
  getAllNonGstBillsCount,
};
