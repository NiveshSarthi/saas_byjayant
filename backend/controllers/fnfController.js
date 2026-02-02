const FNF = require('../models/FNF');
const Employee = require('../models/Employee');
const PDFDocument = require('pdfkit');

const getFNFs = async (req, res) => {
  try {
    const fnfs = await FNF.find()
      .populate('employee')
      .sort({ createdAt: -1 });
    res.json(fnfs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getFNFById = async (req, res) => {
  try {
    const fnf = await FNF.findById(req.params.id)
      .populate('employee');
    if (!fnf) return res.status(404).json({ message: 'FNF not found' });
    res.json(fnf);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createFNF = async (req, res) => {
  try {
    const fnf = new FNF(req.body);
    await fnf.save();
    res.status(201).json(fnf);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateFNF = async (req, res) => {
  try {
    const fnf = await FNF.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!fnf) return res.status(404).json({ message: 'FNF not found' });
    res.json(fnf);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteFNF = async (req, res) => {
  try {
    const fnf = await FNF.findByIdAndDelete(req.params.id);
    if (!fnf) return res.status(404).json({ message: 'FNF not found' });
    res.json({ message: 'FNF deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const calculateFNF = async (req, res) => {
  try {
    const { employeeId, resignationDate, lastWorkingDate } = req.body;

    const employee = await Employee.findById(employeeId).populate('user');
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    // Calculate final payroll (simplified)
    const basicSalary = 50000; // This should come from employee record
    const monthsServed = Math.ceil((new Date(lastWorkingDate) - employee.hireDate) / (1000 * 60 * 60 * 24 * 30));

    const finalPayroll = {
      basicSalary: basicSalary,
      hra: basicSalary * 0.5,
      pf: basicSalary * 0.12,
      gratuity: (basicSalary * 15 * monthsServed) / 26,
      allowances: 5000,
      incentives: 0,
      performanceRewards: 0,
      deductions: 0,
      total: 0
    };

    finalPayroll.total = finalPayroll.basicSalary + finalPayroll.hra + finalPayroll.allowances +
                        finalPayroll.incentives + finalPayroll.performanceRewards -
                        finalPayroll.pf - finalPayroll.gratuity - finalPayroll.deductions;

    // Calculate dues
    const dues = {
      salary: finalPayroll.total,
      leaveEncashment: 10000, // Calculate based on leave balance
      gratuity: finalPayroll.gratuity,
      pf: finalPayroll.pf,
      otherBenefits: 0,
      totalPayable: 0
    };

    dues.totalPayable = dues.salary + dues.leaveEncashment + dues.gratuity + dues.pf + dues.otherBenefits;

    // Calculate recoveries
    const recoveries = {
      advances: 0,
      loans: 0,
      damages: 0,
      otherDeductions: 0,
      totalRecoverable: 0
    };

    recoveries.totalRecoverable = recoveries.advances + recoveries.loans + recoveries.damages + recoveries.otherDeductions;

    const netAmount = dues.totalPayable - recoveries.totalRecoverable;

    res.json({
      finalPayroll,
      dues,
      recoveries,
      netAmount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const generateFNFLetter = async (req, res) => {
  try {
    const fnf = await FNF.findById(req.params.id).populate('employee');
    if (!fnf) return res.status(404).json({ message: 'FNF not found' });

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=fnf-${fnf.employee.user.name}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('FULL & FINAL SETTLEMENT', { align: 'center' });
    doc.moveDown();

    // Employee Details
    doc.fontSize(12).text(`Employee Name: ${fnf.employee.user.name}`);
    doc.text(`Employee ID: ${fnf.employee._id}`);
    doc.text(`Position: ${fnf.employee.position}`);
    doc.text(`Department: ${fnf.employee.department}`);
    doc.text(`Date of Joining: ${fnf.employee.hireDate.toLocaleDateString()}`);
    doc.text(`Date of Resignation: ${fnf.resignationDate.toLocaleDateString()}`);
    doc.text(`Last Working Date: ${fnf.lastWorkingDate.toLocaleDateString()}`);
    doc.moveDown();

    // Final Payroll
    doc.fontSize(14).text('Final Payroll Details:', { underline: true });
    doc.fontSize(12);
    doc.text(`Basic Salary: ₹${fnf.finalPayroll.basicSalary}`);
    doc.text(`HRA: ₹${fnf.finalPayroll.hra}`);
    doc.text(`Conveyance: ₹${fnf.finalPayroll.allowances}`);
    doc.text(`PF: -₹${fnf.finalPayroll.pf}`);
    doc.text(`Gratuity: -₹${fnf.finalPayroll.gratuity}`);
    doc.text(`Total Salary: ₹${fnf.finalPayroll.total}`);
    doc.moveDown();

    // Dues
    doc.fontSize(14).text('Dues Payable:', { underline: true });
    doc.fontSize(12);
    doc.text(`Salary: ₹${fnf.dues.salary}`);
    doc.text(`Leave Encashment: ₹${fnf.dues.leaveEncashment}`);
    doc.text(`Gratuity: ₹${fnf.dues.gratuity}`);
    doc.text(`PF: ₹${fnf.dues.pf}`);
    doc.text(`Total Dues: ₹${fnf.dues.totalPayable}`);
    doc.moveDown();

    // Recoveries
    doc.fontSize(14).text('Recoveries:', { underline: true });
    doc.fontSize(12);
    doc.text(`Advances: ₹${fnf.recoveries.advances}`);
    doc.text(`Loans: ₹${fnf.recoveries.loans}`);
    doc.text(`Damages: ₹${fnf.recoveries.damages}`);
    doc.text(`Total Recoveries: ₹${fnf.recoveries.totalRecoverable}`);
    doc.moveDown();

    // Net Amount
    doc.fontSize(16).text(`Net Amount Payable: ₹${fnf.netAmount}`, { underline: true });
    doc.moveDown(2);

    // Declaration
    doc.fontSize(12).text('I hereby acknowledge receipt of the above amount in full and final settlement of all my dues from the company.');
    doc.moveDown(2);

    // Signatures
    doc.text('Employee Signature: ___________________________', { align: 'left' });
    doc.text('Date: ___________________________', { align: 'left' });
    doc.moveDown();
    doc.text('HR Manager Signature: ___________________________', { align: 'right' });
    doc.text('Date: ___________________________', { align: 'right' });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateFNFStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const fnf = await FNF.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('employee');

    if (!fnf) return res.status(404).json({ message: 'FNF not found' });
    res.json(fnf);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const processPayment = async (req, res) => {
  try {
    const { paymentDate } = req.body;
    const fnf = await FNF.findByIdAndUpdate(req.params.id, {
      status: 'Paid',
      paymentDate
    }, { new: true });

    if (!fnf) return res.status(404).json({ message: 'FNF not found' });
    res.json(fnf);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getFNFs,
  getFNFById,
  createFNF,
  updateFNF,
  updateFNFStatus,
  deleteFNF,
  calculateFNF,
  generateFNFLetter,
  processPayment
};