const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

console.log('Server.js loaded, NODE_ENV:', process.env.NODE_ENV);

const app = express();

// Basic Middleware
app.use(cors());
app.use(express.json());

// Security middleware
const { limiter, authLimiter, securityHeaders, sanitizeInput } = require('./middlewares/security');
app.use(securityHeaders);
app.use(limiter);
app.use(sanitizeInput);

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// MongoDB connection will be after server start

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const employeeRoutes = require('./routes/employees');
app.use('/api/hrms/employees', employeeRoutes);

const assetsRoutes = require('./routes/assets');
app.use('/api/hrms/assets', assetsRoutes);

const recruitmentRoutes = require('./routes/recruitment');
app.use('/api/hrms/recruitment', recruitmentRoutes);

const documentRoutes = require('./routes/documents');
app.use('/api/hrms/documents', documentRoutes);

const atsRoutes = require('./routes/ats');
app.use('/api/ats', atsRoutes);

const payrollRoutes = require('./routes/payroll');
app.use('/api/payroll', payrollRoutes.main);
app.use('/api/payroll', payrollRoutes.employee);

const salesPolicyRoutes = require('./routes/sales-policy');
app.use('/api/sales-policy', salesPolicyRoutes);

const administrationRoutes = require('./routes/administration');
app.use('/api/administration', administrationRoutes);

const fieldConfigRoutes = require('./routes/fieldConfig');
app.use('/api/administration/field-config', fieldConfigRoutes);

const accountsRoutes = require('./routes/accounts');
app.use('/api/accounts', accountsRoutes);

const linkingRoutes = require('../backend-linking-customization/routes/linking');
app.use('/api/linking', linkingRoutes);

const attendanceRoutes = require('./routes/attendance');
app.use('/api/attendance', attendanceRoutes);

const gatepassRoutes = require('./routes/gatepass');
app.use('/api/gatepass', gatepassRoutes);

const notificationRoutes = require('./routes/notifications');
app.use('/api/notifications', notificationRoutes);

const ticketRoutes = require('./routes/tickets');
app.use('/api/tickets', ticketRoutes);

const appraisalRoutes = require('./routes/appraisal');
app.use('/api/hrms/appraisals', appraisalRoutes);

const pipRoutes = require('./routes/pip');
app.use('/api/hrms/pip', pipRoutes);

const fnfRoutes = require('./routes/fnf');
app.use('/api/hrms/fnf', fnfRoutes);

// Error handler (must be last)
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

// Start administration services and server if not in test
if (process.env.NODE_ENV !== 'test') {
  const { scheduleAlerts } = require('./services/administrationService');
  scheduleAlerts();

  const PORT = process.env.PORT || 5000;

  console.log('About to start server, NODE_ENV:', process.env.NODE_ENV, 'PORT:', PORT);
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // MongoDB connection
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.error('MONGO_URI environment variable is required');
    process.exit(1);
  }

  console.log('Attempting to connect to MongoDB...');
  mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  })
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => {
      console.error('MongoDB connection error:', err.message);
      process.exit(1);
    });
}

// Export app for testing
module.exports = app;