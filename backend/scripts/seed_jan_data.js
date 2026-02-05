const mongoose = require('mongoose');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Deal = require('../models/Deal');

require('dotenv').config();

const JAN_2026_START = new Date('2026-01-01');
const JAN_2026_END = new Date('2026-02-01');

// Data from Request
const employeesData = [
    {
        name: 'Anuradha',
        attendance: 'P,W,P,P,P,P,P,P,P,P,H,W,P,P,L,P,P,P,W,A,P,A,P,P,P,W,P,P,P,P,P'.split(','),
        deals: [
            { val: 18700000, type: 'Normal', matured: true, cv: 1, revenue: true }, // 20-Sep -> Jan 10
            { val: 6990000, type: 'Normal', matured: true, cv: 1, revenue: true }   // 12-Dec -> Jan 25
        ]
    },
    {
        name: 'Amit',
        attendance: 'P,W,A,A,A,P,P,P,P,P,H,W,P,P,P,P,P,H,W,P,P,P,P,A,A,A,A,A,A,A,A'.split(','),
        deals: [
            { val: 8150000, type: 'Normal', matured: true, cv: 1, revenue: true }, // 23-Aug -> Jan 2
            { val: 27600000, type: 'Normal', matured: true, cv: 1, revenue: true }, // 19-Sep -> Jan 5
            { val: 5500000, type: 'NPL', matured: false, cv: 1, revenue: true },    // 19-Sep -> Jan 8 (Revenue Yes, but "Not Mature"? User said 'Not Mature' for Ananya, for Amit 'Mature' in one line? wait. Table says "Mature" for lines 1,2. Line 3 'Not Mature'. )
            // Re-reading table: 
            // Amit | 5500000 | NPL | Yes (Rev) | Not Mature
            // Wait, last column is "Deal Status".
            { val: 6500000, type: 'NPL', matured: true, cv: 1, revenue: true }      // 14-Nov -> Jan 20
        ]
    },
    {
        name: 'Shubham Gupta',
        role: 'Manager',
        attendance: 'P,W,P,P,P,P,P,P,P,P,P,W,P,P,L,P,P,P,W,A,A,P,P,P,P,W,H,P,P,P,P'.split(','),
        deals: [] // Manager gets override
    },
    {
        name: 'Ananya',
        attendance: 'A,W,P,P,P,P,P,P,P,P,P,W,P,P,P,P,P,P,W,P,P,P,A,A,A,A,A,A,A,A,A'.split(','),
        deals: [
            { val: 5500000, type: 'NPL', matured: false, cv: 1, revenue: false }, // 06-Oct -> Jan 12. "Revenue Received or not: Not". "Deal Status: Not Mature"
            { val: 8850000, type: 'Normal', matured: true, cv: 1, revenue: true } // 04-Nov -> Jan 15
        ]
    }
];

// Helper to map 1-31 index to Date
const getDate = (day) => new Date(2026, 0, day); // Jan 2026

async function seed() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/saas_db');
    console.log('Connected to DB');

    for (const empData of employeesData) {
        // Find Employee
        const namePart = empData.name.split(' ')[0]; // Match first name
        const employee = await Employee.findOne({
            $or: [
                { 'user.name': new RegExp(namePart, 'i') },
                // Populate lookup might be needed if user is ref. 
                // Actually Employee stores user ID. We need to look up User first or do aggregate.
                // Simpler: Fetch all employees and match in JS.
            ]
        }).populate('user');

        // Find by fetching all (safer)
        const allEmps = await Employee.find().populate('user');
        console.log('All employees:', allEmps.map(e => e.user?.name));
        let targetEmp = allEmps.find(e => e.user?.name?.toLowerCase().includes(namePart.toLowerCase()));

        if (!targetEmp) {
            console.log(`Employee not found: ${empData.name}, creating...`);
            // Create user and employee
            const Role = require('../models/Role');
            const employeeRole = await Role.findOne({ name: 'Employee' });
            const bcrypt = require('bcryptjs');
            const user = new User({
                name: empData.name,
                email: `${empData.name.toLowerCase().replace(' ', '')}@synditech.com`,
                password: await bcrypt.hash('password123', 10),
                role: employeeRole._id
            });
            await user.save();
            const position = empData.role === 'Manager' ? 'Sales Manager' : 'Sales Executive';
            const salary = empData.name === 'Anuradha' ? 21000 : (empData.role === 'Manager' ? 50000 : 25000);
            const employee = new Employee({
                employeeId: `EMP${Math.floor(Math.random() * 1000)}`,
                user: user._id,
                department: 'Sales',
                position: position,
                hireDate: new Date('2023-01-15'),
                status: 'Active',
                level: empData.role === 'Manager' ? 'Manager' : 'Executive',
                salary: salary,
                category: 'Skilled'
            });
            await employee.save();
            targetEmp = await Employee.findById(employee._id).populate('user');
            console.log(`Created ${empData.name}`);
        }

        console.log(`Processing ${targetEmp.user.name} (${targetEmp.position})...`);

        // 1. Clear Jan Data
        await Attendance.deleteMany({
            employee: targetEmp._id,
            date: { $gte: JAN_2026_START, $lt: JAN_2026_END }
        });
        await Deal.deleteMany({
            employee: targetEmp._id,
            date: { $gte: JAN_2026_START, $lt: JAN_2026_END }
        });

        // 2. Insert Attendance
        const attDocs = [];
        empData.attendance.forEach((statusCode, idx) => {
            const day = idx + 1;
            if (day > 31) return;

            // Skip Absent
            if (statusCode === 'A') return;

            const date = getDate(day);
            let checkInTime, checkOutTime;

            switch (statusCode) {
                case 'P': // Present: 9:00 AM - 6:00 PM
                    checkInTime = new Date(date);
                    checkInTime.setHours(9, 0, 0);
                    checkOutTime = new Date(date);
                    checkOutTime.setHours(18, 0, 0);
                    break;
                case 'W': // Weekly Off: 9:00 AM - 6:00 PM
                    checkInTime = new Date(date);
                    checkInTime.setHours(9, 0, 0);
                    checkOutTime = new Date(date);
                    checkOutTime.setHours(18, 0, 0);
                    break;
                case 'L': // Leave: 9:00 AM - 6:00 PM
                    checkInTime = new Date(date);
                    checkInTime.setHours(9, 0, 0);
                    checkOutTime = new Date(date);
                    checkOutTime.setHours(18, 0, 0);
                    break;
                case 'H': // Half Day: 9:00 AM - 1:00 PM
                    checkInTime = new Date(date);
                    checkInTime.setHours(9, 0, 0);
                    checkOutTime = new Date(date);
                    checkOutTime.setHours(13, 0, 0);
                    break;
                default:
                    return; // Skip unknown
            }

            attDocs.push({
                employee: targetEmp._id,
                date: date,
                checkInTime: checkInTime,
                checkOutTime: checkOutTime,
                workingHours: (checkOutTime - checkInTime) / (1000 * 60 * 60)
            });
        });
        await Attendance.insertMany(attDocs);
        console.log(`  Inserted ${attDocs.length} attendance records.`);

        // 3. Insert Deals (Spread across Jan)
        if (empData.deals.length > 0) {
            const dealDocs = empData.deals.map((d, i) => ({
                employee: targetEmp._id,
                dealValue: d.type === 'Normal' ? 0.01 * d.val : 0.004 * d.val, // Set revenue based on type
                type: d.type,
                numberOfSales: 1,
                cvCount: d.val, // CV value
                date: getDate(5 + (i * 5)), // Spread dates: Jan 5, 10...
                builderPaymentReceived: d.revenue,
                isSupportive: false
            }));

            await Deal.insertMany(dealDocs);
            console.log(`  Inserted ${dealDocs.length} deals.`);
        }
    }

    console.log('Seeding Complete.');
    process.exit();
}

seed();
