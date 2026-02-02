const mongoose = require('mongoose');

const fnfSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  resignationDate: {
    type: Date,
    required: true
  },
  lastWorkingDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true,
    enum: ['Personal Reasons', 'Better Opportunity', 'Health Issues', 'Termination', 'Retirement', 'Other']
  },
  noticePeriodServed: {
    type: Boolean,
    default: false
  },
  buyoutAmount: {
    type: Number,
    default: 0
  },
  finalPayroll: {
    basicSalary: Number,
    hra: Number,
    pf: Number,
    gratuity: Number,
    allowances: Number,
    incentives: Number,
    performanceRewards: Number,
    deductions: Number,
    total: Number
  },
  dues: {
    salary: Number,
    leaveEncashment: Number,
    gratuity: Number,
    pf: Number,
    otherBenefits: Number,
    totalPayable: Number
  },
  recoveries: {
    advances: Number,
    loans: Number,
    damages: Number,
    otherDeductions: Number,
    totalRecoverable: Number
  },
  netAmount: {
    type: Number,
    required: true
  },
  paymentDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Initiated', 'Under Review', 'Approved', 'Paid', 'Completed'],
    default: 'Initiated'
  },
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('FNF', fnfSchema);