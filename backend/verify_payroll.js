const mongoose = require('mongoose');
require('dotenv').config();

const Employee = require('./models/Employee');
const User = require('./models/User');
const Role = require('./models/Role');
const { calculatePayroll } = require('./services/payrollService');

const validate = (gross, result, expectedPF) => {
    console.log(`\n--- Test Case: Gross = ${gross} ---`);
    console.log(`Basic (50%): ${result.basicSalary} (Expected: ${gross * 0.5})`);
    console.log(`PF (Capped 1800): ${result.pf} (Expected: ${expectedPF})`);
    console.log(`ESIC (0.75%): ${result.esi}`);
    console.log(`LWF (0.20%): ${result.lwf}`);
    console.log(`Net Salary: ${result.total}`);

    const errors = [];
    if (result.basicSalary !== gross * 0.5) errors.push('Basic mismatch');
    if (result.pf !== expectedPF) errors.push('PF capping mismatch');

    if (errors.length > 0) {
        console.log('❌ FAILED:', errors.join(', '));
        return false;
    }
    console.log('✅ PASSED');
    return true;
};

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const emp = await Employee.findOne();

        const cases = [
            { gross: 35000, expectedPF: 1800 },
            { gross: 50000, expectedPF: 1800 },
            { gross: 21000, expectedPF: 1260 } // 21000 * 0.5 * 0.12 = 1260 (not capped)
        ];

        let allPassed = true;
        for (const c of cases) {
            const result = await calculatePayroll(emp._id, 2, 2026, c.gross);
            if (!validate(c.gross, result, c.expectedPF)) allPassed = false;
        }

        if (allPassed) {
            console.log('\n🚀 ALL EXCEL-STRICT TESTS PASSED');
            process.exit(0);
        } else {
            process.exit(1);
        }
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

test();
