const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  // Compliance fields
  complianceStatus: {
    type: String,
    enum: ['Compliant', 'Non-Compliant'],
    default: 'Non-Compliant'
  },
  minimumWage: {
    type: Number,
    default: 1500
  },
  category: {
    type: String,
    default: 'Skilled'
  },
  designation: {
    type: String,
    required: true
  },
  reportingManagerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  basicSalary: {
    type: Number,
    required: true
  },
  hra: {
    type: Number,
    default: 0
  },
  conveyance: {
    type: Number,
    default: 0
  },
  specialAllowance: {
    type: Number,
    default: 0
  },
  otherAllowance: {
    type: Number,
    default: 0
  },
  lta: {
    type: Number,
    default: 0
  },
  medical: {
    type: Number,
    default: 0
  },
  pf: {
    type: Number,
    default: 0
  },
  esi: {
    type: Number,
    default: 0
  },
  lwf: {
    type: Number,
    default: 0
  },
  bonus: {
    type: Number,
    default: 0
  },
  professionalTax: {
    type: Number,
    default: 0
  },
  tds: {
    type: Number,
    default: 0
  },
  gratuity: {
    type: Number,
    default: 0
  },
  allowances: {
    type: Number,
    default: 0
  },
  incentives: {
    type: Number,
    default: 0
  },
  performanceRewards: {
    type: Number,
    default: 0
  },
  variablePart: {
    type: Number,
    default: 0
  },
  deductions: {
    type: Number,
    default: 0
  },
  statutoryCost: {
    type: Number,
    default: 0
  },
  totalCTC: {
    type: Number,
    default: 0
  },
  presentDays: {
    type: Number,
    default: 0
  },
  lateArrivals: {
    type: Number,
    default: 0
  },
  earlyDepartures: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  // Detailed Incentive Structure
  incentiveDetails: {
    salesCount: { type: Number, default: 0 },
    eligibleAmount: { type: Number, default: 0 },
    unlockedAmount: { type: Number, default: 0 },
    lockedAmount: { type: Number, default: 0 },
    managerCommission: { type: Number, default: 0 },
    salaryReward: { type: Number, default: 0 }, // For the +50% Salary Reward
    comments: String
  },
  // Exact Attendance Breakdown
  attendanceDetails: {
    presentDays: { type: Number, default: 0 },
    weeklyOffs: { type: Number, default: 0 },
    leaves: { type: Number, default: 0 },
    halfDays: { type: Number, default: 0 },
    absentDays: { type: Number, default: 0 },
    lateMarks: { type: Number, default: 0 },
    paidDays: { type: Number, default: 0 }, // The final calculated paid days
    dailyRate: { type: Number, default: 0 }
  },
  employerSide: {
    pf: Number,
    pfAdmin: Number,
    esi: Number,
    lwf: Number,
    bonus: Number,
    gratuity: Number
  },
  auditTrail: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Audit'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Payroll', payrollSchema);