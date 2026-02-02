const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    unique: true,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  hireDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'PIP', 'Resigned'],
    default: 'Active',
  },
  level: {
    type: String,
    required: true,
  },
  reportsTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
  },
  salary: {
    type: Number,
    default: 0,
  },
  phone: {
    type: String,
  },
  isNew: {
    type: Boolean,
    default: true,
  },
  isIntern: {
    type: Boolean,
    default: false,
  },
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
  }],
  onboardingChecklist: {
    loiSent: { type: Boolean, default: false },
    alSent: { type: Boolean, default: false },
    olSent: { type: Boolean, default: false },
    emailCreated: { type: Boolean, default: false },
    assetsAllocated: { type: Boolean, default: false },
    documentsSubmitted: { type: Boolean, default: false },
  },
  assets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
  }],
  category: {
    type: String,
    enum: ['Skilled', 'Unskilled'],
    default: 'Skilled',
  },
  // Add other fields as needed
}, {
  timestamps: true,
});

// Add indexes for better performance
employeeSchema.index({ user: 1 });
employeeSchema.index({ department: 1, position: 1 });
employeeSchema.index({ status: 1 });

module.exports = mongoose.model('Employee', employeeSchema);