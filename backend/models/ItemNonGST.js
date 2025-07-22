const mongoose = require('mongoose');

const itemNonGstSchema = new mongoose.Schema({
  nonGstBillingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NonGSTBilling',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  hsnCode: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  rate: {
    type: Number,
    required: true,
    min: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('ItemNonGST', itemNonGstSchema);
