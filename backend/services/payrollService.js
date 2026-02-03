const SalesPolicy = require('../models/SalesPolicy');
const Deal = require('../models/Deal');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const { getIncentiveRelations } = require('../../backend-linking-customization/services/linkingService');

// Function to calculate incentives
async function calculateIncentives(employeeId, month, year) {
  // Get employee
  const employee = await Employee.findById(employeeId).populate('user');
  if (!employee) return 0;

  // Get position, assume position indicates role
  const role = employee.position || '';
  const isManager = role.toLowerCase().includes('manager');
  const policyRole = isManager ? 'Manager' : 'Sales Executive';

  // Get policy
  const policy = await SalesPolicy.findOne({ role: policyRole });
  if (!policy) return 0;

  // Get all deals for this employee, sorted by date
  const deals = await Deal.find({ employee: employeeId }).sort({ date: 1 });
  if (deals.length === 0) return 0;

  // Policy: Incentive for 1st Sale will be unlocked after the 2nd Sale, etc.
  // This means if they have N sales, they get incentives for N-1 sales (up to the last confirmed one)

  const payrollMonthStart = new Date(year, month - 1, 1);
  const payrollMonthEnd = new Date(year, month, 1);

  let totalIncentive = 0;

  // Rev 08.01.2026 Policy Implementation
  const totalSalesCount = deals.reduce((sum, d) => sum + (d.numberOfSales || 0), 0);

  // Classify deals and calculate potential incentives
  const calculatedDeals = deals.map((deal, index) => {
    const revenueRatio = deal.dealValue / (deal.cvCount || 1);

    let rate = 0;
    // Normal sale: > 0.5% CV @ 0.25% CV
    // NPL sale: 0.25% - 0.50% @ 0.10% CV
    // NPL sale: < 0.25% @ Nil
    if (revenueRatio > 0.005) {
      rate = 0.0025;
    } else if (revenueRatio >= 0.0025) {
      rate = 0.0010;
    }

    let incentiveAmount = rate * (deal.cvCount || 0);

    // Supportive sale split equally
    if (deal.isSupportive) {
      incentiveAmount = incentiveAmount / 2;
    }

    return {
      ...deal.toObject(),
      index,
      incentiveAmount,
      date: new Date(deal.date)
    };
  });

  // Unlock logic: Incentive for Sale N unlocked if Sale N+1 exists
  calculatedDeals.forEach((deal, idx) => {
    const isUnlocked = idx < calculatedDeals.length - 1;
    const isCurrentMonth = deal.date >= payrollMonthStart && deal.date < payrollMonthEnd;

    if (isUnlocked && deal.builderPaymentReceived && isCurrentMonth) {
      totalIncentive += deal.incentiveAmount;
    }
  });

  // Salary Reward Logic
  let salaryReward = 0;
  const basicSalary = employee.salary || 0;

  if (policyRole === 'Sales Executive') {
    // 3 S -> +50% salary reward
    if (totalSalesCount >= 3) {
      salaryReward = basicSalary * 0.50;
    }
  } else if (policyRole === 'Manager') {
    // 3 S (Per Executive) -> +50% salary reward
    // 1 S (Per Executive) -> 10% basic salary allowance
    if (totalSalesCount >= 3) {
      salaryReward = basicSalary * 0.50;
    } else if (totalSalesCount >= 1) {
      salaryReward = basicSalary * 0.10;
    }
  }

  return totalIncentive + salaryReward;
}

// Standard calculations
function calculatePF(basicSalary) {
  return basicSalary * 0.12; // Assuming 12%
}

function calculateGratuity(basicSalary, yearsOfService) {
  return (basicSalary * 15 * yearsOfService) / 26; // Standard formula
}

function calculateHRA(basicSalary, city) {
  // Assume city 'Metro' for 50%, else 40%
  const rate = city === 'Metro' ? 0.5 : 0.4;
  return basicSalary * rate;
}

function calculateConveyance() {
  // Fixed annual conveyance allowance (₹19,200)
  return 19200 / 12; // Monthly
}

function calculateLTA(basicSalary) {
  // LTA is typically 1 month's basic salary
  return basicSalary;
}

function calculateMedical() {
  // Fixed medical allowance (₹50,000 annually)
  return 50000 / 12; // Monthly
}

function calculateProfessionalTax(salary, state = 'Delhi') {
  // Professional tax varies by state, simplified for Delhi
  if (salary <= 21000) return 0;
  if (salary <= 30000) return 135 / 12; // Monthly
  if (salary <= 45000) return 315 / 12;
  if (salary <= 60000) return 690 / 12;
  return 1250 / 12;
}

function calculateTDS(annualIncome) {
  // Simplified TDS calculation (old regime)
  let tax = 0;
  if (annualIncome <= 250000) return 0;
  if (annualIncome <= 500000) tax = (annualIncome - 250000) * 0.05;
  else if (annualIncome <= 1000000) tax = 12500 + (annualIncome - 500000) * 0.2;
  else tax = 112500 + (annualIncome - 1000000) * 0.3;
  return tax / 12; // Monthly
}

/**
 * Advanced Structured Salary Calculation (Back-calculated from CTC)
 * Based on user-provided Excel structure
 */
async function calculateStructuredSalary(ctc, category = 'Skilled') {
  const minWage = category === 'Skilled' ? 15472 : 11275;
  const basic = minWage; // Minimum Wages (BASIC+DA) as per user table

  // Statutory Employer Contributions
  const empPF = (basic * 0.12);
  const empPFAdmin = (basic * 0.01); // Approx 1% combined admin/EDLI
  const empGratuity = (basic * 0.0481);
  const empBonus = (basic * 0.0833);
  const empLWF = category === 'Skilled' ? 68 : 48; // Values from user table

  // Gross estimation
  let gross = ctc - (empPF + empPFAdmin + empGratuity + empBonus + empLWF);

  // ESI Logic (Applicable if Gross <= 21,000)
  let empESI = 0;
  let employeeESI = 0;
  if (gross <= 21000) {
    // If ESI is applicable, it reduces the Gross because CTC is fixed
    // CTC = Gross + ESI (3.25%) + PF + ...
    // So Gross = (CTC - Others) / 1.0325
    gross = (ctc - (empPF + empPFAdmin + empGratuity + empBonus + empLWF)) / 1.0325;
    empESI = gross * 0.0325;
    employeeESI = gross * 0.0075;
  }

  const statutoryCost = empPF + empPFAdmin + empESI + empLWF + empBonus + empGratuity;
  const totalCTC = gross + statutoryCost;

  // Components breakdown from Gross
  const hra = category === 'Skilled' ? basic * 0.5 : (gross - basic > 800 ? 836 : 0); // Approx based on user data
  const conveyance = category === 'Skilled' ? basic * 0.15 : 0; // Approx based on user data
  const specialAllowance = 1000;
  const otherAllowance = Math.max(0, gross - (basic + hra + conveyance + specialAllowance));

  // Employee Deductions
  const employeePF = basic * 0.12;
  const employeeLWF = category === 'Skilled' ? 34 : 24;
  const employeeProfessionalTax = 0; // As per user table

  const totalDeductions = employeePF + employeeESI + employeeLWF + employeeProfessionalTax;
  const netSalary = gross - totalDeductions;

  return {
    basicSalary: basic,
    hra,
    conveyance,
    specialAllowance,
    otherAllowance,
    grossSalary: gross,
    pf: employeePF,
    esi: employeeESI,
    lwf: employeeLWF,
    professionalTax: employeeProfessionalTax,
    netSalary,
    statutoryCost,
    totalCTC,
    employerSide: {
      pf: empPF,
      pfAdmin: empPFAdmin,
      esi: empESI,
      lwf: empLWF,
      bonus: empBonus,
      gratuity: empGratuity
    }
  };
}

// Compliance-based payroll calculation
async function calculatePayroll(employeeId, month, year, minimumWage, allowances = {}, overrides = {}) {
  const employee = await Employee.findById(employeeId).populate('user');

  if (!employee) {
    throw new Error('Employee not found');
  }

  // Use provided minimum wage or default
  const MW = minimumWage || 1500;

  // SALARY BREAKUP (FIXED FORMULAS)
  const basicSalary = MW; // MW = Basic + DA (employee-specific)
  const hra = Math.round(MW * 0.50); // HRA = ROUND(MW * 50%)
  const conveyance = Math.round(MW * 0.15); // Conveyance = ROUND(MW * 15%)
  const specialAllowance = allowances.specialAllowance || 100; // FIXED (100 unless different)
  const otherAllowance = allowances.otherAllowance || 0; // Calculated to make total gross

  // Calculate otherAllowance to reach desired gross
  const grossFromFixed = basicSalary + hra + conveyance + specialAllowance;
  const targetGross = allowances.targetGross || grossFromFixed + otherAllowance;
  const calculatedOtherAllowance = Math.max(0, targetGross - grossFromFixed);

  const grossSalary = basicSalary + hra + conveyance + specialAllowance + calculatedOtherAllowance;

  // EMPLOYEE DEDUCTIONS
  const pfEmployee = Math.min(Math.round(basicSalary * 0.12), 1800); // PF = MIN(ROUND(MW * 12%), 1800)

  // ESIC Employee (0.75% of Gross, only if Gross <= threshold)
  const ESIC_THRESHOLD = 21000; // Assuming standard threshold
  const esiEmployee = grossSalary <= ESIC_THRESHOLD ? Math.round(grossSalary * 0.0075) : 0;

  // LWF Employee (0.20%)
  const STATE_CAP = 50; // Assuming state cap
  const lwfEmployee = Math.min(Math.round(grossSalary * 0.002), STATE_CAP);

  const professionalTax = 0; // Currently ZERO
  const totalEmployeeDeductions = pfEmployee + esiEmployee + lwfEmployee + professionalTax;

  // Net Salary in Hand
  const netSalary = grossSalary - totalEmployeeDeductions;

  // EMPLOYER STATUTORY COST
  const pfEmployer = Math.round(basicSalary * 0.12); // PF Employer (12% of MW)
  const pfAdminCharges = Math.round(basicSalary * 0.01); // PF Admin Charges (1% of MW)
  const esiEmployer = grossSalary <= ESIC_THRESHOLD ? Math.round(grossSalary * 0.0325) : 0; // ESI Employer (3.25%)
  const lwfEmployer = Math.round(grossSalary * 0.004); // LWF Employer (0.40%)
  const bonusEmployer = Math.round(Math.max(basicSalary, 7000) * 0.0833); // Bonus = 8.33% of MAX(MW, 7000)
  const gratuityEmployer = Math.round(basicSalary * 0.0481); // Gratuity = 4.81% of MW

  const statutoryCost = pfEmployer + pfAdminCharges + esiEmployer + lwfEmployer + bonusEmployer + gratuityEmployer;

  // CTC CALCULATION
  const fixedCTC = grossSalary + statutoryCost;
  const variablePay = allowances.variablePay || 0;
  const totalCTC = fixedCTC + variablePay;

  // Compliance check
  const isCompliant = grossSalary >= MW && netSalary > 0;
  const complianceStatus = isCompliant ? 'Compliant' : 'Non-Compliant';

  // Return structured payroll data
  return {
    // Basic info
    employee: employee._id,
    month,
    year,
    designation: employee.position,
    reportingManagerId: employee.reportsTo,

    // Compliance
    complianceStatus,
    minimumWage: MW,
    category: employee.category || 'Skilled',

    // Earnings breakup
    basicSalary,
    hra,
    conveyance,
    specialAllowance,
    otherAllowance: calculatedOtherAllowance,
    grossSalary,

    // Employee deductions
    pf: pfEmployee,
    esi: esiEmployee,
    lwf: lwfEmployee,
    professionalTax,
    deductions: totalEmployeeDeductions,

    // Net salary
    total: netSalary,

    // Employer contributions
    employerSide: {
      pf: pfEmployer,
      pfAdmin: pfAdminCharges,
      esi: esiEmployer,
      lwf: lwfEmployer,
      bonus: bonusEmployer,
      gratuity: gratuityEmployer
    },

    // CTC
    statutoryCost,
    totalCTC,
    variablePart: variablePay,

    // Additional fields
    allowances: calculatedOtherAllowance,
    incentives: 0, // Will be calculated separately if needed
    performanceRewards: 0,
    gratuity: gratuityEmployer,
    bonus: bonusEmployer
  };
}

module.exports = {
  calculateIncentives,
  calculatePF,
  calculateGratuity,
  calculateHRA,
  calculateConveyance,
  calculateLTA,
  calculateMedical,
  calculateProfessionalTax,
  calculateTDS,
  calculatePayroll
};