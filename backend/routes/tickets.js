const express = require('express');
const ticketController = require('../controllers/ticketController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get tickets for current user
router.get('/', ticketController.getTickets);

// Get ticket statistics
router.get('/stats', ticketController.getTicketStats);

// Create new ticket
router.post('/', ticketController.createTicket);

// Get ticket by ID
router.get('/:id', ticketController.getTicketById);

// Update ticket status
router.put('/:id/status', ticketController.updateTicketStatus);

// Add response to ticket
router.post('/:id/response', ticketController.upload.array('attachments', 5), ticketController.addResponse);

module.exports = router;