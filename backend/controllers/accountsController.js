const Deal = require('../models/Deal');
const Incentive = require('../models/Incentive');
const Expense = require('../models/Expense');
const ExpenseApproval = require('../models/ExpenseApproval');
const PDFDocument = require('pdfkit');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const {
  createIncentive,
  unlockIncentive,
  approveIncentive,
  releaseIncentive: releaseIncentiveService,
  addPettyCashTransaction,
  getPettyCashLedger: getPettyCashLedgerService,
  approveExpense,
  rejectExpense
} = require('../services/accountsService');

// Deal management
const getDeals = async (req, res) => {
  try {
    const deals = await Deal.find().populate('employee', 'name');
    res.json(deals);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createDeal = async (req, res) => {
  try {
    const { employee, dealValue, cvCount, numberOfSales, type, date } = req.body;
    const deal = new Deal({
      employee,
      dealValue,
      cvCount,
      numberOfSales,
      type,
      date
    });
    await deal.save();
    res.status(201).json(deal);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const deal = await Deal.findByIdAndUpdate(id, updates, { new: true });
    if (!deal) return res.status(404).json({ message: 'Deal not found' });

    // If payment received, unlock incentives
    if (updates.builderPaymentReceived === true) {
      await unlockIncentive(id);
    }

    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createDealIncentive = async (req, res) => {
  try {
    const { dealId } = req.body;
    const incentive = await createIncentive(dealId);
    res.status(201).json(incentive);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Incentive management
const getIncentives = async (req, res) => {
  try {
    const incentives = await Incentive.find().populate('employee', 'name').populate('deal');
    res.json(incentives);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const approveIncentiveRelease = async (req, res) => {
  try {
    const { id } = req.params;
    await approveIncentive(id);
    res.json({ message: 'Incentive approved for release' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const releaseIncentive = async (req, res) => {
  try {
    const { id } = req.params;
    await releaseIncentiveService(id);
    res.json({ message: 'Incentive released' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Petty cash management
const getPettyCashLedger = async (req, res) => {
  try {
    const ledger = await getPettyCashLedgerService();
    res.json(ledger);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const addPettyCashEntry = async (req, res) => {
  try {
    const { type, amount, description } = req.body;
    const transaction = await addPettyCashTransaction(type, amount, description, req.user.id);
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Expense approvals
const getPendingExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ status: 'Pending' }).populate('submittedBy', 'name bankDetails');
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const approveExpenseRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Approve the expense
    const expense = await approveExpense(id, req.user.id, reason);

    // Trigger automated linking: add to petty cash ledger
    const { onExpenseApproved } = require('../backend-linking-customization/services/linkingService');
    await onExpenseApproved(expense);

    res.json({ message: 'Expense approved and petty cash updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const rejectExpenseRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    await rejectExpense(id, req.user.id, reason);
    res.json({ message: 'Expense rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const exportDealsPdf = async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;
    let query = {};
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    let deals = await Deal.find(query).populate('employee', 'name department');
    if (department) {
      deals = deals.filter(deal => deal.employee && deal.employee.department === department);
    }
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=deals.pdf');
    doc.pipe(res);
    doc.fontSize(20).text('Deals Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text('Employee | Deal Value | Type | Date | Supportive | CV Count | Payment Received');
    doc.moveDown();
    deals.forEach(deal => {
      doc.text(`${deal.employee ? deal.employee.name : 'N/A'} | ${deal.dealValue} | ${deal.type} | ${deal.date.toDateString()} | ${deal.isSupportive} | ${deal.cvCount} | ${deal.builderPaymentReceived}`);
    });
    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const exportDealsCsv = async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;
    let query = {};
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    let deals = await Deal.find(query).populate('employee', 'name department');
    if (department) {
      deals = deals.filter(deal => deal.employee && deal.employee.department === department);
    }
    const csvWriter = createCsvWriter({
      header: [
        { id: 'employee', title: 'Employee' },
        { id: 'dealValue', title: 'Deal Value' },
        { id: 'type', title: 'Type' },
        { id: 'date', title: 'Date' },
        { id: 'isSupportive', title: 'Supportive' },
        { id: 'cvCount', title: 'CV Count' },
        { id: 'builderPaymentReceived', title: 'Payment Received' }
      ]
    });
    const records = deals.map(deal => ({
      employee: deal.employee ? deal.employee.name : 'N/A',
      dealValue: deal.dealValue,
      type: deal.type,
      date: deal.date.toISOString().split('T')[0],
      isSupportive: deal.isSupportive,
      cvCount: deal.cvCount,
      builderPaymentReceived: deal.builderPaymentReceived
    }));
    const csvString = await csvWriter.writeRecords(records);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=deals.csv');
    res.send(csvString);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDeals,
  createDeal,
  updateDeal,
  createDealIncentive,
  getIncentives,
  approveIncentiveRelease,
  releaseIncentive,
  getPettyCashLedger,
  addPettyCashEntry,
  getPendingExpenses,
  approveExpenseRequest,
  rejectExpenseRequest,
  exportDealsPdf,
  exportDealsCsv
};