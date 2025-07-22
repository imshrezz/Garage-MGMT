const mongoose = require("mongoose");

const GarageProfileSchema = new mongoose.Schema(
  {
    logo: {
      type: String, // Store image URL or file path
    },
    garageName: {
      type: String,
      required: true,
    },
    phone: String,
    email: {
      type: String,
      required: true,
    },
    address: String,
    city: String,
    state: String,
    zipCode: String,
    footerMessage: String,
    enableGST: {
      type: Boolean,
      default: false,
    },
    gstNumber: String,
    gstRate: {
      type: Number,
      enum: [0, 5, 12, 18, 28],
      default: 18,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GarageProfile", GarageProfileSchema);
