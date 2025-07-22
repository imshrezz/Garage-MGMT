const GstBill = require("../models/GstBill");
const Garage = require("../models/GarageProfile");
const JobCard = require("../models/JobCard");
const Item = require("../models/Item");
const { generateInvoice } = require("../generateInvoice");

// CREATE GST Bill
const createGstBill = async (req, res) => {
  try {
    const {
      customer,
      vehicleId,
      gstin,
      gst,
      totalAmount,
      mechanicCharge,
      invoiceNo,
      invoiceDate,
      items, // array of items with itemId, quantity, rate, etc.
    } = req.body;

    // Validate that all items exist
    const itemIds = items.map(item => item.itemId);
    const existingItems = await Item.find({ _id: { $in: itemIds } });
    
    if (existingItems.length !== itemIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more items not found"
      });
    }

    // Format items for the bill
    const formattedItems = items.map(item => ({
      item: item.itemId,
      quantity: item.quantity,
      rate: item.rate,
      gstPercent: item.gstPercent,
      actualAmount: item.actualAmount,
      gstAmount: item.gstAmount,
      totalAmount: item.totalAmount
    }));

    // Create GST Bill
    const bill = await GstBill.create({
      customer,
      vehicleId,
      gstin,
      gst,
      totalAmount,
      mechanicCharge,
      invoiceNo,
      invoiceDate,
      items: formattedItems,
    });

    res.status(201).json({
      success: true,
      billId: bill._id,
      message: "GST bill created successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get count of all GST Bills
const getAllGstBillsCount = async (req, res) => {
  try {
    const count = await GstBill.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// READ all GST Bills
const getAllGstBills = async (req, res) => {
  try {
    const bills = await GstBill.find()
      .populate("customer")
      .populate("items")
      .sort({ createdAt: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ single GST Bill
const getGstBillById = async (req, res) => {
  try {
    const bill = await GstBill.findById(req.params.id)
      .populate("customer")
      .populate("items");

    if (!bill) return res.status(404).json({ message: "GST Bill not found" });

    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE GST Bill
const updateGstBill = async (req, res) => {
  try {
    const bill = await GstBill.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("customer items");

    if (!bill) return res.status(404).json({ message: "GST Bill not found" });

    res.json(bill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE GST Bill
const deleteGstBill = async (req, res) => {
  try {
    const bill = await GstBill.findByIdAndDelete(req.params.id);
    if (!bill) return res.status(404).json({ message: "GST Bill not found" });

    res.json({ message: "GST Bill deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// TOTAL Amount Calculation
const calculateGstBillTotal = async (req, res) => {
  try {
    const bill = await GstBill.findById(req.params.id)
      .populate("customer")
      .populate("items");

    if (!bill) return res.status(404).json({ message: "Bill not found" });

    let totalAmount = 0;
    let gstBreakdown = {};

    bill.items.forEach((item) => {
      totalAmount += item.amount;

      const gst = (item.amount * item.gstPercent) / 100;
      gstBreakdown[item.gstPercent] =
        (gstBreakdown[item.gstPercent] || 0) + gst;
    });

    const totalGst = Object.values(gstBreakdown).reduce((a, b) => a + b, 0);
    const grandTotal = totalAmount + totalGst;

    res.json({
      customer: bill.customer.name,
      invoiceNo: bill.invoiceNo,
      invoiceDate: bill.invoiceDate,
      items: bill.items.map((item) => ({
        description: item.description,
        hsnCode: item.hsnCode,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
        gstPercent: item.gstPercent,
        mechanicCharge: item.mechanicCharge,
      })),
      gstBreakdown,
      totalAmount,
      totalGst,
      grandTotal,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateGstBillPDF = async (req, res) => {
  try {
    // Fetch garage details
    const garage = await Garage.findOne();
    if (!garage) {
      return res.status(404).json({ message: "Garage details not found" });
    }

    const bill = await GstBill.findById(req.params.id)
      .populate({
        path: "customer",
        select: "name mobile address vehicles gstin",
      })
      .populate({
        path: "items.item",
        model: "Item"
      });

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    // Find selected vehicle
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

    // Build items data and calculate totals
    const items = bill.items.map((item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      const gstPercent = parseFloat(item.gstPercent) || 0;

      // Calculate amounts for each item
      const actualAmount = quantity * rate;
      const gstAmount = (actualAmount * gstPercent) / 100;
      const totalAmount = actualAmount + gstAmount;

      return {
        description: item.item?.description || "",
        hsnCode: item.item?.hsnCode || "",
        quantity: quantity,
        rate: rate,
        gstPercent: gstPercent,
        actualAmount: actualAmount,
        gstAmount: gstAmount,
        totalAmount: totalAmount,
      };
    });

    // Calculate totals
    const totalActualAmount = items.reduce(
      (sum, item) => sum + item.actualAmount,
      0
    );
    const totalGST = items.reduce((sum, item) => sum + item.gstAmount, 0);

    // Get mechanic charge - similar to nonGstBillController
    const mechanicCharge = parseFloat(bill.mechanicCharge) || 0;

    // Calculate GST breakdown
    const gstBreakdown = {};
    items.forEach((item) => {
      if (!gstBreakdown[item.gstPercent]) {
        gstBreakdown[item.gstPercent] = {
          amount: 0,
          percent: item.gstPercent,
        };
      }
      gstBreakdown[item.gstPercent].amount += item.gstAmount;
    });

    const grandTotal = totalActualAmount + totalGST + mechanicCharge;

    // Format data for invoice generation
    const billData = {
      invoiceNo: bill.invoiceNo,
      invoiceDate: bill.invoiceDate,
      garage: {
        name: garage.garageName,
        address: `${garage.address}, ${garage.city}, ${garage.state} - ${garage.zipCode}`,
        gstin: garage.gstNumber,
        phone: garage.phone,
        email: garage.email || "",
      },
      customer: {
        name: bill.customer?.name || "",
        mobile: bill.customer?.mobile || "",
        gstin: bill.customer?.gstin || "",
      },
      vehicle: {
        number: selectedVehicle.vehicleNumber,
        model: selectedVehicle.model || "",
        km: latestJobCard ? latestJobCard.kmIn.toString() : "N/A",
      },
      items: items,
      mechanicCharge: mechanicCharge,
      totalActualAmount: totalActualAmount,
      totalGST: totalGST,
      gstBreakdown: Object.values(gstBreakdown),
      grandTotal: grandTotal,
    };

    // Generate PDF buffer
    const pdfBuffer = await generateInvoice(billData);

    // Set headers and send PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=GST-Bill-${bill.invoiceNo}.pdf`
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
};

module.exports = {
  createGstBill,
  getAllGstBillsCount,
  getAllGstBills,
  getGstBillById,
  updateGstBill,
  deleteGstBill,
  calculateGstBillTotal,
  generateGstBillPDF,
};
