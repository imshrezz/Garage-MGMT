const Garage = require("../models/GarageProfile");
const fs = require("fs").promises;
const path = require("path");

// Get garage details (assumes only one document)
const getGarage = async (req, res) => {
  try {
    const garage = await Garage.findOne();
    if (!garage) {
      return res
        .status(404)
        .json({ success: false, message: "Garage details not found" });
    }
    res.json({ success: true, garage });
  } catch (error) {
    console.error("Error fetching garage details:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Create garage details (only if not already exists)
const createGarage = async (req, res) => {
  try {
    const existing = await Garage.findOne();
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Garage details already exist" });
    }

    // Default dummy data
    const dummyData = {
      garageName: "My Auto Garage",
      phone: "+91 9876543210",
      email: "contact@myautogarage.com",
      address: "123 Main Street",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400001",
      footerMessage: "Thank you for choosing our services!",
      gstNumber: "27ABCDE1234F1Z5",
      enableGST: true,
      gstRate: 18
    };

    // Merge dummy data with any provided data
    const garageData = {
      ...dummyData,
      ...req.body,
      userId: req.user._id // Assuming user ID is available in request
    };

    const garage = new Garage(garageData);
    const saved = await garage.save();
    res.status(201).json({ success: true, garage: saved });
  } catch (error) {
    console.error("Error creating garage details:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update garage details (updates the first/only one)
const updateGarage = async (req, res) => {
  try {
    const garage = await Garage.findOne();
    if (!garage) {
      return res
        .status(404)
        .json({ success: false, message: "Garage details not found" });
    }

    // Handle logo removal
    if (req.body.removeLogo) {
      if (garage.logo) {
        const logoPath = path.join(
          __dirname,
          "..",
          "uploads",
          path.basename(garage.logo)
        );
        try {
          await fs.unlink(logoPath);
        } catch (error) {
          console.error("Error deleting old logo:", error);
        }
      }
      garage.logo = null;
    }

    // Handle logo upload
    if (req.file) {
      // Delete old logo if exists
      if (garage.logo) {
        const oldLogoPath = path.join(
          __dirname,
          "..",
          "uploads",
          path.basename(garage.logo)
        );
        try {
          await fs.unlink(oldLogoPath);
        } catch (error) {
          console.error("Error deleting old logo:", error);
        }
      }

      // Save new logo path
      garage.logo = `/uploads/${req.file.filename}`;
    }

    // Update other fields
    const updateFields = [
      "name",
      "phone",
      "email",
      "addressLine",
      "city",
      "state",
      "postalCode",
      "invoiceFooter",
      "gstno",
    ];

    updateFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        garage[field] = req.body[field];
      }
    });

    const updated = await garage.save();
    res.json({ success: true, garage: updated });
  } catch (error) {
    console.error("Error updating garage details:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getGarage,
  createGarage,
  updateGarage,
};
