const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    hsnCode: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    rate: { type: Number, required: true, min: 0 },
    gstPercent: { type: Number, enum: [0, 5, 12, 18, 28] },
    amount: { type: Number, min: 0 },
  },
  {
    timestamps: true,
  }
);

// Auto-calculate amount before saving
ItemSchema.pre("save", function (next) {
  this.amount = this.quantity * this.rate;
  next();
});

const Item = mongoose.model("Item", ItemSchema);
module.exports = Item;
