const mongoose = require('mongoose');

const NonGSTBillingSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicle_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  billingNumber: String,
  billingDate: Date,
  total: Number,
  additionalNotes: String
}, { timestamps: true });

module.exports = mongoose.model('NonGSTBilling', NonGSTBillingSchema);
