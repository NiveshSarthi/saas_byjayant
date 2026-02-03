const Ticket = require('../models/Ticket');
// const Notification = require('../models/Notification');
// const { createNotification } = require('./notificationController');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/tickets/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'ticket-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Get tickets for current user (sent or received)
const getTickets = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category } = req.query;
    const query = {
      $or: [
        { sender: req.user.id },
        { recipient: req.user.id }
      ]
    };

    if (status) query.status = status;
    if (category) query.category = category;

    const tickets = await Ticket.find(query)
      .populate('sender', 'name email')
      .populate('recipient', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Ticket.countDocuments(query);

    res.json({
      tickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new ticket
const createTicket = async (req, res) => {
  try {
    const { subject, message, category, priority } = req.body;

    // Handle file attachments (disabled for now)
    const attachments = [];
    // File upload functionality can be added later

    const ticket = new Ticket({
      sender: req.user.id,
      subject,
      message,
      category: category || 'general',
      priority: priority || 'medium',
      attachments
    });

    await ticket.save();

    // Create notification for HR/admin users
    // This would need to be enhanced to notify appropriate HR personnel
    // Temporarily disabled for debugging
    /*
    try {
      await createNotification(
        req.user.id, // For now, notify the sender as well
        'Ticket Created',
        `Your ticket "${subject}" has been submitted successfully.`,
        'success',
        'hr',
        `/tickets/${ticket._id}`
      );
    } catch (notifError) {
      console.error('Notification creation error:', notifError);
    }
    */

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get ticket by ID
const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('sender', 'name email')
      .populate('recipient', 'name email')
      .populate('assignedTo', 'name email')
      .populate('responses.sender', 'name email');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if user has permission to view this ticket
    if (ticket.sender.toString() !== req.user.id && ticket.recipient?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Get ticket by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update ticket status
const updateTicketStatus = async (req, res) => {
  try {
    const { status, assignedTo } = req.body;

    const updateData = { status };
    if (assignedTo) updateData.assignedTo = assignedTo;

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('sender', 'name email')
     .populate('recipient', 'name email')
     .populate('assignedTo', 'name email');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Create notification for status update
    try {
      const recipientId = ticket.sender.toString() === req.user.id ? ticket.recipient : ticket.sender;
      if (recipientId) {
        await createNotification(
          recipientId,
          'Ticket Status Updated',
          `Ticket "${ticket.subject}" status changed to ${status}`,
          'info',
          'hr',
          `/tickets/${ticket._id}`
        );
      }
    } catch (notifError) {
      console.error('Status update notification error:', notifError);
    }

    res.json(ticket);
  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add response to ticket
const addResponse = async (req, res) => {
  try {
    const { message, isInternal = false } = req.body;

    // Handle file attachments for response
    const attachments = [];
    if (req.files) {
      req.files.forEach(file => {
        attachments.push({
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: `/uploads/tickets/${file.filename}`
        });
      });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check permissions
    if (ticket.sender.toString() !== req.user.id && ticket.recipient?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    ticket.responses.push({
      sender: req.user.id,
      message,
      attachments,
      isInternal
    });

    await ticket.save();

    // Create notification for the other party
    try {
      const recipientId = ticket.sender.toString() === req.user.id ? ticket.recipient : ticket.sender;
      if (recipientId) {
        await createNotification(
          recipientId,
          'New Ticket Response',
          `New response added to ticket "${ticket.subject}"`,
          'info',
          'hr',
          `/tickets/${ticket._id}`
        );
      }
    } catch (notifError) {
      console.error('Response notification error:', notifError);
    }

    res.json(ticket);
  } catch (error) {
    console.error('Add response error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get ticket statistics
const getTicketStats = async (req, res) => {
  try {
    const stats = await Ticket.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user.id },
            { recipient: req.user.id }
          ]
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      open: 0,
      'in-progress': 0,
      resolved: 0,
      closed: 0
    };

    stats.forEach(stat => {
      result[stat._id] = stat.count;
    });

    res.json(result);
  } catch (error) {
    console.error('Get ticket stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getTickets,
  createTicket,
  getTicketById,
  updateTicketStatus,
  addResponse,
  getTicketStats,
  upload
};