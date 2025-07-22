const mongoose = require("mongoose");

const GstBillSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    gstin: {
      type: String,
      // required: [true, "GSTIN is required"],
      match: [
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        "Invalid GSTIN format",
      ],
    },
    invoiceNo: {
      type: String,
      // required: true,
      unique: true,
      trim: true,
    },
    invoiceDate: {
      type: Date,
      // required: true,
    },
    items: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
          required: true
        },
        quantity: { type: Number, required: true },
        rate: { type: Number, required: true },
        gstPercent: { type: Number, required: true },
        actualAmount: { type: Number, required: true },
        gstAmount: { type: Number, required: true },
        totalAmount: { type: Number, required: true },
      },
    ],
    mechanicCharge: {
      type: String,
      trim: true,
    },
    totalAmount: {
      type: String,
      trim: true,
    },
    gst: {
      type: Number,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const GstBill = mongoose.model("GstBill", GstBillSchema);
module.exports = GstBill;
