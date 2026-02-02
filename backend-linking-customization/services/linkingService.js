const ModuleLink = require('../models/ModuleLink');
const ApprovalFlow = require('../models/ApprovalFlow');
const IncentiveRelation = require('../models/IncentiveRelation');
const ModuleConfig = require('../models/ModuleConfig');

// Get all module links
async function getModuleLinks() {
  return await ModuleLink.find();
}

// Get approval flow by name
async function getApprovalFlow(name) {
  return await ApprovalFlow.findOne({ name });
}

// Get all approval flows
async function getApprovalFlows() {
  return await ApprovalFlow.find();
}

// Get incentive relations
async function getIncentiveRelations() {
  return await IncentiveRelation.find();
}

// Get module configs
async function getModuleConfigs() {
  return await ModuleConfig.find();
}

// Check if module is enabled
async function isModuleEnabled(moduleName) {
  const config = await ModuleConfig.findOne({ moduleName });
  return config ? config.enabled : true; // default true if not configured
}

// Apply approval flow dynamically
async function applyApprovalFlow(flowName, request) {
  const flow = await getApprovalFlow(flowName);
  if (!flow) throw new Error('Approval flow not found');

  // Simulate applying the flow, e.g., send to first approver
  const firstStep = flow.steps.sort((a, b) => a.order - b.order)[0];
  // Logic to notify or assign to role
  return { nextApprover: firstStep.role };
}

// Example: Link modules, e.g., get data flow
async function getLinkedModules(source) {
  const links = await ModuleLink.find({ sourceModule: source });
  return links.map(link => link.targetModule);
}

// Automated linking functions
async function onExpenseApproved(expense) {
  // When an expense is approved, automatically add to petty cash ledger
  const PettyCash = require('../../backend/models/PettyCash');
  const pettyCashEntry = new PettyCash({
    type: 'Debit',
    amount: expense.amount,
    category: expense.category,
    description: `Approved expense: ${expense.title}`,
    date: new Date(),
    linkedExpense: expense._id
  });
  await pettyCashEntry.save();
  return pettyCashEntry;
}

async function onEmployeeCreated(employee) {
  // When an employee is created, automatically create appraisal and PIP records
  const Appraisal = require('../../backend/models/Appraisal');
  const PIP = require('../../backend/models/PIP');

  // Create initial appraisal
  const appraisal = new Appraisal({
    employee: employee._id,
    reviewer: employee.user, // Assuming HR creates it
    period: 'Annual',
    startDate: employee.hireDate,
    endDate: new Date(employee.hireDate.getFullYear() + 1, employee.hireDate.getMonth(), employee.hireDate.getDate()),
    ratings: {
      performance: 3,
      skills: 3,
      attitude: 3,
      overall: 3
    },
    achievements: [],
    areasForImprovement: [],
    goals: [],
    comments: 'Initial appraisal created'
  });
  await appraisal.save();

  // Create initial PIP if needed
  const pip = new PIP({
    employee: employee._id,
    initiatedBy: employee.user,
    reason: 'Performance Monitoring',
    startDate: employee.hireDate,
    endDate: new Date(employee.hireDate.getTime() + (90 * 24 * 60 * 60 * 1000)), // 90 days
    objectives: [],
    supportProvided: [],
    reviews: [],
    status: 'Active'
  });
  await pip.save();

  return { appraisal, pip };
}

async function onDealClosed(deal) {
  // When a deal is closed, automatically calculate and create incentives
  const Incentive = require('../../backend/models/Incentive');
  const incentive = new Incentive({
    employee: deal.employee,
    deal: deal._id,
    amount: 0, // Will be calculated
    status: 'Locked',
    unlockDate: new Date(Date.now() + (60 * 24 * 60 * 60 * 1000)) // 60 days from now
  });
  await incentive.save();
  return incentive;
}

async function onGatepassApproved(gatepass) {
  // When gatepass is approved, automatically deduct from payroll
  const Payroll = require('../../backend/models/Payroll');
  // Find current month's payroll and add deduction
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  let payroll = await Payroll.findOne({
    employee: gatepass.employee,
    month: currentMonth,
    year: currentYear
  });

  if (payroll) {
    payroll.deductions += gatepass.deductionAmount || 0;
    payroll.total = payroll.basicSalary + payroll.hra + payroll.allowances + payroll.incentives + payroll.performanceRewards - payroll.pf - payroll.gratuity - payroll.deductions;
    await payroll.save();
  }

  return payroll;
}

module.exports = {
  getModuleLinks,
  getApprovalFlow,
  getApprovalFlows,
  getIncentiveRelations,
  getModuleConfigs,
  isModuleEnabled,
  applyApprovalFlow,
  getLinkedModules,
  onExpenseApproved,
  onEmployeeCreated,
  onDealClosed,
  onGatepassApproved,
};