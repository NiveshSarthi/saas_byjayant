const mongoose = require('mongoose');
const { calculatePayroll } = require('./services/payrollService');
const Employee = require('./models/Employee');
const User = require('./models/User');

const mongoURI = process.env.MONGO_URI || 'mongodb://root:vbPT5AthmBzfWQtaH2MOdbj6nx4d9TFUvmHIGm0htv43pNMEMwMbgby82bqiGhzx@72.61.248.175:5444/?directConnection=true';

async function testPayroll() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Find an employee to test with
    const employee = await Employee.findOne().populate('user');
    if (!employee) {
      console.error('No employees found');
      return;
    }

    console.log(`Testing payroll for: ${employee.user.name} (${employee.position})`);

    // Test payroll calculation
    const result = await calculatePayroll(
      employee._id,
      2, // February
      2024, // Year
      1500, // Minimum wage
      {
        specialAllowance: 100,
        targetGross: 3000, // Target gross salary
        variablePay: 0
      }
    );

    console.log('\n=== PAYROLL CALCULATION RESULTS ===');
    console.log('Compliance Status:', result.complianceStatus);
    console.log('Minimum Wage:', result.minimumWage);
    console.log('Category:', result.category);

    console.log('\n=== SALARY BREAKUP ===');
    console.log('Basic Salary (MW):', result.basicSalary);
    console.log('HRA (50% of MW):', result.hra);
    console.log('Conveyance (15% of MW):', result.conveyance);
    console.log('Special Allowance:', result.specialAllowance);
    console.log('Other Allowance:', result.otherAllowance);
    console.log('Gross Salary:', result.grossSalary);

    console.log('\n=== EMPLOYEE DEDUCTIONS ===');
    console.log('PF (12% of Basic, max 1800):', result.pf);
    console.log('ESIC (0.75% of Gross):', result.esi);
    console.log('LWF (0.20% of Gross):', result.lwf);
    console.log('Professional Tax:', result.professionalTax);
    console.log('Total Deductions:', result.deductions);

    console.log('\n=== NET SALARY ===');
    console.log('Net Salary in Hand:', result.total);

    console.log('\n=== EMPLOYER STATUTORY COST ===');
    console.log('PF Employer (12% of MW):', result.employerSide.pf);
    console.log('PF Admin (1% of MW):', result.employerSide.pfAdmin);
    console.log('ESI Employer (3.25% of Gross):', result.employerSide.esi);
    console.log('LWF Employer (0.40% of Gross):', result.employerSide.lwf);
    console.log('Bonus (8.33% of max(MW,7000)):', result.employerSide.bonus);
    console.log('Gratuity (4.81% of MW):', result.employerSide.gratuity);
    console.log('Total Statutory Cost:', result.statutoryCost);

    console.log('\n=== CTC CALCULATION ===');
    console.log('Fixed CTC (Gross + Statutory):', result.grossSalary + result.statutoryCost);
    console.log('Variable Pay:', result.variablePart);
    console.log('Total CTC:', result.totalCTC);

    console.log('\n=== VERIFICATION ===');
    const expectedBasic = 1500;
    const expectedHRA = Math.round(1500 * 0.50); // 750
    const expectedConveyance = Math.round(1500 * 0.15); // 225
    const expectedSpecialAllowance = 100;
    const expectedOtherAllowance = 425; // 3000 - (1500 + 750 + 225 + 100)
    const expectedGross = 3000;
    const expectedPF = Math.min(Math.round(1500 * 0.12), 1800); // 180
    const expectedESIC = Math.round(3000 * 0.0075); // 23
    const expectedLWF = Math.round(3000 * 0.002); // 6
    const expectedNet = 3000 - (180 + 23 + 6); // 2791

    console.log('Basic matches expected:', result.basicSalary === expectedBasic);
    console.log('HRA matches expected:', result.hra === expectedHRA);
    console.log('Conveyance matches expected:', result.conveyance === expectedConveyance);
    console.log('Special Allowance matches expected:', result.specialAllowance === expectedSpecialAllowance);
    console.log('Other Allowance matches expected:', result.otherAllowance === expectedOtherAllowance);
    console.log('Gross matches expected:', result.grossSalary === expectedGross);
    console.log('PF matches expected:', result.pf === expectedPF);
    console.log('ESIC matches expected:', result.esi === expectedESIC);
    console.log('LWF matches expected:', result.lwf === expectedLWF);
    console.log('Net Salary matches expected:', result.total === expectedNet);
    console.log('Statutory Cost matches expected:', result.statutoryCost === 960);
    console.log('Total CTC matches expected:', result.totalCTC === 3960);

  } catch (error) {
    console.error('Error testing payroll:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testPayroll();