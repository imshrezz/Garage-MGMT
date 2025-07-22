const mongoose = require("mongoose");

const jobCardSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    vehicleNumber: { type: String, required: true },
    jobInDate: { type: Date, required: true },
    estimatedDelivery: { type: Date, required: true },
    serviceType: {
      type: String,
      enum: [
        "General Service",
        "Engine Work",
        "Electrical Work",
        "AC Service",
        "Other",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Closed"],
      default: "Pending",
    },
    assignedMechanic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    kmIn: { type: Number, required: true },
    jobDescription: { type: String },
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobCard", jobCardSchema);
