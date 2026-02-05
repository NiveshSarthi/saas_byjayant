
// Mock Function based on backend/services/payrollService.js
async function calculatePayroll(employeeId, month, year, grossSalary, allowances = {}, overrides = {}) {
    // Mock Employee
    const employee = { _id: "123", salary: 35000 };

    // INPUTS (Fixed from Gross)
    const GS = Math.round(Number(grossSalary) || 0);
    const variablePay = Math.round(Number(allowances.variablePay) || 0);

    // 1. EARNINGS STRUCTURE (Basic = 50% of Gross)
    const basicSalary = Math.round(GS * 0.50);
    const hra = Math.round(basicSalary * 0.50); // HRA usually 50% of Basic
    const conveyance = Math.round(basicSalary * 0.15); // Conveyance usually 15% of Basic

    // Calculate special/other allowances to balance the Gross
    const fixedComponents = basicSalary + hra + conveyance;
    const saValue = Math.round(Number(allowances.specialAllowance) || 0);
    const otherAllowance = Math.max(0, GS - (fixedComponents + saValue));

    // 2. STATUTORY DEDUCTIONS (Employee Side)
    // PF = ROUND(MIN(Basic * 12%, 1800), 0)
    const pfEmployee = Math.round(Math.min(basicSalary * 0.12, 1800));

    // ESIC = 0.75% of Gross
    const esiEmployee = GS <= 21000 ? Math.round(GS * 0.0075) : 0;

    // LWF = 0.20% of Gross
    const lwfEmployee = Math.round(GS * 0.002);

    const professionalTax = Number(allowances.professionalTax) || 0; // Fixed per slab

    const totalDeductions = pfEmployee + esiEmployee + lwfEmployee + professionalTax;

    // 3. NET SALARY
    const netSalary = GS - totalDeductions;

    return {
        basicSalary,
        grossSalary: GS,
        total: netSalary
    };
}

// Run Test
(async () => {
    const res = await calculatePayroll("123", 2, 2026, 35000);
    console.log("Result for 35000:", JSON.stringify(res, null, 2));
})();
