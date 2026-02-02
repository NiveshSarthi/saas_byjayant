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

// Total payroll calculation
async function calculatePayroll(employeeId, month, year, ctc, allowances, city, overrides = {}) {
  const employee = await Employee.findById(employeeId);
  const structured = await calculateStructuredSalary(ctc, employee.category || 'Skilled');

  const incentives = overrides.incentives !== undefined ? overrides.incentives : await calculateIncentives(employeeId, month, year);
  const hra = overrides.hra !== undefined ? overrides.hra : structured.hra;
  const conveyance = overrides.conveyance !== undefined ? overrides.conveyance : structured.conveyance;
  const lta = overrides.lta !== undefined ? overrides.lta : calculateLTA(structured.basicSalary);
  const medical = overrides.medical !== undefined ? overrides.medical : calculateMedical();
  const pf = overrides.pf !== undefined ? overrides.pf : structured.pf;

  const yearsOfService = Math.floor((new Date() - employee.hireDate) / (1000 * 60 * 60 * 24 * 365));
  const gratuity = overrides.gratuity !== undefined ? overrides.gratuity : structured.employerSide.gratuity;

  // Professional Tax and TDS
  const professionalTax = overrides.professionalTax !== undefined ? overrides.professionalTax : structured.professionalTax;
  const tds = overrides.tds !== undefined ? overrides.tds : calculateTDS(ctc * 12);

  // Attendance deductions
  const daysInMonth = new Date(year, month, 0).getDate();
  const dailySalary = structured.grossSalary / daysInMonth;

  // ... (keeping attendance logic same as before)
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);
  const attendanceRecords = await Attendance.find({
    employee: employeeId,
    date: { $gte: startDate, $lt: endDate }
  });

  let totalDeductionDays = 0;
  let presentDays = 0;
  let lateArrivals = 0;
  let earlyDepartures = 0;

  attendanceRecords.forEach(record => {
    presentDays++;
    const checkIn = new Date(record.checkInTime);
    const timeInMinutes = checkIn.getHours() * 60 + checkIn.getMinutes();

    if (timeInMinutes >= 10 * 60 && timeInMinutes < 12 * 60) {
      totalDeductionDays += 0.25; // 1/4th salary
      lateArrivals++;
    } else if (timeInMinutes >= 12 * 60 && timeInMinutes < 14 * 60) {
      totalDeductionDays += 0.5; // half day
      lateArrivals++;
    } else if (timeInMinutes >= 14 * 60 && timeInMinutes < 16 * 60) {
      totalDeductionDays += 0.25; // 1/4th salary
      lateArrivals++;
    } else if (timeInMinutes >= 16 * 60) {
      totalDeductionDays += 1.0; // Absent
      lateArrivals++;
    }

    if (record.checkOutTime) {
      const checkOut = new Date(record.checkOutTime);
      const outTimeInMinutes = checkOut.getHours() * 60 + checkOut.getMinutes();

      if (outTimeInMinutes >= 17 * 60 && outTimeInMinutes < 18 * 60) {
        totalDeductionDays += 0.25; // 1/4th salary
        earlyDepartures++;
      } else if (outTimeInMinutes >= 14 * 60 && outTimeInMinutes < 17 * 60) {
        totalDeductionDays += 0.5; // half day
        earlyDepartures++;
      } else if (outTimeInMinutes < 14 * 60) {
        totalDeductionDays += 1.0; // Absent
        earlyDepartures++;
      }
    }
  });

  const absentDays = daysInMonth - presentDays;
  totalDeductionDays += absentDays;

  const deductions = overrides.deductions !== undefined ? overrides.deductions : totalDeductionDays * dailySalary;

  // Use incentive relations for dynamic calculation
  const relations = await getIncentiveRelations();
  let adjustedIncentives = incentives;
  relations.forEach(rel => {
    if (rel.incentiveType === 'sales' && rel.relation === 'percentage') {
      adjustedIncentives += (rel.value / 100) * structured.basicSalary;
    }
  });

  const performanceRewards = overrides.performanceRewards !== undefined ? overrides.performanceRewards : 0;

  const total = (structured.grossSalary + adjustedIncentives + performanceRewards) - (tds + deductions);

  return {
    basicSalary: structured.basicSalary,
    hra,
    conveyance,
    lta,
    medical,
    pf,
    esi: structured.esi,
    lwf: structured.lwf,
    professionalTax,
    tds,
    allowances: structured.specialAllowance + structured.otherAllowance,
    incentives: adjustedIncentives,
    performanceRewards,
    deductions,
    presentDays,
    lateArrivals,
    earlyDepartures,
    total: Math.max(0, structured.netSalary + adjustedIncentives + performanceRewards - (tds + (totalDeductionDays * dailySalary))), // Corrected Net logic
    grossSalary: structured.grossSalary,
    netSalary: structured.netSalary,
    statutoryCost: structured.statutoryCost,
    totalCTC: structured.totalCTC,
    employerSide: structured.employerSide
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