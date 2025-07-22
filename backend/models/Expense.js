const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String
  },
  paidTo: {
    type: String,
    required: true
  },
  paymentMode: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'UPI', 'Cheque'],
    required: true
  },
  createdBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Expense', ExpenseSchema);
