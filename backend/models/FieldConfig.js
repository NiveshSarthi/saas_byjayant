const mongoose = require('mongoose');

const fieldConfigSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['departments', 'positions', 'levels'],
    unique: true
  },
  values: [{
    type: String,
    required: true
  }],
  positions: [{
    name: {
      type: String,
      required: true
    },
    department: {
      type: String,
      required: true
    },
    level: {
      type: String,
      required: true
    }
  }]
}, {
  timestamps: true
});

// Ensure only one document per type
fieldConfigSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existing = await this.constructor.findOne({ type: this.type });
    if (existing) {
      // Update existing document instead of creating new one
      existing.values = this.values;
      existing.positions = this.positions;
      await existing.save();
      next(new Error('Document updated instead of created'));
    }
  }
  next();
});

module.exports = mongoose.model('FieldConfig', fieldConfigSchema);