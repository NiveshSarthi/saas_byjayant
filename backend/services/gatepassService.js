const Payroll = require('../models/Payroll');
const Gatepass = require('../models/Gatepass');

const calculateGatepassDeduction = (gatepass) => {
  // Simple deduction: 1 day's salary if gatepass is for a full day or something
  // For simplicity, assume deduction based on hours: e.g., hourly rate * hours absent
  // But since no hourly rate, assume fixed deduction per unapproved gatepass
  return 1000; // Fixed deduction, e.g., 1000 rupees
};

const applyGatepassDeduction = async (gatepassId) => {
  const gatepass = await Gatepass.findById(gatepassId).populate('employee');
  if (!gatepass || gatepass.status !== 'rejected') return;

  const employeeId = gatepass.employee._id;
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  let payroll = await Payroll.findOne({ employee: employeeId, month, year });
  if (!payroll) {
    // Create payroll if not exists, but for now assume it exists
    return;
  }

  const deduction = calculateGatepassDeduction(gatepass);
  payroll.deductions += deduction;
  payroll.total -= deduction; // Assuming total is net pay
  await payroll.save();
};

const creditGatepassApproval = async (gatepassId) => {
  const gatepass = await Gatepass.findById(gatepassId).populate('employee');
  if (!gatepass || gatepass.status !== 'approved') return;

  const employeeId = gatepass.employee._id;
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  let payroll = await Payroll.findOne({ employee: employeeId, month, year });
  if (!payroll) return;

  const deduction = calculateGatepassDeduction(gatepass);
  payroll.deductions -= deduction;
  payroll.total += deduction;
  await payroll.save();
};

module.exports = {
  applyGatepassDeduction,
  creditGatepassApproval,
};