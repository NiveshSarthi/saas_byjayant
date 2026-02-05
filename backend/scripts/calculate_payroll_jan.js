const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const ExcelJS = require('exceljs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Payroll = require('../models/Payroll');
const User = require('../models/User');
const { calculateIncentives } = require('../services/payrollService');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/saas-hrms');
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
};

const calculatePayroll = async () => {
    await connectDB();

    try {
        console.log('--- Starting Payroll Calculation for January 2026 ---');

        const employees = await Employee.find({}).populate('user');
        const startJan = new Date('2026-01-01');
        const endJan = new Date('2026-01-31T23:59:59');

        // Prepare Excel Workbook
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Payroll Jan 2026');

        // Define Columns
        sheet.columns = [
            { header: 'Employee ID', key: 'empId', width: 15 },
            { header: 'Name', key: 'name', width: 25 },
            { header: 'Department', key: 'department', width: 15 },
            { header: 'Designation', key: 'position', width: 20 },
            { header: 'Working Days', key: 'workingDays', width: 15 }, // Days in month (excluding Sundays)
            { header: 'Present Days', key: 'presentDays', width: 15 }, // Actual attendance count
            { header: 'Payable Days', key: 'payableDays', width: 15 }, // After deductions
            { header: 'Monthly CTC', key: 'monthlyCTC', width: 15 },
            { header: 'Basic Salary', key: 'basic', width: 15 },
            { header: 'HRA', key: 'hra', width: 15 },
            { header: 'PF (Employee)', key: 'pf', width: 15 },
            { header: 'Incentives', key: 'incentives', width: 15 },
            { header: 'Manager Commission', key: 'commission', width: 15 },
            { header: 'Net Salary', key: 'netSalary', width: 15 },
        ];

        // Payroll Data Array
        const payrollData = [];
        let totalIncentives = 0;

        for (const emp of employees) {
            console.log(`Processing: ${emp.user.name}`);

            // Fetch Attendance for the month
            const attendanceRecords = await Attendance.find({
                employee: emp._id,
                date: { $gte: startJan, $lte: endJan }
            });

            let totalPayableDays = 0;
            let presentDaysCount = 0;

            // Process each day
            // In a real scenario, we'd loop through all expected working days.
            // Here we iterate through attendance records + consider Sundays as holidays/paid?
            // Usually payroll is based on 30/31 days or actual working days.
            // Let's assume Fixed Salary is for the whole month (31 days).
            // Deductions reduce the payable days from 31 (or 26 working days).
            // Let's us 27 working days (31 - 4 Sundays).

            const expectedWorkingDays = 27; // Jan 2026 has 4 Sundays (4th, 11th, 18th, 25th)
            const sundays = 4;

            // Logic: Start with 0 payable. Add for attendance. Add for Sundays/Holidays if policy allows.
            // Or Start with Total Days and subtract specific Absent days.
            // Given the requirements "generate jan attendance... calculate payroll", I will sum up the daily factors.
            // Absent days (no record) = 0 payable. 
            // Sundays = 1.0 payable (standard salaried employee).

            totalPayableDays += sundays;

            attendanceRecords.forEach(record => {
                presentDaysCount++;
                const checkIn = new Date(record.checkInTime);
                const checkOut = new Date(record.checkOutTime);

                let dailyFactor = 1.0;
                let deduction = 0;

                // Check-in Rules
                const inHour = checkIn.getHours();
                const inMin = checkIn.getMinutes();
                const inTime = inHour + inMin / 60;

                if (inTime >= 10 && inTime < 12) {
                    deduction += 0.25; // 1/4th Salary
                } else if (inTime >= 12 && inTime < 14) {
                    deduction += 0.5; // Half Day
                    // Note: If they come at 12:30, it is covered here.
                } else if (inTime >= 14 && inTime < 16) {
                    deduction += 0.75; // 3/4th Salary
                } else if (inTime >= 16) {
                    deduction += 1.0; // Absent
                }

                // Check-out Rules
                const outHour = checkOut.getHours();
                const outMin = checkOut.getMinutes();
                const outTime = outHour + outMin / 60;

                // Assuming standard checkout is 18:00 (6 PM)?
                // Rule: 5:00-6:00 pm -> 1/4th salary (deduction assumed)
                // Rule: 2:00-5:00 pm -> Half day
                // Rule: Before 2:00 PM -> Absent

                if (outTime < 14) {
                    deduction += 1.0; // Absent
                } else if (outTime >= 14 && outTime < 17) {
                    deduction += 0.5; // Half Day
                } else if (outTime >= 17 && outTime < 18) {
                    deduction += 0.25; // 1/4th Salary
                }

                // Apply max deduction
                if (deduction > 1.0) deduction = 1.0;

                dailyFactor -= deduction;
                if (dailyFactor < 0) dailyFactor = 0;

                totalPayableDays += dailyFactor;
            });

            // Calculate Salary
            // Monthly CTC is annual / 12? Or is the provided "CTC/Salary" monthly?
            // The user provided "CTC" column with values 20000, 35000 etc.
            // Assuming these are MONTHLY Gross/CTC figures based on the magnitude.
            const monthlyCTC = emp.salary || 0;

            // Pro-rata Salary
            // Using 31 days basis for calculation?
            // Salary per day = Monthly / 31
            const salaryPerDay = monthlyCTC / 31;
            const finalPayableDays = totalPayableDays; // + any holidays

            // Allowances breakdown (Simple 50% Basic)
            const earnedGross = (monthlyCTC / 31) * finalPayableDays;

            const basic = earnedGross * 0.5;
            const hra = earnedGross * 0.4; // 40% of Basic usually, but here 50% of Gross is Basic
            // Let's use standard split of Earned Gross: 50% Basic, 50% Allowances
            const allowance = earnedGross - basic;

            // PF Calculation (12% of Basic, capped usually but here simple)
            const pf = basic * 0.12;

            // Incentives
            let incentives = 0;
            try {
                const incentiveResult = await calculateIncentives(emp._id, 1, 2026);
                incentives = (incentiveResult.totalIncentive || 0) + (incentiveResult.salaryReward || 0);
            } catch (e) {
                console.log('Error calculating incentives for', emp.user.name, e.message);
                incentives = 0;
            }

            let netSalary = earnedGross - pf + incentives;

            totalIncentives += incentives;

            let commission = 0;
            if (emp.user.name === 'Shubham Gupta') {
                commission = totalIncentives * 0.1;
                netSalary += commission;
            }

            // Save to DB
            // Check existing payroll
            let payrollEntry = await Payroll.findOne({ employee: emp._id, month: 1, year: 2026 });
            if (!payrollEntry) {
                payrollEntry = new Payroll({
                    employee: emp._id,
                    month: 1,
                    year: 2026,
                    designation: emp.position,
                    basicSalary: basic
                });
            }

            payrollEntry.totalCTC = monthlyCTC;
            payrollEntry.basicSalary = basic;
            payrollEntry.hra = allowance; // Putting rest in HRA/Allocation for simplicity
            payrollEntry.pf = pf;
            payrollEntry.total = netSalary;
            payrollEntry.presentDays = presentDaysCount;
            // Using a custom field or overriding 'presentDays' to mean payable for record?
            // Let's store payable days in 'presentDays' for simplicity or add a note?
            // The schema has 'presentDays'. We should probably store actual present days.
            payrollEntry.presentDays = finalPayableDays;

            await payrollEntry.save();

            // Add to Excel Row
            sheet.addRow({
                empId: emp.employeeId,
                name: emp.user.name,
                department: emp.department,
                position: emp.position,
                workingDays: 31,
                presentDays: presentDaysCount,
                payableDays: finalPayableDays.toFixed(2),
                monthlyCTC: monthlyCTC,
                basic: basic.toFixed(2),
                hra: allowance.toFixed(2),
                pf: pf.toFixed(2),
                incentives: incentives.toFixed(2),
                commission: commission.toFixed(2),
                netSalary: netSalary.toFixed(2)
            });
        }

        // Save Excel
        const fileName = 'Payroll_Jan_2026.xlsx';
        await workbook.xlsx.writeFile(fileName);
        console.log(`Payroll saved to ${fileName}`);

        process.exit(0);

    } catch (error) {
        console.error('Error calculating payroll:', error);
        process.exit(1);
    }
};

calculatePayroll();
