const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true,
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['general', 'payroll', 'leave', 'attendance', 'hr', 'it', 'facility', 'other'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String
  }],
  responses: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: {
      type: String,
      required: true
    },
    attachments: [{
      filename: String,
      originalName: String,
      mimeType: String,
      size: Number,
      url: String
    }],
    isInternal: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [String],
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Generate unique ticket ID
ticketSchema.pre('save', async function(next) {
  if (this.isNew) {
    const currentYear = new Date().getFullYear();
    let counter = Math.floor(Math.random() * 1000000); // Start with random number to avoid conflicts
    let ticketId;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      ticketId = `TKT${currentYear}${counter.toString().padStart(6, '0')}`;
      counter++;
      attempts++;
      if (attempts >= maxAttempts) {
        return next(new Error('Unable to generate unique ticket ID'));
      }
    } while (await mongoose.model('Ticket').findOne({ ticketId }));

    this.ticketId = ticketId;
  }
  next();
});

// Index for efficient queries
ticketSchema.index({ sender: 1, status: 1, createdAt: -1 });
ticketSchema.index({ recipient: 1, status: 1, createdAt: -1 });
ticketSchema.index({ assignedTo: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Ticket', ticketSchema);