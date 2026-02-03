const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  checkInTime: {
    type: Date,
    required: true,
  },
  checkOutTime: {
    type: Date,
  },
  checkInLocation: {
    lat: Number,
    lng: Number,
  },
  checkOutLocation: {
    lat: Number,
    lng: Number,
  },
  workingHours: {
    type: Number, // in hours, calculated
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Attendance', attendanceSchema);