const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Electricity Bill', 'Water Bill', 'Internet/Subscriptions', 'Office Maintenance', 'Stationery Purchase', 'Pantry/Catering', 'Software/Tools', 'Marketing Expense', 'Other'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  department: {
    type: String,
    enum: ['Administration', 'HR', 'Sales', 'Marketing', 'Accounts', 'IT', 'Operations'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  rejectionReason: {
    type: String,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedAt: {
    type: Date,
  },
  receipt: {
    type: String, // URL or path to receipt file
  },
}, {
  timestamps: true,
});

// Add indexes for better performance
expenseSchema.index({ submittedBy: 1 });
expenseSchema.index({ status: 1 });
expenseSchema.index({ department: 1 });
expenseSchema.index({ date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);