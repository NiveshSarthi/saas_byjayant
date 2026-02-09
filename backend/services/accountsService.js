const Incentive = require('../models/Incentive');
const PettyCash = require('../models/PettyCash');
const Expense = require('../models/Expense');
const ExpenseApproval = require('../models/ExpenseApproval');
const Deal = require('../models/Deal');
const SalesPolicy = require('../models/SalesPolicy');
const Employee = require('../models/Employee');
const { applyApprovalFlow } = require('../backend-linking-customization/services/linkingService');

// Calculate incentive amount for a deal
async function calculateIncentiveAmount(deal) {
  const employee = await Employee.findById(deal.employee).populate('user');
  if (!employee) return 0;

  const role = employee.position;
  const policy = await SalesPolicy.findOne({ role });
  if (!policy) return 0;

  let amount = 0;
  // Base incentive
  amount += (policy.incentivePercentage / 100) * deal.dealValue;

  // NPL vs Normal
  if (deal.type === 'NPL') {
    amount += (policy.nplIncentive / 100) * deal.dealValue;
  } else {
    amount += (policy.normalIncentive / 100) * deal.dealValue;
  }

  // Supportive split
  if (deal.isSupportive) {
    amount += (policy.supportiveSplit / 100) * deal.dealValue;
  }

  return amount;
}

// Create incentive for a deal
async function createIncentive(dealId) {
  const deal = await Deal.findById(dealId).populate('employee');
  if (!deal) throw new Error('Deal not found');

  const amount = await calculateIncentiveAmount(deal);
  const incentive = new Incentive({
    employee: deal.employee,
    deal: dealId,
    amount
  });
  await incentive.save();
  return incentive;
}

// Unlock incentive when payment received
async function unlockIncentive(dealId) {
  await Incentive.updateMany({ deal: dealId }, { isLocked: false });
}

// Approve incentive for release
async function approveIncentive(incentiveId) {
  await Incentive.findByIdAndUpdate(incentiveId, { approved: true });
}

// Release incentive (integrate with payroll)
async function releaseIncentive(incentiveId) {
  await Incentive.findByIdAndUpdate(incentiveId, { released: true });
  // TODO: Add to payroll
}

// Petty cash ledger functions
async function getCurrentBalance() {
  const lastTransaction = await PettyCash.findOne().sort({ date: -1 });
  return lastTransaction ? lastTransaction.balance : 0;
}

async function addPettyCashTransaction(type, amount, description, createdBy) {
  const currentBalance = await getCurrentBalance();
  const newBalance = type === 'credit' ? currentBalance + amount : currentBalance - amount;

  const transaction = new PettyCash({
    type,
    amount,
    description,
    balance: newBalance,
    createdBy
  });
  await transaction.save();
  return transaction;
}

async function getPettyCashLedger() {
  return await PettyCash.find().sort({ date: 1 }).populate('createdBy', 'name');
}

// Expense approval functions
async function approveExpense(expenseId, approvedBy, reason) {
  // Apply approval flow for dynamic config
  const flowResult = await applyApprovalFlow('Expense Approval', { expenseId, approvedBy, reason });
  // For now, proceed with approval; in full implementation, handle multi-step

  const approval = new ExpenseApproval({
    expense: expenseId,
    approvedBy,
    status: 'approved',
    reason
  });
  await approval.save();

  const expense = await Expense.findByIdAndUpdate(expenseId,
    {
      status: 'Approved',
      approvedBy,
      approvedAt: new Date()
    },
    { new: true }
  ).populate('submittedBy');

  return expense;
}

async function rejectExpense(expenseId, approvedBy, reason) {
  const approval = new ExpenseApproval({
    expense: expenseId,
    approvedBy,
    status: 'rejected',
    reason
  });
  await approval.save();

  const expense = await Expense.findByIdAndUpdate(expenseId,
    {
      status: 'Rejected',
      rejectionReason: reason
    },
    { new: true }
  );

  return expense;
}

module.exports = {
  calculateIncentiveAmount,
  createIncentive,
  unlockIncentive,
  approveIncentive,
  releaseIncentive,
  getCurrentBalance,
  addPettyCashTransaction,
  getPettyCashLedger,
  approveExpense,
  rejectExpense
};