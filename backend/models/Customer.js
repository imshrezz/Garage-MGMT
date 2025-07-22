const mongoose = require("mongoose");
const vehicleSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true },
  brand: { type: String },
  model: { type: String },
  fuelType: { type: String, required: true },
  vehicleType: { type: String, required: true },
  registrationDate: { type: String },
  insuranceExpiry: { type: String },
});

const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    alternateNumber: { type: String },
    email: { type: String },
    address: { type: String },
    vehicles: [vehicleSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", CustomerSchema);
