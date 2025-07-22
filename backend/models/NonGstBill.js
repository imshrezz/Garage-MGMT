const mongoose = require("mongoose");

const NonGstBillSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  invoiceNo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  invoiceDate: {
    type: Date,
    required: true,
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
  }],
  mechanicCharge: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  additionalNotes: {
    type: String,
    default: ""
  },
  garage: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    gstin: { type: String, required: true },
    state: { type: String, required: true }
  }
}, {
  timestamps: true,
});

const NonGstBill = mongoose.model("NonGstBill", NonGstBillSchema);
module.exports = NonGstBill;
