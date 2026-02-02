const Gatepass = require('../models/Gatepass');
const Employee = require('../models/Employee');
const { applyGatepassDeduction, creditGatepassApproval } = require('../services/gatepassService');

const requestGatepass = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const { reason, startTime, endTime } = req.body;
    const gatepass = new Gatepass({
      employee: employee._id,
      requestDate: new Date(),
      reason,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    });

    await gatepass.save();
    res.status(201).json(gatepass);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyGatepasses = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const gatepasses = await Gatepass.find({ employee: employee._id }).sort({ requestDate: -1 });
    res.json(gatepasses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getPendingGatepasses = async (req, res) => {
  try {
    const gatepasses = await Gatepass.find({ status: 'pending' }).populate('employee').sort({ requestDate: -1 });
    res.json(gatepasses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const approveGatepass = async (req, res) => {
  try {
    const gatepass = await Gatepass.findById(req.params.id);
    if (!gatepass) {
      return res.status(404).json({ message: 'Gatepass not found' });
    }

    gatepass.status = 'approved';
    gatepass.approvedBy = req.user._id;
    gatepass.comments = req.body.comments || '';

    await gatepass.save();
    await creditGatepassApproval(gatepass._id);
    res.json(gatepass);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const rejectGatepass = async (req, res) => {
  try {
    const gatepass = await Gatepass.findById(req.params.id);
    if (!gatepass) {
      return res.status(404).json({ message: 'Gatepass not found' });
    }

    gatepass.status = 'rejected';
    gatepass.approvedBy = req.user._id;
    gatepass.comments = req.body.comments || '';

    await gatepass.save();
    await applyGatepassDeduction(gatepass._id);
    res.json(gatepass);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  requestGatepass,
  getMyGatepasses,
  getPendingGatepasses,
  approveGatepass,
  rejectGatepass,
};